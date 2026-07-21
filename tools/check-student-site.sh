#!/bin/bash
# בדיקת אתר תלמיד לפני העלאה לאוויר
# שימוש:  ./tools/check-student-site.sh <שם-התיקייה>
# דוגמה:  ./tools/check-student-site.sh dancing

set -u
cd "$(dirname "$0")/.." || exit 1

DIR="${1:-}"
if [ -z "$DIR" ]; then
  echo "❌ חסר שם תיקייה.  שימוש: ./tools/check-student-site.sh <שם-התיקייה>"
  exit 1
fi
DIR="${DIR%/}"

if [ ! -d "$DIR" ]; then
  echo "❌ התיקייה '$DIR' לא קיימת"
  exit 1
fi

FILES=$(find "$DIR" -name "*.html" -type f)
if [ -z "$FILES" ]; then
  echo "❌ אין קבצי HTML ב-$DIR"
  exit 1
fi

echo "════════════════════════════════════════"
echo "  בדיקת אתר תלמיד: $DIR"
echo "════════════════════════════════════════"
echo

FAIL=0

# ── 1. noindex ─────────────────────────────
echo "1. חסימת אינדוקס בגוגל"
for f in $FILES; do
  if grep -qi 'name="robots"[^>]*noindex' "$f"; then
    echo "   ✅ $f"
  else
    echo "   ❌ $f — חסר noindex"
    FAIL=1
  fi
done
echo

# ── 2. פרטים אישיים ────────────────────────
echo "2. פרטים אישיים חשופים"
HITS=$(grep -ohE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|05[0-9][- ]?[0-9]{3}[- ]?[0-9]{4}|972[0-9]{9}' $FILES 2>/dev/null \
  | grep -viE 'example|test|yourname|you@|your@|placeholder|1234567|0000000|9876543|5551234|3334455|7778899|@2x|\.png|\.jpg|\.svg|w3\.org|schema\.org|googleapis|gstatic|facebook|ai-lab\.co\.il|972546500795|@media|@keyframes|@import|@font|@charset|@supports' \
  | sort -u)
if [ -n "$HITS" ]; then
  echo "   ❌ נמצאו פרטים שנראים אמיתיים — בדוק כל אחד:"
  echo "$HITS" | sed 's/^/        /'
  echo "        (אם אלה נתוני דמו — אפשר להמשיך. אם זה טלפון/מייל של תלמיד — להסיר!)"
  FAIL=1
else
  echo "   ✅ לא נמצאו טלפונים או מיילים אמיתיים"
fi
echo

# ── 3. העברת מידע לשירות חיצוני ────────────
echo "3. שליחת פרטי גולשים לשירות חיצוני"
EXT=$(grep -ohE 'callmebot|api\.telegram|hooks\.slack|formspree|emailjs|discord\.com/api/webhooks' $FILES 2>/dev/null | sort -u)
if [ -n "$EXT" ]; then
  echo "   ❌ האתר שולח מידע החוצה — לבדוק לאן ולמי:"
  echo "$EXT" | sed 's/^/        /'
  FAIL=1
else
  echo "   ✅ אין שליחה לשירות חיצוני"
fi
echo

# ── 4. מפתחות API גלויים ───────────────────
echo "4. מפתחות API בקוד"
KEYS=$(grep -ohE '(sk-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_-]{30,}|API_KEY\s*=\s*["'"'"'][^"'"'"']{12,})' $FILES 2>/dev/null \
  | grep -viE 'YOUR_|_HERE|xxx|placeholder|example|<your|change_?me|paste_?your' \
  | sort -u)
if [ -n "$KEYS" ]; then
  echo "   ❌ נמצא מפתח בקוד הדפדפן (כל אחד יכול לראות אותו):"
  echo "$KEYS" | cut -c1-60 | sed 's/^/        /'
  FAIL=1
else
  echo "   ✅ אין מפתחות חשופים"
fi
echo

# ── 5. לא בסייטמאפ ─────────────────────────
echo "5. האתר לא בסייטמאפ"
if grep -q "/$DIR/" sitemap.xml 2>/dev/null; then
  echo "   ❌ $DIR נמצא ב-sitemap.xml — צריך להסיר (noindex + סייטמאפ זו סתירה)"
  FAIL=1
else
  echo "   ✅ לא בסייטמאפ"
fi
echo

# ── סיכום ──────────────────────────────────
echo "════════════════════════════════════════"
if [ $FAIL -eq 0 ]; then
  echo "  ✅ הכל תקין — אפשר להעלות"
else
  echo "  ⛔ יש בעיות לתקן לפני העלאה"
fi
echo "════════════════════════════════════════"
exit $FAIL
