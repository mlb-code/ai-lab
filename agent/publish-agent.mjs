// סוכן הפרסום — "פרסום בקליק" (08.09.2026, בקשת מאיר)
// מאיר עונה על מייל של Issue (דוח הנראות או כל Issue) במילה אחת:
//   טיוטה [: נושא]  → הסוכן כותב מאמר מלא ומצרף אותו כתגובה ב-Issue (לא מפרסם)
//   פרסם  [: נושא]  → הסוכן מפרסם (משתמש בטיוטה שנשמרה אם יש, אחרת כותב), מעדכן בלוג/סייטמאפ/llms, ומגיב עם הקישור
// נושא המאמר: מהשורה אחרי המילה (פרסם: X), אחרת מ"ההמלצה השבועית" בגוף ה-Issue.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const anthropicKey = process.env.ANTHROPIC_API_KEY;
const ghToken = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY || "mlb-code/ai-lab";
const issueNumber = process.env.ISSUE_NUMBER;
const commentBody = (process.env.COMMENT_BODY || "").trim();
const DRY = process.env.DRY_RUN === "1";              // בדיקה מקומית: לא נוגע בריפו ולא ב-GitHub
const OUT = DRY ? (process.env.OUT_DIR || "/tmp/publish-agent") : ".";
if (!anthropicKey) { console.error("חסר ANTHROPIC_API_KEY"); process.exit(1); }

const mode = /^(פרסם|publish)/.test(commentBody.trim()) ? "publish" : /^(טיוטה|draft)/.test(commentBody.trim()) ? "draft" : null;
if (!mode) { console.log("לא פקודה של הסוכן — מסיים."); process.exit(0); }
// תשובה מהמייל מגיעה עם כל הציטוט של ההודעה המקורית (כולל קישורי unsubscribe עם טוקנים) — לוקחים רק את השורה הראשונה
const firstLine = commentBody.split(/\r?\n/).map(l => l.trim()).find(l => l) || "";
const topicFromComment = firstLine.replace(/^(פרסם|publish|טיוטה|draft)\s*[:：-]?\s*/, "").replace(/https?:\/\/\S+/g, "").trim().slice(0, 200);

// ---------- GitHub ----------
const gh = async (p, init = {}) => {
  const r = await fetch(`https://api.github.com/repos/${repo}${p}`, { ...init, headers: { Authorization: `Bearer ${ghToken}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`GitHub ${p}: ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
};
const comment = async (text) => { if (DRY || !ghToken || !issueNumber) { console.log("\n[תגובה ל-Issue]\n" + text); return; } await gh(`/issues/${issueNumber}/comments`, { method: "POST", body: JSON.stringify({ body: text }) }); };

let issueBody = "";
if (!DRY && ghToken && issueNumber) { try { issueBody = (await gh(`/issues/${issueNumber}`)).body || ""; } catch (e) { console.warn("לא נקרא גוף ה-Issue:", e.message); } }
const recFromIssue = (() => {
  const m = issueBody.match(/ההמלצה השבועית[^\n]*\n+([\s\S]{20,900}?)(?:\n\n---|\n@mlb-code|$)/);
  return m ? m[1].trim() : "";
})();
const topic = topicFromComment || process.env.TOPIC || recFromIssue;
if (!topic) { await comment("לא מצאתי נושא. כתוב: `פרסם: <נושא המאמר>` או `טיוטה: <נושא>`."); process.exit(0); }

// ---------- הקשר מהאתר: מאמרים קיימים (לקישורים פנימיים ולמניעת כפילות) ----------
const blogIndex = fs.readFileSync("blog/index.html", "utf8");
const existing = [...blogIndex.matchAll(/<a class="blog-card" href="\/blog\/([^"]+)\.html">[\s\S]*?<h3 class="blog-card-title">([^<]+)<\/h3>/g)].map(m => ({ slug: m[1], title: m[2].trim() }));
const tags = [...new Set([...blogIndex.matchAll(/blog-card-tag">([^<]+)</g)].map(m => m[1]))];

// ---------- טיוטה שמורה? ----------
const draftPath = `agent/drafts/issue-${issueNumber || "local"}.json`;
let art = null;
if (mode === "publish" && !DRY && fs.existsSync(draftPath)) { art = JSON.parse(fs.readFileSync(draftPath, "utf8")); console.log("משתמש בטיוטה שמורה:", art.slug); }

// ---------- כתיבה עם Claude ----------
if (!art) {
  const system = `אתה כותב התוכן של AI Lab (ai-lab.co.il) — בית ספר ישראלי לבינה מלאכותית ויזמות לילדים ונוער (גילאי 9–17, קורסים חיים בזום, קבוצות של עד 5, מנחה: מאיר לביא). אתה כותב מאמר בלוג בעברית להורים, ברמה של המאמרים הקיימים באתר.
כללים מחייבים:
- עברית טבעית וחמה, פנייה להורים ברבים ("אתם"). בלי ז'רגון, בלי אנגלית מיותרת. 1,100–1,500 מילים.
- בלי הבטחות ("הילד ילמד/ידע/יצליח") — כותבים "במה עוסקים", "מה בונים", "מה יוצא".
- בלי אימוג'י. בלי שמות של ילדים אמיתיים. בלי לדבר על גילאים מינימליים או תנאי שימוש של כלים/פלטפורמות.
- SEO: הכותרת עד 60 תווים עם מילת המפתח; תיאור 120–155 תווים; h2 לכל סעיף; FAQ של 3–4 שאלות בסוף; 2–3 קישורים פנימיים למאמרים קיימים מהרשימה (href="/blog/<slug>.html"); אזכור טבעי אחד של AI Lab עם קישור <a href="/#courses">.
- HTML בלבד בגוף, עם התגיות: <p>, <h2>, <h3>, <ul><li>, <strong>, ו-4 סוגי תיבות: <div class="highlight-box">, <div class="success-box"><h3>…</h3>…</div>, <div class="danger-box"><h3>…</h3>…</div>, <div class="quote-box"><p>…</p></div>. את ה-FAQ מכניסים ב-<div class="highlight-box"> עם <p><strong>שאלה: …</strong></p><p>תשובה</p>.
- מקורי לחלוטין. לא להמציא נתונים או מחקרים; אם צריך מספר — "לפי הניסיון שלנו".
החזר JSON בלבד (בלי טקסט מסביב):
{"slug":"english-kebab-slug","title":"…","description":"…","excerpt":"משפט אחד לכרטיס (עד 140 תווים)","tag":"אחד מ: ${tags.join(" / ")}","readMinutes":6,"bodyHtml":"…","faq":[{"q":"…","a":"…"}],"related":["slug1","slug2"]}`;
  const user = `נושא המאמר (מהמלצת סוכן הנראות / ממאיר):\n${topic}\n\nמאמרים קיימים באתר (slug — כותרת):\n${existing.map(e => `${e.slug} — ${e.title}`).join("\n")}\n\nאל תכתוב מאמר שכבר קיים ברשימה; אם הנושא כמעט זהה — קח זווית אחרת ומובחנת.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-opus-5", max_tokens: 9000, thinking: { type: "adaptive" }, system, messages: [{ role: "user", content: user }] }),
  });
  const ai = await res.json();
  const text = (ai.content || []).filter(c => c.type === "text").map(c => c.text).join("\n");
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) { await comment("הכתיבה נכשלה (לא התקבל JSON). נסה שוב או נסח את הנושא אחרת.\n\n" + text.slice(0, 400)); process.exit(1); }
  art = JSON.parse(json);
  art.slug = String(art.slug || "article").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  if (existing.some(e => e.slug === art.slug) || fs.existsSync(`blog/${art.slug}.html`)) art.slug += "-" + new Date().toISOString().slice(0, 10);
  if (!tags.includes(art.tag)) art.tag = "הורים";
  art.related = (art.related || []).filter(s => existing.some(e => e.slug === s)).slice(0, 3);
  art.topic = topic; art.createdAt = new Date().toISOString();
}

// ---------- בניית ה-HTML מהתבנית של הבלוג ----------
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const today = new Date(); const iso = today.toISOString().slice(0, 10);
const heMonth = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"][today.getMonth()];
const IMG = "https://ai-lab.co.il/og-image-2026.jpg";
const url = `https://ai-lab.co.il/blog/${art.slug}.html`;
const tpl = fs.readFileSync("blog/kids-ai-privacy.html", "utf8");
let head = tpl.slice(0, tpl.indexOf('<link rel="stylesheet" href="/blog/shared.css">'));
head = head.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(art.title)} | עולם ה-AI | AI Lab</title>`)
  .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(art.description)}">`)
  .replace(/https:\/\/ai-lab\.co\.il\/blog\/kids-ai-privacy\.html/g, url)
  .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(art.title)} | AI Lab">`)
  .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(art.description)}">`)
  .replace(/https:\/\/ai-lab\.co\.il\/blog\/images\/article-11-kids-ai-privacy\.jpg/g, IMG);
const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const scripts = [
  ld({ "@context": "https://schema.org", "@type": "Article", headline: art.title, description: art.description, image: IMG, author: { "@type": "Person", name: "מאיר לביא", url: "https://ai-lab.co.il" }, publisher: { "@type": "Organization", name: "AI Lab", logo: { "@type": "ImageObject", url: "https://ai-lab.co.il/favicon.png" } }, datePublished: iso, dateModified: iso, mainEntityOfPage: url }),
  ld({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "AI Lab", item: "https://ai-lab.co.il/" }, { "@type": "ListItem", position: 2, name: "עולם ה-AI", item: "https://ai-lab.co.il/blog/" }, { "@type": "ListItem", position: 3, name: art.title.slice(0, 60), item: url }] }),
  ...(art.faq?.length ? [ld({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: art.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) })] : []),
].join("\n");
const related = art.related.map(s => { const e = existing.find(x => x.slug === s); return `            <a href="/blog/${s}.html" style="color:var(--accent);text-decoration:none;font-weight:500;">${e.title} ←</a>`; }).join("\n");
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>';
const page = `${head}<link rel="stylesheet" href="/blog/shared.css">
${scripts}
</head>
<body>
    <!-- SHARED NAV (injected by /blog/shared.js) -->
    <div id="shared-nav"></div>

    <!-- ARTICLE -->
    <article class="article-container">
        <a href="/blog/" class="back-link">&#8594; חזרה לעולם ה-AI</a>
        <span class="article-tag">${esc(art.tag)}</span>
        <span class="article-emoji">${ICON}</span>
        <h1>${esc(art.title)}</h1>
        <div class="article-meta">AI Lab | ${heMonth} ${today.getFullYear()} | קריאה של ${art.readMinutes || 6} דקות</div>

        <div class="article-content">
${art.bodyHtml}
        </div>
    </article>

    <div style="max-width:750px;margin:2rem auto;padding:2rem;background:var(--dark-card);border-radius:16px;border:1px solid rgba(255,255,255,0.06);">
        <h3 style="font-size:1.2rem;margin-bottom:1rem;">מאמרים נוספים שיעניינו אתכם</h3>
        <div style="display:flex;flex-direction:column;gap:0.8rem;">
${related}
        </div>
    </div>

    <!-- SHARED LEAD FORM CTA (injected by /blog/shared.js) -->
    <div id="shared-cta" data-article="${art.slug}"></div>

    <!-- SHARED FOOTER (injected by /blog/shared.js) -->
    <div id="shared-footer"></div>

    <script src="/blog/shared.js"></script>
</body>
</html>
`;

// ---------- טיוטה: שומרים ומגיבים ----------
const plain = art.bodyHtml.replace(/<h2[^>]*>/g, "\n\n## ").replace(/<h3[^>]*>/g, "\n\n### ").replace(/<li[^>]*>/g, "\n- ").replace(/<\/p>/g, "\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
if (mode === "draft") {
  fs.mkdirSync(path.join(OUT, "agent/drafts"), { recursive: true });
  fs.writeFileSync(path.join(OUT, draftPath), JSON.stringify(art, null, 1));
  if (!DRY) gitCommitPush([draftPath], `טיוטת מאמר (Issue #${issueNumber}): ${art.title}`);
  await comment(`📝 **טיוטה מוכנה** — "${art.title}"\n\n_${art.description}_\n\n${plain}\n\n---\n**שאלות נפוצות:** ${art.faq?.map(f => f.q).join(" · ") || "—"}\n\nלפרסום כמו שזה: ענה **פרסם**. לשינוי: ענה **טיוטה: <מה לשנות>** ואכתוב מחדש.`);
  console.log("טיוטה נשמרה:", draftPath);
  process.exit(0);
}

// ---------- פרסום ----------
const files = [];
const w = (rel, content) => { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); files.push(rel); };
w(`blog/${art.slug}.html`, page);
// כרטיס בראש הבלוג + JSON-LD
let idx = blogIndex;
const card = `            <a class="blog-card" href="/blog/${art.slug}.html">
                <img class="blog-card-image" src="/og-image-2026.jpg" loading="lazy" decoding="async" alt="${esc(art.title)}">
                <div class="blog-card-body">
                    <span class="blog-card-tag">${esc(art.tag)}</span>
                    <h3 class="blog-card-title">${esc(art.title)}</h3>
                    <p class="blog-card-excerpt">${esc(art.excerpt || art.description)}</p>
                    <div class="blog-card-meta">
                        <span>${heMonth} ${today.getFullYear()}</span>
                        <span class="blog-card-read">קראו עוד &#8592;</span>
                    </div>
                </div>
            </a>
`;
const firstCard = idx.indexOf('            <a class="blog-card" href="/blog/');
idx = idx.slice(0, firstCard) + card + idx.slice(firstCard);
idx = idx.replace('"blogPost": [\n', `"blogPost": [\n          { "@type": "BlogPosting", "headline": ${JSON.stringify(art.title)}, "url": "${url}" },\n`);
w("blog/index.html", idx);
w("sitemap.xml", fs.readFileSync("sitemap.xml", "utf8").replace("</urlset>", `  <url>\n    <loc>${url}</loc>\n    <lastmod>${iso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`));
w("llms.txt", fs.readFileSync("llms.txt", "utf8").replace("- [עולם ה-AI — כל המאמרים](https://ai-lab.co.il/blog/)\n", `- [עולם ה-AI — כל המאמרים](https://ai-lab.co.il/blog/)\n- [${art.title}](${url})\n`));
if (!DRY && fs.existsSync(draftPath)) { fs.unlinkSync(draftPath); files.push(draftPath); }
if (DRY) { console.log("DRY RUN — נכתב ל:", OUT, files); process.exit(0); }
gitCommitPush(files, `מאמר חדש (פרסום בקליק, Issue #${issueNumber}): ${art.title}`);
await comment(`✅ **פורסם:** ${url}\n\nהמאמר יופיע באתר תוך 1–3 דקות (GitHub Pages). נוסף לבלוג, לסייטמאפ ול-llms.txt. התמונה: קאבר AI Lab.\nלתיקון קטן — כתוב לסשן התפעול; למאמר נוסף — ענה שוב **פרסם: <נושא>** על הדוח הבא.`);
if (issueNumber) { try { await gh(`/issues/${issueNumber}`, { method: "PATCH", body: JSON.stringify({ state: "closed" }) }); } catch { /* */ } }
console.log("פורסם:", url);

function gitCommitPush(paths, msg) {
  const sh = c => execSync(c, { stdio: "inherit" });
  sh(`git config user.name "publish-agent"`); sh(`git config user.email "actions@github.com"`);
  sh(`git add -A ${paths.map(p => `"${p}"`).join(" ")}`);
  sh(`git commit -m "${msg.replace(/"/g, "'")}"`);
  sh(`git pull --rebase`); sh(`git push`);
}
