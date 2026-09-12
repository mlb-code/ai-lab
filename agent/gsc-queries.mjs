// ייצוא שאילתות חיפוש מ-Search Console (90 יום) — בסיס למחקר מילות מפתח לגוגל אדס (12.09.2026).
// רץ ב-GitHub Actions (gsc-queries.yml, workflow_dispatch). מדפיס Markdown ל-stdout.
import crypto from "node:crypto";

const SITE = "sc-domain:ai-lab.co.il";
const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON);
const days = Number(process.env.DAYS || 90);

async function googleToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${unsigned}.${sig}` });
  const data = await res.json();
  if (!data.access_token) throw new Error("Google auth failed: " + JSON.stringify(data));
  return data.access_token;
}

async function gsc(token, body) {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GSC ${res.status}: ${await res.text()}`);
  return (await res.json()).rows || [];
}

const token = await googleToken(sa);
const end = new Date(Date.now() - 2 * 864e5), start = new Date(end.getTime() - days * 864e5);
const range = { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
const total = await gsc(token, { ...range, dimensions: [] });
console.log(`# שאילתות חיפוש ${range.startDate}–${range.endDate}\n`);
if (total[0]) console.log(`סה"כ: ${total[0].clicks} קליקים · ${total[0].impressions} חשיפות · CTR ${(total[0].ctr * 100).toFixed(1)}% · מיקום ${total[0].position.toFixed(1)}\n`);
const rows = await gsc(token, { ...range, dimensions: ["query"], rowLimit: 200 });
rows.sort((a, b) => b.impressions - a.impressions);
console.log("| שאילתה | חשיפות | קליקים | מיקום |\n|---|---|---|---|");
for (const r of rows.slice(0, 120)) console.log(`| ${r.keys[0]} | ${r.impressions} | ${r.clicks} | ${r.position.toFixed(1)} |`);
console.log("\n## דפים\n| דף | חשיפות | קליקים | מיקום |\n|---|---|---|---|");
for (const r of (await gsc(token, { ...range, dimensions: ["page"], rowLimit: 20 })).sort((a, b) => b.impressions - a.impressions))
  console.log(`| ${r.keys[0].replace("https://ai-lab.co.il", "")} | ${r.impressions} | ${r.clicks} | ${r.position.toFixed(1)} |`);
