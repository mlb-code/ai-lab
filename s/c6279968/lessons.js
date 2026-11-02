/*
  lessons.js — לוח השיעורים של מיה (20 שיעורים).
  -----------------------------------------------------------------
  כאן משנים תאריכים ושמות בלבד. התוכן של כל שיעור נמצא ב-content/lesson-NN.js.

  • date  — תאריך השיעור "YYYY-MM-DD" (שעון ישראל). אפשר להזיז שיעור פשוט
            על ידי שינוי התאריך שלו (אין חישוב אוטומטי של "כל ראשון").
  • השיעור נפתח בפורטל ביום שלו ב-openTime (09:00), ומתקיים ב-lessonTime (10:00).
  • part  — "computers" (עולם המחשבים) או "ai" (בינה מלאכותית).
  • icon  — אימוג'י אחד לכרטיס.

  business — רשימת התוצרים בעמוד "העסק של מיה" (lesson = השיעור שבו בונים אותם).
*/
window.MIA_META = {
  student: "מיה",
  zoom: "https://us06web.zoom.us/j/8186142816?pwd=VEtXYVh3Z3IwZWhrZHYvWm5hYWlKQT09",
  startISO: "2026-11-08T10:00:00+02:00",
  lessonTime: "10:00",
  openTime: "09:00",
  durationMin: 60,
  lessons: [
    { n: 1,  date: "2026-11-08", part: "computers", icon: "🖥️", title: "מה יש בתוך המחשב?" },
    { n: 2,  date: "2026-11-15", part: "computers", icon: "⌨️", title: "המקלדת היא הכלי שלי" },
    { n: 3,  date: "2026-11-22", part: "computers", icon: "🗂️", title: "המשרד של מיה — קבצים ותיקיות" },
    { n: 4,  date: "2026-11-29", part: "computers", icon: "🌐", title: "איך עובד האינטרנט?" },
    { n: 5,  date: "2026-12-06", part: "computers", icon: "🛡️", title: "בטוחים ברשת" },
    { n: 6,  date: "2026-12-13", part: "computers", icon: "📝", title: "כותבים כמו מקצוענים — מעבד תמלילים" },
    { n: 7,  date: "2026-12-20", part: "computers", icon: "🧮", title: "כמה ארוויח? — גיליון אלקטרוני" },
    { n: 8,  date: "2026-12-27", part: "computers", icon: "🎨", title: "הפלייר שלי — עיצוב ותמונות" },
    { n: 9,  date: "2027-01-03", part: "computers", icon: "📊", title: "מציגים את העסק — מצגת" },
    { n: 10, date: "2027-01-10", part: "computers", icon: "☁️", title: "המחשב מדבר עם העולם — מייל, ענן וסיכום" },
    { n: 11, date: "2027-01-17", part: "ai", icon: "🤖", title: "מה זה בינה מלאכותית?" },
    { n: 12, date: "2027-01-24", part: "ai", icon: "💬", title: "שיחה ראשונה עם Claude" },
    { n: 13, date: "2027-01-31", part: "ai", icon: "📚", title: "AI עוזר לי ללמוד (ולא עושה במקומי)" },
    { n: 14, date: "2027-02-07", part: "ai", icon: "💡", title: "מכונת הרעיונות — AI ועסקים" },
    { n: 15, date: "2027-02-14", part: "ai", icon: "✍️", title: "AI כותב בשבילי (ואני עורכת)" },
    { n: 16, date: "2027-02-21", part: "ai", icon: "🖼️", title: "לוגו ותמונות ב-AI" },
    { n: 17, date: "2027-02-28", part: "ai", icon: "🕵️‍♀️", title: "AI טועה! — איך לבדוק" },
    { n: 18, date: "2027-03-07", part: "ai", icon: "🏗️", title: "בונים אתר לעסק עם Claude" },
    { n: 19, date: "2027-03-14", part: "ai", icon: "🛎️", title: "המוכר האוטומטי — AI שמדבר עם לקוחות" },
    { n: 20, date: "2027-03-21", part: "ai", icon: "🏆", title: "פרויקט סיום — העסק של מיה" }
  ],
  business: [
    { id: "idea",    lesson: 1,  icon: "💡", title: "רעיון לעסק",            hint: "משפט אחד: \"העסק שלי הוא…\"" },
    { id: "folder",  lesson: 3,  icon: "🗂️", title: "תיקיית \"העסק של מיה\"", hint: "עם 3 תיקיות: מוצרים, לקוחות, פרסום" },
    { id: "market",  lesson: 4,  icon: "🔎", title: "בדיקת מחירים ברשת",     hint: "3 מוצרים דומים וכמה הם עולים" },
    { id: "pricing", lesson: 6,  icon: "🏷️", title: "מחירון",                hint: "5 מוצרים, מחיר ותמונה (Word)" },
    { id: "profit",  lesson: 7,  icon: "🧮", title: "טבלת רווחים",           hint: "עלות, מחיר ורווח (Excel)" },
    { id: "flyer",   lesson: 8,  icon: "📣", title: "פלייר",                 hint: "עם מחיר גדול וברור" },
    { id: "deck",    lesson: 9,  icon: "📊", title: "מצגת העסק",             hint: "5–6 שקפים (PowerPoint)" },
    { id: "slogan",  lesson: 14, icon: "✨", title: "שם וסלוגן",             hint: "ולמה דווקא הם" },
    { id: "texts",   lesson: 15, icon: "✍️", title: "תיאורי מוצרים",         hint: "כתובים עם Claude וערוכים בידיים שלך" },
    { id: "logo",    lesson: 16, icon: "🎨", title: "לוגו",                  hint: "ועל הפלייר" },
    { id: "site",    lesson: 18, icon: "🌐", title: "אתר לעסק",              hint: "דף אינטרנט אחד שבנית עם Claude" },
    { id: "seller",  lesson: 19, icon: "🛎️", title: "הוראות למוכר",          hint: "5 שורות למוכר האוטומטי" }
  ]
};
