# פרומפטים לתמונות — מאמרי הדיסקורד (25, 26)

## איך משתמשים
1. מדביקים כל פרומפט בכלי יצירת תמונות (Gemini / ChatGPT — מה שנוח)
2. מבקשים יחס **16:9**
3. שומרים את התוצאות לשולחן העבודה בשמות **`25.png`** ו-**`26.png`**
4. לוחצים פעמיים על הקובץ `תמונות-מאמרי-דיסקורד.command` שבשולחן העבודה — הוא דוחס, ממיר ושם את הקבצים במקום הנכון
5. כותבים לקלוד "התמונות מוכנות" — הוא מחבר אותן למאמרים ולכרטיסים

## סגנון הבסיס (זהה לתמונות הקיימות בבלוג)
רקע סגול-נייבי כהה · זוהר ניאון טורקיז וסגול-מג'נטה · איור וקטורי שטוח וידידותי ·
דמויות מעוגלות עם לחיים ורודות · רובוט קטן וחברותי · צללית קו רקיע של עיר · כוכבים ונצנוצים · **בלי טקסט בתמונה**

---

## article-25 — דיסקורד לילדים: המדריך להורים

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A parent and a child sit together on a cozy couch
looking at one laptop between them. Above the laptop floats a large glowing chat-app window
with a rounded sidebar of small channel rooms on one side and friendly speech bubbles on the
other, all rendered as simple abstract shapes. A glowing teal shield icon with a checkmark
hovers gently over the window like a protective badge. A small friendly robot peeks from
behind the couch, smiling. Floating gear icons, small padlock shapes and chat-bubble icons
drift in the background. Purple city skyline silhouette along the bottom. Stars and sparkles
in the sky. Friendly rounded character design with rosy cheeks, both smiling and relaxed.
No text, no letters, no words anywhere in the image.
```

---

## article-26 — קהילת הדיסקורד של AI Lab

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A glowing floating clubhouse building seen in
cutaway, with several lit rooms stacked on different floors: one room where kids gather
around a screen showing a colorful website, one room with a glowing trophy and a calendar
icon, one room with a big question-mark speech bubble and raised hands, one room with a
bookshelf and a small robot explaining, and a calm top floor where a few adults sit with
coffee cups watching a screen. Small friendly kids of different appearances walk toward the
entrance holding glowing key cards. A friendly glowing robot guide floats at the door,
waving. Purple city skyline silhouette along the bottom. Stars and sparkles in the sky.
Friendly rounded character design with rosy cheeks, smiling. No text, no letters, no
numbers, no words anywhere in the image.
```

---

## מה הקובץ `.command` עושה (למי שסקרן)
```bash
cd ~/Desktop/ai-lab/blog/images
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/25.png --out article-25-discord-for-kids-parents-guide.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/26.png --out article-26-ailab-discord-community.jpg
```
התוצאה: שני קבצי JPEG של 150–220KB ברוחב 1200.
