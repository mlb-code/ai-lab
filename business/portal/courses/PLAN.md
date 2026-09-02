# תוכנית עבודה — בניית מצגות לקורסים 2 ו-3

> **סטטוס:** ממתין לאישור/בנייה. קורס 1 (websites) הושלם — 5 שיעורים × 19 שקפים.

---

## 🗺️ עיקרון מנחה

- **כל שיעור = 19 שקפים, 60 דקות**
- מבנה **זהה לקורס 1** (websites)
- מילון מונחים שונה לכל שיעור (רק חדשים)
- תבנית פרומפט/קוד ייחודית לכל שיעור
- 3 וריאציות לפי תחום עסקי + 3 מלכודות נפוצות
- ללא אימוג'ים — שימוש ב-Space Mono labels
- **חיצים:** `→ חזרה לקורס` (אחורה ב-RTL), `← הבא` (קדימה ב-RTL)

### מבנה קבוע של שקפים בכל שיעור

```
01 כותרת   →   02 אג'נדה   →   03 Recap   →   04 מילון
05 חלק עיוני header   →   06-08 תיאוריה (3 שקפים)
09 חלק מעשי header   →   10-13 הדגמה (4 שקפים)
14 וריאציות   →   15 תבנית   →   16 מלכודות
17 משימה לבית   →   18 סיכום + מעבר
```

---

## 📘 קורס 2 — בניית אוטומציות לעסק

**מטרה:** תהליכים עסקיים שרצים לבד. בסוף הקורס יש pipeline מלא של מכירה + 2-3 אוטומציות פנימיות פעילות.

### מפת השיעורים

| # | כותרת | 4 שקפי תיאוריה | 4 שקפי הדגמה | תוצר |
|---|------|-----------------|----------------|------|
| **01** | יסודות אוטומציה | trigger/action · webhook ו-API · השוואה Make/Zapier/n8n · מבנה תהליך | רישום ל-Make · אוטומציה ראשונה (טופס→Sheet) · הוספת מייל · הוספת WhatsApp | טופס→Sheet+Email+WA |
| **02** | אינטגרציות עומק | עולם הגוגל · OAuth והרשאות · חיבורי modules · יציבות+error handling | חיבור Sheets · חיבור Calendar · חיבור Gmail · אוטומציה Multi-step | flow עם 4 חיבורים אמיתיים |
| **03** | Pipeline מכירה | מסע לקוח · drip campaigns · lead scoring · timing strategy | ליד→CRM · מייל ראשוני · תזכורת אחרי 24/72ש · מעבר ל"קרים" | Pipeline מכירה מלא |
| **04** | AI באוטומציה | AI ב-flow · פרומפטים בתוך אוטומציה · agents מול בוטים · עלויות API | Claude API ב-Make · תיוג מיילים · תשובות מותאמות · סיכום פגישות זום | אוטומציה משולבת AI |
| **05** | אוטומציות פנימיות + n8n | מה לאוטמט פנימה · n8n vs Make · self-hosted · scaling | חשבונית אוטומטית · דוח שבועי · n8n על Railway · מיגרציה Make→n8n | 3 אוטומציות פנימיות |

### מילון מונחים (חדשים לכל שיעור)

- **ש'1:** trigger, action, webhook, API, scenario, integration
- **ש'2:** OAuth, module, mapping, error handler, fallback
- **ש'3:** pipeline, drip, lead scoring, conversion funnel, CRM
- **ש'4:** agent, prompt chaining, tokens, rate limit, fine-tuning
- **ש'5:** self-hosted, Railway, cron, queue, workflow

### וריאציות לפי תחום עסקי
1. **שירות/קליניקה** — תזמון פגישות אוטומטי
2. **E-commerce** — סנכרון מלאי + הזמנות
3. **שירותים B2B** — quote → contract → onboarding

---

## 📗 קורס 3 — עוזר אישי AI

**מטרה:** סוכן AI אישי שמנהל את היום. בסוף הקורס: עוזר מלא (יומן, מיילים, משימות, ידע אישי) שמחובר לטלפון.

### מפת השיעורים

| # | כותרת | 4 שקפי תיאוריה | 4 שקפי הדגמה | תוצר |
|---|------|-----------------|----------------|------|
| **01** | מהו עוזר AI | בוט VS סוכן · Claude Desktop · MCP פרוטוקול · מה אפשר/לא אפשר | התקנת Claude Desktop · MCP filesystem · MCP memory · פרומפט "סיכום בוקר" ראשון | Claude Desktop + 2 MCP |
| **02** | פרומפט מערכת אישי | persona/tone/role · system vs user prompt · שמירת זיכרון · עקביות | יצירת system prompt · בדיקה+התאמה · שילוב MCP memory · פרומפט "זה אני" | system prompt אישי |
| **03** | יומן + מיילים + משימות | MCP ל-Workspace · הרשאות · תיאום מערכות · אבטחה+פרטיות | חיבור Calendar · חיבור Gmail · חיבור Notion/Todoist · פרומפט יומי מלא | עוזר Day-to-Day |
| **04** | סוכנים מתקדמים | assistant vs agent · autonomy levels · multi-step tasks · בקרה+אישור | סוכן SDR · סוכן תמיכה · סוכן ניתוח · בקרה+בטיחות | סוכן עסקי אחד פעיל |
| **05** | ידע אישי + flow מלא | RAG בקצרה · knowledge base · סגנון אישי · privacy | חיבור Drive/Notion KB · עוזר ב-WhatsApp · שילוב הכל ב-flow · פרויקט סיום | flow מלא + KB אישי |

### מילון מונחים (חדשים לכל שיעור)

- **ש'1:** agent, assistant, MCP, server, capability, context window
- **ש'2:** system prompt, persona, tone, instruction, memory
- **ש'3:** OAuth scopes, integration, permission, sync
- **ש'4:** autonomy, sub-agent, tool use, function calling, sandbox
- **ש'5:** RAG, knowledge base, embedding, retrieval, fine-tune

### וריאציות לפי קהל
1. **בעל עסק** — עוזר יזמי (לידים + פגישות + סיכומים)
2. **שכיר/מנהל** — עוזר תפעולי (מיילים + משימות + תזכורות)
3. **עצמאי/יוצר** — עוזר תוכן (כתיבה + מחקר + פרסום)

---

## 🔁 תהליך הבנייה לכל שיעור

```
1. כתיבת מילון (10 דק')        →  ~6 מונחים חדשים
2. כתיבת 4 שקפי תיאוריה        →  WHY + HOW על כל מושג
3. כתיבת 4 שקפי הדגמה          →  צעדים + פרומפטים מלאים
4. וריאציות (3 כרטיסים)        →  לפי תחום
5. תבנית פרומפט/קוד            →  copy-paste שמיושם
6. 3 מלכודות נפוצות            →  שגיאה + פתרון
7. משימה לבית                  →  4 צעדים, peer feedback ב-WA
8. שקף סיכום                   →  4 נקודות + מעבר לשיעור הבא
```

**זמן בנייה משוער:** 30-40 דק' לשיעור × 10 שיעורים = **5-7 שעות עבודה**.

---

## 📦 קבצים שיווצרו

```
business/portal/courses/
├── automation/
│   ├── lesson-01.html  ← יסודות אוטומציה
│   ├── lesson-02.html  ← אינטגרציות עומק
│   ├── lesson-03.html  ← Pipeline מכירה
│   ├── lesson-04.html  ← AI באוטומציה
│   └── lesson-05.html  ← אוטומציות פנימיות + n8n
└── assistant/
    ├── lesson-01.html  ← מהו עוזר AI
    ├── lesson-02.html  ← פרומפט מערכת אישי
    ├── lesson-03.html  ← יומן + מיילים + משימות
    ├── lesson-04.html  ← סוכנים מתקדמים
    └── lesson-05.html  ← ידע אישי + flow מלא
```

**עדכוני course outline:**
- `business/portal/automation.html` — מבנה זהה ל-`websites.html`
- `business/portal/assistant.html` — מבנה זהה ל-`websites.html`

---

## ✅ פטרון מצגת קיים (לקורס 1)

המצגות בקורס 1 (`courses/websites/lesson-*.html`) — מקור האמת לפורמט.
**אין צורך לפתח CSS/JS חדש** — `lesson.css` ו-`lesson.js` כבר משותפים בתיקייה `courses/`.

### Patterns מוכנים לשימוש חוזר
- `.glossary` — טבלת מילון מונחים
- `.why-how` — בלוק WHY+HOW דו-עמודות
- `.agenda` — סדר יום עם זמנים
- `.steps` — רשימה ממוספרת
- `.compare` — השוואה bad/good
- `.cards.cols-2/3/4` — כרטיסים
- `.prompt` — בלוק פרומפט מודגש
- `.code` — בלוק קוד
- `.callout-big` — ציטוט מודגש
- 6 רקעים: `bg-default`, `bg-glow`, `bg-theory`, `bg-practice`, `bg-warn`, `bg-homework`

---

## 🚦 כללי ברזל לבנייה

1. **טון לימודי, לא שיווקי** — "נכסה" / "נלמד", לא "תדעו" / "מנצח"
2. **משימה לבית** — peer feedback ב-WhatsApp, לא "אני אעבור"
3. **ללא קישורים חיצוניים ל-Anthropic** — אם צריך resources, להחליף ב"רעיונות לתרגול נוסף"
4. **חיצים נכונים ל-RTL:** `→ חזרה`, `הבא ←`
5. **ללא אימוג'ים** — kicker עם פס + טקסט בלבד

---

## ❓ פתוח להחלטה

- **קורס 4 (יצירת תוכן עם AI)** — לא במסגרת התוכנית הנוכחית. אם נחזור לבנות — נוסיף 5 שיעורים נוספים באותו פטרון.
