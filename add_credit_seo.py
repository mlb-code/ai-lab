# -*- coding: utf-8 -*-
"""מוסיף קרדיט ל-AI Lab + תגיות SEO לכל פרויקטי התלמידים. בטוח להרצה חוזרת."""
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))

# slug -> (שם תצוגה, תיאור SEO)
PROJECTS = {
    "hairmatch":          ("HairMatch", "HairMatch — מציאת מוצרי טיפוח השיער המושלמים בשבילך בעזרת בינה מלאכותית."),
    "horse-fashion":      ("Horse Fashion", "Horse Fashion — ציוד ואופנה מקצועית לסוסים."),
    "drivelog":           ("DriveLog", "DriveLog — מערכת ניהול שיעורי נהיגה חכמה ופשוטה למורי נהיגה בישראל."),
    "nadavlego":          ("חגיגת לגו", "חגיגת לגו — תערוכה, פעילויות ויצירה סביב עולם הלגו."),
    "gamebuddy":          ("GameBuddy", "GameBuddy — מצאו את שותף המשחק המושלם שלכם."),
    "free-movie-trailers":("Free Movie Trailers", "Free Movie Trailers — כל הטריילרים של הסרטים במקום אחד."),
    "englishkids":        ("EnglishKids", "EnglishKids — לימוד אנגלית לילדים בצורה חכמה ומהנה."),
    "build-pc":           ("BUILD PC", "BUILD PC — השוו, חסכו ושדרגו ובנו את המחשב המושלם בזמן הנכון."),
    "mayasuqish":         ("MayaSuqish", "MayaSuqish — מצאו את שותפי הסקווש שלכם."),
    "motionstudios":      ("Motion Studios", "Motion Studios — למדו ליצור אנימציות סטופ-מושן בכמה שלבים פשוטים."),
    "fcbuddy":            ("FCBuddy", "FCBuddy — מצאו שחקנים וקבעו משחקי כדורגל."),
    "spot":               ("SPOT", "SPOT — כל כלב ביומו: הפלטפורמה לחובבי הכלבים."),
    "tennismate":         ("TennisMate", "TennisMate — מצאו שחקני טניס בישראל, בחינם."),
    "trendsaver":         ("TrendSaver", "TrendSaver — חזו, חסכו וקנו חכם."),
}

SEO_MARKER = "<!-- ailab-seo -->"
CREDIT_MARKER = "<!-- ailab-credit -->"
SITE = "https://ai-lab.co.il"
OG_IMG = SITE + "/og-image.jpg"

def seo_block(slug, name, desc):
    url = f"{SITE}/{slug}"
    cta = f"{SITE}/register-kids?utm_source=student-project&utm_medium=footer&utm_campaign={slug}"
    return f'''{SEO_MARKER}
<meta name="description" content="{desc}">
<meta name="author" content="AI Lab — קורס AI לילדים ונוער">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AI Lab">
<meta property="og:locale" content="he_IL">
<meta property="og:title" content="{name}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{OG_IMG}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{name}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{OG_IMG}">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "{name}",
  "description": "{desc}",
  "url": "{url}",
  "inLanguage": "he",
  "isPartOf": {{ "@type": "WebSite", "name": "AI Lab", "url": "{SITE}" }},
  "publisher": {{ "@type": "Organization", "name": "AI Lab", "url": "{SITE}", "logo": "{SITE}/ailab-logo.jpg" }},
  "creator": {{ "@type": "Organization", "name": "AI Lab — קורס AI לילדים ונוער", "url": "{cta}" }}
}}
</script>
'''

def credit_block(slug):
    cta = f"{SITE}/register-kids?utm_source=student-project&utm_medium=footer&utm_campaign={slug}"
    return f'''{CREDIT_MARKER}
<div style="text-align:center;padding:18px 16px;font-size:14px;line-height:1.7;font-family:inherit;border-top:1px solid rgba(128,128,128,0.2);margin-top:8px;">
  <a href="{cta}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;opacity:0.85;">
    🚀 רוצים לבנות פרויקט כזה? <strong style="text-decoration:underline;">למדו ב-AI Lab</strong>
  </a>
</div>
'''

for slug, (name, desc) in PROJECTS.items():
    path = os.path.join(BASE, slug, "index.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()
    changes = []

    # 1) SEO — אחרי </title>
    if SEO_MARKER not in html and "</title>" in html:
        html = html.replace("</title>", "</title>\n" + seo_block(slug, name, desc), 1)
        changes.append("seo")

    # 2) קרדיט — לפני </footer>, ואם אין footer אז לפני </body>
    if CREDIT_MARKER not in html:
        block = credit_block(slug)
        if "</footer>" in html:
            html = html.replace("</footer>", block + "</footer>", 1)
        else:
            html = html.replace("</body>", block + "</body>", 1)
        changes.append("credit")

    if changes:
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✓ {slug}: {', '.join(changes)}")
    else:
        print(f"– {slug}: כבר קיים, דילגתי")

print("סיום.")
