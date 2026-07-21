# פרומפטים לתמונות המאמרים

## איך משתמשים
1. מדביקים כל פרומפט בכלי יצירת תמונות (ChatGPT/DALL·E, Gemini, Midjourney — לא משנה)
2. מבקשים יחס **16:9**
3. מורידים את התוצאה לשולחן העבודה
4. מריצים את הפקודה שבסוף הקובץ — היא דוחסת ושמה את הקובץ בשם הנכון

## סגנון הבסיס (נגזר מהתמונות הקיימות)
רקע סגול-נייבי כהה · זוהר ניאון טורקיז/ירוק ומג'נטה · איור וקטורי שטוח וידידותי ·
דמויות מעוגלות עם לחיים ורודות · אלמנטים צפים של קוד וממשק · צללית קו רקיע של עיר ·
כוכבים ונצנוצים · **בלי טקסט בתמונה**

---

## article-15 — חוג תכנות מול קורס AI

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. Split composition: on the left side a child sits
at an old-style desktop computer showing simple colorful block-based code puzzle pieces,
lit in cooler blue tones. On the right side a child sits at a modern laptop while a
friendly glowing robot assistant floats beside them, and a finished colorful website
mockup with buttons and images glows above the screen in warm teal and magenta light.
A soft glowing vertical divider of light separates the two halves. Floating code symbols
</div>, {} and gear icons drift in the background. Purple city skyline silhouette along
the bottom. Stars and sparkles in the sky. Friendly rounded character design with rosy
cheeks, smiling. No text, no letters, no words anywhere in the image.
```

---

## article-16 — כמה עולה קורס AI לילדים

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A parent and child sit together at a glowing
desk with a laptop, looking thoughtfully at three floating translucent holographic price
cards of different heights hovering above them, each card glowing a different neon color
and showing abstract bar shapes and coin icons. Golden glowing coins and a small
calculator icon float nearby. A friendly small robot peeks from the side. Floating code
symbols and gear icons drift in the background. Purple city skyline silhouette along the
bottom. Stars and sparkles. Friendly rounded character design with rosy cheeks. No text,
no numbers, no letters, no words anywhere in the image.
```

---

## article-17 — פרויקטים אמיתיים של ילדים

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A wide grid wall of many small glowing website
screens floats in the air, each showing a different colorful abstract app interface —
a sports scoreboard, a cupcake, a music note, a car, a travel map, a dumbbell, a lego
brick — all rendered as simple bright icons. Three happy kids of different appearances
stand in the foreground with their backs partly to us, looking up at the wall of screens,
one pointing excitedly. A friendly glowing robot floats beside them. Purple city skyline
silhouette along the bottom. Stars and sparkles in the sky. Friendly rounded character
design with rosy cheeks. No text, no letters, no words anywhere in the image.
```

---

## article-19 — Vibe Coding לילדים

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A child sits at a laptop speaking, with a
glowing neon speech bubble rising from them that contains simple abstract shapes and
sparkles. The speech bubble flows in a luminous curved stream toward a large screen
where a complete colorful app interface is assembling itself out of glowing building
blocks. A friendly glowing robot assistant floats beside the screen, gesturing toward
the app as if presenting it. Magic sparkle trails follow the stream. Floating code
symbols </div>, {} and gear icons drift in the background. Purple city skyline silhouette
along the bottom. Stars and sparkles in the sky. Friendly rounded character design with
rosy cheeks, smiling. No text, no letters, no words anywhere in the image.
```

---

## הפקודה לדחיסה

מריצים בטרמינל אחרי שהורדת את 4 התמונות לשולחן העבודה בשמות `15.png`, `16.png`, `17.png`, `19.png`:

```bash
cd ~/Desktop/ai-lab/blog/images

sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/15.png --out article-15-coding-class-vs-ai-course.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/16.png --out article-16-ai-course-price-kids.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/17.png --out article-17-real-kids-ai-projects.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/19.png --out article-19-vibe-coding-for-kids.jpg

ls -lh article-1[5-9]*
```

התוצאה אמורה להיות 4 קבצים של 150–220KB. אם יוצא גדול בהרבה — תוריד את
`formatOptions` מ-82 ל-70.

> הערה: המפרט (1200×669, JPEG, ~150–220KB) נגזר מהתמונות הקיימות בתיקייה.
> שיטת היצירה המקורית לא תועדה בריפו — הפרומפטים כאן שוחזרו מניתוח ויזואלי
> של התמונות הקיימות.

---
---

# בונוס — 5 מאמרים ותיקים שאין להם תמונה בכלל

המאמרים האלה משתפים כרגע את התמונה הגנרית של האתר. **הראשון ברשימה הוא
המאמר המסחרי הכי חזק בבלוג** — שווה להתחיל ממנו.

## article-20 — איך לבחור קורס בינה מלאכותית ⭐ הכי חשוב

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A parent stands thoughtfully in front of three
floating glowing doorways or portals of different neon colors, each revealing a different
glimpse inside — one showing a lone screen, one showing a large crowded classroom of tiny
figures, one showing a small circle of children around a glowing laptop with a friendly
robot. The parent holds a glowing checklist tablet. A magnifying glass icon and question
mark shapes float nearby. Purple city skyline silhouette along the bottom. Stars and
sparkles. Friendly rounded character design with rosy cheeks. No text, no letters, no
words anywhere in the image.
```

## article-21 — ChatGPT מול Claude מול Gemini

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. Three distinct friendly glowing robot characters
of different shapes stand side by side on small floating platforms, each surrounded by its
own colored aura — one teal, one warm orange, one blue. Each robot presents a different
glowing holographic panel showing abstract shapes: one with flowing text lines, one with
a document, one with an image and chart. A child stands small in the foreground looking
up at them, deciding. Purple city skyline silhouette along the bottom. Stars and sparkles.
Friendly rounded character design. No text, no letters, no words anywhere in the image.
```

## article-22 — כלי AI חינמיים למבוגרים

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A cheerful adult sits at a laptop while a
constellation of glowing app icons floats around them in a wide arc — a paintbrush, a
microphone, a document, a camera, a music note, a chart, a lightbulb — each rendered as a
simple bright neon icon inside a rounded glowing tile. Small price-tag shapes on some
tiles glow teal to suggest they cost nothing. A friendly small robot floats nearby.
Purple city skyline silhouette along the bottom. Stars and sparkles. Friendly rounded
character design with rosy cheeks. No text, no letters, no words anywhere in the image.
```

## article-23 — ללמוד AI בגיל מבוגר

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A warm, confident older adult with grey hair sits
comfortably at a laptop, smiling, with a glowing website they built floating above the
screen. A friendly glowing robot assistant sits beside them like a patient companion.
Soft glowing growth motifs — an upward arc of light, a small sprouting plant of light —
rise gently behind them. Floating gear and lightbulb icons drift in the background.
Purple city skyline silhouette along the bottom. Stars and sparkles. Friendly rounded
character design with rosy cheeks. No text, no letters, no words anywhere in the image.
```

## article-24 — אוטומציות AI לעסק קטן

```
Flat vector cartoon illustration, 16:9, dark navy-purple background (#1a1a2e) with neon
teal (#00D4AA), purple and magenta glow. A small business owner stands beside a glowing
conveyor of light where repetitive tasks — an envelope, an invoice, a calendar, a chat
bubble, a spreadsheet — flow along and are picked up and handled by friendly small robot
arms, coming out the other side as neat glowing checkmark shapes. The owner watches with
relief, holding a coffee cup. Purple city skyline silhouette along the bottom. Stars and
sparkles. Friendly rounded character design with rosy cheeks. No text, no letters, no
words anywhere in the image.
```

## הפקודה לדחיסה (הבונוס)

```bash
cd ~/Desktop/ai-lab/blog/images

sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/20.png --out article-20-how-to-choose-ai-course.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/21.png --out article-21-chatgpt-vs-claude-vs-gemini.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/22.png --out article-22-free-ai-tools-2026.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/23.png --out article-23-learn-ai-older-age.jpg
sips -Z 1200 --setProperty format jpeg --setProperty formatOptions 82 ~/Desktop/24.png --out article-24-ai-automation-small-business.jpg
```

אחרי שתייצר אותן — תגיד לי ואני אחבר אותן למאמרים ולכרטיסים בבלוג אוטומטית.
