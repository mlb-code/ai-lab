// AI Lab Pro — בלוק יומי לדוח השיווק: GA4 של pro.ai-lab.co.il (אתמול + 7 ימים). מדפיס HTML; שורה ראשונה = סיכום לשורה התחתונה.
import crypto from "node:crypto";
const sa = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON || "{}");
const PROP = process.env.GA4_PRO_PROPERTY_ID;
if (!sa.client_email || !PROP) { console.log("<!--SUMMARY:-->"); process.exit(0); }
async function token() {
  const now = Math.floor(Date.now() / 1000), enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const u = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 });
  const sig = crypto.createSign("RSA-SHA256").update(u).sign(sa.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${u}.${sig}` });
  const d = await r.json(); if (!d.access_token) throw new Error(JSON.stringify(d)); return d.access_token;
}
async function report(t, body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROP}:runReport`, { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`GA4 ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return ((await r.json()).rows || []).map(row => ({ k: (row.dimensionValues || []).map(d => d.value), v: (row.metricValues || []).map(m => Number(m.value)) }));
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
try {
  const t = await token();
  const y = { startDate: "yesterday", endDate: "yesterday" }, w = { startDate: "7daysAgo", endDate: "yesterday" };
  const EV = ["whatsapp_click", "generate_lead", "cta_click", "select_product", "calculator_use"];
  const names = { whatsapp_click: "וואטסאפ", generate_lead: "טפסים (לידים)", cta_click: "שיחת היכרות", select_product: "בחירת מוצר", calculator_use: "מחשבון" };
  const [ty, tw, evy, evw, src] = await Promise.all([
    report(t, { dateRanges: [y], metrics: [{ name: "sessions" }, { name: "totalUsers" }] }),
    report(t, { dateRanges: [w], metrics: [{ name: "sessions" }, { name: "totalUsers" }] }),
    report(t, { dateRanges: [y], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: EV } } } }),
    report(t, { dateRanges: [w], dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }], dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: EV } } } }),
    report(t, { dateRanges: [w], dimensions: [{ name: "sessionSource" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 5 }),
  ]);
  const sy = ty[0]?.v || [0, 0], sw = tw[0]?.v || [0, 0];
  const ey = Object.fromEntries(evy.map(r => [r.k[0], r.v[0]])), ew = Object.fromEntries(evw.map(r => [r.k[0], r.v[0]]));
  const leadsY = (ey.generate_lead || 0) + (ey.whatsapp_click || 0), leadsW = (ew.generate_lead || 0) + (ew.whatsapp_click || 0);
  console.log(`<!--SUMMARY:AI Lab Pro: אתמול ${sy[0]} ביקורים, ${leadsY} פניות (טופס/וואטסאפ) · 7 ימים: ${sw[0]} ביקורים, ${leadsW} פניות-->`);
  const rows = EV.map(e => `<tr><td>${names[e]}</td><td>${ey[e] || 0}</td><td>${ew[e] || 0}</td></tr>`).join("");
  console.log(`<h2>🏢 AI Lab Pro (pro.ai-lab.co.il)</h2>
<p><b>אתמול:</b> ${sy[0]} ביקורים, ${sy[1]} משתמשים · <b>7 ימים:</b> ${sw[0]} ביקורים, ${sw[1]} משתמשים</p>
<table border="1" cellpadding="6" style="border-collapse:collapse"><tr><th>פעולה</th><th>אתמול</th><th>7 ימים</th></tr>${rows}</table>
<p><b>מאיפה מגיעים (7 ימים):</b> ${src.length ? src.map(r => `${esc(r.k[0])} ${r.v[0]}`).join(" · ") : "אין נתונים עדיין"}</p>
<p>לידים מלאים (שם וטלפון): <a href="https://docs.google.com/spreadsheets/d/1mmn9c_gwCjrYc2BSo9VYE1fOovsIIQVDU4nHgLuz9s8/edit">גיליון לידים AI Lab Pro</a></p>`);
} catch (e) { console.log("<!--SUMMARY:-->"); console.log(`<h2>🏢 AI Lab Pro</h2><p>GA4 לא זמין: ${esc(e.message.slice(0, 160))}</p>`); }
