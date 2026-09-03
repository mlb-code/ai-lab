// סוכן ניטור נראות — AI Lab (רץ ב-GitHub Actions כל 3 ימים; דיווח בלבד, לא מתקן)
// 1) מצלם את העמודים המרכזיים במובייל ובדסקטופ (Playwright/Chromium)
// 2) בדיקות טכניות: גלישת רוחב, תמונות שבורות, שגיאות קונסול, כשלי רשת
// 3) אם מוגדר ANTHROPIC_API_KEY — Claude מנתח את הצילומים כבודק נראות אנושי
// 4) כותב report.md; יוצא עם exit 20 כשנמצאו בעיות (ה-workflow פותח Issue → מייל למאיר)
import { chromium } from "playwright";
import { writeFileSync, readFileSync, mkdirSync } from "fs";

const PAGES = [
  { name: "דף הבית — מובייל", url: "https://ai-lab.co.il/", width: 390, height: 844, shot: "home-mobile" },
  { name: "דף הבית — מחשב", url: "https://ai-lab.co.il/", width: 1400, height: 900, shot: "home-desktop" },
  { name: "כל הפרויקטים — מובייל", url: "https://ai-lab.co.il/projects.html", width: 390, height: 844, shot: "projects-mobile" },
  { name: "פלטפורמת ההרשמה — מובייל", url: "https://my.ai-lab.co.il/", width: 390, height: 844, shot: "platform-mobile" },
];

// שגיאות רשת שאינן באשמת האתר — לא מדווחים עליהן:
// אנליטיקס/פיקסלים (נחסמים בסביבת בדיקה), ו-prefetch של Next.js (_rsc) שמבוטל באופן טבעי
const IGNORE_NET = [/googletagmanager|google-analytics|analytics\.google|google\.com\/measurement|googleadservices|doubleclick|facebook|fbcdn|connect\.facebook|[?&]_rsc=/i];

mkdirSync("shots", { recursive: true });
const findings = [];   // בעיות טכניות ודאיות
const notes = [];      // מידע לניתוח של Claude

const browser = await chromium.launch();
for (const p of PAGES) {
  const ctx = await browser.newContext({
    viewport: { width: p.width, height: p.height },
    userAgent: p.width < 500
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
      : undefined,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const consoleErrs = [], netFails = [];
  page.on("pageerror", e => consoleErrs.push(String(e).slice(0, 200)));
  page.on("console", m => { if (m.type() === "error") consoleErrs.push(m.text().slice(0, 200)); });
  page.on("requestfailed", r => {
    // ERR_ABORTED = הדפדפן עצמו ביטל (prefetch, ניווט) — רעש, לא תקלה של האתר
    if (r.failure()?.errorText === "net::ERR_ABORTED") return;
    if (!IGNORE_NET.some(rx => rx.test(r.url()))) netFails.push(`${r.url().slice(0, 120)} (${r.failure()?.errorText})`);
  });
  page.on("response", r => {
    if (r.status() >= 400 && !IGNORE_NET.some(rx => rx.test(r.url()))) netFails.push(`${r.url().slice(0, 120)} → HTTP ${r.status()}`);
  });

  try {
    await page.goto(p.url, { waitUntil: "networkidle", timeout: 45000 });
  } catch {
    findings.push(`**${p.name}**: העמוד לא נטען תוך 45 שניות (${p.url})`);
    await ctx.close();
    continue;
  }
  await page.waitForTimeout(3500); // לתת לאנימציות הפתיחה להסתיים

  // בדיקות בתוך העמוד
  const checks = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const overflowPx = document.documentElement.scrollWidth - vw;
    const brokenImgs = [...document.querySelectorAll("img")]
      .filter(i => i.complete && i.naturalWidth === 0 && i.loading !== "lazy" && i.getBoundingClientRect().width > 5)
      .map(i => (i.currentSrc || i.src || "").slice(0, 120));
    return { overflowPx, brokenImgs, title: document.title };
  });

  if (checks.overflowPx > 4) findings.push(`**${p.name}**: העמוד רחב מהמסך ב-${checks.overflowPx}px — תוכן ייחתך בקצוות (זה הבאג מסוג "טקסט נשבר")`);
  if (checks.brokenImgs.length) findings.push(`**${p.name}**: ${checks.brokenImgs.length} תמונות שבורות: ${checks.brokenImgs.slice(0, 3).join(", ")}`);
  if (consoleErrs.length) findings.push(`**${p.name}**: ${consoleErrs.length} שגיאות JavaScript: ${[...new Set(consoleErrs)].slice(0, 2).join(" | ")}`);
  if (netFails.length) findings.push(`**${p.name}**: ${netFails.length} בקשות שנכשלו: ${[...new Set(netFails)].slice(0, 3).join(" | ")}`);

  // צילום: מסך ראשון + עמוד מלא (חתוך לגבולות ה-API של התמונות)
  await page.screenshot({ path: `shots/${p.shot}-top.png` });
  const fullH = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: `shots/${p.shot}-full.png`, fullPage: true, clip: fullH > 7500 ? { x: 0, y: 0, width: p.width, height: 7500 } : undefined });
  notes.push(`${p.name}: כותרת "${checks.title}", גובה ${fullH}px, גלישת רוחב ${checks.overflowPx}px`);
  await ctx.close();
}
await browser.close();

// ===== ניתוח נראות עם Claude (אם יש מפתח) =====
let aiReport = "";
const KEY = process.env.ANTHROPIC_API_KEY;
if (KEY) {
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: KEY });
    const imgs = ["home-mobile-full", "home-desktop-top", "projects-mobile-top", "platform-mobile-top"];
    const content = [];
    for (const s of imgs) {
      try {
        content.push({ type: "image", source: { type: "base64", media_type: "image/png", data: readFileSync(`shots/${s}.png`).toString("base64") } });
        content.push({ type: "text", text: `(הצילום למעלה: ${s})` });
      } catch { /* צילום חסר — מדלגים */ }
    }
    content.push({
      type: "text",
      text: `אתה בודק נראוּת (QA ויזואלי) של אתר AI Lab — מרכז קורסי AI לילדים, אתר עברי RTL בעיצוב כהה-זכוכיתי.
לפניך צילומי מסך עדכניים. דווח אך ורק על בעיות שרואים בוודאות בצילומים:
- טקסט חתוך, מילים שבורות, טקסט שגולש מהמסך או מקופסה
- אלמנטים חופפים, לא מיושרים, או צמודים מדי לקצה
- טקסט בלתי קריא על הרקע, כפתורים שנראים שבורים
- אזורים ריקים חשודים או תמונות חסרות
ממצאים טכניים שנמדדו: ${notes.join(" · ")}
כתוב בעברית, קצר ולעניין. אם הכל תקין — כתוב שורה אחת: "לא נמצאו בעיות נראות בצילומים." אל תמציא בעיות ואל תציע שיפורי עיצוב — רק תקלות.`,
    });
    const msg = await client.messages.create({
      model: "claude-sonnet-5",
      // דגמי Claude 5 חושבים לפני תשובה — חייבים תקציב שמכסה גם את החשיבה,
      // אחרת התשובה נחתכת לפני בלוק הטקסט (קרה בריצה #2: דוח ריק)
      max_tokens: 6000,
      messages: [{ role: "user", content }],
    });
    aiReport = msg.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    if (!aiReport) aiReport = `(המודל לא החזיר טקסט — stop_reason=${msg.stop_reason}, blocks=${msg.content.map(b => b.type).join(",")})`;
  } catch (e) {
    aiReport = `(ניתוח Claude נכשל: ${String(e).slice(0, 160)})`;
  }
} else {
  aiReport = "(ניתוח חזותי של Claude כבוי — חסר ANTHROPIC_API_KEY בסודות ה-repo)";
}

// ===== דוח =====
const aiFoundProblems = aiReport && !aiReport.includes("לא נמצאו בעיות נראות");
const hasProblems = findings.length > 0 || (KEY && aiFoundProblems && !aiReport.startsWith("(") );
const now = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
const report = `# 🔍 דוח סוכן הנראות — ${now}

${findings.length ? "## בעיות טכניות שנמדדו\n" + findings.map(f => "- " + f).join("\n") : "✅ הבדיקות הטכניות תקינות (רוחב עמוד, תמונות, שגיאות JS, רשת)."}

## עין של Claude על הצילומים
${aiReport}

---
*הסוכן בודק: דף הבית (מובייל+מחשב), כל הפרויקטים, פלטפורמת ההרשמה. דיווח בלבד — שום דבר לא שונה. צילומי המסך המלאים מצורפים ל-Artifacts של הריצה.*
`;
writeFileSync("report.md", report);
console.log(report);
process.exit(hasProblems ? 20 : 0);
