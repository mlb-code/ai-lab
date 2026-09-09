#!/usr/bin/env python3
"""סוכן שיווק יומי של AI Lab — רץ ב-GitHub Actions כל בוקר.
אוסף: מודעות מטא (אתמול + מצטבר), עוקבים באינסטגרם (+שינוי), פוסטים שעלו אתמול, תגובות חדשות (עם סיווג + טיוטת תשובה),
ומחבר את דוח GA4 אם קיים (ga.md). מדפיס Markdown ל-stdout, וכותב report.md + comments.json לאישור תשובות.
ENV: META_ACCESS_TOKEN, ANTHROPIC_API_KEY (אופציונלי: בלי — אין סיווג), STATE_FILE.
"""
import os, json, datetime as dt, time
from zoneinfo import ZoneInfo
import requests

TZ = ZoneInfo("Asia/Jerusalem")
API = "https://graph.facebook.com/v21.0"
TOKEN = os.environ["META_ACCESS_TOKEN"]
ACT = "act_200256287557563"; PAGE = "958828183989506"; IG = "17841440161415232"
STATE_FILE = os.environ.get("STATE_FILE", "agent/marketing-state.json")
today = dt.datetime.now(TZ).date(); yday = today - dt.timedelta(days=1)


def get(path, **params):
    for _ in range(4):
        r = requests.get(f"{API}/{path}", params={**params, "access_token": TOKEN}, timeout=60).json()
        if "error" in r and r["error"].get("code") in (17, 4, 32):
            time.sleep(45); continue
        return r
    return r


def acts(row, keys):
    m = {a["action_type"]: float(a["value"]) for a in (row.get("actions") or [])}
    return {k: int(m.get(k, 0)) for k in keys}


def money(v): return f"₪{float(v or 0):.0f}"


# ---------- מודעות ----------
def ads_block():
    out = ["## מודעות במטא"]
    for label, preset in (("אתמול", "yesterday"), ("מצטבר מתחילת הקמפיינים", "maximum")):
        rows = get(f"{ACT}/insights", level="campaign", date_preset=preset, limit=50,
                   fields="campaign_name,spend,impressions,reach,clicks,actions,cpc,ctr").get("data", [])
        rows = [r for r in rows if float(r.get("spend", 0)) > 0]
        if not rows: out.append(f"\n**{label}:** אין הוצאה."); continue
        out.append(f"\n**{label}:**\n| קמפיין | הוצאה | הגעה | לחיצות קישור | צפיות בדף | CTR | CPC |\n|---|---|---|---|---|---|---|")
        tot = [0, 0, 0, 0]
        for r in rows:
            a = acts(r, ["link_click", "landing_page_view"])
            out.append(f"| {r['campaign_name'].replace('AI Lab · ','')} | {money(r['spend'])} | {r.get('reach','0')} | {a['link_click']} | {a['landing_page_view']} | {float(r.get('ctr',0)):.1f}% | ₪{float(r.get('cpc',0)):.2f} |")
            tot[0] += float(r['spend']); tot[1] += int(r.get('reach', 0)); tot[2] += a['link_click']; tot[3] += a['landing_page_view']
        out.append(f"| **סה\"כ** | **{money(tot[0])}** | {tot[1]} | **{tot[2]}** | {tot[3]} | | |")
    # מודעות מובילות אתמול
    ads = get(f"{ACT}/insights", level="ad", date_preset="yesterday", limit=100,
              fields="ad_name,adset_name,spend,impressions,actions,ctr").get("data", [])
    ads = sorted([a for a in ads if float(a.get("spend", 0)) > 0], key=lambda x: -float(x["spend"]))[:8]
    if ads:
        out.append("\n**מודעות מובילות אתמול (לפי הוצאה):**\n| מודעה | סט | הוצאה | לחיצות | CTR |\n|---|---|---|---|---|")
        for a in ads:
            k = acts(a, ["link_click"])
            out.append(f"| {a['ad_name']} | {a['adset_name'][:28]} | {money(a['spend'])} | {k['link_click']} | {float(a.get('ctr',0)):.1f}% |")
    # מודעות שנדחו / בבדיקה
    bad = get(f"{ACT}/ads", fields="name,effective_status,ad_review_feedback", limit=100,
              effective_status='["DISAPPROVED","PENDING_REVIEW","WITH_ISSUES"]').get("data", [])
    if bad:
        out.append("\n**⚠️ מודעות שדורשות תשומת לב:** " + ", ".join(f"{b['name']} ({b['effective_status']})" for b in bad))
    return "\n".join(out)


# ---------- אינסטגרם / פייסבוק ----------
def social_block(state):
    out = ["## עמודים"]
    ig = get(IG, fields="followers_count,media_count")
    fb = get(PAGE, fields="followers_count,fan_count")
    f_now = ig.get("followers_count", 0); f_prev = state.get("ig_followers")
    delta = f"({'+' if f_now - f_prev >= 0 else ''}{f_now - f_prev} מאתמול)" if f_prev is not None else ""
    out.append(f"- **אינסטגרם:** {f_now} עוקבים {delta} · **פייסבוק:** {fb.get('followers_count', fb.get('fan_count', '?'))} עוקבים")
    state["ig_followers"] = f_now
    if f_now >= 350 and not state.get("contest_notified"):
        out.append("- 🏆 **חצינו 350 עוקבים — פוסט התחרות להורים יוצא היום ב-18:00 (אוטומטית).**"); state["contest_notified"] = True
    # פוסטים אתמול
    since = int(dt.datetime.combine(yday, dt.time.min, TZ).timestamp()); until = int(dt.datetime.combine(today, dt.time.min, TZ).timestamp())
    posts = get(f"{PAGE}/posts", fields="message,created_time,permalink_url,shares,insights.metric(post_impressions_unique)", since=since, until=until, limit=20).get("data", [])
    media = get(f"{IG}/media", fields="caption,timestamp,permalink,media_product_type,like_count,comments_count", limit=15).get("data", [])
    media = [m for m in media if m["timestamp"][:10] == yday.isoformat()]
    out.append(f"\n**פוסטים שעלו אתמול ({yday.strftime('%d.%m')}):** פייסבוק {len(posts)} · אינסטגרם {len(media)}")
    for m in media:
        out.append(f"- IG {m.get('media_product_type','')}: \"{(m.get('caption') or '')[:40].replace(chr(10),' ')}…\" · ❤️ {m.get('like_count',0)} · 💬 {m.get('comments_count',0)} · [קישור]({m['permalink']})")
    for p in posts:
        reach = (p.get("insights", {}).get("data") or [{}])[0].get("values", [{}])[0].get("value", "?")
        out.append(f"- FB: \"{(p.get('message') or '')[:40].replace(chr(10),' ')}…\" · הגעה {reach} · [קישור]({p.get('permalink_url','')})")
    return "\n".join(out)


# ---------- תגובות ----------
def fetch_comments():
    cutoff = dt.datetime.now(TZ) - dt.timedelta(hours=48); items = []
    for p in get(f"{PAGE}/posts", fields="id,message,created_time", limit=25).get("data", []):
        for c in get(f"{p['id']}/comments", fields="id,message,from,created_time,is_hidden", limit=50).get("data", []):
            t = dt.datetime.fromisoformat(c["created_time"].replace("+0000", "+00:00"))
            if t < cutoff or c.get("is_hidden"): continue
            if (c.get("from") or {}).get("id") == PAGE: continue
            items.append({"net": "fb", "id": c["id"], "text": c.get("message", ""), "post": (p.get("message") or "")[:40], "who": (c.get("from") or {}).get("name", "")})
    for m in get(f"{IG}/media", fields="id,caption,timestamp", limit=20).get("data", []):
        for c in get(f"{m['id']}/comments", fields="id,text,username,timestamp,hidden", limit=50).get("data", []):
            t = dt.datetime.fromisoformat(c["timestamp"].replace("+0000", "+00:00"))
            if t < cutoff or c.get("hidden") or c.get("username") == "ai.lab.il": continue
            items.append({"net": "ig", "id": c["id"], "text": c.get("text", ""), "post": (m.get("caption") or "")[:40], "who": c.get("username", "")})
    return items


def classify(items):
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not items or not key: return [{**i, "kind": "unknown", "reply": ""} for i in items]
    import anthropic
    client = anthropic.Anthropic(api_key=key)
    prompt = ("אתה מנהל הקהילה של AI Lab, מרכז ישראלי שמלמד ילדים ונוער (מגיל 9) בינה מלאכותית, יזמות, תכנות, סרטונים וכסף חכם, בזום, עד 5 בקבוצה. "
              "הפרטים: אתר ai-lab.co.il (קורסים והרשמה), קהילת דיסקורד לנוער, קהילת וואטסאפ להורים, מחיר קורס 990-1,290 ₪ ל-8 מפגשים, מחזורים אחרי החגים.\n"
              "לכל תגובה החזר JSON עם kind (אחד מ: question, lead, positive, negative, spam, other) ו-reply: תשובה קצרה, חמה, בעברית, בגובה העיניים, "
              "בלי הבטחות על תוצאות, בלי מחירים מדויקים אלא הפניה לאתר, ובלי לפנות לילדים ישירות (פונים להורה). ל-spam החזר reply ריק. "
              "החזר רק מערך JSON באותו סדר של הקלט.\n\nתגובות:\n" + json.dumps([{"i": n, "net": i["net"], "post": i["post"], "text": i["text"]} for n, i in enumerate(items)], ensure_ascii=False))
    resp = client.messages.create(model="claude-opus-5", max_tokens=4000, output_config={"effort": "low"},
                                  messages=[{"role": "user", "content": prompt}])
    text = next((b.text for b in resp.content if b.type == "text"), "[]")
    try:
        start = text.index("["); parsed = json.loads(text[start:text.rindex("]") + 1])
    except Exception:
        parsed = []
    out = []
    for n, i in enumerate(items):
        p = parsed[n] if n < len(parsed) else {}
        out.append({**i, "kind": p.get("kind", "other"), "reply": p.get("reply", "")})
    return out


def hide(item):
    if item["net"] == "fb": requests.post(f"{API}/{item['id']}", data={"is_hidden": "true", "access_token": TOKEN}, timeout=30)
    else: requests.post(f"{API}/{item['id']}", data={"hide": "true", "access_token": TOKEN}, timeout=30)


def comments_block(state):
    seen = set(state.get("seen_comments", []))
    items = [i for i in fetch_comments() if i["id"] not in seen]
    items = classify(items)
    out = ["## תגובות חדשות (48 שעות)"]
    if not items: out.append("אין תגובות חדשות."); return "\n".join(out), []
    hidden = [i for i in items if i["kind"] == "spam"]
    for i in hidden: hide(i)
    todo = [i for i in items if i["kind"] != "spam"]
    if hidden: out.append(f"הוסתרו אוטומטית {len(hidden)} תגובות ספאם.")
    if todo:
        out.append("לכל תגובה יש טיוטת תשובה. **כדי לפרסם:** כתוב בתגובה ל-Issue הזה `אשר 1 3` (מספרים), או `אשר הכל`. לערוך: `אשר 2: הטקסט שלי`.\n")
        for n, i in enumerate(todo, 1):
            icon = {"lead": "🔥", "question": "❓", "positive": "💚", "negative": "⚠️"}.get(i["kind"], "💬")
            out.append(f"**{n}. {icon} {i['net'].upper()} · {i['who']}** על \"{i['post']}…\"\n> {i['text']}\n\n↩️ טיוטה: {i['reply'] or '(אין)'}\n")
    state["seen_comments"] = list(seen | {i["id"] for i in items})[-2000:]
    return "\n".join(out), todo


def main():
    state = json.load(open(STATE_FILE)) if os.path.exists(STATE_FILE) else {}
    parts = [f"# דוח שיווק יומי · {today.strftime('%d.%m.%Y')}", ads_block(), social_block(state)]
    cb, todo = comments_block(state); parts.append(cb)
    if os.path.exists("ga.md"): parts.append("## אנליטיקס (7 ימים)\n" + open("ga.md", encoding="utf-8").read().split("\n", 1)[-1])
    parts.append("\n---\n*סוכן שיווק יומי · AI Lab · הדוח נוצר אוטומטית. תשובות לתגובות מתפרסמות רק אחרי אישור.*")
    md = "\n\n".join(parts)
    if todo: md += "\n\n<!-- COMMENTS_JSON " + json.dumps(todo, ensure_ascii=False) + " -->"
    open("report.md", "w", encoding="utf-8").write(md)
    json.dump(state, open(STATE_FILE, "w"), ensure_ascii=False, indent=2)
    print(md)


if __name__ == "__main__":
    main()
