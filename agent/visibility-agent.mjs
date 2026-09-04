// סוכן הנראות של AI Lab — זרוע SEO שבועית
// מושך נתונים מ-Google Search Console, בודק תקינות טכנית, ומבקש מ-Claude דוח בעברית.
// רץ ב-GitHub Actions (ראו .github/workflows/visibility-agent.yml). בלי תלויות חיצוניות.
import crypto from "node:crypto";

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
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
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

const day = d => d.toISOString().slice(0, 10);
function range(daysAgoStart, daysAgoEnd) {
  const s = new Date(Date.now() - daysAgoStart * 864e5), e = new Date(Date.now() - daysAgoEnd * 864e5);
  return { startDate: day(s), endDate: day(e) };
}

// ---- בדיקות טכניות קלות ----
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
      if (path === "/sitemap.xml" && r.ok) {
        const n = ((await r.text()).match(/<loc>/g) || []).length;
        out.push(`כתובות בסייטמאפ: ${n}`);
      }
    } catch (e) { out.push(`${path}: שגיאה — ${e.message}`); }
  }
  return out.join("\n");
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
const tech = await techChecks();

const fmtRows = rows => rows.map(r => `${(r.keys || ["(סה\"כ)"]).join(" | ")} — קליקים ${r.clicks}, חשיפות ${r.impressions}, מיקום ${r.position?.toFixed(1)}`).join("\n") || "(אין נתונים)";

const dataBlock = `## תקופה נוכחית ${cur.startDate}–${cur.endDate}
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
### בדיקות טכניות
${tech}`;

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-5",
    max_tokens: 3000,
    system: `אתה "סוכן הנראות" של AI Lab (ai-lab.co.il) — בית ספר ישראלי ל-AI ויזמות לילדים ונוער. אתה כותב דוח SEO שבועי בעברית למאיר, בעל העסק, שאינו איש טכנולוגיה.
כללים: עברית פשוטה וחמה, בלי ז'רגון. פתח בשורת מצב אחת (עלייה/יציבות/ירידה). הצג עד 5 נקודות עיקריות עם מספרים מדויקים. אם יש ירידה חדה (מעל 30% בקליקים) — פתח ב"⚠️ דורש תשומת לב". סיים ב"ההמלצה השבועית" אחת בלבד: נושא מאמר מבוסס שאילתה עולה, או תיקון טכני — הכי מעשי שיש. אל תמציא נתונים; אם משהו חסר, כתוב שחסר.`,
    messages: [{ role: "user", content: `הנתונים לשבוע זה:\n\n${dataBlock}` }],
  }),
});
const ai = await res.json();
const report = ai.content?.map(c => c.text).filter(Boolean).join("\n") || "שגיאה: לא התקבל דוח מ-Claude.\n" + JSON.stringify(ai).slice(0, 500);

console.log(report);

// ---- פרסום כ-Issue (מגיע למייל של מאיר דרך התראות GitHub) ----
if (ghToken) {
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ghToken}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: JSON.stringify({
      title: `דוח הנראות השבועי — ${day(new Date())}`,
      body: report + "\n\n---\n_נוצר אוטומטית על ידי סוכן הנראות · נתונים: Google Search Console_",
      labels: ["visibility-agent"],
    }),
  });
  console.log("Issue:", r.status);
}
