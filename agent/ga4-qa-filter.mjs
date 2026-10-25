// סינון תנועת בדיקות פנימית מכל שאילתות GA4 (Data API, runReport) — 25.10.2026.
// בדיקות המעקב שלנו נכנסות לאתר עם utm_source=selftest, utm_medium=qa, utm_campaign=tracking_check
// (~22 ביקורים בשבוע, ~17% מהתנועה) ועיוותו כל דוח. כל runReport בדוחות (סוכן הנראות, ga-report, pro-daily) עובר דרך כאן.
// GA4 מאפשר לסנן לפי מימד גם כשהוא לא מופיע ב-dimensions של השאילתה (כמו הסינונים הקיימים לפי eventName / pagePath),
// ו-sessionSource / sessionMedium תואמים לכל המימדים והמדדים שבשימוש (הם כבר נשאלים יחד איתם בסוכן הנראות).
// stringFilter בלי caseSensitive = לא רגיש לאותיות גדולות/קטנות.

export const QA_NOTE = "לא כולל תנועת בדיקות פנימית (מקור selftest / מדיום qa).";

const notExact = (fieldName, value) => ({ notExpression: { filter: { fieldName, stringFilter: { matchType: "EXACT", value } } } });
const QA_EXCLUSIONS = [notExact("sessionSource", "selftest"), notExact("sessionMedium", "qa")];

// מחבר את ההחרגה לסינון קיים (אם יש) ב-andGroup אחד. סינון שהוא כבר andGroup — משטחים אותו במקום לקנן.
export function excludeQA(filter) {
  const own = !filter ? [] : filter.andGroup ? filter.andGroup.expressions || [] : [filter];
  return { andGroup: { expressions: [...own, ...QA_EXCLUSIONS] } };
}

// גוף runReport מלא → אותו גוף עם dimensionFilter שמחריג את תנועת הבדיקות
export const withoutQA = body => ({ ...body, dimensionFilter: excludeQA(body.dimensionFilter) });
