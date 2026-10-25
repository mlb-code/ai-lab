// בדיקת סריקה ואינדוקס בגוגל (Search Console URL Inspection API) — 25.10.2026.
// עונה על "גוגל בכלל ראה את המאמרים החדשים?": לכל כתובת — פסק דין (verdict), מצב כיסוי (coverageState), מתי נסרקה לאחרונה.
// הרצה ידנית: gh workflow run gsc-inspect -R mlb-code/ai-lab → טבלה ב-Summary של הריצה (+ סייטמאפים, כולל האם ל-Pro יש סייטמאפ).
// סוכן הנראות השבועי מייבא מכאן את inspectUrls / INSPECT_URLS / proSitemapLine (הקוד הראשי רץ רק כשמריצים את הקובץ ישירות).
// הרשאה: webmasters.readonly מספיקה. מכסה של גוגל: 2,000 בדיקות ביום ו-600 בדקה לנכס — על 429 עוצרים בשקט.
// בלי תלויות חיצוניות.
import crypto from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export const SITE = "sc-domain:ai-lab.co.il"; // נכס דומיין — מכסה גם את pro.ai-lab.co.il
const API = "https://searchconsole.googleapis.com";
const MAX_URLS = 10;

// דף הבית, הבלוג, המאמרים שפורסמו 02–03.10.2026 (מיצוב "חוג תכנות לילדים": קומיטים 18ec753, 367c4eb, 0b803d0) ודף הבית של Pro
export const INSPECT_URLS = [
  "https://ai-lab.co.il/",
  "https://ai-lab.co.il/blog/",
  "https://ai-lab.co.il/blog/coding-class-vs-ai-course.html",
  "https://ai-lab.co.il/blog/kids-coding-class-2026-guide.html",
  "https://ai-lab.co.il/blog/online-classes-for-computer-loving-kids.html",
  "https://ai-lab.co.il/blog/coding-club-teens-tel-aviv.html",
  "https://ai-lab.co.il/blog/computer-class-for-kids-2026.html",
  "https://ai-lab.co.il/blog/how-many-kids-in-coding-class.html",
  "https://ai-lab.co.il/blog/private-ai-lessons-adults.html",
  "https://pro.ai-lab.co.il/",
];

export async function googleToken(sa, scope = "https://www.googleapis.com/auth/webmasters.readonly") {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${unsigned}.${sig}` });
  const data = await res.json();
  if (!data.access_token) throw new Error("Google auth failed: " + JSON.stringify(data));
  return data.access_token;
}

// ---- בדיקת כתובות ----
export async function inspectUrls(token, urls = INSPECT_URLS, siteUrl = SITE) {
  const list = urls.slice(0, MAX_URLS), out = [];
  for (let i = 0; i < list.length; i++) {
    const url = list[i];
    try {
      const r = await fetch(`${API}/v1/urlInspection/index:inspect`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionUrl: url, siteUrl, languageCode: "en-US" }),
      });
      if (r.status === 429) { // מכסה — לא ממשיכים להפציץ; שאר הכתובות מסומנות כ"לא נבדקו"
        out.push({ url, error: "מכסת הבדיקות של גוגל נגמרה כרגע (429)" });
        for (const rest of list.slice(i + 1)) out.push({ url: rest, error: "לא נבדק (מכסה)" });
        break;
      }
      if (!r.ok) {
        const t = await r.text();
        let msg; try { msg = JSON.parse(t).error?.message; } catch { msg = t; }
        out.push({ url, error: `HTTP ${r.status}${r.status === 403 ? " (אין לחשבון השירות הרשאה לכתובת/לנכס)" : ""}: ${(msg || "").slice(0, 140)}` });
        continue;
      }
      const res = (await r.json()).inspectionResult || {};
      const s = res.indexStatusResult || {};
      out.push({ url, verdict: s.verdict, coverageState: s.coverageState, lastCrawlTime: s.lastCrawlTime, robotsTxtState: s.robotsTxtState,
        indexingState: s.indexingState, pageFetchState: s.pageFetchState, googleCanonical: s.googleCanonical, userCanonical: s.userCanonical,
        sitemap: s.sitemap, link: res.inspectionResultLink });
    } catch (e) { out.push({ url, error: e.message.slice(0, 140) }); }
  }
  return out;
}

const VERDICT_HE = { PASS: "✅ באינדקס", NEUTRAL: "⏳ לא באינדקס", FAIL: "❌ שגיאה", PARTIAL: "⚠️ חלקי", VERDICT_UNSPECIFIED: "? לא ידוע" };
// תרגום חופשי של מצבי הכיסוי הנפוצים (ההתאמה לפי תחילת הטקסט, בלי תלות במקף/רישיות)
const COVERAGE_HE = [
  ["submitted and indexed", "באינדקס (נשלח בסייטמאפ)"],
  ["indexed, not submitted in sitemap", "באינדקס (לא דרך הסייטמאפ)"],
  ["indexed", "באינדקס"],
  ["crawled", "גוגל סרק את הדף אבל עדיין לא הכניס לאינדקס"],
  ["discovered", "גוגל יודע שהדף קיים אבל עדיין לא סרק אותו"],
  ["url is unknown to google", "גוגל עדיין לא מכיר את הכתובת"],
  ["excluded by", "מוחרג (noindex)"],
  ["blocked by robots.txt", "חסום ב-robots.txt"],
  ["page with redirect", "דף שמפנה לכתובת אחרת"],
  ["alternate page with proper canonical", "עותק — גוגל מאנדקס את הכתובת הקנונית"],
  ["duplicate", "גוגל רואה בדף כפילות של דף אחר"],
  ["not found (404)", "הדף לא נמצא (404)"],
  ["soft 404", "גוגל חושב שהדף ריק (soft 404)"],
  ["server error", "שגיאת שרת"],
];
export function coverageHe(state = "") {
  const s = state.toLowerCase().replace(/\s*[-–]\s*/g, " ");
  return (COVERAGE_HE.find(([k]) => s.startsWith(k)) || [, ""])[1];
}
const fmtDate = iso => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)).replace(/\//g, ".");
export function crawlAge(iso) {
  if (!iso) return "עדיין לא נסרק";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  return `${fmtDate(iso)} (${days <= 0 ? "היום" : days === 1 ? "אתמול" : `לפני ${days} ימים`})`;
}
function notes(r) {
  const n = [];
  if (r.robotsTxtState === "DISALLOWED") n.push("חסום ב-robots.txt");
  if (r.indexingState && !["INDEXING_ALLOWED", "INDEXING_STATE_UNSPECIFIED"].includes(r.indexingState)) n.push(`noindex (${r.indexingState})`);
  if (r.pageFetchState && !["SUCCESSFUL", "PAGE_FETCH_STATE_UNSPECIFIED"].includes(r.pageFetchState)) n.push(`שליפה: ${r.pageFetchState}`);
  if (r.googleCanonical && r.userCanonical && r.googleCanonical !== r.userCanonical) n.push(`גוגל בחר קנוני אחר: ${r.googleCanonical}`);
  return n.join(" · ");
}
const short = url => url.replace(/^https:\/\/ai-lab\.co\.il/, "").replace(/^https:\/\//, "") || "/";
const cell = v => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

export const indexedCount = results => results.filter(r => r.verdict === "PASS").length;

// טבלת Markdown (ל-Summary של ה-workflow ולפירוט המלא בסוף דוח הנראות)
export function inspectionMarkdown(results) {
  const rows = results.map(r => r.error
    ? `| ${cell(short(r.url))} | ⚠️ לא נבדק | ${cell(r.error)} | | |`
    : `| ${cell(short(r.url))} | ${VERDICT_HE[r.verdict] || cell(r.verdict)} | ${cell(r.coverageState)}${coverageHe(r.coverageState) ? ` — ${coverageHe(r.coverageState)}` : ""} | ${crawlAge(r.lastCrawlTime)} | ${cell(notes(r))} |`);
  const ok = results.filter(r => !r.error).length;
  return `| כתובת | מצב (verdict) | coverageState | נסרק לאחרונה | הערות |\n|---|---|---|---|---|\n${rows.join("\n")}\n\n**סיכום:** ${indexedCount(results)} מתוך ${ok} כתובות שנבדקו נמצאות באינדקס של גוגל` + (ok < results.length ? ` (${results.length - ok} לא נבדקו)` : "") + ".";
}

// שורות טקסט לנתוני הדוח השבועי (Claude מסכם אותן)
export function inspectionLines(results) {
  return results.map(r => r.error
    ? `- ${r.url}: לא נבדק — ${r.error}`
    : `- ${r.url}: verdict ${r.verdict} · coverageState "${r.coverageState}"${coverageHe(r.coverageState) ? ` — ${coverageHe(r.coverageState)}` : ""} · נסרק לאחרונה: ${crawlAge(r.lastCrawlTime)}${notes(r) ? ` · ${notes(r)}` : ""}`).join("\n")
    + `\nסיכום: ${indexedCount(results)} מתוך ${results.filter(r => !r.error).length} כתובות שנבדקו באינדקס.`;
}

// ---- סייטמאפים ----
async function gscGet(token, path) {
  const r = await fetch(`${API}/webmasters/v3${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  return { status: r.status, ok: r.ok, j };
}
export async function listSites(token) {
  const r = await gscGet(token, "/sites");
  return r.ok ? (r.j.siteEntry || []) : { error: `HTTP ${r.status}: ${(r.j.error?.message || "").slice(0, 120)}` };
}
export async function listSitemaps(token, site) {
  const r = await gscGet(token, `/sites/${encodeURIComponent(site)}/sitemaps`);
  if (r.ok) return { site, sitemaps: r.j.sitemap || [] };
  const why = r.status === 403 ? "אין לחשבון השירות גישה לנכס הזה" : r.status === 404 ? "הנכס לא קיים ב-Search Console" : `HTTP ${r.status}`;
  return { site, error: `${why} (${r.status}): ${(r.j.error?.message || "").slice(0, 120)}` };
}
// נכס URL-prefix של Pro (אם נפתח); נכסים נוספים של Pro נאספים מרשימת הנכסים שחשבון השירות רואה
const PRO_PROPERTIES = ["https://pro.ai-lab.co.il/"];

// בודק את נכס הדומיין + נכסי Pro האפשריים; מחזיר את כל התוצאות + מסקנה לגבי סייטמאפ של pro.ai-lab.co.il
export async function sitemapsCheck(token) {
  const sites = await listSites(token);
  const visible = Array.isArray(sites) ? sites.map(s => s.siteUrl) : [];
  const targets = [...new Set([SITE, ...PRO_PROPERTIES, ...visible.filter(s => s.includes("pro.ai-lab.co.il"))])];
  const results = [];
  for (const site of targets) results.push(await listSitemaps(token, site));
  const proMaps = results.flatMap(r => (r.sitemaps || []).filter(m => (m.path || "").includes("pro.ai-lab.co.il")).map(m => ({ ...m, site: r.site })));
  const proDenied = results.filter(r => PRO_PROPERTIES.includes(r.site) && r.error && r.error.includes("(403)"));
  let conclusion;
  if (proMaps.length) conclusion = "✅ יש סייטמאפ של pro.ai-lab.co.il שנשלח לגוגל: " + proMaps.map(m => `${m.path} (בנכס ${m.site}, נשלח ${m.lastSubmitted ? fmtDate(m.lastSubmitted) : "?"}${m.errors && Number(m.errors) ? `, ${m.errors} שגיאות` : ""})`).join(" · ");
  else conclusion = "❌ לא נמצא סייטמאפ של pro.ai-lab.co.il בנכסים שחשבון השירות רואה — צריך לשלוח ב-Search Console את https://pro.ai-lab.co.il/sitemap.xml (משימה למאיר)"
    + (proDenied.length ? `. שימו לב: לנכס ${proDenied.map(r => r.site).join(", ")} אין לחשבון השירות גישה, אז ייתכן שהסייטמאפ נשלח שם ואנחנו פשוט לא רואים.` : ".");
  return { sites, results, proMaps, conclusion };
}
// שורה אחת לדוח השבועי
export async function proSitemapLine(token) {
  try { return (await sitemapsCheck(token)).conclusion; } catch (e) { return `בדיקת הסייטמאפ של Pro נכשלה: ${e.message.slice(0, 120)}`; }
}

function sitemapsMarkdown({ sites, results, conclusion }) {
  let md = "\n## נכסי Search Console שחשבון השירות רואה\n";
  md += Array.isArray(sites) ? (sites.map(s => `- ${s.siteUrl} (${s.permissionLevel})`).join("\n") || "(אין)") : `שגיאה: ${sites.error}`;
  md += "\n\n## סייטמאפים שנשלחו\n";
  for (const r of results) {
    md += `\n### ${r.site}\n`;
    if (r.error) { md += `${r.error}\n`; continue; }
    if (!r.sitemaps.length) { md += "לא נשלחו סייטמאפים בנכס הזה.\n"; continue; }
    md += "| סייטמאפ | נשלח | גוגל הוריד לאחרונה | ממתין | שגיאות | אזהרות | כתובות שנשלחו |\n|---|---|---|---|---|---|---|\n";
    md += r.sitemaps.map(m => `| ${cell(m.path)} | ${m.lastSubmitted ? fmtDate(m.lastSubmitted) : "—"} | ${m.lastDownloaded ? fmtDate(m.lastDownloaded) : "—"} | ${m.isPending ? "כן" : "לא"} | ${m.errors ?? 0} | ${m.warnings ?? 0} | ${(m.contents || []).map(c => `${c.type}: ${c.submitted}`).join(", ") || "—"} |`).join("\n") + "\n";
  }
  return md + `\n## האם ל-pro.ai-lab.co.il יש סייטמאפ שנשלח?\n${conclusion}\n`;
}

// ---- הרצה ישירה (workflow gsc-inspect) ----
async function main() {
  if (!process.env.GSC_SERVICE_ACCOUNT_JSON) { console.error("חסר GSC_SERVICE_ACCOUNT_JSON"); process.exit(1); }
  const token = await googleToken(JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON));
  // אפשר להעביר רשימה אחרת: URLS="https://ai-lab.co.il/a.html, https://ai-lab.co.il/b.html" (עד 10)
  const custom = (process.env.URLS || "").split(/[\s,]+/).filter(u => /^https?:\/\//.test(u));
  const urls = custom.length ? custom : INSPECT_URLS;
  const results = await inspectUrls(token, urls);
  let md = `# סטטוס סריקה בגוגל — ${new Date().toISOString().slice(0, 10)}\nנכס: \`${SITE}\` · ${results.length} כתובות (URL Inspection API)\n\n${inspectionMarkdown(results)}\n`;
  try { md += sitemapsMarkdown(await sitemapsCheck(token)); }
  catch (e) { md += `\n## סייטמאפים\nשגיאה: ${e.message.slice(0, 200)}\n`; }
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
