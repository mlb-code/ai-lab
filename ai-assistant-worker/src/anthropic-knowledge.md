# Anthropic Knowledge Base — AI Lab Teaching Assistant

מקור הידע של העוזר: חומרי הלימוד הרשמיים של Anthropic (Courses, Prompt Engineering Tutorial, API Docs, AI Fluency, Claude Code).
מטרה: ללמד תלמידים בני 10-17 איך לעבוד נכון עם Claude / ChatGPT / Cursor / Claude Code, ואיך להשתמש ב-AI לפיתוח תוכנה.
מונחים טכניים נשמרים באנגלית (Prompt, Tool, Chain of Thought וכו') כי אלו השמות הרשמיים.

---

## 1. Prompt Engineering Basics (יסודות פרומפט)

### מהו Prompt?
Prompt זו ההוראה/השאלה שאתה שולח למודל. איכות הפלט תלויה כמעט לגמרי באיכות ה-Prompt. רוב הבעיות עם AI הן *לא* בעיות של המודל — אלא של הוראות לא ברורות.

### שמונה טכניקות ליבה (מהתיעוד הרשמי של Anthropic):

**1. Be Clear and Direct (בהירות וישירות)**
- נסח בשפה חד-משמעית, בלי רמיזות.
- ציין במדויק מה אתה רוצה: פורמט, אורך, טון, קהל יעד.
- "תסביר לילד בן 12 מהי לולאת for, ב-3 משפטים קצרים" עדיף על "תסביר לי for".
- תחשוב על הפרומפט כמו על הוראות לעובד חדש שלא מכיר את ההקשר שלך.

**2. Use Examples / Multishot (דוגמאות / Few-Shot)**
- תן 2-5 דוגמאות של input→output במקום רק להסביר במילים.
- דוגמאות עובדות טוב יותר מהסברים ארוכים.
- זה מנחה את המודל ל-format ולסגנון הרצויים.

**3. Let Claude Think — Chain of Thought (CoT)**
- בקש מהמודל "תחשוב שלב-שלב לפני שתענה".
- משפר דיוק משמעותית במשימות מורכבות (מתמטיקה, לוגיקה, debugging).
- אפשר לבקש שיחשוב בתוך תגית `<thinking>` ואז יסכם ב-`<answer>`.

**4. Use XML Tags (תגיות XML)**
- הפרד בין חלקי ה-Prompt עם תגיות כמו `<instruction>`, `<example>`, `<data>`, `<context>`.
- מונע בלבול בין הוראות לבין נתונים.
- מקל על המודל להבין את המבנה.

**5. Give Claude a Role — System Prompt**
- הגדר persona: "אתה מורה סבלני למתמטיקה לילדים בני 12".
- משפר איכות, טון, ומידת הפירוט.
- ב-System Prompt שם את ההקשר הקבוע; ב-User Message שם את המשימה הספציפית.

**6. Prefill Claude's Response**
- התחל את התשובה בשביל Claude כדי להכריח פורמט.
- לדוגמה, אם מתחילים ב-`{` המודל חייב להשלים JSON.
- שימושי לפלטים מובנים (JSON, XML, רשימות).

**7. Chain Complex Prompts (שרשור Prompts)**
- פצל משימה מורכבת לשלבים קטנים יותר.
- הפלט של Prompt אחד הופך ל-input של הבא.
- קל יותר לבדוק ולדבג.

**8. Long Context Tips (הקשר ארוך)**
- שים מידע חשוב בהתחלה ובסוף (המודל זוכר טוב יותר את הקצוות).
- השתמש בתגיות לארגן מסמכים ארוכים.
- Claude תומך ב-100K+ טוקנים אבל עדיין — קריא יותר = תוצאה טובה יותר.

---

## 2. Anthropic Interactive Prompt Engineering Tutorial — מפת הלמידה

הקורס הרשמי (repo: anthropics/prompt-eng-interactive-tutorial) בנוי כ-9 שיעורים בשלוש רמות:

**רמת מתחילים (Beginner):**
1. **Basic Prompt Structure** — מבנה בסיסי של Prompt (System, User, Assistant).
2. **Being Clear and Direct** — שפה חד-משמעית.
3. **Assigning Roles** — מתן persona למודל.

**רמת ביניים (Intermediate):**
4. **Separating Data from Instructions** — הפרדה בין הוראות לנתונים (XML tags).
5. **Formatting Output & Speaking for Claude** — עיצוב פלט + prefill.
6. **Precognition — Thinking Step by Step** — Chain of Thought.
7. **Using Examples** — Few-shot prompting.

**רמת מתקדמים (Advanced):**
8. **Avoiding Hallucinations** — איך למנוע מהמודל להמציא.
9. **Complex Prompts — Industry Use Cases** — chatbots, legal, finance, coding.

**Appendix:** Prompt Chaining, Tool Use, Search & Retrieval.

---

## 3. Advanced Prompting Techniques

### Avoiding Hallucinations (הימנעות מהזיות)
Hallucination = המודל ממציא עובדות שנשמעות סבירות.
- תן למודל אופציה לומר "אני לא יודע" — "אם אינך בטוח, אמור 'איני יודע'".
- ספק מקורות בתוך ה-Prompt ובקש שיצטט מהם בלבד.
- בקש שידגיש ציטוטים רלוונטיים לפני המסקנה.
- בדוק תמיד עובדות קריטיות (תאריכים, מספרים, שמות).

### Prompt Chaining
כשמשימה מורכבת מדי ל-Prompt אחד — שבור אותה:
- Prompt 1: נתח את הטקסט ותוציא נקודות מפתח.
- Prompt 2: קח את הנקודות ותכתוב סיכום.
- Prompt 3: קח את הסיכום ותרגם לעברית.
כל שלב קל לאימות ולתיקון.

### Output Formatting
- בקש JSON/XML/Markdown מפורש.
- תן דוגמת פלט.
- השתמש ב-prefill להכריח פורמט.
- הגדר schema ("השדות חייבים להיות: name, age, summary").

### Speaking for Claude
שים תחילת תשובה ב-role=assistant. המודל ימשיך משם.
זה טכניקה חזקה להבטיח פלט מובנה או סגנון מסוים.

---

## 4. Tool Use (Function Calling)

### מה זה?
Tool Use מאפשר למודל "לקרוא" לפונקציות חיצוניות — API, חישוב, חיפוש, שליפה מ-DB.
המודל לא מבצע את הפעולה — הוא *מחליט* שצריך להפעיל כלי, ומחזיר בקשה מובנית; האפליקציה שלך מבצעת ומחזירה את התוצאה.

### זרימת הלולאה (Agentic Loop):
1. משתמש שולח הודעה + רשימת tools זמינים.
2. Claude מחליט אם צריך tool. אם כן, מחזיר `stop_reason: "tool_use"` + בלוק `tool_use` עם שם הכלי ופרמטרים.
3. הקוד שלך מריץ את הכלי ושולח חזרה `tool_result`.
4. Claude משתמש בתוצאה כדי להמשיך את התשובה.
5. חוזר על עצמו עד שהתשובה מוכנה (`stop_reason: "end_turn"`).

### שני סוגי כלים:
- **Client Tools** — הקוד שלך מבצע (query ל-DB, שליחת מייל, קריאת קובץ). אתה מגדיר schema + מממש.
- **Server Tools** — Anthropic מבצע עבורך (web_search, code_execution, web_fetch). רק תוסיף לרשימת tools.

### הגדרת Tool — המפתחות:
- **name** — שם ברור וקצר (get_weather, search_docs).
- **description** — הסבר מפורט *מתי* להשתמש בכלי (זה החלק הכי חשוב — Claude מחליט לפי התיאור).
- **input_schema** — JSON Schema של הפרמטרים.

### Best Practices:
- תיאורים מפורטים = החלטות נכונות יותר.
- `strict: true` מאלץ conformance ל-schema.
- פרמטרים חסרים: Opus ישאל; Sonnet עלול לנחש. להדרכה: "אם חסר מידע — שאל, אל תנחש".
- Parallel Tool Use — המודל יכול לקרוא לכמה כלים בו-זמנית.

### MCP (Model Context Protocol)
סטנדרט פתוח לחיבור AI לכלים חיצוניים (Google Drive, Jira, Slack, DBs).
MCP Server = עוטף של כלים שכל AI תואם-MCP יכול להתחבר אליו.

### פיטפול נפוצים:
- תיאור כלי מעורפל → הכלי נקרא בזמן הלא נכון.
- Schema רופף → פרמטרים שגויים.
- שכחה לטפל ב-error מהכלי → המודל ממשיך בהנחה שהצליח.

---

## 5. AI Fluency Framework — מודל 4D של Anthropic

מסגרת ללימוד איך לעבוד עם AI באופן *effective, efficient, ethical, safe*.
ארבעה מיומנויות ליבה:

### D1 — Delegation (האצלה)
- אילו משימות כדאי להעביר ל-AI ואילו לא?
- חלק משימות גדולות לתתי-משימות שה-AI יכול לבצע.
- שאלות מדריכות: האם זו משימה חזרתית? האם דורשת שיקול דעת אנושי? האם העלות של טעות גבוהה?

### D2 — Description (תיאור)
- היכולת לנסח Prompt טוב.
- כולל את כל טכניקות ה-Prompt Engineering מלמעלה.
- ככל שהתיאור שלך מדויק יותר — הפלט טוב יותר.

### D3 — Discernment (הבחנה)
- היכולת להעריך ביקורתית את הפלט של ה-AI.
- האם העובדות נכונות? האם הלוגיקה תקינה? האם זה עונה *באמת* על מה ששאלתי?
- Description ↔ Discernment loop: מתארים, בוחנים, מתקנים — וחוזרים.

### D4 — Diligence (חריצות / אחריות)
- אימות, אחריות, שימוש אתי.
- לבדוק מקורות, לשמור על פרטיות, לזהות הטיות.
- לא להעתיק פלט עיוור — להבין, לבדוק, לקחת אחריות.

**הלולאה:** Delegate → Describe → Discern → Diligence → (שוב).

---

## 6. Claude Code — Best Practices

### מה זה Claude Code?
כלי agentic coding בטרמינל / IDE / desktop / web. קורא את הקוד שלך, עורך קבצים, מריץ פקודות, מתחבר ל-git, מבצע משימות רחבות על פני מספר קבצים.

### יכולות עיקריות:
- כתיבת פיצ'רים ותיקון באגים בשפה טבעית.
- הרצת טסטים, תיקון שגיאות lint, פתרון merge conflicts.
- יצירת commits, branches, pull requests.
- חיבור כלים חיצוניים דרך MCP (Drive, Jira, Slack, DBs).
- הרצת כמה agents במקביל (sub-agents).

### CLAUDE.md — הזיכרון הפרויקטלי
קובץ markdown בשורש הפרויקט. Claude Code קורא אותו בתחילת *כל* session.
מה לשים שם:
- סטנדרטים של קוד.
- החלטות ארכיטקטוניות.
- ספריות מועדפות.
- פקודות build/test/deploy.
- check-list לקוד review.

### Custom Commands & Hooks
- **Commands:** `/review-pr`, `/deploy-staging` — workflows שהצוות משתף.
- **Hooks:** פקודות shell שרצות לפני/אחרי פעולות Claude (auto-format אחרי edit, lint לפני commit).

### Unix Philosophy & Piping
Claude Code מתנהג כמו כלי Unix:
```
tail -200 app.log | claude -p "Slack me if you see any anomalies"
git diff main --name-only | claude -p "review these files for security issues"
```

### Best Practices ללימוד תלמידים:
- **התחל קטן** — משימה אחת ברורה, לא "תבנה לי אפליקציה".
- **בקש plan לפני execute** — במיוחד במשימות גדולות.
- **קרא את הקוד שנכתב** — אל תסמוך עיוור.
- **הרץ טסטים** — Claude יכול לכתוב ולהריץ טסטים אוטומטית.
- **Commit לעיתים קרובות** — כדי להיות יכול לחזור אחורה.
- **השתמש ב-CLAUDE.md** — במקום לחזור על הקשר בכל session.

---

## 7. Software Development with AI — עקרונות כלליים

### איך לעבוד עם AI Coding Assistants (Claude, Cursor, Copilot):
1. **הבן מה שכתוב** — אם לא מבינים את הקוד, אל תשתמשו בו.
2. **טסטים קודם** — בקשו tests לפני ה-implementation (TDD-ish).
3. **הקשר הוא הכל** — ככל שתתנו יותר הקשר (קבצים רלוונטיים, error messages, דוגמאות), התוצאה טובה יותר.
4. **שאלות פתוחות → שאלות ממוקדות** — לא "תתקן את הבאג" אלא "הפונקציה X מחזירה null כש-input ריק, צריך להחזיר []".
5. **Iterate** — כמעט תמיד צריך 2-3 סבבים.

### מתי AI עוזר הכי הרבה:
- Boilerplate (CRUD, forms, routing).
- הסברים של קוד קיים.
- רפקטורינג.
- כתיבת טסטים.
- Debugging עם error message ברור.
- תרגום בין שפות תכנות.

### מתי AI מסוכן / מוגבל:
- קוד קריטי לאבטחה בלי בדיקה אנושית.
- החלטות ארכיטקטוניות גדולות.
- כשאין לך דרך לאמת את הפלט.
- ספריות / APIs שהשתנו אחרי knowledge cutoff.

### Common Pitfalls (טעויות נפוצות של תלמידים):
- **Copy-paste בלי להבין** — "זה עבד באופן קסום" = בעיה.
- **Prompt עצלן** — "תעשה לי משחק" לא יעבוד. תגדיר מה, איך, באיזה שפה, עם אילו מנגנונים.
- **לא לקרוא שגיאות** — הדבר הראשון לעשות עם באג זה לקרוא את ההודעה.
- **יותר מדי הקשר** — לפעמים מעמיסים על המודל קבצים לא רלוונטיים, וזה פוגע.
- **לא לשמור גרסאות** — עבודה בלי git = אסון מחכה לקרות.

---

## 8. מושגי יסוד שכל תלמיד צריך להכיר

- **LLM** (Large Language Model) — מודל שפה גדול. מנבא את המילה הבאה בהסתברות.
- **Token** — יחידת טקסט בסיסית. מילה ~= 1-3 tokens באנגלית, פחות בעברית.
- **Context Window** — כמות הטקסט שהמודל יכול "להחזיק" בבת אחת (Claude: עד 200K-1M tokens).
- **System Prompt** — ההוראות הקבועות למודל.
- **User Message / Assistant Message** — הדו-שיח.
- **Temperature** — 0 = דטרמיניסטי, 1 = יצירתי. לקוד בד"כ 0-0.3.
- **Fine-tuning** — אימון נוסף של מודל על דאטה ספציפי (בד"כ לא נדרש — Prompting מספיק).
- **RAG** (Retrieval-Augmented Generation) — שליפת מידע רלוונטי ממאגר חיצוני לפני שליחה למודל.
- **Agent** — מערכת AI שמקבלת החלטות ומבצעת פעולות דרך tools בלולאה.
- **MCP** — סטנדרט פתוח לחיבור AI לכלים.

---

## 9. סיכום — "מה אני אומר לתלמיד שרק התחיל?"

1. **Prompt טוב = תוצאה טובה.** ברור, מפורט, עם דוגמאות.
2. **תחשוב לבד לפני שתשאל AI.** אם אתה יודע בדיוק מה אתה רוצה, AI ייתן לך את זה.
3. **בדוק מה AI נותן.** תמיד. במיוחד עובדות וקוד.
4. **פצל משימות גדולות.** AI טוב בצעדים קטנים.
5. **תן הקשר.** קוד, שגיאות, דוגמאות — הכל עוזר.
6. **תהיה ספקן.** AI יכול להמציא. אם משהו נראה מוזר — בדוק.
7. **קרא את הפלט.** אל תרוץ קוד שאתה לא מבין.
8. **Iterate.** ניסיון ראשון כמעט אף פעם לא מושלם.

*המטרה היא לא שה-AI יעבוד בשבילך — אלא שיהפוך אותך למתכנת טוב יותר.*
