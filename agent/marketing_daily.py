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
def h(tag, inner, **attrs):
    a = "".join(f' {k}="{v}"' for k, v in attrs.items())
    return f"<{tag}{a}>{inner}</{tag}>"


def table(headers, rows):
    th = "".join(h("th", x, align="right") for x in headers)
    trs = "".join(h("tr", "".join(h("td", str(c), align="right") for c in r)) for r in rows)
    return h("table", h("thead", h("tr", th)) + h("tbody", trs))


def ads_block(summary):
    FILT = json.dumps([{"field": "campaign.name", "operator": "CONTAIN", "value": "AI Lab ·"}])
    def rows_for(rng):
        rows = get(f"{ACT}/insights", level="campaign", limit=50, filtering=FILT, **rng,
                   fields="campaign_name,spend,impressions,reach,clicks,actions,cpc,ctr").get("data", [])
        return [r for r in rows if float(r.get("spend", 0)) > 0]
    y = rows_for({"date_preset": "yesterday"})
    cum = rows_for({"time_range": json.dumps({"since": "2026-09-09", "until": today.isoformat()})})
    parts = [h("h2", "מודעות במטא")]
    def render(label, rows):
        if not rows: return h("p", h("b", label + ":") + " אין הוצאה.")
        lines = []; tot = [0.0, 0, 0, 0]
        for r in rows:
            a = acts(r, ["link_click", "landing_page_view"]); name = r["campaign_name"].replace("AI Lab · ", "").replace(" · ספטמבר 2026", "")
            lines.append([name, money(r["spend"]), a["link_click"], f"₪{float(r.get('cpc', 0)):.2f}", a["landing_page_view"], r.get("reach", "0")])
            tot[0] += float(r["spend"]); tot[1] += a["link_click"]; tot[2] += a["landing_page_view"]; tot[3] += int(r.get("reach", 0))
            # דגל אוטומטי: קמפיין יקר (מעל ₪2 ללחיצה עם הוצאה משמעותית) — לבדוק קהל/קריאייטיב
            if label == "אתמול" and float(r.get("cpc", 0)) > 2 and float(r["spend"]) >= 20:
                summary.append(f"⚠️ {name}: ₪{float(r['cpc']):.2f} ללחיצה אתמול — יקר, לבדוק קהל או קריאייטיב")
        lines.append([h("b", "סה\"כ"), h("b", money(tot[0])), h("b", tot[1]), "", tot[2], tot[3]])
        return h("h3", label) + table(["קמפיין", "הוצאה", "לחיצות", "עלות ללחיצה", "הגיעו לאתר", "הגעה"], lines), tot
    ry = render("אתמול", y); rc = render("מצטבר מ-09.09", cum)
    parts.append(ry if isinstance(ry, str) else ry[0]); parts.append(rc if isinstance(rc, str) else rc[0])
    if not isinstance(ry, str): summary.append(f"מודעות אתמול: {money(ry[1][0])} · {ry[1][1]} לחיצות · {ry[1][2]} הגיעו לאתר")
    if not isinstance(rc, str): summary.append(f"מצטבר: {money(rc[1][0])} · {rc[1][1]} לחיצות")
    ads = get(f"{ACT}/insights", level="ad", date_preset="yesterday", limit=100, filtering=FILT,
              fields="ad_name,adset_name,spend,impressions,actions,ctr").get("data", [])
    ads = sorted([a for a in ads if float(a.get("spend", 0)) > 0], key=lambda x: -float(x["spend"]))[:6]
    if ads:
        parts.append(h("h3", "מודעות מובילות אתמול") + table(["מודעה", "הוצאה", "לחיצות", "CTR"],
                     [[a["ad_name"], money(a["spend"]), acts(a, ["link_click"])["link_click"], f"{float(a.get('ctr', 0)):.1f}%"] for a in ads]))
    bad = get(f"{ACT}/ads", fields="name,effective_status,campaign{name}", limit=200,
              effective_status='["DISAPPROVED","PENDING_REVIEW","WITH_ISSUES"]').get("data", [])
    bad = [b for b in bad if "AI Lab ·" in (b.get("campaign") or {}).get("name", "")]
    if bad:
        parts.append(h("p", "⚠️ " + h("b", "מודעות שדורשות טיפול: ") + ", ".join(f"{b['name']} ({b['effective_status']})" for b in bad)))
        summary.append(f"⚠️ {len(bad)} מודעות דורשות טיפול")
    return "".join(parts)


# ---------- דף הבית מול דף הנחיתה (פיצול קמפיין הקורסים מ-10.09) ----------
COURSES_CAMPAIGN = "120248975514880650"

def landing_split_block(summary):
    """סט A (דף הבית) מול סט B (/parents): הגיעו לדף → לחצו וואטסאפ (Contact) או הרשמה (InitiateCheckout). מצטבר מאז הפיצול."""
    rows = get(f"{COURSES_CAMPAIGN}/insights", level="adset", fields="adset_name,spend,actions,cpc",
               time_range=json.dumps({"since": "2026-09-10", "until": today.isoformat()})).get("data", [])
    rows = [r for r in rows if float(r.get("spend", 0)) > 0]
    if len(rows) < 2: return ""
    lines = []; best = None
    for r in rows:
        a = acts(r, ["link_click", "landing_page_view", "contact", "initiate_checkout"])
        conv = a["contact"] + a["initiate_checkout"]; lpv = a["landing_page_view"]
        rate = conv / lpv if lpv else 0.0
        label = "A · דף הבית" if r["adset_name"].startswith("A") else "B · דף הנחיתה"
        lines.append([label, money(r["spend"]), a["link_click"], lpv, a["contact"], a["initiate_checkout"], f"{100*rate:.1f}%" if lpv else "—"])
        if lpv >= 30 and (best is None or rate > best[1]): best = (label, rate)
    if best: summary.append(f"פיצול הקורסים: מוביל {best[0]} ({100*best[1]:.1f}% פעולה אחרי הגעה לדף)")
    return h("h2", "דף הבית מול דף הנחיתה (קמפיין הקורסים, מצטבר מ-10.09)") + \
        table(["סט", "הוצאה", "לחיצות", "הגיעו לדף", "וואטסאפ", "הרשמה", "% פעולה"], lines) + \
        h("p", h("i", "החלטה ב-15.09: כל התקציב לסט עם אחוז הפעולה הגבוה יותר (לפחות 30 הגעות לדף בכל סט)."))


# ---------- סוכן הוואטסאפ (Railway) ----------
AGENT_HEALTH_URL = os.environ.get("WA_AGENT_HEALTH_URL", "https://ailab-whatsapp-agent-production.up.railway.app/health")

def agent_block(summary):
    try:
        d = requests.get(AGENT_HEALTH_URL, timeout=20).json()
    except Exception as e:
        summary.append("⚠️ סוכן הוואטסאפ לא מגיב (Railway)")
        return h("h2", "סוכן הוואטסאפ") + h("p", f"לא הצלחתי לקרוא את הסטטוס: {e}")
    s = d.get("stats", {})
    if not d.get("ok") or not d.get("agent_enabled"): summary.append("⚠️ סוכן הוואטסאפ כבוי או לא תקין")
    elif s.get("failed", 0): summary.append(f"⚠️ סוכן הוואטסאפ: {s['failed']} הודעות נכשלו")
    else: summary.append(f"סוכן וואטסאפ: תקין · {s.get('conversations', 0)} שיחות מצטבר · אתמול+היום ${d.get('day_cost_usd', 0):.2f}")
    return h("h2", "סוכן הוואטסאפ (Railway)") + h("ul",
        h("li", f"שיחות: {s.get('conversations', 0)} · הודעות נכנסו {s.get('messages_in', 0)} · יצאו {s.get('messages_out', 0)} · נכשלו {s.get('failed', 0)}") +
        h("li", f"מענה אוטומטי: {'פעיל' if d.get('auto_reply') else 'כבוי'} · מוח {d.get('brain_model', '?')} · עלות החודש ${d.get('month_cost_usd', 0):.2f} מתוך ${d.get('monthly_budget_usd', 0):.0f}"))


# ---------- גוגל אדס (REST v22; רץ רק אם יש GOOGLE_ADS_* בסביבה) ----------
def google_block(summary):
    g = {k: os.environ.get(k, "").strip() for k in ("GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_REFRESH_TOKEN")}
    if not all(g.values()): return ""
    try:
        tok = requests.post("https://oauth2.googleapis.com/token", data={"client_id": g["GOOGLE_ADS_CLIENT_ID"], "client_secret": g["GOOGLE_ADS_CLIENT_SECRET"],
                            "refresh_token": g["GOOGLE_ADS_REFRESH_TOKEN"], "grant_type": "refresh_token"}, timeout=60).json()["access_token"]
        hd = {"Authorization": f"Bearer {tok}", "login-customer-id": os.environ.get("GOOGLE_ADS_MANAGER_ID", "318-612-5942").replace("-", "")}
        if os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN"): hd["developer-token"] = os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"].strip()
        cust = os.environ.get("GOOGLE_ADS_CUSTOMER_ID", "787-977-7621").replace("-", "")
        def q(gaql):
            r = requests.post(f"https://googleads.googleapis.com/v22/customers/{cust}/googleAds:search", headers=hd, json={"query": gaql}, timeout=120)
            r.raise_for_status(); return r.json().get("results", [])
        base = "SELECT campaign.name, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.average_cpc, metrics.conversions FROM campaign WHERE campaign.status = 'ENABLED' AND segments.date {r}"
        y = q(base.format(r="DURING YESTERDAY")); cum = q(base.format(r=f"BETWEEN '2026-09-12' AND '{today.isoformat()}'"))
    except Exception as e:
        summary.append("⚠️ גוגל אדס: לא הצלחתי לקרוא נתונים"); return h("h2", "גוגל אדס") + h("p", str(e)[:200])
    def rows(rs):
        out = []
        for r in rs:
            m = r["metrics"]; cost = int(m.get("costMicros", 0)) / 1e6; clicks = int(m.get("clicks", 0))
            out.append([r["campaign"]["name"].replace("AI Lab · ", ""), money(cost), clicks, f"₪{cost/clicks:.2f}" if clicks else "—", m.get("impressions", 0), f"{float(m.get('conversions', 0)):.0f}"])
        return out
    ty = sum(int(r["metrics"].get("costMicros", 0)) for r in y) / 1e6; cy = sum(int(r["metrics"].get("clicks", 0)) for r in y); convy = sum(float(r["metrics"].get("conversions", 0)) for r in y)
    summary.append(f"גוגל אתמול: {money(ty)} · {cy} קליקים · {convy:.0f} המרות" if y else "גוגל אתמול: אין הוצאה (מודעות בבדיקה?)")
    parts = [h("h2", "גוגל אדס (חיפוש)")]
    parts.append(h("h3", "אתמול") + (table(["קמפיין", "הוצאה", "קליקים", "עלות לקליק", "חשיפות", "המרות"], rows(y)) if y else h("p", "אין נתונים.")))
    parts.append(h("h3", "מצטבר מ-12.09") + (table(["קמפיין", "הוצאה", "קליקים", "עלות לקליק", "חשיפות", "המרות"], rows(cum)) if cum else h("p", "אין נתונים.")))
    try:
        kw = q("SELECT ad_group_criterion.keyword.text, metrics.clicks, metrics.cost_micros, metrics.impressions FROM keyword_view WHERE segments.date DURING LAST_7_DAYS AND metrics.impressions > 0 ORDER BY metrics.clicks DESC LIMIT 8")
        if kw: parts.append(h("h3", "מילים מובילות (7 ימים)") + table(["מילה", "קליקים", "הוצאה", "חשיפות"], [[r["adGroupCriterion"]["keyword"]["text"], r["metrics"].get("clicks", 0), money(int(r["metrics"].get("costMicros", 0)) / 1e6), r["metrics"].get("impressions", 0)] for r in kw]))
    except Exception: pass
    return "".join(parts)


# ---------- אינסטגרם / פייסבוק ----------
def social_block(state, summary):
    ig = get(IG, fields="followers_count,media_count"); fb = get(PAGE, fields="followers_count,fan_count")
    f_now = ig.get("followers_count", 0); f_prev = state.get("ig_followers")
    delta = f" ({'+' if f_now - f_prev >= 0 else ''}{f_now - f_prev} מאתמול)" if f_prev is not None else ""
    state["ig_followers"] = f_now
    summary.append(f"אינסטגרם: {f_now} עוקבים{delta}")
    parts = [h("h2", "עמודים"), h("p", h("b", "אינסטגרם: ") + f"{f_now} עוקבים{delta} · " + h("b", "פייסבוק: ") + f"{fb.get('followers_count', fb.get('fan_count', '?'))} עוקבים")]
    if f_now >= 350 and not state.get("contest_notified"):
        parts.append(h("p", "🏆 " + h("b", "חצינו 350 עוקבים — פוסט התחרות להורים יוצא היום ב-18:00 אוטומטית."))); state["contest_notified"] = True
    since = int(dt.datetime.combine(yday, dt.time.min, TZ).timestamp()); until = int(dt.datetime.combine(today, dt.time.min, TZ).timestamp())
    posts = get(f"{PAGE}/posts", fields="message,created_time,permalink_url,insights.metric(post_impressions_unique)", since=since, until=until, limit=20).get("data", [])
    media = get(f"{IG}/media", fields="caption,timestamp,permalink,media_product_type,like_count,comments_count", limit=15).get("data", [])
    media = [m for m in media if m["timestamp"][:10] == yday.isoformat()]
    items = []
    for m in media:
        items.append(h("li", f"אינסטגרם ({m.get('media_product_type','').lower()}): \"{(m.get('caption') or '')[:38].replace(chr(10),' ')}…\" · ❤️ {m.get('like_count',0)} · 💬 {m.get('comments_count',0)} · " + h("a", "לפוסט", href=m["permalink"])))
    for p in posts:
        reach = (p.get("insights", {}).get("data") or [{}])[0].get("values", [{}])[0].get("value", "?")
        items.append(h("li", f"פייסבוק: \"{(p.get('message') or '')[:38].replace(chr(10),' ')}…\" · הגעה {reach} · " + h("a", "לפוסט", href=p.get("permalink_url", ""))))
    parts.append(h("h3", f"פוסטים שעלו אתמול ({yday.strftime('%d.%m')})") + (h("ul", "".join(items)) if items else h("p", "לא עלו פוסטים.")))
    return "".join(parts)


# ---------- מתזמן הרשתות (Railway) ----------
SCHEDULER_URL = os.environ.get("SCHEDULER_STATUS_URL", "https://scheduler-production-ed9c.up.railway.app/status")

def scheduler_block(summary):
    """בודק שהמתזמן ב-Railway חי ושלא פוספסו פוסטים. רץ בענן — לא תלוי במחשב של מאיר."""
    try:
        st = requests.get(SCHEDULER_URL, timeout=20).json()
    except Exception as e:
        summary.append("⚠️ מתזמן הרשתות לא מגיב (Railway) — לבדוק: " + h("a", "railway.com", href="https://railway.com/dashboard"))
        return h("h2", "מתזמן הרשתות") + h("p", f"לא הצלחתי לקרוא את הסטטוס: {e}")
    last_run = (st.get("last") or {}).get("run_at") or ""
    stale = True
    if last_run:
        try: stale = (dt.datetime.now(TZ) - dt.datetime.fromisoformat(last_run)) > dt.timedelta(minutes=10)
        except Exception: pass
    missed = st.get("missed") or []; paused = st.get("paused")
    yday_done = sorted(k for k, v in (st.get("posted") or {}).items() if k.startswith(yday.isoformat()) and v.get("fb") and v.get("ig"))
    upcoming = st.get("upcoming") or []
    if paused: summary.append("⚠️ מתזמן הרשתות מושהה (PAUSED=1) — לא יעלו פוסטים")
    elif stale: summary.append(f"⚠️ מתזמן הרשתות לא רץ מאז {last_run[11:16] or '—'} — לבדוק ב-Railway")
    if missed: summary.append("⚠️ פוסטים שלא עלו: " + ", ".join(m[11:16] + " " + m[17:] for m in missed[-5:]))
    if not (paused or stale or missed): summary.append(f"מתזמן הרשתות: תקין · אתמול עלו {len(yday_done)} פוסטים · ריצה אחרונה {last_run[11:16]}")
    rows = [h("li", f"אתמול עלו: {', '.join(k[11:16] for k in yday_done) or 'אין'}"), h("li", "הבאים בתור: " + (" · ".join(u[5:16].replace('T',' ') + " " + u[17:] for u in upcoming[:3]) or "אין"))]
    if missed: rows.append(h("li", h("b", "לא עלו: ") + ", ".join(missed)))
    return h("h2", "מתזמן הרשתות (Railway)") + h("ul", "".join(rows)) + h("p", h("a", "דף הסטטוס", href=SCHEDULER_URL))

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
    out = [h("h2", "תגובות חדשות (48 שעות)")]
    if not items: out.append(h("p", "אין תגובות חדשות.")); return "".join(out), []
    hidden = [i for i in items if i["kind"] == "spam"]
    for i in hidden: hide(i)
    todo = [i for i in items if i["kind"] != "spam"]
    if hidden: out.append(h("p", f"הוסתרו אוטומטית {len(hidden)} תגובות ספאם."))
    if todo:
        out.append(h("p", "לכל תגובה יש טיוטת תשובה. " + h("b", "כדי לפרסם:") + " השב למייל הזה (או כתוב תגובה ב-Issue) עם <code>אשר 1 3</code> (מספרים) או <code>אשר הכל</code>. לערוך: <code>אשר 2: הטקסט שלי</code>."))
        for n, i in enumerate(todo, 1):
            icon = {"lead": "🔥", "question": "❓", "positive": "💚", "negative": "⚠️"}.get(i["kind"], "💬")
            net = "אינסטגרם" if i["net"] == "ig" else "פייסבוק"
            out.append(h("p", h("b", f"{n}. {icon} {net} · {i['who']}") + f" על \"{i['post']}…\"") + h("blockquote", i["text"]) + h("p", "↩️ " + h("b", "טיוטה: ") + (i["reply"] or "(אין)")))
    state["seen_comments"] = list(seen | {i["id"] for i in items})[-2000:]
    return "".join(out), todo


def ga_compact():
    if not os.path.exists("ga.md"): return ""
    md = open("ga.md", encoding="utf-8").read()
    tot = next((l for l in md.splitlines() if l.startswith("**סה")), "")
    def section(title, n):
        if f"### {title}" not in md: return ""
        block = md.split(f"### {title}")[1].split("###")[0].strip().splitlines()
        rows = [l for l in block if l.startswith("|") and not l.startswith("|---")]
        if len(rows) < 2: return ""
        hdr = [c.strip() for c in rows[0].strip("|").split("|")]
        body = [[c.strip() for c in r.strip("|").split("|")] for r in rows[1:1 + n]]
        return h("h3", title) + table(hdr, body)
    return h("h2", "אנליטיקס (7 ימים)") + h("p", tot.replace("**", "")) + section("מקור / מדיום", 6) + section("קמפיינים (UTM)", 5) + section("לחיצות CTA (cta_click)", 6)


def main():
    state = json.load(open(STATE_FILE)) if os.path.exists(STATE_FILE) else {}
    summary = []
    ads = ads_block(summary); ab = landing_split_block(summary); gg = google_block(summary); social = social_block(state, summary); sch = scheduler_block(summary); ag = agent_block(summary)
    cb, todo = comments_block(state)
    if todo: summary.append(f"💬 {len(todo)} תגובות ממתינות לתשובה")
    ga = ga_compact()
    if os.path.exists("ga.md"):
        tot = next((l for l in open("ga.md", encoding="utf-8").read().splitlines() if l.startswith("**סה")), "")
        if tot: summary.append("אתר: " + tot.replace("**", "").replace("סה\"כ:", "").strip())
    body = h("div", h("h1", f"דוח שיווק יומי · {today.strftime('%d.%m.%Y')}") + h("h2", "שורה תחתונה") + h("ul", "".join(h("li", x) for x in summary)) + ads + ab + gg + social + sch + ag + cb + ga
                + h("p", h("i", "נוצר אוטומטית על ידי סוכן השיווק של AI Lab. תשובות לתגובות מתפרסמות רק אחרי אישור.")), dir="rtl")
    if todo: body += "\n\n<!-- COMMENTS_JSON " + json.dumps(todo, ensure_ascii=False) + " -->"
    open("report.md", "w", encoding="utf-8").write(body)
    json.dump(state, open(STATE_FILE, "w"), ensure_ascii=False, indent=2)
    print(body)


if __name__ == "__main__":
    main()
