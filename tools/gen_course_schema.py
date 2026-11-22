#!/usr/bin/env python3
"""
מחולל סכמת קורסים (Schema.org JSON-LD) לדף הבית של AI Lab.

מקור האמת: מערך ה-JS `COURSES` בתוך index.html (כרטיסי הקורסים והמודאל).
הסקריפט מחלץ את המערך (דרך node), בונה ItemList של אובייקטי Course,
ומחליף את הבלוק בין הסמנים COURSE-SCHEMA:START / COURSE-SCHEMA:END ב-index.html.

הרצה:   python3 tools/gen_course_schema.py            # כותב ל-index.html
        python3 tools/gen_course_schema.py --check    # רק בודק שהבלוק מעודכן (יציאה 1 אם לא)
        python3 tools/gen_course_schema.py --print    # מדפיס את ה-JSON בלבד

מחזורים (תאריכים ושעות) מוגדרים למטה ב-COHORTS — לעדכן שם בכל מחזור חדש.
"""
import json
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
START = "<!-- COURSE-SCHEMA:START (נוצר אוטומטית מ-tools/gen_course_schema.py — לא לערוך ידנית) -->"
END = "<!-- COURSE-SCHEMA:END -->"

SITE = "https://ai-lab.co.il"
ORG_ID = SITE + "/#org"
ENROLL_URL = "https://my.ai-lab.co.il/courses"
INSTRUCTOR = {"@type": "Person", "name": "מאיר לביא", "url": "https://www.linkedin.com/in/meirlavi"}
TZ = "Asia/Jerusalem"
WEEKS = 8
MAX_AGE = 15  # הקבוצות במחזור הנוכחי: 9–11 ו-12–15

# המחזורים הפתוחים, לפי שם הקורס במערך. כל מחזור = 8 מפגשים שבועיים של שעה.
COHORTS = {
    "בינה מלאכותית ויזמות": [
        # (קבוצת גיל, יום, תאריך ראשון, שעה)
        ("9-11", "Sunday", date(2026, 11, 29), "16:00"),
        ("9-11", "Wednesday", date(2026, 12, 2), "16:00"),
        ("12-15", "Sunday", date(2026, 11, 29), "18:00"),
        ("12-15", "Wednesday", date(2026, 12, 2), "18:00"),
    ],
}

# קורס שאינו במערך הכרטיסים (מסלול מבוגרים) — נשמר כדי לא לאבד מידע שהיה בסכמה הקודמת.
EXTRA_COURSES = [
    {
        "@type": "Course",
        "name": "קורס בינה מלאכותית למבוגרים — AI Lab Starter",
        "description": "8 מפגשים חיים בזום למבוגרים ללא רקע טכנולוגי: מהצעד הראשון עם ChatGPT ו-Claude ועד פרויקט אמיתי באוויר.",
        "url": "https://starter.ai-lab.co.il/",
        "provider": {"@id": ORG_ID},
        "inLanguage": "he",
        "isAccessibleForFree": False,
        "educationalLevel": "מתחילים",
        "audience": {"@type": "EducationalAudience", "educationalRole": "student", "audienceType": "מבוגרים"},
        "hasCourseInstance": [{
            "@type": "CourseInstance", "courseMode": "online", "courseWorkload": "PT8H",
            "location": {"@type": "VirtualLocation", "name": "Zoom"},
        }],
    },
]

LEVEL = {1: "מתחילים", 2: "ממשיכים", 3: "מתקדמים"}
AVAIL = {"open": "https://schema.org/InStock", "first": "https://schema.org/PreOrder", "soon": "https://schema.org/PreOrder"}


def extract_courses(html: str) -> list:
    """מחלץ את `const COURSES = [...]` ומעריך אותו עם node ל-JSON."""
    m = re.search(r"^\s*const COURSES = (\[.*?^\s*\]);", html, re.S | re.M)
    if not m:
        sys.exit("לא נמצא מערך COURSES ב-index.html")
    js = "const COURSES = " + m.group(1) + ";\nprocess.stdout.write(JSON.stringify(COURSES));"
    out = subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def clean(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s or "")
    return re.sub(r"\s+", " ", s).strip()


def price_num(p: str):
    d = re.sub(r"[^\d]", "", p or "")
    return d or None


def age_range(age: str) -> str:
    lo = re.sub(r"\D", "", age or "9") or "9"
    return f"{lo}-{MAX_AGE}"


def audience(ages: str) -> dict:
    """typicalAgeRange שייך ל-CreativeWork (Course); טווח גיל על קהל = PeopleAudience."""
    lo, hi = ages.split("-")
    return {
        "@type": ["EducationalAudience", "PeopleAudience"],
        "educationalRole": "student",
        "audienceType": "ילדים ונוער",
        "suggestedMinAge": int(lo),
        "suggestedMaxAge": int(hi),
    }


def course_instance(course_name: str, cohort, seats: int = 5) -> dict:
    ages, day, first, hhmm = cohort
    last = first + timedelta(weeks=WEEKS - 1)
    h, mm = hhmm.split(":")
    end = f"{int(h) + 1:02d}:{mm}"
    return {
        "@type": "CourseInstance",
        "name": f"{course_name} — גילאי {ages}, יום {HE_DAY[day]} {hhmm}",
        "courseMode": "online",
        "courseWorkload": f"PT{WEEKS}H",
        "startDate": first.isoformat(),
        "endDate": last.isoformat(),
        "location": {"@type": "VirtualLocation", "name": "Zoom"},
        "instructor": INSTRUCTOR,
        "maximumAttendeeCapacity": seats,
        "audience": audience(ages),
        "courseSchedule": {
            "@type": "Schedule",
            "repeatFrequency": "Weekly",
            "repeatCount": WEEKS,
            "byDay": f"https://schema.org/{day}",
            "startDate": first.isoformat(),
            "endDate": last.isoformat(),
            "startTime": f"{hhmm}:00",
            "endTime": f"{end}:00",
            "duration": "PT1H",
            "scheduleTimezone": TZ,
        },
    }


HE_DAY = {"Sunday": "ראשון", "Monday": "שני", "Tuesday": "שלישי", "Wednesday": "רביעי",
          "Thursday": "חמישי", "Friday": "שישי", "Saturday": "שבת"}


def build_course(co: dict, valid_from: str) -> dict:
    name = clean(co["name"])
    desc_parts = [clean(co.get("tag"))]
    if co.get("deliver"):
        desc_parts.append("התוצר: " + clean(co["deliver"]) + ".")
    desc_parts.append(f"{clean(co.get('count') or '8 מפגשים')} חיים בזום, בקבוצות של עד 5 תלמידים לפי גיל.")
    if co.get("note"):
        desc_parts.append(clean(co["note"]))
    slug = co.get("slug") or name.replace(" ", "-")
    course = {
        "@type": "Course",
        "@id": f"{SITE}/#course-{slug}",
        "name": name,
        "description": " ".join(desc_parts),
        "url": f"{SITE}/#courses",
        "provider": {"@id": ORG_ID},
        "inLanguage": "he",
        "isAccessibleForFree": False,
        "educationalLevel": LEVEL.get(co.get("lvl"), "מתחילים"),
        "typicalAgeRange": age_range(co.get("age")),
        "audience": audience(age_range(co.get("age"))),
        "syllabusSections": [
            {"@type": "Syllabus", "position": i + 1, "name": clean(s[0]), "description": clean(s[1])}
            for i, s in enumerate(co.get("sessions") or [])
        ],
    }
    if co.get("prereq"):
        course["coursePrerequisites"] = clean(co["prereq"])
    price = price_num(co.get("price"))
    if price:
        course["offers"] = {
            "@type": "Offer",
            "price": price,
            "priceCurrency": "ILS",
            "category": "Paid",
            "availability": AVAIL.get(co.get("status"), "https://schema.org/PreOrder"),
            "url": ENROLL_URL,
            "validFrom": valid_from,
            "seller": {"@id": ORG_ID},
        }
    cohorts = COHORTS.get(name)
    if cohorts:
        course["hasCourseInstance"] = [course_instance(name, c) for c in cohorts]
    else:
        course["hasCourseInstance"] = [{
            "@type": "CourseInstance", "courseMode": "online", "courseWorkload": f"PT{WEEKS}H",
            "location": {"@type": "VirtualLocation", "name": "Zoom"}, "instructor": INSTRUCTOR,
        }]
    return course


def build_schema(courses: list, valid_from: str) -> dict:
    items = [build_course(c, valid_from) for c in courses] + EXTRA_COURSES
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": f"{SITE}/#courses-list",
        "name": "מפת הקורסים של AI Lab",
        "url": f"{SITE}/#courses",
        "numberOfItems": len(items),
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "item": c} for i, c in enumerate(items)
        ],
    }


def render_block(schema: dict) -> str:
    js = json.dumps(schema, ensure_ascii=False, separators=(",", ":"))
    return f'{START}\n    <script type="application/ld+json">\n{js}\n    </script>\n    {END}'


def main():
    html = INDEX.read_text(encoding="utf-8")
    courses = extract_courses(html)
    # validFrom: נשמר מהבלוק הקיים כדי שלא ישתנה בכל הרצה; אם אין — היום.
    m = re.search(r'"validFrom":\s*"(\d{4}-\d{2}-\d{2})"', html)
    valid_from = m.group(1) if m else date.today().isoformat()
    schema = build_schema(courses, valid_from)

    if "--print" in sys.argv:
        print(json.dumps(schema, ensure_ascii=False, indent=1))
        return

    block = render_block(schema)
    if "חינם" in block:
        sys.exit("הבלוק מכיל את המילה 'חינם' — לתקן את המקור לפני כתיבה")
    pat = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if not pat.search(html):
        sys.exit(f"לא נמצאו הסמנים {START!r} / {END!r} ב-index.html")
    new_html = pat.sub(lambda _: block, html, count=1)

    if "--check" in sys.argv:
        if new_html != html:
            sys.exit("סכמת הקורסים ב-index.html אינה מעודכנת — להריץ python3 tools/gen_course_schema.py")
        print("סכמת הקורסים מעודכנת.")
        return
    if new_html == html:
        print("אין שינוי.")
        return
    INDEX.write_text(new_html, encoding="utf-8")
    print(f"נכתבו {len(schema['itemListElement'])} קורסים לסכמה ב-index.html ({len(block):,} תווים).")


if __name__ == "__main__":
    main()
