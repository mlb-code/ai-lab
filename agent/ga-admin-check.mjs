// בדיקת כללי אירועים ב-GA4 (Admin API) + מקור אירועי whatsapp_click/generate_lead (Data API). 13.09.2026.
// מצב רגיל: רק מדפיס. עם DELETE_RULE=<resource name מלא> — מוחק את הכלל הזה (דורש הרשאת עריכה לחשבון השירות).
import crypto from "node:crypto";

const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON);
const PROP = process.env.GA4_PROPERTY_ID;
const DEL = process.env.DELETE_RULE || "";

async function token(scope) {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${unsigned}.${sig}` });
  const d = await res.json(); if (!d.access_token) throw new Error("auth: " + JSON.stringify(d)); return d.access_token;
}
async function call(tok, url, method = "GET", body) {
  const r = await fetch(url, { method, headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t }; }
  return { status: r.status, j };
}

const tok = await token("https://www.googleapis.com/auth/analytics.edit https://www.googleapis.com/auth/analytics.readonly");
const A = "https://analyticsadmin.googleapis.com";
console.log(`# בדיקת GA4 property ${PROP}\n`);

const streams = await call(tok, `${A}/v1beta/properties/${PROP}/dataStreams`);
console.log("## data streams", streams.status); console.log(JSON.stringify(streams.j, null, 1).slice(0, 1500));
for (const s of streams.j.dataStreams || []) {
  const cr = await call(tok, `${A}/v1alpha/${s.name}/eventCreateRules`);
  console.log(`\n## eventCreateRules של ${s.name}`, cr.status); console.log(JSON.stringify(cr.j, null, 1).slice(0, 4000));
  const er = await call(tok, `${A}/v1alpha/${s.name}/eventEditRules`);
  console.log(`\n## eventEditRules של ${s.name}`, er.status); console.log(JSON.stringify(er.j, null, 1).slice(0, 4000));
}
const ke = await call(tok, `${A}/v1beta/properties/${PROP}/keyEvents`);
console.log("\n## keyEvents", ke.status); console.log(JSON.stringify(ke.j, null, 1).slice(0, 2500));

// מאיפה מגיעים האירועים: לפי יום, מקור ומכשיר
const D = `https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`;
for (const ev of ["whatsapp_click", "generate_lead", "landing_view", "page_view", "cta_click"]) {
  const r = await call(tok, D, "POST", { dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
    dimensions: [{ name: "date" }, { name: "sessionSource" }, { name: "hostName" }], metrics: [{ name: "eventCount" }], limit: 30,
    dimensionFilter: { andGroup: { expressions: [
      { filter: { fieldName: "eventName", stringFilter: { value: ev } } },
      { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/parents" } } }] } } });
  console.log(`\n## ${ev} על /parents (7 ימים): יום | מקור | host | כמה`);
  for (const row of r.j.rows || []) console.log(row.dimensionValues.map(d => d.value).join(" | ") + " | " + row.metricValues[0].value);
}

// האם cta_click נעלם בכל האתר אחרי 10.09 (כלל GA4?) או רק בדף הנחיתה
for (const ev of ["cta_click", "whatsapp_click", "generate_lead", "click"]) {
  const r = await call(tok, D, "POST", { dateRanges: [{ startDate: "10daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }, { name: "pagePath" }], metrics: [{ name: "eventCount" }], limit: 40,
    orderBys: [{ dimension: { dimensionName: "date" } }],
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: ev } } } });
  console.log(`\n## ${ev} בכל האתר (10 ימים): יום | דף | כמה`);
  for (const row of r.j.rows || []) console.log(row.dimensionValues.map(d => d.value).join(" | ") + " | " + row.metricValues[0].value);
}
// ניסיון להפעיל את Admin API בפרויקט דרך חשבון השירות (ייכשל אם אין לו הרשאה — אז מאיר מפעיל בקליק)
const en = await call(await token("https://www.googleapis.com/auth/cloud-platform"),
  "https://serviceusage.googleapis.com/v1/projects/429419145749/services/analyticsadmin.googleapis.com:enable", "POST", {});
console.log("\n## enable Admin API:", en.status, JSON.stringify(en.j).slice(0, 300));

if (DEL) {
  const d = await call(tok, `${A}/v1alpha/${DEL}`, "DELETE");
  console.log("\n## DELETE", DEL, d.status, JSON.stringify(d.j).slice(0, 400));
}
