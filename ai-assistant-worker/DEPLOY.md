# הוראות דיפלוי — עוזר הקורס ל-AI Lab

## מה יש כאן?
- `src/index.js` — קוד ה-Worker (proxy ל-Claude API)
- `src/course-knowledge.md` — בסיס הידע (תוכן 16 המפגשים)
- `wrangler.toml` — הגדרות הפריסה

## שלבי הדיפלוי (פעם ראשונה)

### 1. התקנת Wrangler (פעם אחת)
```bash
npm install -g wrangler
```

### 2. התחברות ל-Cloudflare
```bash
cd /Users/meirlb/Desktop/ai-lab/ai-assistant-worker
wrangler login
```
(ייפתח דפדפן — אשר שהאפליקציה יכולה לגשת לחשבון שלך)

### 3. שמירת מפתח ה-API (CRITICAL — המפתח נשמר מוצפן)
```bash
wrangler secret put ANTHROPIC_API_KEY
```
הטרמינל יבקש להדביק את המפתח. הדבק (Cmd+V) ולחץ Enter.
**המפתח נעלם מיד מהמסך ונשמר מוצפן ב-Cloudflare.**

### 4. דיפלוי
```bash
wrangler deploy
```

### 5. העתק את ה-URL שקיבלת
אחרי הדיפלוי תקבל הודעה:
```
Published ai-lab-assistant
  https://ai-lab-assistant.YOUR-SUBDOMAIN.workers.dev
```

### 6. עדכון ה-URL ב-portal.html
ערוך את `/Users/meirlb/Desktop/ai-lab/portal.html`, מצא את השורה:
```javascript
const AI_WORKER_URL = 'https://ai-lab-assistant.YOUR-SUBDOMAIN.workers.dev';
```
והחלף ב-URL האמיתי שקיבלת.

### 7. Commit + push
```bash
cd /Users/meirlb/Desktop/ai-lab
git add portal.html
git commit -m "Wire AI assistant worker URL"
git push
```

## עדכוני תוכן בעתיד
כשמעדכנים את תוכן הקורס ב-portal.html:
1. הריץ מחדש את סקריפט חילוץ התוכן (להגיד לClaude)
2. ערוך `src/course-knowledge.md` אם צריך
3. `wrangler deploy`

## בדיקה לפני העלאה לפרודקשן (לוקאלי)
```bash
wrangler dev
```
זה יריץ Worker מקומי על `http://localhost:8787`. כדי לבדוק:
1. ערוך זמנית את `AI_WORKER_URL` ב-portal.html ל-`http://localhost:8787`
2. הרץ שרת מקומי: `cd /Users/meirlb/Desktop/ai-lab && python3 -m http.server 8000`
3. פתח `http://localhost:8000/portal.html`

## עלויות צפויות
- **Cloudflare Workers:** חינם עד 100K בקשות/יום
- **Claude Haiku 4.5** (המודל שבחרנו):
  - $1 / מיליון input tokens
  - $5 / מיליון output tokens
  - **עם prompt caching:** הוזלה של ~90% על ה-system prompt
- הערכה: ~$0.001 לשיחה של 5-6 הודעות → 1,000 שיחות = $1

## טיפים לאבטחה
- ה-`ANTHROPIC_API_KEY` נשמר כ-secret ב-Cloudflare — לא נכנס לגיט, לא מופיע בקוד
- CORS מוגבל ל-`ai-lab.co.il` בלבד
- Rate limit: 10 הודעות/דקה, 60/שעה לכל IP
- אורך הודעה מקסימלי: 500 תווים
- הגבלת היסטוריה: 20 הודעות אחרונות (חסכון בטוקנים)
