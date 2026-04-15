/**
 * שליחת מייל תודה לכל מי שהשתתף בוובינר
 *
 * הוראות שימוש:
 * 1. פתח את הגיליון webinar-registrations ב-Google Sheets
 * 2. Extensions → Apps Script
 * 3. הדבק את הקוד הזה
 * 4. הרץ sendThankYou()
 *
 * הסקריפט:
 * - מדלג על מי שכבר נשלח לו (עמודה G = "thankyou_sent" עם הערך "yes")
 * - מדלג על ליאור אוסטרייך (כבר נרשם לקורס)
 * - מסמן בעמודה G "yes" אחרי שליחה מוצלחת
 */

function sendThankYou() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var count = 0;
  var skipped = 0;

  // ודא שיש כותרת לעמודה G
  if (!data[0][6]) {
    sheet.getRange(1, 7).setValue('thankyou_sent');
  }

  for (var i = 1; i < data.length; i++) {
    var name = (data[i][0] || '').toString().trim();
    var email = (data[i][1] || '').toString().trim();
    var alreadySent = (data[i][6] || '').toString().trim().toLowerCase();

    if (!email) continue;
    if (alreadySent === 'yes') { skipped++; continue; }

    // דלג על ליאור אוסטרייך - כבר נרשם
    if (name.indexOf('ליאור אוסטרייך') !== -1 ||
        name.indexOf('אוסטרייך') !== -1 ||
        email.toLowerCase().indexOf('ostreich') !== -1) {
      sheet.getRange(i + 1, 7).setValue('skipped — registered');
      skipped++;
      continue;
    }

    var subject = 'תודה שהשתתפתם בוובינר! 🙏 הקורס הבא נפתח עכשיו';

    var html = buildThankYouHtml(name);

    try {
      GmailApp.sendEmail(email, subject, '', {
        htmlBody: html,
        name: 'AI Lab',
        replyTo: 'laviemb@gmail.com'
      });
      sheet.getRange(i + 1, 7).setValue('yes');
      count++;
      Utilities.sleep(1500);
    } catch (e) {
      sheet.getRange(i + 1, 7).setValue('error: ' + e.message);
      Logger.log('Error: ' + email + ' - ' + e.message);
    }
  }

  Logger.log('Sent ' + count + ' emails. Skipped ' + skipped + '.');
  SpreadsheetApp.getUi().alert('נשלחו ' + count + ' מיילים. דולגו ' + skipped + '.');
}

function buildThankYouHtml(name) {
  var registerUrl = 'https://ai-lab.co.il/webinar-form.html';

  return '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>'
    + '<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">'
    + '<div style="max-width:600px;margin:0 auto;background:#0f0f1e;border-radius:12px;overflow:hidden;direction:rtl;">'

    // Header
    + '<div style="background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:36px 24px 28px;text-align:center;">'
    + '<div style="font-size:26px;font-weight:900;color:#00D4AA;letter-spacing:1px;margin-bottom:16px;">AI Lab</div>'
    + '<h1 style="color:#fff;font-size:28px;margin:0 0 8px;line-height:1.3;">תודה שהשתתפתם! &#x1F64F;</h1>'
    + '<p style="color:#c0c0e0;font-size:18px;margin:0;font-weight:600;">היי ' + name + ', היה לנו כיף ענק שהייתם איתנו בוובינר</p>'
    + '</div>'

    // Intro
    + '<div style="padding:28px 24px 8px;color:#d0d0e8;font-size:16px;line-height:1.7;">'
    + '<p style="margin:0 0 16px;">בוובינר ראינו איך ילדים ובני נוער בונים <strong style="color:#fff;">פרויקטים אמיתיים</strong> — אתרים, בוטים ואפליקציות — תוך כדי שהם לומדים AI ויזמות &#x1F680;</p>'
    + '<p style="margin:0 0 16px;">אם אהבתם את מה שראיתם, <strong style="color:#00D4AA;">הקורס הבא נפתח עכשיו</strong> ואתם מוזמנים להירשם.</p>'
    + '</div>'

    // CTA - Top
    + '<div style="margin:24px;background:linear-gradient(135deg,rgba(108,60,225,0.25),rgba(0,212,170,0.15));border:1px solid rgba(108,60,225,0.4);border-radius:14px;padding:32px 24px;text-align:center;">'
    + '<div style="font-size:48px;margin-bottom:10px;">&#x1F393;</div>'
    + '<div style="font-size:24px;font-weight:900;color:#fff;margin-bottom:10px;">מוזמנים להירשם לקורס</div>'
    + '<div style="font-size:15px;color:#c0c0e0;margin-bottom:26px;line-height:1.6;">המקומות מוגבלים — כדאי להזדרז &#x1F447;</div>'
    + '<a href="' + registerUrl + '" style="display:block;background:#6C3CE1;color:#fff;font-size:24px;font-weight:900;padding:22px 32px;border-radius:60px;text-decoration:none;">להרשמה לקורס &#x2190;</a>'
    + '</div>'

    // Examples Section
    + '<div style="margin:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:24px;">'
    + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:6px;text-align:center;">&#x1F31F; דוגמאות מהתלמידים שלנו</div>'
    + '<div style="font-size:13px;color:#9090b0;text-align:center;margin-bottom:18px;">אתרים אמיתיים שתלמידים בנו בקורס</div>'

    // Project 1: שיר
    + '<a href="https://ai-lab.co.il/horse-fashion/" style="display:block;text-decoration:none;margin-bottom:12px;">'
    + '<div style="background:linear-gradient(135deg,rgba(226,130,70,0.15),rgba(180,90,40,0.1));border:1px solid rgba(226,130,70,0.3);border-radius:12px;padding:18px;text-align:center;">'
    + '<div style="font-size:32px;margin-bottom:6px;">&#x1F40E;</div>'
    + '<div style="font-size:17px;font-weight:800;color:#fff;margin-bottom:4px;">Horse Fashion</div>'
    + '<div style="font-size:13px;color:#e2a06a;font-weight:700;margin-bottom:6px;">שיר, בת 14</div>'
    + '<div style="font-size:13px;color:#c0c0e0;line-height:1.5;">חנות אונליין לציוד מקצועי לסוסים — קטלוג, עגלת קניות, דרופשיפינג</div>'
    + '</div></a>'

    // Project 2: אבינועם + גבריאל
    + '<a href="https://ai-lab.co.il/gamebuddy/" style="display:block;text-decoration:none;margin-bottom:12px;">'
    + '<div style="background:linear-gradient(135deg,rgba(108,60,225,0.15),rgba(139,92,246,0.1));border:1px solid rgba(108,60,225,0.3);border-radius:12px;padding:18px;text-align:center;">'
    + '<div style="font-size:32px;margin-bottom:6px;">&#x1F3AE;</div>'
    + '<div style="font-size:17px;font-weight:800;color:#fff;margin-bottom:4px;">GameBuddy</div>'
    + '<div style="font-size:13px;color:#8B5CF6;font-weight:700;margin-bottom:6px;">אבינועם וגבריאל, בני 13</div>'
    + '<div style="font-size:13px;color:#c0c0e0;line-height:1.5;">פלטפורמה להתאמת שחקני פורטנייט לפי רמה — עם מערכת דירוג</div>'
    + '</div></a>'

    // Project 3: נועם
    + '<a href="https://ai-lab.co.il/hairmatch/" style="display:block;text-decoration:none;">'
    + '<div style="background:linear-gradient(135deg,rgba(255,182,193,0.12),rgba(255,150,180,0.08));border:1px solid rgba(255,182,193,0.3);border-radius:12px;padding:18px;text-align:center;">'
    + '<div style="font-size:32px;margin-bottom:6px;">&#x2728;</div>'
    + '<div style="font-size:17px;font-weight:800;color:#fff;margin-bottom:4px;">HairMatch</div>'
    + '<div style="font-size:13px;color:#ff9bb5;font-weight:700;margin-bottom:6px;">נועם, בת 14</div>'
    + '<div style="font-size:13px;color:#c0c0e0;line-height:1.5;">מציאת מוצרי טיפוח שיער מותאמים אישית — עם המלצות חכמות</div>'
    + '</div></a>'

    + '</div>'

    // Footer
    + '<div style="padding:20px 24px 28px;text-align:center;color:#7070a0;font-size:13px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.06);">'
    + 'יש שאלות? פשוט תשיבו למייל הזה &#x2709;<br>'
    + '<strong style="color:#00D4AA;">AI Lab</strong> — ai-lab.co.il'
    + '</div>'

    + '</div></body></html>';
}
