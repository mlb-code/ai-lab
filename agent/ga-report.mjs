// דוח GA4 לפי דרישה — מריצים דרך workflow ga-report (gh workflow run ga-report -f days=7).
// מדפיס Markdown ל-stdout ול-GITHUB_STEP_SUMMARY. מסנן localhost.
import crypto from "node:crypto";
import fs from "node:fs";
const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON);
const GA4 = process.env.GA4_PROPERTY_ID;
const DAYS = Number(process.env.DAYS || 7);

async function googleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${unsigned}.${sig}` });
  const d = await res.json(); if (!d.access_token) throw new Error(JSON.stringify(d)); return d.access_token;
}
async function report(token, dims, metrics, range, limit = 15, filter = null) {
  const body = { dateRanges: [range], dimensions: [...dims, { name: "hostName" }].map(d => typeof d === "string" ? { name: d } : d), metrics: metrics.map(m => ({ name: m })), limit: 500 };
  if (filter) body.dimensionFilter = filter;
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4}:runReport`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GA4 ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json(); const merged = new Map();
  for (const r of j.rows || []) {
    const keys = r.dimensionValues.map(d => d.value); const host = keys.pop();
    if (/localhost|127\.0\.0\.1/.test(host || "")) continue;
    if (keys.some(k => /localhost|127\.0\.0\.1/.test(k || ""))) continue; // גם כמקור/מפנה (בדיקות מקומיות של סשן האתר)
    const vals = r.metricValues.map(m => Number(m.value)); const id = keys.join(" | ");
    const cur = merged.get(id) || { k: id, v: vals.map(() => 0) }; cur.v = cur.v.map((x, i) => x + vals[i]); merged.set(id, cur);
  }
  return [...merged.values()].sort((a, b) => b.v[0] - a.v[0]).slice(0, limit);
}
const table = (title, rows, cols) => `\n### ${title}\n| ${cols.join(" | ")} |\n|${cols.map(() => "---").join("|")}|\n` + rows.map(r => `| ${r.k} | ${r.v.join(" | ")} |`).join("\n") + "\n";

const token = await googleToken(sa);
const cur = { startDate: `${DAYS}daysAgo`, endDate: "today" }, prev = { startDate: `${DAYS * 2}daysAgo`, endDate: `${DAYS + 1}daysAgo` };
let md = `## GA4 · ai-lab.co.il · ${DAYS} ימים אחרונים (עד היום)\n`;
const tot = await report(token, [], ["sessions", "totalUsers", "screenPageViews"], cur, 1);
const totp = await report(token, [], ["sessions", "totalUsers", "screenPageViews"], prev, 1);
md += `\n**סה"כ:** ביקורים ${tot[0]?.v[0] ?? 0} (תקופה קודמת ${totp[0]?.v[0] ?? 0}) · משתמשים ${tot[0]?.v[1] ?? 0} · צפיות ${tot[0]?.v[2] ?? 0}\n`;
md += table("לפי יום", await report(token, ["date"], ["sessions", "totalUsers"], cur, 40), ["תאריך", "ביקורים", "משתמשים"]);
md += table("מקור / מדיום", await report(token, ["sessionSource", "sessionMedium"], ["sessions", "totalUsers", "engagedSessions"], cur, 15), ["מקור | מדיום", "ביקורים", "משתמשים", "מעורבים"]);
md += table("קמפיינים (UTM)", await report(token, ["sessionCampaignName", "sessionSource"], ["sessions", "totalUsers", "engagedSessions"], cur, 15), ["קמפיין | מקור", "ביקורים", "משתמשים", "מעורבים"]);
md += table("תוכן UTM (utm_content)", await report(token, ["sessionManualAdContent"], ["sessions", "engagedSessions"], cur, 15), ["utm_content", "ביקורים", "מעורבים"]);
md += table("דפי נחיתה", await report(token, ["landingPagePlusQueryString"], ["sessions", "engagedSessions"], cur, 15), ["דף נחיתה", "ביקורים", "מעורבים"]);
md += table("דפים נצפים", await report(token, ["pagePath"], ["screenPageViews", "totalUsers"], cur, 15), ["דף", "צפיות", "משתמשים"]);
md += table("לחיצות CTA (cta_click)", await report(token, ["customEvent:cta_section", "customEvent:cta_label"], ["eventCount"], cur, 20, { filter: { fieldName: "eventName", stringFilter: { value: "cta_click" } } }), ["סקשן | כפתור", "לחיצות"]);
md += table("מכשיר", await report(token, ["deviceCategory"], ["sessions"], cur, 5), ["מכשיר", "ביקורים"]);
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
