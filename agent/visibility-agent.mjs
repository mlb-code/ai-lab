// סוכן הנראות של AI Lab — זרוע SEO שבועית
// מושך נתונים מ-Google Search Console, בודק תקינות טכנית, ומבקש מ-Claude דוח בעברית.
// רץ ב-GitHub Actions (ראו .github/workflows/visibility-agent.yml). בלי תלויות חיצוניות.
// 25.10.2026: (1) כל שאילתות GA4 מחריגות תנועת בדיקות פנימית (selftest / qa) — ga4-qa-filter.mjs.
// (2) אחריותיות: הדוח נפתח ב"מה קרה עם ההמלצה מהשבוע שעבר" (מהדוח הקודם, התגובות עליו והקומיטים מאז), וההמלצה החדשה = משימה אחת עם אחראי (מאיר / קלוד).
// (3) "סטטוס סריקה בגוגל": URL Inspection למאמרים של 02–03.10 ולדף הבית — gsc-inspect.mjs (אותה רשימה כמו ה-workflow הידני gsc-inspect).
import crypto from "node:crypto";
import { withoutQA, QA_NOTE } from "./ga4-qa-filter.mjs";
import { inspectUrls, inspectionLines, inspectionMarkdown, proSitemapLine } from "./gsc-inspect.mjs";

const SITE = "sc-domain:ai-lab.co.il";
const SITE_URL = "https://ai-lab.co.il";
const AI_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot", "Grok"];

const gscJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const ghToken = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY || "mlb-code/ai-lab";

if (!anthropicKey) { console.error("חסר ANTHROPIC_API_KEY"); process.exit(1); }
if (!gscJson) {
  console.log("GSC_SERVICE_ACCOUNT_JSON עדיין לא הוגדר — הסוכן ממתין להקמת חשבון השירות. יוצא בשקט.");
  process.exit(0);
}

// ---- אימות מול גוגל: JWT חתום ב-RS256 → access token ----
async function googleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${unsigned}.${sig}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Google auth failed: " + JSON.stringify(data));
  return data.access_token;
}

async function gscQuery(token, body) {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GSC ${res.status}: ${await res.text()}`);
  return (await res.json()).rows || [];
}

// ---- Google Analytics 4 (Data API) — ביקורים, מקורות, ומה לוחצים באתר (אירועי cta_click) ----
// דורש: GA4_PROPERTY_ID (משתנה בריפו) + חשבון השירות כ-Viewer בנכס + מימדים מותאמים cta_label / cta_section
const GA4 = process.env.GA4_PROPERTY_ID;
const GA4_PRO = process.env.GA4_PRO_PROPERTY_ID; // AI Lab Pro (pro.ai-lab.co.il), נוסף 04.10.2026
const PRO_URL = "https://pro.ai-lab.co.il";
// Microsoft Clarity (02.10.2026, מאיר: "תכניס את זה לדוח כדי שתהיה לנו ביקורת"): Data Export API, 3 ימים אחרונים.
// דורש CLARITY_API_TOKEN (סוד בריפו) — מאיר מייצר ב-Clarity → Settings → Data Export → Generate new API token.
const CLARITY_TOKEN = process.env.CLARITY_API_TOKEN;
const CLARITY_PRO_TOKEN = process.env.CLARITY_PRO_TOKEN; // פרויקט Clarity נפרד ל-AI Lab Pro (04.10.2026)
async function clarityBlock(tok = CLARITY_TOKEN, title = "כל האתר + הפלטפורמה") {
  if (!tok) return "### Clarity (הקלטות ומפות חום)\nעדיין לא מחובר — חסר CLARITY_API_TOKEN (מאיר מייצר ב-Clarity → Settings → Data Export).";
  const label = { Traffic: "תנועה", ScrollDepth: "עומק גלילה ממוצע", EngagementTime: "זמן מעורבות", DeadClickCount: "לחיצות מתות (לחיצה שלא עשתה כלום)", RageClickCount: "לחיצות זעם (לחיצות חוזרות מתסכול)", QuickbackClick: "חזרה מהירה אחורה", ExcessiveScroll: "גלילה מוגזמת (מחפשים ולא מוצאים)", ScriptErrorCount: "שגיאות סקריפט", ErrorClickCount: "לחיצות שגרמו לשגיאה", PopularPages: "דפים פופולריים", Device: "מכשיר", Browser: "דפדפן", ReferrerUrl: "מקור הפניה", PageTitle: "כותרת דף", OS: "מערכת הפעלה", Country: "מדינה" };
  try {
    const r = await fetch("https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3&dimension1=Device", { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) return `### Clarity (הקלטות ומפות חום)\nשגיאה ${r.status}: ${(await r.text()).slice(0, 200)}`;
    const data = await r.json();
    const lines = [`### Clarity (3 ימים אחרונים, ${title})`];
    for (const m of Array.isArray(data) ? data : []) {
      const info = (m.information || []).slice(0, 8).map(i => Object.entries(i).map(([k, v]) => `${k}: ${v}`).join(", ")).join(" · ");
      lines.push(`- ${label[m.metricName] || m.metricName}: ${info || "(אין נתונים)"}`);
    }
    if (lines.length === 1) lines.push("(אין נתונים עדיין — הכלי הותקן 02.10)");
    return lines.join("\n");
  } catch (e) { return `### Clarity (הקלטות ומפות חום)\nשגיאה: ${e.message.slice(0, 200)}`; }
}
// תנועת פיתוח מקומית (localhost של מאיר) לא נספרת: מוסיפים hostName לכל שאילתה, מסננים בצד שלנו ומאחדים חזרה.
// תנועת בדיקות פנימית (selftest / qa) מסוננת כבר בצד של GA4 (withoutQA).
async function ga4Report(token, body, prop = GA4) {
  // אם השאילתה כבר כוללת sessionSource (דוח המקורות) — לא מוסיפים אותו שוב (GA4 דוחה מימד כפול; תקלת 18.09)
  const base = body.dimensions || [];
  const srcIdx = base.findIndex(d => d.name === "sessionSource");
  const dims = [...base, { name: "hostName" }, ...(srcIdx === -1 ? [{ name: "sessionSource" }] : [])];
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(withoutQA({ ...body, dimensions: dims, limit: Math.min((body.limit || 10) * 4, 250) })), // מחריג תנועת בדיקות פנימית, משולב עם הסינון של השאילתה
  });
  if (!res.ok) throw new Error(`GA4 ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  const merged = new Map();
  for (const r of j.rows || []) {
    const keys = (r.dimensionValues || []).map(d => d.value);
    const source = srcIdx === -1 ? keys.pop() : keys[srcIdx];
    const host = keys.pop();
    if (/localhost|127\.0\.0\.1/.test((host || "") + " " + (source || ""))) continue;
    const vals = (r.metricValues || []).map(m => Number(m.value));
    const id = keys.join("\u0001");
    const cur = merged.get(id) || { k: keys, v: vals.map(() => 0) };
    cur.v = cur.v.map((x, i) => x + (vals[i] || 0));
    merged.set(id, cur);
  }
  return [...merged.values()].sort((a, b) => b.v[0] - a.v[0]).slice(0, body.limit || 10);
}
async function analyticsBlock(token) {
  if (!GA4) return "### אנליטיקס (GA4)\nעדיין לא מחובר — חסר GA4_PROPERTY_ID (מאיר צריך להוסיף את חשבון השירות כ-Viewer בנכס ולשמור את מזהה הנכס).";
  const cur = { startDate: "7daysAgo", endDate: "yesterday" }, prev = { startDate: "14daysAgo", endDate: "8daysAgo" };
  const out = [];
  try {
    const [c, p] = await Promise.all([
      ga4Report(token, { dateRanges: [cur], metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }] }),
      ga4Report(token, { dateRanges: [prev], metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }] }),
    ]);
    const f = r => r[0] ? `ביקורים ${r[0].v[0]}, משתמשים ${r[0].v[1]}, צפיות ${r[0].v[2]}` : "(אין נתונים)";
    out.push(`### ביקורים — 7 ימים אחרונים\n${f(c)}\n### ביקורים — 7 הימים שלפני\n${f(p)}`);
    const src = await ga4Report(token, { dateRanges: [cur], dimensions: [{ name: "sessionSource" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 });
    out.push(`### מאיפה מגיעים (7 ימים)\n${src.map(r => `${r.k[0]} — ${r.v[0]}`).join("\n") || "(אין)"}`);
    const pages = await ga4Report(token, { dateRanges: [cur], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 10 });
    out.push(`### עמודים נצפים (7 ימים)\n${pages.map(r => `${r.k[0]} — ${r.v[0]}`).join("\n") || "(אין)"}`);
    try {
      const clicks = await ga4Report(token, { dateRanges: [cur], dimensions: [{ name: "customEvent:cta_section" }, { name: "customEvent:cta_label" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "cta_click" } } }, orderBys: [{ metric: { metricName: "eventCount" }, desc: true }], limit: 25 });
      const prevClicks = await ga4Report(token, { dateRanges: [prev], dimensions: [{ name: "customEvent:cta_label" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "cta_click" } } }, limit: 60 });
      const pm = Object.fromEntries(prevClicks.map(r => [r.k[0], r.v[0]]));
      out.push(`### על מה לוחצים באתר (אירועי cta_click, 7 ימים; בסוגריים השבוע שלפני)\n${clicks.map(r => `[${r.k[0]}] ${r.k[1]} — ${r.v[0]} (${pm[r.k[1]] ?? 0})`).join("\n") || "(עדיין אין לחיצות מדודות)"}`);
    } catch (e) {
      out.push(`### על מה לוחצים באתר\nלא זמין עדיין — כנראה המימדים המותאמים cta_label / cta_section לא נרשמו ב-GA4 (Admin → Custom definitions). ${e.message.slice(0, 120)}`);
    }
  } catch (e) { out.push(`### אנליטיקס (GA4)\nשגיאה בגישה: ${e.message.slice(0, 200)} — לבדוק שחשבון השירות הוא Viewer בנכס ושמזהה הנכס נכון.`); }
  return out.join("\n");
}

const day = d => d.toISOString().slice(0, 10);
function range(daysAgoStart, daysAgoEnd) {
  const s = new Date(Date.now() - daysAgoStart * 864e5), e = new Date(Date.now() - daysAgoEnd * 864e5);
  return { startDate: day(s), endDate: day(e) };
}

// ---- בדיקות טכניות קלות ----
// ---- AI Lab Pro: GA4 של האתר לעסקים + Search Console (רק דפי pro.) + בדיקות טכניות ----
async function proBlock(token) {
  const out = [];
  const cur = { startDate: "7daysAgo", endDate: "yesterday" }, prev = { startDate: "14daysAgo", endDate: "8daysAgo" };
  // Search Console: רק עמודי pro.ai-lab.co.il (נכס דומיין מכסה את כל התת-דומיינים)
  try {
    const q = async range => {
      const r = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...range, dimensions: ["query"], rowLimit: 10, dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: "pro.ai-lab.co.il" }] }] }),
      });
      return (await r.json()).rows || [];
    };
    const d = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
    const rows = await q({ startDate: d(8), endDate: d(2) });
    const tot = rows.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 });
    out.push(`### בגוגל (Search Console, 7 ימים)\nקליקים ${tot.c}, חשיפות ${tot.i}` + (rows.length ? "\n" + rows.map(r => `- "${r.keys[0]}": קליקים ${r.clicks}, חשיפות ${r.impressions}, מיקום ${r.position.toFixed(1)}`).join("\n") : "\n(עדיין אין שאילתות — האתר הושק 04.10.2026)"));
  } catch (e) { out.push(`### בגוגל\nשגיאה: ${e.message.slice(0, 120)}`); }
  // GA4
  if (!GA4_PRO) out.push("### באתר (GA4)\nחסר GA4_PRO_PROPERTY_ID.");
  else try {
    const [c, p] = await Promise.all([
      ga4Report(token, { dateRanges: [cur], metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }] }, GA4_PRO),
      ga4Report(token, { dateRanges: [prev], metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }] }, GA4_PRO),
    ]);
    const f = r => r[0] ? `ביקורים ${r[0].v[0]}, משתמשים ${r[0].v[1]}, צפיות ${r[0].v[2]}` : "(אין נתונים)";
    out.push(`### באתר (GA4, 7 ימים)\nנוכחי: ${f(c)}\nשבוע קודם: ${f(p)}`);
    const src = await ga4Report(token, { dateRanges: [cur], dimensions: [{ name: "sessionSource" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 }, GA4_PRO);
    out.push("### מאיפה מגיעים\n" + (src.map(r => `- ${r.k[0]}: ${r.v[0]}`).join("\n") || "(אין נתונים)"));
    const pages = await ga4Report(token, { dateRanges: [cur], dimensions: [{ name: "pagePath" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 10 }, GA4_PRO);
    out.push("### עמודים נצפים\n" + (pages.map(r => `- ${r.k[0]}: ${r.v[0]}`).join("\n") || "(אין נתונים)"));
    const ev = await ga4Report(token, { dateRanges: [cur], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["whatsapp_click", "cta_click", "generate_lead", "select_product", "calculator_use", "menu_open"] } } }, limit: 10 }, GA4_PRO);
    const names = { whatsapp_click: "לחיצות וואטסאפ", cta_click: "לחיצות 'שיחת היכרות'", generate_lead: "טפסים שנשלחו (לידים)", select_product: "בחירת מוצר בהירו", calculator_use: "שימוש במחשבון", menu_open: "פתיחת מוצר בתפריט" };
    out.push("### פעולות באתר (אירועי GA4)\n" + (ev.map(r => `- ${names[r.k[0]] || r.k[0]}: ${r.v[0]}`).join("\n") || "(עדיין אין אירועים)"));
  } catch (e) { out.push(`### באתר (GA4)\nשגיאה: ${e.message.slice(0, 200)} — לבדוק שחשבון השירות הוא Viewer בנכס 557307412.`); }
  // טכני
  const checks = [];
  for (const [path, must] of [["/", "AI Lab Pro"], ["/robots.txt", "Allow: /"], ["/sitemap.xml", "<urlset"], ["/llms.txt", "AI Lab Pro"], ["/pricing/", "המחירון"]]) {
    try { const r = await fetch(PRO_URL + path, { redirect: "follow" }); const t = await r.text(); checks.push(`- ${path}: ${r.status === 200 && t.includes(must) ? "תקין" : "⚠️ בעיה (HTTP " + r.status + ")"}`); }
    catch (e) { checks.push(`- ${path}: ⚠️ ${e.message.slice(0, 60)}`); }
  }
  out.push("### בדיקות טכניות\n" + checks.join("\n"));
  return out.join("\n");
}

async function techChecks() {
  const out = [];
  for (const path of ["/llms.txt", "/robots.txt", "/sitemap.xml"]) {
    try {
      const r = await fetch(SITE_URL + path, { redirect: "follow" });
      out.push(`${path}: ${r.status}`);
      if (path === "/robots.txt" && r.ok) {
        const txt = await r.text();
        const blocked = AI_BOTS.filter(b => new RegExp(`User-agent:\\s*${b}[\\s\\S]{0,80}?Disallow:\\s*/\\s*$`, "mi").test(txt));
        out.push(blocked.length ? `⚠️ robots.txt חוסם זחלני AI: ${blocked.join(", ")}` : "זחלני AI (GPTBot/ClaudeBot/Gemini/Perplexity/Grok): לא חסומים");
      }
      if (path === "/llms.txt" && r.ok) {
        // טריות (28.09.2026): הבינות עונות לפי הקובץ הזה — מועדים ישנים או "בקרוב" = תשובות שגויות להורים
        const txt = await r.text();
        const m = txt.match(/עודכן לאחרונה:\s*(\d{4}-\d{2}-\d{2})/);
        const ageDays = m ? Math.round((Date.now() - new Date(m[1]).getTime()) / 86400000) : null;
        if (ageDays == null) out.push("⚠️ llms.txt: אין שורת 'עודכן לאחרונה'");
        else if (ageDays > 45) out.push(`⚠️ llms.txt לא עודכן ${ageDays} ימים (מאז ${m[1]}) — לעדכן מועדי מחזורים ומחירים`);
        else out.push(`llms.txt עודכן לפני ${ageDays} ימים`);
        if (/בקרוב/.test(txt)) out.push("⚠️ llms.txt מכיל 'בקרוב' — להחליף בתאריך אמיתי");
      }
      if (path === "/sitemap.xml" && r.ok) {
        const n = ((await r.text()).match(/<loc>/g) || []).length;
        out.push(`כתובות בסייטמאפ: ${n}`);
      }
    } catch (e) { out.push(`${path}: שגיאה — ${e.message}`); }
  }
  return out.join("\n");
}

// ---- אחריותיות (25.10.2026): מה קרה עם ההמלצה מהשבוע שעבר ----
// מושכים את דוח הנראות הקודם (Issue פתוח או סגור), את "ההמלצה השבועית" שבו, תגובות של מאיר / סוכן הפרסום עליו,
// ואת כותרות הקומיטים מאז — כדי ש-Claude ישפוט אם ההמלצה בוצעה ואם עזרה. תגובות של זרים (הריפו ציבורי) לא נכנסות.
const TITLE_PREFIX = "דוח הנראות השבועי";
const BOT_AUTHORS = /^(marketing-agent|trailers-agent|geo-monitor)$/i;              // עדכוני מצב אוטומטיים — רעש
const NOISE = /^(marketing-agent|trailers-agent|geo-monitor|social:|agent: reminder)|אזור אישי|\/s\/[0-9a-f]{6,}/i; // מדיה, תזכורות, אזורים אישיים של תלמידים
async function ghGet(path) {
  const r = await fetch(`https://api.github.com/repos/${repo}${path}`, { headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json" } });
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  return r.json();
}
// החלק "ההמלצה השבועית" מגוף ה-Issue: מהמופע האחרון של הצירוף (לפני שורת @mlb-code) ועד הכותרת / קו ההפרדה הבא
function extractRecommendation(body = "") {
  const lines = body.split("\n@mlb-code")[0].split(/\r?\n/);
  let start = -1;
  lines.forEach((l, i) => { if (l.includes("ההמלצה השבועית")) start = i; });
  if (start === -1) return "";
  const out = [lines[start].replace(/^[#>\s]+/, "")];
  for (const l of lines.slice(start + 1)) {
    if (/^\s*(#{1,6}\s|-{3,}\s*$|<details)/.test(l)) break;
    out.push(l);
  }
  return out.join("\n").trim().slice(0, 1500);
}
async function previousReportBlock() {
  if (!ghToken) return "(אין GITHUB_TOKEN — הדוח הקודם לא נבדק)";
  try {
    const today = day(new Date());
    const pick = list => (Array.isArray(list) ? list : [])
      .filter(i => !i.pull_request && (i.title || "").startsWith(TITLE_PREFIX) && !(i.title || "").includes(today))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    let prev = pick(await ghGet("/issues?state=all&labels=visibility-agent&sort=created&direction=desc&per_page=10"));
    if (!prev) prev = pick(await ghGet("/issues?state=all&sort=created&direction=desc&per_page=100")); // גיבוי: בלי תווית
    if (!prev) return "אין דוח קודם — זה הדוח הראשון.";
    const rec = extractRecommendation(prev.body || "") || "(לא נמצא חלק 'ההמלצה השבועית' בדוח הקודם)";
    const owner = repo.split("/")[0];
    let comments, commits;
    try {
      comments = (await ghGet(`/issues/${prev.number}/comments?per_page=50`))
        .filter(c => c.user?.login === owner || c.user?.login === "github-actions[bot]")
        .map(c => {
          const first = (c.body || "").split(/\r?\n/).map(l => l.trim()).find(Boolean) || ""; // תשובה מהמייל מגיעה עם ציטוט — רק השורה הראשונה
          return `- ${c.user.login === owner ? "מאיר" : "סוכן הפרסום (אוטומטי)"} (${(c.created_at || "").slice(0, 10)}): ${first.slice(0, 200)}`;
        });
    } catch (e) { comments = [`(התגובות לא נקראו: ${e.message})`]; }
    try {
      commits = (await ghGet(`/commits?since=${encodeURIComponent(prev.created_at)}&per_page=100`))
        .map(c => ({ d: (c.commit?.author?.date || "").slice(0, 10), who: c.commit?.author?.name || "", msg: (c.commit?.message || "").split("\n")[0] }))
        .filter(c => !BOT_AUTHORS.test(c.who) && !NOISE.test(c.msg))
        .slice(0, 40).map(c => `- ${c.d} · ${c.msg.slice(0, 160)}`);
    } catch (e) { commits = [`(השינויים לא נקראו: ${e.message})`]; }
    return `דוח #${prev.number} מ-${(prev.created_at || "").slice(0, 10)} (ה-Issue ${prev.state === "closed" ? "סגור" : "פתוח"})
### ההמלצה מהשבוע שעבר (כלשונה)
${rec}
### תגובות על הדוח הקודם (מאיר וסוכן הפרסום בלבד)
${comments.join("\n") || "(אין תגובות — מאיר לא ענה 'טיוטה' / 'פרסם')"}
### שינויים שנדחפו לאתר מאז הדוח הקודם (כותרות קומיטים, בלי עדכונים אוטומטיים ומדיה)
${commits.join("\n") || "(אין שינויים)"}`;
  } catch (e) { return `לא הצלחתי לקרוא את הדוח הקודם: ${e.message.slice(0, 120)}`; }
}

// ---- סטטוס סריקה בגוגל (URL Inspection) — האם המאמרים של 02–03.10 ודף הבית באינדקס ----
async function indexingBlock(token) {
  try {
    const results = await inspectUrls(token);
    return { text: `${inspectionLines(results)}\nסייטמאפ של AI Lab Pro: ${await proSitemapLine(token)}`, table: inspectionMarkdown(results) };
  } catch (e) { return { text: `הבדיקה נכשלה: ${e.message.slice(0, 160)}`, table: "" }; }
}

// ---- הרצה ----
const sa = JSON.parse(gscJson);
const token = await googleToken(sa);
// שבוע אחרון מלא (נתוני GSC מתעדכנים בפיגור של ~יומיים) מול השבוע שלפניו
const cur = range(9, 3), prev = range(16, 10);
const [curTotal, prevTotal, topQueries, prevQueries, topPages] = await Promise.all([
  gscQuery(token, { ...cur, dimensions: [] }),
  gscQuery(token, { ...prev, dimensions: [] }),
  gscQuery(token, { ...cur, dimensions: ["query"], rowLimit: 25 }),
  gscQuery(token, { ...prev, dimensions: ["query"], rowLimit: 25 }),
  gscQuery(token, { ...cur, dimensions: ["page"], rowLimit: 12 }),
]);
// ביטויי היעד (02.10.2026, מפת מילות המפתח): מעקב שבועי — האם המיצוב "חוג תכנות לילדים" תופס
const WATCH = ["חוג תכנות לילדים", "חוגי תכנות לילדים", "חוג מחשבים לילדים", "קורס תכנות לילדים", "קורס תכנות לילדים אונליין", "קורס ai לנוער", "חוג ai לילדים", "קורס בינה מלאכותית לילדים", "חוגים לילדים", "ai lab"];
async function watchlistBlock(token) {
  try {
    const rows = await gscQuery(token, { ...range(28, 3), dimensions: ["query"], rowLimit: 500 });
    const prevRows = await gscQuery(token, { ...range(56, 31), dimensions: ["query"], rowLimit: 500 });
    const find = (rs, q) => rs.find(r => (r.keys?.[0] || "").toLowerCase() === q.toLowerCase());
    const lines = WATCH.map(q => {
      const r = find(rows, q), p = find(prevRows, q);
      if (!r && !p) return `- "${q}": לא מופיעים (0 חשיפות ב-28 יום)`;
      const f = x => x ? `קליקים ${x.clicks}, חשיפות ${x.impressions}, מיקום ${x.position?.toFixed(1)}` : "לא הופיע";
      return `- "${q}": ${f(r)} (28 יום קודמים: ${f(p)})`;
    });
    return lines.join("\n");
  } catch (e) { return `שגיאה: ${e.message.slice(0, 120)}`; }
}
const watch = await watchlistBlock(token);
const tech = await techChecks();
const analytics = await analyticsBlock(token);
const clarity = await clarityBlock();
const pro = await proBlock(token);
const proClarity = CLARITY_PRO_TOKEN ? await clarityBlock(CLARITY_PRO_TOKEN, "AI Lab Pro בלבד") : "### Clarity\nחסר CLARITY_PRO_TOKEN.";
const indexing = await indexingBlock(token);
const previous = await previousReportBlock();

const fmtRows = rows => rows.map(r => `${(r.keys || ["(סה\"כ)"]).join(" | ")} — קליקים ${r.clicks}, חשיפות ${r.impressions}, מיקום ${r.position?.toFixed(1)}`).join("\n") || "(אין נתונים)";

const dataBlock = `## הדוח הקודם — כדי לבדוק מה קרה עם ההמלצה מהשבוע שעבר
${previous}

## תקופה נוכחית ${cur.startDate}–${cur.endDate}
### סה"כ נוכחי
${fmtRows(curTotal)}
### סה"כ שבוע קודם (${prev.startDate}–${prev.endDate})
${fmtRows(prevTotal)}
### שאילתות מובילות — נוכחי
${fmtRows(topQueries)}
### שאילתות מובילות — שבוע קודם
${fmtRows(prevQueries)}
### עמודים מובילים — נוכחי
${fmtRows(topPages)}
### ביטויי היעד — 28 יום אחרונים מול 28 הקודמים (המיצוב "חוג תכנות לילדים" מ-02.10)
${watch}
### בדיקות טכניות
${tech}
### סטטוס סריקה בגוגל (URL Inspection: דף הבית, הבלוג, המאמרים שפורסמו 02–03.10.2026, דף הבית של Pro)
${indexing.text}

## אנליטיקס — מה קורה באתר עצמו (Google Analytics) — ${QA_NOTE}
${analytics}

## Clarity — איך הגולשים מתנהגים (הקלטות ומפות חום)
${clarity}

## AI Lab Pro — האתר לעסקים (pro.ai-lab.co.il, הושק 04.10.2026) — נתוני GA4: ${QA_NOTE}
${pro}
${proClarity}`;

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-5",
    // 18.09.2026: ב-Sonnet 5 חשיבה מופעלת כברירת מחדל ואכלה את כל 3,000 הטוקנים — חזר בלוק thinking ריק בלי דוח.
    // לדוח כתיבה אין צורך בחשיבה: מכבים אותה, ונותנים מקום לתשובה עצמה.
    thinking: { type: "disabled" },
    max_tokens: 6000,
    system: `אתה "סוכן הנראות" של AI Lab (ai-lab.co.il) — בית ספר ישראלי ל-AI ויזמות לילדים ונוער. אתה כותב דוח SEO שבועי בעברית למאיר, בעל העסק, שאינו איש טכנולוגיה.
כללים: עברית פשוטה וחמה, בלי ז'רגון; מונח טכני (אינדקס, סייטמאפ וכו') — רק עם הסבר קצר במילים פשוטות. הצג עד 5 נקודות עיקריות עם מספרים מדויקים.
סדר הדוח:
(0) פתח בחלק קצר "מה קרה עם ההמלצה מהשבוע שעבר" (2–4 שורות): מה הומלץ, במשפט אחד; האם זה בוצע — לפי רשימת השינויים שנדחפו לאתר, התגובות על הדוח הקודם ונתוני השבוע; ואם בוצע — האם רואים השפעה במספרים. תן פסק דין אחד ברור: "בוצע ועזר" / "בוצע, עוד מוקדם לראות השפעה" / "בוצע ולא עזר" / "לא בוצע" / "אי אפשר לדעת מהנתונים" — ובמקרה האחרון כתוב במשפט אחד למה. אם לא בוצע — כתוב אם זה עדיין רלוונטי. שים לב לתאריכים: נתוני Search Console בדוח מסתיימים כמה ימים לפני היום, אז שינוי מהימים האחרונים עוד לא יכול להופיע בהם. אם אין דוח קודם — שורה אחת שאומרת זאת. רשימת השינויים נועדה רק לשפוט אם ההמלצה בוצעה: אל תצטט ממנה מעבר לזה, ואל תזכיר שמות של אנשים.
מיד אחריו שורת מצב אחת (עלייה/יציבות/ירידה). אם יש ירידה חדה (מעל 30% בקליקים) — שורת המצב מתחילה ב"⚠️ דורש תשומת לב".
(1) "בגוגל" — חיפושים, שאילתות, מיקומים (Search Console). הוסף פסקה קצרה "ביטויי היעד": אילו מ-10 הביטויים כבר מופיעים, באיזה מיקום, ומה השתנה מול 28 הימים הקודמים — זה המדד להצלחת המיצוב "חוג תכנות לילדים".
(2) "סטטוס סריקה בגוגל" — חלק קצר: כמה מהכתובות שנבדקו כבר באינדקס של גוגל (כלומר יכולות להופיע בחיפוש), אילו עדיין לא — לפי שם המאמר במילים פשוטות ומה המצב שלהן (למשל "גוגל יודע שהדף קיים אבל עדיין לא סרק אותו"), ומתי גוגל ביקר בהן לאחרונה. המאמרים פורסמו 02–03.10.2026; מאמר שעדיין לא באינדקס אחרי שלושה שבועות — ציין זאת במפורש. הוסף שורה אחת על הסייטמאפ של AI Lab Pro (נשלח לגוגל או לא). אם הבדיקה נכשלה או שהמכסה נגמרה — שורה אחת. טבלה מלאה לכל כתובת מצורפת אוטומטית בסוף הדוח, אז אין צורך לפרט כתובות שבאינדקס אחת-אחת.
(3) "באתר" — ביקורים, מאיפה מגיעים, ואיזה כפתורים לוחצים יותר ופחות (Google Analytics, אירועי cta_click). תמיד ציין: 3 הכפתורים הכי נלחצים, כפתורים חשובים שכמעט לא לוחצים עליהם (במיוחד הרשמה/מפת הקורסים/דיסקורד/וואטסאפ), ומגמה מול השבוע הקודם. מעקב הלחיצות (cta_click) כבר מותקן באתר מ-08.09.2026 — אם אין עדיין נתוני לחיצות, כתוב שהם מצטברים ואל תמליץ "לחבר מעקב". אם האנליטיקס לא מחובר — כתוב זאת במשפט אחד ומה צריך כדי לחבר. נתוני האנליטיקס לא כוללים תנועת בדיקות פנימית (מקור selftest / מדיום qa) — כתוב זאת בשורה אחת קצרה בחלק הזה. מספרים שמופיעים בהמלצה מהשבוע שעבר אולי כללו את התנועה הזו — אל תשווה אליהם ישירות; ההשוואה לשבוע הקודם בנתונים כבר נקייה.
(4) "התנהגות" — Clarity: לחיצות זעם/מתות, עומק גלילה, זמן מעורבות, לפי מכשיר; מה זה אומר על חוויית ההרשמה ומה לתקן. אם Clarity לא מחובר או ריק — שורה אחת שאומרת זאת.
(5) חלק קצר ונפרד: "AI Lab Pro — האתר לעסקים" (pro.ai-lab.co.il): ביקורים, מאיפה, לחיצות וואטסאפ וטפסים (לידים), ושאילתות אם יש. שם הקהל הוא בעלי עסקים, לא הורים; ההשוואה היא לשבוע הקודם בלבד. אם אין עדיין נתונים, כתוב שהאתר חדש ומה לבדוק בשבוע הבא.
(6) סיים בחלק "ההמלצה השבועית": משימה אחת בלבד, קונקרטית, שאפשר לבצע השבוע — הכי מעשית שיש (נושא מאמר מבוסס שאילתה עולה, תיקון טכני, שינוי בכפתור שלא ממיר, או פעולה בחשבון). מבנה קבוע, ארבע שורות:
**אחראי:** מאיר — כשהמשימה דורשת אותו: חשבונות, כניסה למערכות (Search Console, גוגל לעסק, מטא וכו'), כסף או החלטה עסקית. או **אחראי:** קלוד — כשזה שינוי בקוד, באתר או בתוכן (מאמר, כותרת, כפתור, תיקון טכני) שקלוד יכול לעשות לבד.
**המשימה:** צעד אחד ברור — מה בדיוק ואיפה. אם המשימה היא מאמר: האחראי קלוד, והשורה מתחילה ב"מאמר:" ואחריה הנושא.
**למה:** המספר מנתוני השבוע שמצדיק אותה.
**איך נדע שזה עבד:** מה נבדוק בדוח של השבוע הבא.
אם ההמלצה מהשבוע שעבר לא בוצעה ועדיין היא הכי חשובה — מותר לחזור עליה, אבל כתוב "חוזרת מהשבוע שעבר" ופרק אותה לצעד קטן יותר; אחרת בחר משימה אחרת.
את הצירוף "ההמלצה השבועית" כתוב רק בכותרת של החלק האחרון — לא בשום מקום אחר בדוח (מערכת אוטומטית מחפשת אותו). בחלק הפתיחה כתוב "ההמלצה מהשבוע שעבר".
אל תמציא נתונים; אם משהו חסר, כתוב שחסר.`,
    messages: [{ role: "user", content: `הנתונים לשבוע זה:\n\n${dataBlock}` }],
  }),
});
const ai = await res.json();
// רק בלוקי טקסט (לא thinking); אם אין — שגיאה קריאה עם הסיבה, בלי להדביק את ה-JSON הגולמי לדוח
const reportText = (ai.content ?? []).filter(c => c.type === "text" && c.text).map(c => c.text).join("\n").trim();
const report = reportText || `שגיאה: לא התקבל דוח מ-Claude (stop_reason: ${ai.stop_reason ?? "?"}, שגיאה: ${ai.error?.message ?? "אין"}). אפשר להריץ שוב את ה-workflow ידנית.`;

console.log(report);

// ---- פרסום כ-Issue (מגיע למייל של מאיר דרך התראות GitHub) ----
if (ghToken) {
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ghToken}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: JSON.stringify({
      title: `דוח הנראות השבועי — ${day(new Date())}`,
      // הטבלה המלאה של סטטוס הסריקה — אחרי קו הפרדה, כך שסוכן הפרסום (שקורא את "ההמלצה השבועית" עד ה-"---" הבא) לא יקלוט אותה
      body: report
        + (indexing.table ? `\n\n---\n<details><summary>סטטוס סריקה בגוגל — פירוט לכל כתובת</summary>\n\n${indexing.table}\n\n</details>` : "")
        + "\n\n---\n@mlb-code — הדוח השבועי מוכן.\n\n**אם ההמלצה השבועית היא מאמר** — ענה על המייל הזה במילה אחת: **טיוטה** (אקבל את המאמר כאן לעיון) או **פרסם** (יתפרסם ישירות באתר). אפשר גם לכוון: `פרסם: <נושא אחר>`.\n"
        + `_נוצר אוטומטית על ידי סוכן הנראות · נתונים: Google Search Console, Google Analytics, Clarity · ${QA_NOTE}_`,
      labels: ["visibility-agent"],
    }),
  });
  console.log("Issue:", r.status);
}
