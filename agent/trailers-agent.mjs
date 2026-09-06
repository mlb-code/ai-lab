// סוכן הטריילרים — רמה 2 של פרסום סרטוני בוגרים (קורס יצירת סרטונים ב-AI)
// מזהה סרטון חדש בתיקיית הדרייב → Claude כותב כיתוב מוכן לפרסום → Issue עם תיוג (= מייל למאיר).
// רץ ב-GitHub Actions. משתמש באותו חשבון שירות של סוכן הנראות (קריאה בלבד מהדרייב).
import crypto from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const STATE_FILE = "agent/trailers-state.json";
const gscJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const ghToken = process.env.GITHUB_TOKEN;
const folderId = process.env.TRAILERS_FOLDER_ID;
const repo = process.env.GITHUB_REPOSITORY || "mlb-code/ai-lab";

if (!gscJson || !anthropicKey) { console.error("חסרים סודות"); process.exit(1); }
if (!folderId) {
  console.log("TRAILERS_FOLDER_ID עדיין לא הוגדר — הסוכן ממתין לתיקיית הדרייב. יוצא בשקט.");
  process.exit(0);
}

// ---- אימות גוגל (JWT → token), הרשאת קריאה לדרייב בלבד ----
async function googleToken(sa, scope) {
  const now = Math.floor(Date.now() / 1000);
  const enc = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: sa.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
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

const sa = JSON.parse(gscJson);
const token = await googleToken(sa, "https://www.googleapis.com/auth/drive.readonly");

// ---- רשימת הסרטונים בתיקייה ----
const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and mimeType contains 'video/'`);
const listRes = await fetch(
  `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,createdTime,webViewLink,size)&pageSize=200&orderBy=createdTime`,
  { headers: { Authorization: `Bearer ${token}` } });
if (!listRes.ok) { console.error("Drive list failed:", listRes.status, await listRes.text()); process.exit(1); }
const files = (await listRes.json()).files ?? [];

const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : { seen: [] };
const fresh = files.filter(f => !state.seen.includes(f.id));
console.log(`בתיקייה ${files.length} סרטונים, מהם ${fresh.length} חדשים.`);
if (fresh.length === 0) process.exit(0);

for (const f of fresh.slice(0, 5)) { // עד 5 בריצה — לא מציפים
  // ---- Claude כותב כיתוב — עם כללי פרטיות קשיחים ----
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      system: `אתה כותב כיתובי רשתות חברתיות ל-AI Lab — בית ספר ישראלי ל-AI לילדים ונוער (ai-lab.co.il). תלמיד בקורס "יצירת סרטונים ב-AI" סיים טריילר לסרט דמיוני שהמציא, והוא יפורסם באינסטגרם ובטיקטוק.
כתוב שתי גרסאות כיתוב בעברית: אחת לאינסטגרם (2-3 שורות + אימוג'ים + 5-8 האשטגים רלוונטיים בעברית ובאנגלית) ואחת קצרצרה לטיקטוק (שורה + האשטגים).
כללי פרטיות מחייבים: השתמש רק בשם פרטי של התלמיד אם הוא מזוהה בשם הקובץ — לעולם לא שם משפחה, לעולם לא מספרי טלפון או ספרות מזהות. אם אין שם ברור — כתוב "תלמיד שלנו". הזכר שהסרטון נוצר עם AI בקורס של AI Lab. סיים בהזמנה עדינה לקורס (ai-lab.co.il). בלי הבטחות ("תלמד"), רק "יוצרים/בונים".`,
      messages: [{ role: "user", content: `שם הקובץ: ${f.name}\nתאריך העלאה: ${f.createdTime}` }],
    }),
  });
  const ai = await res.json();
  const caption = ai.content?.map(c => c.text).filter(Boolean).join("\n") || "(הכיתוב לא נוצר — כתבו ידנית)";

  const body = `🎬 **טריילר חדש של בוגר עלה לתיקייה!**

**קובץ:** ${f.name}
**צפייה:** ${f.webViewLink}
**הורדה:** https://drive.google.com/uc?export=download&id=${f.id}

---

## כיתובים מוכנים לפרסום

${caption}

---

**מה עושים:** 1) צופים ומאשרים את הסרטון · 2) מורידים · 3) מעתיקים את הכיתוב ומפרסמים באינסטגרם/טיקטוק · 4) אם רוצים גם בגלריית האתר — אומרים לקלוד "תוסיף את הטריילר לאתר".

@mlb-code
_נוצר אוטומטית על ידי סוכן הטריילרים_`;

  const ir = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ghToken}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
    body: JSON.stringify({ title: `🎬 טריילר חדש לפרסום — ${new Date().toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" })}`, body, labels: ["trailers-agent"] }),
  });
  console.log(`Issue עבור ${f.id}:`, ir.status);
  state.seen.push(f.id);
}

writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
console.log("state updated");
