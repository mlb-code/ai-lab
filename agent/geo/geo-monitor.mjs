// מעקב GEO חודשי של AI Lab — האם מנועי ה-AI (ChatGPT, Gemini, Perplexity, Claude, Grok) ממליצים על AI Lab
// כשהורים שואלים בעברית, ומי המתחרים שמופיעים במקומנו.
//
// רץ ב-GitHub Actions פעם בחודש (ראו .github/workflows/geo-monitor.yml) או ידנית: node agent/geo/geo-monitor.mjs
// בלי תלויות חיצוניות (Node 20+). כל מנוע נשאל דרך ה-API הרשמי שלו עם חיפוש ברשת מופעל.
//
// קלט:   agent/geo/questions.json (12 שאלות), agent/geo/competitors.json (מתחרים ידועים)
// פלט:   agent/geo/results/<YYYY-MM>/<engine>.json  — תשובות גולמיות (טקסט, ציטוטים, שימוש, עלות)
//        agent/geo/results/<YYYY-MM>/summary.json    — ציונים לחישוב מגמה בחודש הבא
//        agent/geo/reports/דוח-GEO-<YYYY-MM>.md       — הדוח בעברית (נפתח כ-Issue = מייל למאיר)
//        agent/geo/latest.json                        — מצביע לדוח האחרון (ל-workflow ולסשן התפעול)
//
// משתני סביבה:
//   מפתחות:  ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, PERPLEXITY_API_KEY, XAI_API_KEY (מה שחסר — המנוע מדולג ומסומן "חסר מפתח")
//   GEO_RUNS=3          כמה ריצות לכל שאלה בכל מנוע
//   GEO_MONTH=YYYY-MM   חודש הדוח (ברירת מחדל: החודש הנוכחי בשעון ישראל)
//   GEO_BUDGET_USD=5    תקרת עלות משוערת לריצה — מעבר לה הריצה נעצרת והדוח מציין זאת
//   GEO_ONLY=gemini,anthropic   להריץ רק מנועים מסוימים (לבדיקות)
//   GEO_LIMIT=2         להריץ רק N שאלות ראשונות (לבדיקות)
//   GEO_JUDGE=0         לכבות את שופט ה-LLM הזול (Haiku) שמחלץ שמות עסקים שלא ברשימה
//   GEO_COPY_DIR=/path  להעתיק את הדוח גם לתיקייה נוספת (למשל ailab-center-platform)
//   GEMINI_GEO_MODEL / OPENAI_GEO_MODEL / XAI_GEO_MODEL / ANTHROPIC_GEO_MODEL — להחליף מודל בלי לגעת בקוד

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const SITE = "https://ai-lab.co.il";
const OUR_DOMAINS = ["ai-lab.co.il"]; // כולל סאב-דומיינים (my., starter.)

const RUNS = Math.max(1, Number(process.env.GEO_RUNS || 3));
const BUDGET = Number(process.env.GEO_BUDGET_USD || 5);
const ONLY = (process.env.GEO_ONLY || "").split(",").map(s => s.trim()).filter(Boolean);
const LIMIT = Number(process.env.GEO_LIMIT || 0);
const JUDGE_ON = process.env.GEO_JUDGE !== "0";

// חודש הדוח בשעון ישראל
function ilMonth() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const MONTH = process.env.GEO_MONTH || ilMonth();
const TODAY_IL = new Date().toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric" });

const questionsAll = JSON.parse(fs.readFileSync(path.join(HERE, "questions.json"), "utf8"));
const questions = LIMIT ? questionsAll.slice(0, LIMIT) : questionsAll;
const COMPETITORS = JSON.parse(fs.readFileSync(path.join(HERE, "competitors.json"), "utf8")).competitors;

const RESULTS_DIR = path.join(HERE, "results", MONTH);
const REPORTS_DIR = path.join(HERE, "reports");
fs.mkdirSync(RESULTS_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

const log = (...a) => console.error(`[geo ${new Date().toISOString().slice(11, 19)}]`, ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- HTTP עם timeout וניסיון חוזר ----------
async function postJson(url, headers, body, { timeoutMs = 150000, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body), signal: ctl.signal });
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* לא JSON */ }
      if (res.ok) return json ?? {};
      const retryable = res.status === 429 || res.status >= 500;
      lastErr = new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
      lastErr.status = res.status;
      if (!retryable || attempt === retries) throw lastErr;
      await sleep(5000 * (attempt + 1));
    } catch (e) {
      lastErr = e;
      if (e.status && !(e.status === 429 || e.status >= 500)) throw e; // שגיאת לקוח — לא לנסות שוב
      if (attempt === retries) throw e;
      await sleep(5000 * (attempt + 1));
    } finally { clearTimeout(t); }
  }
  throw lastErr;
}

const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } };
const isOurDomain = h => OUR_DOMAINS.some(d => h === d || h.endsWith("." + d));

// Gemini מחזיר כתובות redirect (vertexaisearch) — עבור הדומיין שלנו פותרים אותן כדי לדעת איזה עמוד צוטט
const redirectCache = new Map();
async function resolveRedirect(u) {
  if (redirectCache.has(u)) return redirectCache.get(u);
  let out = u;
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 10000);
    const r = await fetch(u, { method: "HEAD", redirect: "manual", signal: ctl.signal });
    clearTimeout(t);
    const loc = r.headers.get("location");
    if (loc) out = loc;
  } catch { /* נשאר כמו שהוא */ }
  redirectCache.set(u, out);
  return out;
}

// ---------- מנועים ----------
// כל מנוע: ask(question) → { text, citations:[{url,title,domain}], results:[{url,title,domain}], searched, usage, costUsd, raw }
// citations = מה שהמנוע ציטט בפועל בתשובה; results = מה שהחיפוש הביא לו (גם אם לא ציטט)
const ENGINES = {
  openai: {
    label: "ChatGPT (OpenAI)",
    envKey: "OPENAI_API_KEY",
    model: process.env.OPENAI_GEO_MODEL || "gpt-4.1-mini",
    price: { in: 0.40, out: 1.60, perSearch: 0.01 }, // $/M טוקנים; $10 ל-1,000 חיפושים
    async ask(q) {
      // Responses API עם כלי web_search (developers.openai.com/api/docs/guides/tools-web-search)
      const j = await postJson("https://api.openai.com/v1/responses", { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, {
        model: this.model,
        input: q,
        tools: [{ type: "web_search", search_context_size: "low", user_location: { type: "approximate", country: "IL", city: "Tel Aviv", timezone: "Asia/Jerusalem" } }],
        include: ["web_search_call.action.sources"],
      });
      const out = j.output || [];
      const msgs = out.filter(o => o.type === "message");
      const parts = msgs.flatMap(m => (m.content || []).filter(c => c.type === "output_text"));
      const text = parts.map(p => p.text).join("\n");
      const citations = parts.flatMap(p => (p.annotations || []).filter(a => a.type === "url_citation").map(a => ({ url: a.url, title: a.title })));
      const calls = out.filter(o => o.type === "web_search_call");
      const results = calls.flatMap(c => (c.action?.sources || []).map(s => ({ url: s.url, title: s.title || "" })));
      const usage = { input: j.usage?.input_tokens || 0, output: j.usage?.output_tokens || 0, searches: calls.length };
      return { text, citations, results, searched: calls.length > 0, usage, raw: { id: j.id, status: j.status } };
    },
  },
  gemini: {
    label: "Gemini (Google)",
    envKey: "GEMINI_API_KEY",
    // 02.10.2026: gemini-2.5-flash כבר לא זמין למשתמשים חדשים (404 "no longer available to new users") — גוגל מפנה ל-gemini-3.8-flash.
    // גם הכי קרוב למה שהורה מקבל באפליקציית Gemini. חיפוש גוגל: 5,000 בקשות חינם בחודש לדגמי 3.x.
    model: process.env.GEMINI_GEO_MODEL || "gemini-3.8-flash",
    price: { in: 0.75, out: 3.75, perSearch: 0 },
    async ask(q) {
      // Grounding with Google Search (ai.google.dev/gemini-api/docs/google-search) דרך generateContent
      const j = await postJson(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, { "x-goog-api-key": process.env.GEMINI_API_KEY }, {
        contents: [{ parts: [{ text: q }] }],
        tools: [{ google_search: {} }],
        generationConfig: { thinkingConfig: { thinkingLevel: "low" }, maxOutputTokens: 2500 },
      });
      const c = j.candidates?.[0] || {};
      const text = (c.content?.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join("\n");
      const gm = c.groundingMetadata || {};
      // ב-Gemini ה-uri הוא redirect של גוגל וה-title הוא הדומיין האמיתי
      const chunks = (gm.groundingChunks || []).map(ch => ch.web).filter(Boolean);
      const results = [];
      for (const w of chunks) {
        let url = w.uri || "";
        const domain = (w.title || "").replace(/^www\./, "").toLowerCase();
        if (isOurDomain(domain) && /vertexaisearch|google/.test(url)) url = await resolveRedirect(url);
        results.push({ url, title: w.title || "", domain: domain.includes(".") ? domain : hostOf(url) });
      }
      // מה שנתמך בציטוט בפועל (groundingSupports מצביעים על אינדקסי chunks)
      const usedIdx = new Set((gm.groundingSupports || []).flatMap(s => s.groundingChunkIndices || []));
      const citations = results.filter((_, i) => usedIdx.has(i));
      const u = j.usageMetadata || {};
      const usage = { input: u.promptTokenCount || 0, output: (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0), searches: (gm.webSearchQueries || []).length ? 1 : 0 };
      return { text, citations: citations.length ? citations : results, results, searched: (gm.webSearchQueries || []).length > 0, usage, raw: { queries: gm.webSearchQueries || [], finishReason: c.finishReason } };
    },
  },
  perplexity: {
    label: "Perplexity",
    envKey: "PERPLEXITY_API_KEY",
    // Sonar Chat Completions הופסק ב-27.09.2026 — המקבילה הרשמית היא Agent API עם preset "fast" (כולל web_search אוטומטית)
    model: "agent/preset:fast",
    price: { in: 0.20, out: 1.20, perSearch: 0.0025 },
    async ask(q) {
      const j = await postJson("https://api.perplexity.ai/v1/agent", { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}` }, {
        preset: "fast",
        input: q,
        tools: [{ type: "web_search", user_location: { country: "IL" } }],
      });
      const out = j.output || [];
      const parts = out.filter(o => o.type === "message").flatMap(m => (m.content || []).filter(c => c.type === "output_text"));
      const text = parts.map(p => p.text).join("\n");
      const citations = parts.flatMap(p => (p.annotations || []).filter(a => a.type === "url_citation").map(a => ({ url: a.url, title: a.title })));
      const results = out.filter(o => o.type === "search_results").flatMap(s => (s.results || []).map(r => ({ url: r.url, title: r.title || "" })));
      const usage = { input: j.usage?.input_tokens || 0, output: j.usage?.output_tokens || 0, searches: results.length ? 1 : 0, reportedCost: j.usage?.cost?.total_cost };
      return { text, citations: citations.length ? citations : results, results, searched: results.length > 0, usage, raw: { id: j.id, model: j.model, status: j.status } };
    },
  },
  anthropic: {
    label: "Claude (Anthropic)",
    envKey: "ANTHROPIC_API_KEY",
    model: process.env.ANTHROPIC_GEO_MODEL || "claude-sonnet-5",
    price: { in: 2.0, out: 10.0, perSearch: 0.01 },
    async ask(q) {
      // כלי web_search_20260209 (platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool).
      // allowed_callers: direct — בלי סינון דינמי, כדי לקבל ציטוטים מפורשים בבלוקי הטקסט (עם הסינון הציטוטים חוזרים ריקים).
      // user_location: קוד מדינה IL לא נתמך (400) — משתמשים בעיר ובאזור זמן.
      // max_uses 2: כל חיפוש מוסיף ~10K טוקנים לקלט (כ-$0.03) — עם 2 חיפושים הריצה החודשית נשארת סביב $3.
      const tool = { type: "web_search_20260209", name: "web_search", max_uses: 2, allowed_callers: ["direct"], user_location: { type: "approximate", city: "Tel Aviv", timezone: "Asia/Jerusalem" } };
      const messages = [{ role: "user", content: q }];
      let content = [], usage = { input: 0, output: 0, searches: 0 }, stop = null;
      for (let turn = 0; turn < 4; turn++) {
        const j = await postJson("https://api.anthropic.com/v1/messages", { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, {
          model: this.model, max_tokens: 2500, thinking: { type: "disabled" }, messages, tools: [tool],
        });
        if (j.error) throw new Error(JSON.stringify(j.error));
        content = content.concat(j.content || []);
        usage.input += j.usage?.input_tokens || 0; usage.output += j.usage?.output_tokens || 0; usage.searches += j.usage?.server_tool_use?.web_search_requests || 0;
        stop = j.stop_reason;
        if (stop !== "pause_turn") break;
        messages.push({ role: "assistant", content: j.content }); // המשך תור שהושהה — מחזירים את התוכן כפי שהוא
      }
      const textBlocks = content.filter(b => b.type === "text");
      const text = textBlocks.map(b => b.text).join("");
      const citations = textBlocks.flatMap(b => (b.citations || []).filter(c => c.type === "web_search_result_location").map(c => ({ url: c.url, title: c.title })));
      const results = content.filter(b => b.type === "web_search_tool_result" && Array.isArray(b.content)).flatMap(b => b.content.filter(r => r.type === "web_search_result").map(r => ({ url: r.url, title: r.title || "" })));
      return { text, citations, results, searched: usage.searches > 0, usage, raw: { stop_reason: stop } };
    },
  },
  xai: {
    label: "Grok (xAI)",
    envKey: "XAI_API_KEY",
    model: process.env.XAI_GEO_MODEL || "grok-4.7",
    price: { in: 2.0, out: 6.0, perSearch: 0.005 },
    async ask(q) {
      // Responses API של xAI עם כלי web_search (docs.x.ai/developers/tools/web-search)
      const j = await postJson("https://api.x.ai/v1/responses", { Authorization: `Bearer ${process.env.XAI_API_KEY}` }, {
        model: this.model,
        input: [{ role: "user", content: q }],
        tools: [{ type: "web_search" }],
      });
      const out = j.output || [];
      const parts = out.filter(o => o.type === "message").flatMap(m => (m.content || []).filter(c => c.type === "output_text"));
      const text = parts.map(p => p.text).join("\n");
      let citations = parts.flatMap(p => (p.annotations || []).filter(a => a.type === "url_citation").map(a => ({ url: a.url, title: a.title })));
      if (!citations.length && Array.isArray(j.citations)) citations = j.citations.map(u => ({ url: typeof u === "string" ? u : u.url, title: "" }));
      const calls = out.filter(o => /web_search/.test(o.type || ""));
      const usage = { input: j.usage?.input_tokens || 0, output: j.usage?.output_tokens || 0, searches: Math.max(calls.length, citations.length ? 1 : 0) };
      return { text, citations, results: citations, searched: usage.searches > 0, usage, raw: { id: j.id, status: j.status } };
    },
  },
};
const ENGINE_ORDER = ["openai", "gemini", "perplexity", "anthropic", "xai"];

function estimateCost(engine, usage) {
  if (typeof usage.reportedCost === "number") return usage.reportedCost;
  const p = ENGINES[engine].price;
  return (usage.input * p.in + usage.output * p.out) / 1e6 + (usage.searches || 0) * p.perSearch;
}

// ---------- ניתוח דטרמיניסטי ----------
const OUR_NAME_PATTERNS = [
  /(?<!Google |MIT |Meta |Microsoft |Stanford |Apple |Amazon |IBM |NVIDIA |Facebook |Open)\bAI[\s\-–]?Lab\b(?!s)/i,
  /איי[\s\-]?(?:איי[\s\-]?)?לאב/,
  /ai-lab\.co\.il/i,
];
function toMatcher(alias) {
  const m = alias.match(/^\/(.+)\/([a-z]*)$/);
  if (m) return new RegExp(m[1], m[2].includes("i") ? m[2] : m[2] + "i");
  return new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
const COMP_MATCHERS = COMPETITORS.map(c => ({ ...c, matchers: c.aliases.map(toMatcher) }));
const GENERIC_HOSTS = ["google.com", "google.co.il", "facebook.com", "instagram.com", "youtube.com", "youtu.be", "tiktok.com", "linkedin.com", "wikipedia.org", "reddit.com", "quora.com", "x.com", "twitter.com", "vertexaisearch.cloud.google.com", "bing.com", "apple.com", "microsoft.com", "openai.com", "anthropic.com"];
const NEWS_HOSTS = ["ynet.co.il", "mako.co.il", "walla.co.il", "haaretz.co.il", "globes.co.il", "calcalist.co.il", "geektime.co.il", "themarker.com", "israelhayom.co.il", "maariv.co.il", "n12.co.il", "kan.org.il", "bizportal.co.il", "ice.co.il"];
const DIRECTORY_HOSTS = ["study.co.il", "hugim.co.il", "kidscity.co.il", "yad2.co.il", "zap.co.il", "easy.co.il", "d.co.il", "b144.co.il", "mitmatch.co.il", "allhugim.co.il", "hugim.org.il"];

function firstIndex(text, re) { const m = re.exec(text); return m ? m.index : -1; }

function competitorByDomain(host) {
  return COMP_MATCHERS.find(c => c.domains.some(d => host === d || host.endsWith("." + d)));
}
function competitorByName(name) {
  return COMP_MATCHERS.find(c => c.matchers.some(re => re.test(name)) || c.name === name);
}

function classifySource(url, domainHint) {
  const host = domainHint || hostOf(url);
  if (!host) return { host, kind: "אחר" };
  if (isOurDomain(host)) {
    let p = ""; try { p = new URL(url).pathname; } catch { /* redirect לא פתור */ }
    if (/vertexaisearch/.test(url)) return { host, kind: "האתר שלנו (עמוד לא ידוע)" };
    if (/^\/blog\//.test(p)) return { host, kind: "הבלוג שלנו", page: p };
    if (/llms\.txt/.test(p)) return { host, kind: "llms.txt שלנו", page: p };
    if (/faq/.test(p)) return { host, kind: "FAQ שלנו", page: p };
    if (host.startsWith("starter.")) return { host, kind: "האתר שלנו (Starter למבוגרים)", page: p };
    if (host.startsWith("my.")) return { host, kind: "האתר שלנו (פלטפורמה)", page: p };
    return { host, kind: p === "/" || p === "" ? "האתר שלנו (דף הבית)" : "האתר שלנו (עמוד אחר)", page: p };
  }
  if (competitorByDomain(host)) return { host, kind: "אתר מתחרה", competitor: competitorByDomain(host).id };
  if (host.endsWith("wikipedia.org")) return { host, kind: "ויקיפדיה" };
  if (NEWS_HOSTS.some(h => host === h || host.endsWith("." + h))) return { host, kind: "אתר חדשות" };
  if (DIRECTORY_HOSTS.some(h => host === h || host.endsWith("." + h))) return { host, kind: "אינדקס/מדריך חוגים" };
  if (GENERIC_HOSTS.some(h => host === h || host.endsWith("." + h))) return { host, kind: "רשת חברתית / כללי" };
  if (/\.(ac|gov|org)\.il$/.test(host)) return { host, kind: "מוסד ישראלי (אקדמיה/ממשל/עמותה)" };
  if (/\.il$/.test(host)) return { host, kind: "אתר ישראלי אחר" };
  return { host, kind: "אתר זר אחר" };
}

function analyze(answer) {
  const text = answer.text || "";
  const allUrls = [...(answer.citations || []), ...(answer.results || [])];
  const citedHosts = new Set((answer.citations || []).map(c => c.domain || hostOf(c.url)).filter(Boolean));

  const ourIdx = Math.min(...OUR_NAME_PATTERNS.map(re => firstIndex(text, re)).filter(i => i >= 0).concat([Infinity]));
  const mentioned = ourIdx !== Infinity;
  const cited = [...citedHosts].some(isOurDomain);
  const seenInResults = (answer.results || []).some(r => isOurDomain(r.domain || hostOf(r.url)));

  const comps = [];
  for (const c of COMP_MATCHERS) {
    const idx = Math.min(...c.matchers.map(re => firstIndex(text, re)).filter(i => i >= 0).concat([Infinity]));
    const inCites = [...citedHosts].some(h => c.domains.some(d => h === d || h.endsWith("." + d)));
    if (idx !== Infinity || inCites) comps.push({ id: c.id, name: c.name, index: idx === Infinity ? null : idx, inText: idx !== Infinity, cited: inCites });
  }
  // דומיינים ישראליים שצוטטו ולא ברשימה — גילוי מתחרים חדשים
  const discoveredDomains = [...new Set(allUrls.map(u => u.domain || hostOf(u.url)).filter(Boolean))]
    .filter(h => !isOurDomain(h) && !competitorByDomain(h) && classifySource("https://" + h, h).kind === "אתר ישראלי אחר");

  const sources = (answer.citations || []).map(c => ({ url: c.url, ...classifySource(c.url, c.domain) }));

  // מיקום: סדר ההופעה הראשונה של AI Lab מול כל הארגונים שזוהו בטקסט
  const orgIdx = comps.filter(c => c.inText).map(c => c.index);
  const position = mentioned ? 1 + orgIdx.filter(i => i < ourIdx).length : null;
  return { mentioned, cited, seenInResults, position, orgsInText: orgIdx.length + (mentioned ? 1 : 0), competitors: comps, discoveredDomains, sources };
}

// ---------- שופט LLM זול (Haiku) — רק כשצריך: תשובה ארוכה שבה הזיהוי הדטרמיניסטי מצא פחות משני ארגונים ----------
async function judgeOrgs(text) {
  if (!JUDGE_ON || !process.env.ANTHROPIC_API_KEY) return null;
  try {
    const j = await postJson("https://api.anthropic.com/v1/messages", { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, {
      model: "claude-haiku-4-5", max_tokens: 400,
      system: "You extract names of organizations, schools, companies or named courses that are recommended or mentioned as providers in a Hebrew/English answer about AI courses. Return ONLY JSON: {\"orgs\":[{\"name\":\"...\",\"domain\":\"... or empty\"}]} in order of appearance. Exclude generic tools and products (ChatGPT, Gemini, Scratch, Canva, Zoom), and exclude the names 'AI Lab'/'ai-lab.co.il'. Max 12 items.",
      messages: [{ role: "user", content: text.slice(0, 6000) }],
    }, { retries: 1 });
    const t = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
    const cost = ((j.usage?.input_tokens || 0) * 1.0 + (j.usage?.output_tokens || 0) * 5.0) / 1e6;
    return { orgs: (parsed.orgs || []).filter(o => o && o.name).slice(0, 12), cost };
  } catch (e) { log("judge failed:", e.message.slice(0, 120)); return null; }
}

// ---------- הרצה ----------
const state = { totalCost: 0, stopped: false, engines: {} };
const activeEngines = ENGINE_ORDER.filter(e => !ONLY.length || ONLY.includes(e));
const missingKeys = ENGINE_ORDER.filter(e => !process.env[ENGINES[e].envKey]);
const runnable = activeEngines.filter(e => process.env[ENGINES[e].envKey]);
const skippedByFilter = ENGINE_ORDER.filter(e => !activeEngines.includes(e) && process.env[ENGINES[e].envKey]);
log(`חודש ${MONTH} · ${questions.length} שאלות × ${RUNS} ריצות · מנועים: ${runnable.join(", ") || "(אין)"} · חסרים: ${missingKeys.join(", ") || "-"}`);

async function runEngine(engine) {
  const E = ENGINES[engine];
  const file = path.join(RESULTS_DIR, `${engine}.json`);
  const data = { engine, label: E.label, model: E.model, month: MONTH, runs: RUNS, generatedAt: new Date().toISOString(), answers: [], cost: 0, errors: 0 };
  for (const q of questions) {
    for (let run = 1; run <= RUNS; run++) {
      if (state.stopped) break;
      const rec = { questionId: q.id, question: q.text, run, at: new Date().toISOString() };
      try {
        const a = await E.ask(q.text);
        const cost = estimateCost(engine, a.usage);
        data.cost += cost; state.totalCost += cost;
        Object.assign(rec, { text: a.text, citations: a.citations, results: a.results, searched: a.searched, usage: a.usage, costUsd: +cost.toFixed(5), raw: a.raw });
        rec.analysis = analyze(a);
        if (a.text.length > 300 && rec.analysis.orgsInText < 2) {
          const judged = await judgeOrgs(a.text);
          if (judged) {
            data.cost += judged.cost; state.totalCost += judged.cost;
            rec.judgeOrgs = judged.orgs;
            // ארגונים שהשופט מצא ואינם ברשימה הידועה → "נוספים"; אם כן ברשימה — מצרפים למתחרים
            for (const o of judged.orgs) {
              const known = competitorByName(o.name) || (o.domain && competitorByDomain(o.domain.replace(/^www\./, "")));
              if (known && !rec.analysis.competitors.some(c => c.id === known.id)) {
                const idx = text_index(a.text, o.name);
                rec.analysis.competitors.push({ id: known.id, name: known.name, index: idx, inText: idx != null, cited: false, viaJudge: true });
              }
            }
            const extra = judged.orgs.filter(o => !competitorByName(o.name) && !(o.domain && competitorByDomain(o.domain.replace(/^www\./, ""))));
            rec.analysis.discoveredOrgs = extra.map(o => o.name);
            // מיקום מחושב מחדש עם הארגונים הנוספים שנמצאו בטקסט
            if (rec.analysis.mentioned) {
              const ourIdx = Math.min(...OUR_NAME_PATTERNS.map(re => firstIndex(a.text, re)).filter(i => i >= 0));
              const idxs = [...rec.analysis.competitors.filter(c => c.inText).map(c => c.index), ...extra.map(o => text_index(a.text, o.name)).filter(i => i != null)];
              rec.analysis.position = 1 + idxs.filter(i => i < ourIdx).length;
              rec.analysis.orgsInText = idxs.length + 1;
            }
          }
        }
        log(`${engine} ${q.id} #${run}: ${rec.analysis.mentioned ? "✅ AI Lab" : "—"} ${rec.analysis.position ? "#" + rec.analysis.position : ""} · ${rec.analysis.competitors.map(c => c.id).join(",") || "ללא מתחרים ידועים"} · $${cost.toFixed(3)}`);
      } catch (e) {
        data.errors++;
        rec.error = String(e.message || e).slice(0, 400);
        log(`${engine} ${q.id} #${run}: שגיאה — ${rec.error.slice(0, 160)}`);
        if (e.status === 401 || e.status === 403) { rec.error += " (מפתח לא תקין/חסר הרשאה — המנוע נעצר)"; data.answers.push(rec); data.fatal = rec.error; return finish(); }
      }
      data.answers.push(rec);
      if (state.totalCost > BUDGET && !state.stopped) { state.stopped = true; log(`⚠️ עצירה: העלות המשוערת ($${state.totalCost.toFixed(2)}) עברה את התקציב ($${BUDGET})`); }
      await sleep(600);
    }
    if (state.stopped) break;
  }
  return finish();
  function finish() { data.cost = +data.cost.toFixed(4); fs.writeFileSync(file, JSON.stringify(data, null, 2)); state.engines[engine] = data; return data; }
}
function text_index(text, name) { if (!name) return null; const i = text.toLowerCase().indexOf(String(name).toLowerCase()); return i >= 0 ? i : null; }

await Promise.all(runnable.map(runEngine));

// ---------- סיכום וציונים ----------
function summarize() {
  const perEngine = {};
  for (const e of runnable) {
    const d = state.engines[e]; const ok = d.answers.filter(a => a.analysis);
    const mentionedRuns = ok.filter(a => a.analysis.mentioned);
    const qWith = new Set(mentionedRuns.map(a => a.questionId));
    const positions = mentionedRuns.map(a => a.analysis.position).filter(Boolean);
    perEngine[e] = {
      label: d.label, model: d.model, runs: ok.length, errors: d.errors, fatal: d.fatal || null,
      mentionedRuns: mentionedRuns.length, mentionRate: ok.length ? mentionedRuns.length / ok.length : 0,
      questionsWith: qWith.size, questionsTotal: questions.length,
      citedRuns: ok.filter(a => a.analysis.cited).length, seenInResultsRuns: ok.filter(a => a.analysis.seenInResults).length,
      searchedRuns: ok.filter(a => a.searched).length,
      avgPosition: positions.length ? +(positions.reduce((s, x) => s + x, 0) / positions.length).toFixed(1) : null,
      firstPlaceRuns: positions.filter(p => p === 1).length,
      cost: d.cost,
      byQuestion: Object.fromEntries(questions.map(q => {
        const rs = ok.filter(a => a.questionId === q.id);
        const m = rs.filter(a => a.analysis.mentioned);
        return [q.id, { runs: rs.length, mentioned: m.length, bestPosition: Math.min(...m.map(a => a.analysis.position || 99).concat([99])) }];
      })),
    };
  }
  const all = runnable.flatMap(e => state.engines[e].answers.filter(a => a.analysis));
  const overall = {
    runs: all.length, mentionedRuns: all.filter(a => a.analysis.mentioned).length,
    mentionRate: all.length ? all.filter(a => a.analysis.mentioned).length / all.length : 0,
    questionsWith: new Set(all.filter(a => a.analysis.mentioned).map(a => a.questionId)).size, questionsTotal: questions.length,
    citedRuns: all.filter(a => a.analysis.cited).length,
  };
  // מתחרים
  const comp = {};
  for (const e of runnable) for (const a of state.engines[e].answers) if (a.analysis) for (const c of a.analysis.competitors) {
    comp[c.id] ??= { id: c.id, name: c.name, answers: 0, questions: new Set(), engines: new Set(), aheadOfUs: 0 };
    comp[c.id].answers++; comp[c.id].questions.add(a.questionId); comp[c.id].engines.add(e);
    // "לפנינו": המתחרה הוזכר בטקסט לפני AI Lab (או ש-AI Lab לא הוזכר כלל)
    const ourIdx = a.analysis.mentioned ? Math.min(...OUR_NAME_PATTERNS.map(re => firstIndex(a.text, re)).filter(i => i >= 0)) : Infinity;
    if (c.inText && c.index != null && c.index < ourIdx) comp[c.id].aheadOfUs++;
  }
  const competitors = Object.values(comp).map(c => ({ ...c, questions: [...c.questions].sort(), engines: [...c.engines] })).sort((a, b) => b.answers - a.answers);
  // גילויים
  const discovered = {};
  for (const e of runnable) for (const a of state.engines[e].answers) if (a.analysis) {
    for (const h of a.analysis.discoveredDomains || []) { discovered[h] ??= { name: h, kind: "domain", answers: 0, questions: new Set() }; discovered[h].answers++; discovered[h].questions.add(a.questionId); }
    for (const n of a.analysis.discoveredOrgs || []) { const k = "org:" + n; discovered[k] ??= { name: n, kind: "org", answers: 0, questions: new Set() }; discovered[k].answers++; discovered[k].questions.add(a.questionId); }
  }
  const discoveredList = Object.values(discovered).map(d => ({ ...d, questions: [...d.questions].sort() })).sort((a, b) => b.answers - a.answers);
  // מקורות
  const srcKinds = {}; const ourPages = {};
  for (const e of runnable) for (const a of state.engines[e].answers) if (a.analysis) for (const s of a.analysis.sources) {
    srcKinds[s.kind] ??= { kind: s.kind, count: 0, hosts: {} }; srcKinds[s.kind].count++; srcKinds[s.kind].hosts[s.host] = (srcKinds[s.kind].hosts[s.host] || 0) + 1;
    if (s.kind.includes("שלנו")) { const k = s.page || s.url; ourPages[k] = (ourPages[k] || 0) + 1; }
  }
  const sources = Object.values(srcKinds).map(s => ({ ...s, hosts: Object.entries(s.hosts).sort((a, b) => b[1] - a[1]).slice(0, 6) })).sort((a, b) => b.count - a.count);
  return { month: MONTH, generatedAt: new Date().toISOString(), runsPerQuestion: RUNS, engines: perEngine, missingKeys, overall, competitors, discovered: discoveredList, sources, ourPages, totalCost: +state.totalCost.toFixed(3), stoppedForBudget: state.stopped, budget: BUDGET };
}
const summary = summarize();
fs.writeFileSync(path.join(RESULTS_DIR, "summary.json"), JSON.stringify(summary, null, 2));

// ---------- מגמה מול החודש הקודם ----------
function previousSummary() {
  const dirs = fs.readdirSync(path.join(HERE, "results")).filter(d => /^\d{4}-\d{2}$/.test(d) && d < MONTH).sort();
  for (const d of dirs.reverse()) {
    const p = path.join(HERE, "results", d, "summary.json");
    if (fs.existsSync(p)) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { /* ממשיכים */ } }
  }
  return null;
}
const prev = previousSummary();
const pct = x => `${Math.round((x || 0) * 100)}%`;
function trendText(cur, old) {
  if (old == null) return "קו בסיס";
  const d = Math.round((cur - old) * 100);
  return d > 0 ? `⬆️ +${d} נק'` : d < 0 ? `⬇️ ${d} נק'` : "➡️ ללא שינוי";
}

// ---------- המלצות (Claude Sonnet 5, עם נפילה לניסוח דטרמיניסטי) ----------
function heuristicRecs() {
  const worst = questions.map(q => ({ q, m: runnable.reduce((s, e) => s + (summary.engines[e].byQuestion[q.id]?.mentioned || 0), 0) })).sort((a, b) => a.m - b.m).slice(0, 3);
  const top = summary.competitors[0];
  return [
    worst[0] ? `לכתוב מאמר בבלוג שעונה ישירות על השאלה "${worst[0].q.text}" (0 הופעות של AI Lab בכל המנועים), עם כותרת שחוזרת על ניסוח ההורה ועם פסקת תשובה ישירה בראש המאמר.` : "לכתוב מאמר בבלוג שעונה ישירות על אחת השאלות שבהן לא הופענו.",
    worst[1] ? `להוסיף ל-llms.txt (בחלק "שאלות נפוצות") שורת שאלה-תשובה בניסוח המדויק "${worst[1].q.text}" → AI Lab, כולל מחיר, גילאים ופורמט.` : "להוסיף ל-llms.txt שורות שאלה-תשובה בניסוחים שהורים משתמשים בהם.",
    top ? `${top.name} הוזכר ב-${top.answers} תשובות — כדאי לבדוק מה באתר שלו מצוטט (עמוד קורס עם מחיר, גילאים ו-FAQ) ולוודא שלעמוד הקורס שלנו יש מידע מקביל ומפורש בטקסט (לא רק בתמונות).` : "לבדוק אילו עמודים של מתחרים מצוטטים ולהתאים את עמוד הקורס שלנו.",
  ];
}
async function llmRecommendations() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  let llms = ""; try { llms = await (await fetch(SITE + "/llms.txt")).text(); } catch { /* בלי */ }
  const digest = {
    month: MONTH, overall: summary.overall, engines: Object.fromEntries(Object.entries(summary.engines).map(([k, v]) => [k, { label: v.label, mentionRate: v.mentionRate, questionsWith: v.questionsWith, citedRuns: v.citedRuns, searchedRuns: v.searchedRuns, avgPosition: v.avgPosition, byQuestion: v.byQuestion }])),
    questions: questions.map(q => ({ id: q.id, text: q.text })),
    competitors: summary.competitors.slice(0, 10).map(c => ({ name: c.name, answers: c.answers, questions: c.questions })),
    discovered: summary.discovered.slice(0, 10), sources: summary.sources.map(s => ({ kind: s.kind, count: s.count, hosts: s.hosts })), ourPages: summary.ourPages,
    sampleAnswers: runnable.flatMap(e => state.engines[e].answers.filter(a => a.text).slice(0, 2).map(a => ({ engine: e, q: a.question, text: a.text.slice(0, 1200) }))),
  };
  try {
    const j = await postJson("https://api.anthropic.com/v1/messages", { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" }, {
      model: "claude-sonnet-5", max_tokens: 1800, thinking: { type: "disabled" },
      system: `אתה אנליסט GEO (Generative Engine Optimization) של AI Lab (ai-lab.co.il) — בית ספר ישראלי ל-AI לילדים ונוער 9–17 ולמבוגרים, אונליין בזום. מאיר, בעל העסק, אינו איש טכנולוגיה.
קיבלת תוצאות מעקב חודשי: האם מנועי ה-AI הזכירו את AI Lab בתשובות לשאלות של הורים, מי המתחרים שהופיעו, ואילו מקורות צוטטו. קיבלת גם את llms.txt הנוכחי של האתר.
כתוב בדיוק 3 המלצות קונקרטיות בעברית, כל אחת 2–4 שורות, ממוספרות, בפורמט: **כותרת קצרה** — מה לעשות בדיוק ולמה (עם המספרים מהנתונים). ההמלצות חייבות להיות מהסוגים: (א) איזה מאמר לכתוב בבלוג (כותרת מוצעת + מה חייב להופיע בו), (ב) מה לתקן/להוסיף ב-llms.txt (שורה מוצעת כלשונה), (ג) איזה ביטוי/ניסוח שהורים משתמשים בו חסר באתר ואיפה להוסיף אותו. עדיפות לשאלות שבהן לא הופענו בכלל ולמתחרים שמופיעים הרבה. אל תמציא נתונים. כל ניסוח מוצע לאתר או ל-llms.txt ידבר רק על AI Lab — בלי טענות על מתחרים (מה הם עושים או לא עושים), מותר רק לציין שהם מופיעים בתשובות. אל תציע לשנות את גילאי היעד (9–17) או לפרסם דבר על תנאי שימוש של כלים. פלט: רק 3 ההמלצות, בלי פתיחה ובלי סיכום.`,
      messages: [{ role: "user", content: `## נתוני המעקב (JSON)\n${JSON.stringify(digest, null, 1).slice(0, 40000)}\n\n## llms.txt הנוכחי\n${llms.slice(0, 14000)}` }],
    }, { retries: 1 });
    const t = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
    state.totalCost += ((j.usage?.input_tokens || 0) * 2 + (j.usage?.output_tokens || 0) * 10) / 1e6;
    return t || null;
  } catch (e) { log("recommendations failed:", e.message.slice(0, 160)); return null; }
}
const recsLLM = await llmRecommendations();
const recsText = recsLLM || heuristicRecs().map((r, i) => `${i + 1}. ${r}`).join("\n");
summary.totalCost = +state.totalCost.toFixed(3);
fs.writeFileSync(path.join(RESULTS_DIR, "summary.json"), JSON.stringify(summary, null, 2));

// ---------- הדוח ----------
const KEY_HOWTO = {
  openai: `**ChatGPT (OpenAI) — חסר \`OPENAI_API_KEY\`.** עלות משוערת: ~$0.6 לחודש (gpt-4.1-mini + $10 ל-1,000 חיפושים).
1. היכנס ל-https://platform.openai.com/ עם חשבון OpenAI (אפשר אותו חשבון של ChatGPT).
2. Settings → Billing → Add payment method, וטען קרדיט מראש (המינימום $5 — מספיק לחודשים רבים).
3. בתפריט השמאלי: API keys → "Create new secret key" → שם: \`ailab-geo\` → Create. העתק את המפתח (מוצג פעם אחת).
4. הדבק בשורה חדשה בקובץ \`Pyton1/pyton corus 1/meta-ads/.env\`: \`OPENAI_API_KEY=המפתח\`
5. בטרמינל (מתוך תיקיית ai-lab): \`gh secret set OPENAI_API_KEY -R mlb-code/ai-lab\` → ידביק את המפתח כשיתבקש → Enter.`,
  perplexity: `**Perplexity — חסר \`PERPLEXITY_API_KEY\`.** עלות משוערת: ~$0.2 לחודש (preset "fast" + $2.5 ל-1,000 חיפושים). שים לב: Sonar Chat Completions הופסק ב-27.09.2026 — הסקריפט כבר משתמש ב-Agent API החדש.
1. היכנס ל-https://console.perplexity.ai/ (חשבון Perplexity רגיל).
2. Billing → הוסף כרטיס אשראי וטען קרדיט (מינימום קטן, כמה דולרים).
3. API Keys (https://console.perplexity.ai/project/keys) → "+ Create Key" → העתק.
4. הדבק ב-\`meta-ads/.env\`: \`PERPLEXITY_API_KEY=המפתח\`
5. \`gh secret set PERPLEXITY_API_KEY -R mlb-code/ai-lab\``,
  xai: `**Grok (xAI) — חסר \`XAI_API_KEY\`.** עלות משוערת: ~$0.6 לחודש (grok-4.7 + $5 ל-1,000 חיפושים). חשבון חדש מקבל בדרך כלל $25 קרדיט ניסיון.
1. היכנס ל-https://console.x.ai/ (אפשר עם חשבון X או Google).
2. Billing → Payment Methods → הוסף כרטיס (או השתמש בקרדיט הניסיון).
3. API Keys → "Create API Key" → שם: \`ailab-geo\` → העתק (מוצג פעם אחת).
4. הדבק ב-\`meta-ads/.env\`: \`XAI_API_KEY=המפתח\`
5. \`gh secret set XAI_API_KEY -R mlb-code/ai-lab\``,
  gemini: `**Gemini — חסר \`GEMINI_API_KEY\`.** https://aistudio.google.com/apikey → Create API key → להדביק ב-\`meta-ads/.env\` ולהריץ \`gh secret set GEMINI_API_KEY -R mlb-code/ai-lab\`.`,
  anthropic: `**Claude — חסר \`ANTHROPIC_API_KEY\`.** https://platform.claude.com/ → API keys → Create key → להדביק ב-\`meta-ads/.env\` ולהריץ \`gh secret set ANTHROPIC_API_KEY -R mlb-code/ai-lab\`.`,
};

function qLabel(id) { const q = questions.find(x => x.id === id); return q ? `${Number(id.slice(1))}. ${q.short}` : id; }
function cell(e, qid) {
  const b = summary.engines[e]?.byQuestion[qid]; if (!b || !b.runs) return "—";
  return b.mentioned ? `✅ ${b.mentioned}/${b.runs}${b.bestPosition < 99 ? ` (מקום ${b.bestPosition})` : ""}` : `✖ 0/${b.runs}`;
}
const o = summary.overall;
const engineRows = ENGINE_ORDER.map(e => {
  const E = ENGINES[e];
  if (!runnable.includes(e)) return `| ${E.label} | ${E.model} | — | — | — | — | — | חסר מפתח (הוראות למטה) |`;
  const s = summary.engines[e]; const p = prev?.engines?.[e];
  const status = s.fatal ? `⚠️ ${s.fatal.slice(0, 60)}` : s.errors ? `${s.errors} שגיאות` : "תקין";
  return `| ${E.label} | ${s.model} | **${s.mentionedRuns}/${s.runs}** (${pct(s.mentionRate)}) | ${s.questionsWith}/${s.questionsTotal} | ${s.avgPosition ?? "—"} | ${s.citedRuns} | ${trendText(s.mentionRate, p?.mentionRate)} | ${status} · $${s.cost.toFixed(3)} |`;
}).join("\n");

const compRows = summary.competitors.slice(0, 15).map(c => `| ${c.name} | ${c.answers} | ${c.aheadOfUs} | ${c.questions.map(q => Number(q.slice(1))).join(", ")} | ${c.engines.map(e => ENGINES[e].label.split(" ")[0]).join(", ")} |`).join("\n") || "| (לא זוהו מתחרים מהרשימה) | | | | |";
// דוגמה אחת לכל מנוע (שאלה 1, ריצה ראשונה) — כדי שמאיר יראה איך התשובה נראית
const examples = runnable.map(e => {
  const a = state.engines[e].answers.find(x => x.text);
  if (!a) return `**${ENGINES[e].label}:** (אין תשובה)`;
  const snippet = a.text.replace(/\s+/g, " ").trim().slice(0, 600);
  return `**${ENGINES[e].label}** — "${a.question}" (${a.analysis.mentioned ? `AI Lab הוזכר, מקום ${a.analysis.position}` : "AI Lab לא הוזכר"}):\n> ${snippet}${a.text.length > 600 ? " …" : ""}`;
}).join("\n\n");
const discRows = summary.discovered.slice(0, 12).map(d => `| ${d.kind === "domain" ? `\`${d.name}\`` : d.name} | ${d.answers} | ${d.questions.map(q => Number(q.slice(1))).join(", ")} |`).join("\n");
const srcRows = summary.sources.map(s => `| ${s.kind} | ${s.count} | ${s.hosts.map(([h, n]) => `${h} (${n})`).join(", ")} |`).join("\n") || "| (לא היו ציטוטים) | | |";
const ourPagesRows = Object.entries(summary.ourPages).sort((a, b) => b[1] - a[1]).map(([p, n]) => `- \`${p}\` — ${n}`).join("\n");

const statusLine = o.runs === 0
  ? "⚠️ לא התקבלו תשובות — בדוק מפתחות ושגיאות."
  : `AI Lab הוזכר ב-**${o.mentionedRuns} מתוך ${o.runs}** תשובות (**${pct(o.mentionRate)}**) · ב-**${o.questionsWith} מתוך ${o.questionsTotal}** שאלות · האתר שלנו צוטט כמקור ב-${o.citedRuns} תשובות · מגמה: **${prev ? trendText(o.mentionRate, prev.overall?.mentionRate) + ` (מול ${prev.month}: ${pct(prev.overall?.mentionRate)})` : "קו בסיס (ריצה ראשונה)"}**`;

const report = `# דוח GEO חודשי — ${MONTH}${prev ? "" : " (קו בסיס)"}

_האם ChatGPT, Gemini, Perplexity, Claude ו-Grok ממליצים על AI Lab כשהורים שואלים בעברית? נוצר אוטומטית ב-${TODAY_IL}. ${questions.length} שאלות × ${RUNS} ריצות בכל מנוע, עם חיפוש ברשת מופעל._

## שורת מצב
${statusLine}
${summary.stoppedForBudget ? `\n⚠️ **הריצה נעצרה באמצע** כי העלות המשוערת עברה את התקציב ($${BUDGET}). חלק מהשאלות לא נבדקו בכל המנועים.\n` : ""}
מנועים שנבדקו: ${runnable.map(e => ENGINES[e].label).join(", ") || "אין"}. ${missingKeys.length ? `**לא נבדקו (חסר מפתח API): ${missingKeys.map(e => ENGINES[e].label).join(", ")}** — הוראות השגה בסוף הדוח.` : "כל 5 המנועים נבדקו."}${skippedByFilter.length ? ` (דולגו ידנית בריצה הזו: ${skippedByFilter.map(e => ENGINES[e].label).join(", ")})` : ""}

## ציון לפי מנוע
| מנוע | מודל | תשובות עם AI Lab | שאלות עם AI Lab | מיקום ממוצע* | האתר שלנו צוטט | מגמה | מצב · עלות |
|---|---|---|---|---|---|---|---|
${engineRows}

_*מיקום = באיזה מקום AI Lab הוזכר מבין העסקים שבתשובה (1 = ראשון). "האתר שלנו צוטט" = ai-lab.co.il הופיע כמקור מצוטט, גם אם השם לא נכתב._

## לפי שאלה
| שאלה | ${runnable.map(e => ENGINES[e].label.split(" ")[0]).join(" | ")} |
|---|${runnable.map(() => "---").join("|")}|
${questions.map(q => `| ${qLabel(q.id)} | ${runnable.map(e => cell(e, q.id)).join(" | ")} |`).join("\n")}

## המתחרים המובילים (מי מופיע במקומנו)
| מתחרה | בכמה תשובות | מתוכן לפנינו* | באילו שאלות (מספר) | באילו מנועים |
|---|---|---|---|---|
${compRows}

_*"לפנינו" = המתחרה נכתב בתשובה לפני AI Lab, או ש-AI Lab לא הוזכר בה בכלל._
${discRows ? `
### עסקים ודומיינים נוספים שזוהו (לא ברשימת המתחרים הידועים — לשקול להוסיף ל-competitors.json)
| שם / דומיין | בכמה תשובות | באילו שאלות |
|---|---|---|
${discRows}` : ""}

## המקורות שצוטטו
| סוג מקור | כמה ציטוטים | דומיינים בולטים |
|---|---|---|
${srcRows}
${ourPagesRows ? `\n**עמודים שלנו שצוטטו:**\n${ourPagesRows}` : "\n**שום עמוד שלנו לא צוטט החודש.**"}

## 3 המלצות קונקרטיות${recsLLM ? "" : " (ניסוח אוטומטי — Claude לא היה זמין)"}
${recsText}

## איך נראית תשובה (דוגמה אחת לכל מנוע)
${examples}

${missingKeys.length ? `## מפתחות חסרים — איך משיגים (למאיר, צעד-צעד)
כל מפתח שתוסיף יצטרף אוטומטית לריצה של החודש הבא. אחרי \`gh secret set\` אפשר גם להריץ מיד: GitHub → ריפו ai-lab → Actions → geo-monitor → Run workflow.

${missingKeys.map(e => KEY_HOWTO[e]).join("\n\n")}
` : ""}
## עלות הריצה
עלות משוערת כוללת: **$${summary.totalCost.toFixed(2)}** (תקרה: $${BUDGET}). ${runnable.map(e => `${ENGINES[e].label.split(" ")[0]}: $${summary.engines[e].cost.toFixed(2)}`).join(" · ")}${recsLLM ? " · המלצות + שופט: כלול" : ""}.

---
_איך זה עובד: הסקריפט \`agent/geo/geo-monitor.mjs\` שואל כל מנוע דרך ה-API הרשמי שלו עם חיפוש ברשת, 3 פעמים לכל שאלה (התשובות משתנות), ובודק בטקסט ובציטוטים אם "AI Lab" / ai-lab.co.il מופיעים, באיזה מיקום, ומי המתחרים (רשימה ב-\`agent/geo/competitors.json\` + גילוי דומיינים ישראליים). תשובות גולמיות: \`agent/geo/results/${MONTH}/\`. רץ אוטומטית ב-1 לכל חודש ב-09:00 (GitHub Actions: geo-monitor); החודש הבא יחושב מול הדוח הזה._
`;

const reportPath = path.join(REPORTS_DIR, `דוח-GEO-${MONTH}.md`);
fs.writeFileSync(reportPath, report);
fs.writeFileSync(path.join(HERE, "latest.json"), JSON.stringify({ month: MONTH, report: path.relative(REPO, reportPath), summary: path.relative(REPO, path.join(RESULTS_DIR, "summary.json")), generatedAt: summary.generatedAt, mentionRate: o.mentionRate, totalCost: summary.totalCost, missingKeys }, null, 2));
if (process.env.GEO_COPY_DIR) { try { fs.copyFileSync(reportPath, path.join(process.env.GEO_COPY_DIR, `דוח-GEO-${MONTH}.md`)); log("הועתק ל-", process.env.GEO_COPY_DIR); } catch (e) { log("העתקה נכשלה:", e.message); } }
log(`סיום · ציון ${pct(o.mentionRate)} · עלות $${summary.totalCost.toFixed(2)} · דוח: ${reportPath}`);
console.log(report);
