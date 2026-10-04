// רשימת כל נכסי GA4 שחשבון השירות רואה (לקבלת property id של נכס חדש). רץ ב-GitHub Actions (ga-list.yml).
import crypto from "node:crypto";
const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON);
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${unsigned}.${sig}` });
  const d = await r.json(); if (!d.access_token) throw new Error(JSON.stringify(d)); return d.access_token;
}
const t = await token();
const r = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200", { headers: { Authorization: `Bearer ${t}` } });
const d = await r.json();
for (const a of d.accountSummaries || []) for (const p of a.propertySummaries || []) console.log(`${p.property.replace("properties/", "")}\t${p.displayName}\t(${a.displayName})`);
if (!d.accountSummaries) console.log(JSON.stringify(d));
