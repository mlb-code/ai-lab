/**
 * שליחת מייל תזכורת לנרשמי וובינר כללי (15.4)
 *
 * הוראות:
 * 1. פתח Google Sheet חדש
 * 2. הדבק את הנתונים מ-webinar-registrations.csv (Sheet1)
 * 3. Extensions → Apps Script → הדבק את הקוד הזה
 * 4. הרץ את sendReminders()
 * 5. אשר הרשאות Gmail
 */

function sendReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const nameCol = headers.indexOf('name');
  const emailCol = headers.indexOf('email');
  const sentCol = headers.indexOf('sent');

  let count = 0;

  for (let i = 1; i < data.length; i++) {
    const name = data[i][nameCol];
    const email = data[i][emailCol];
    const sent = data[i][sentCol];

    if (sent === 'yes' || !email) continue;

    const subject = '🎯 תזכורת: הוובינר שלנו ביום רביעי — מחכים לכם!';
    const htmlBody = getReminderHTML(name);

    try {
      GmailApp.sendEmail(email, subject, '', {
        htmlBody: htmlBody,
        name: 'AI Lab',
        replyTo: 'laviemb@gmail.com'
      });

      // סמן כנשלח
      sheet.getRange(i + 1, sentCol + 1).setValue('yes');
      count++;

      // המתנה קצרה בין מיילים
      Utilities.sleep(1000);

    } catch (e) {
      Logger.log('Error sending to ' + email + ': ' + e.message);
      sheet.getRange(i + 1, sentCol + 1).setValue('error: ' + e.message);
    }
  }

  Logger.log('Sent ' + count + ' reminder emails');
  SpreadsheetApp.getUi().alert('נשלחו ' + count + ' מיילים בהצלחה!');
}

function getReminderHTML(name) {
  const zoomLink = 'https://us06web.zoom.us/j/88285914918?pwd=YCKLQhCqpHOwsmppGiMvl21BN7Xjdk.1';
  const gcalLink = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('וובינר AI ויזמות לילדים — AI Lab') +
    '&dates=20260415T160000Z/20260415T170000Z' +
    '&details=' + encodeURIComponent('לינק לכניסה:\n' + zoomLink) +
    '&location=' + encodeURIComponent('Zoom Online');
  const shareText = encodeURIComponent('הי, אני הולך/ת לוובינר חינמי על AI ויזמות לילדים 🚀\nיום רביעי 15.4 בשעה 19:00\nבואו תירשמו גם!\n👉 https://ai-lab.co.il/webinar-general.html');
  const whatsappShare = 'https://wa.me/?text=' + shareText;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,'Heebo',sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0f0f1e;border-radius:12px;overflow:hidden;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:32px 24px;text-align:center;">
    <div style="font-size:24px;font-weight:900;color:#00D4AA;letter-spacing:1px;">AI Lab</div>
    <h1 style="color:#fff;font-size:26px;margin:16px 0 8px;line-height:1.3;">
      היי ${name} 👋<br>
      רק תזכורת — הוובינר שלנו כבר ביום רביעי!
    </h1>
  </div>

  <!-- Content -->
  <div style="padding:28px 24px;color:#e0e0f0;font-size:16px;line-height:1.7;">

    <div style="background:rgba(108,60,225,0.15);border:1px solid rgba(108,60,225,0.3);border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
      <div style="font-size:14px;color:#9090b0;margin-bottom:6px;">📅 מתי?</div>
      <div style="font-size:22px;font-weight:800;color:#fff;">יום רביעי, 15 באפריל 2026</div>
      <div style="font-size:20px;font-weight:700;color:#00D4AA;">19:00 🇮🇱</div>
    </div>

    <p style="margin:0 0 16px;">
      בוובינר הזה נדבר על איך ילדים ובני נוער (גילאי 10-15) יכולים ללמוד <strong style="color:#fff;">AI ויזמות</strong> ולבנות פרויקטים אמיתיים — אתרים, בוטים, ועוד.
    </p>
    <p style="margin:0 0 24px;">
      מומלץ מאוד לשבת עם הילדים מול המסך 💻
    </p>

    <!-- Zoom Button -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${zoomLink}" style="display:inline-block;background:#6C3CE1;color:#fff;font-size:18px;font-weight:800;padding:14px 40px;border-radius:50px;text-decoration:none;">
        🚀 הצטרפו לזום
      </a>
    </div>

    <!-- Calendar Button -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${gcalLink}" style="display:inline-block;background:rgba(0,212,170,0.15);border:1px solid #00D4AA;color:#00D4AA;font-size:15px;font-weight:700;padding:10px 28px;border-radius:50px;text-decoration:none;">
        📅 הוסיפו ליומן Google
      </a>
    </div>

    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">

    <!-- Share -->
    <div style="text-align:center;">
      <p style="color:#9090b0;font-size:14px;margin:0 0 12px;">מכירים מישהו שזה יתאים לו? 🎯</p>
      <a href="${whatsappShare}" style="display:inline-block;background:#25D366;color:#fff;font-size:15px;font-weight:700;padding:10px 24px;border-radius:50px;text-decoration:none;">
        📲 שלחו לחבר בוואטסאפ
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:rgba(0,0,0,0.3);padding:16px 24px;text-align:center;">
    <div style="color:#00D4AA;font-weight:900;font-size:16px;">AI Lab</div>
    <div style="color:#9090b0;font-size:12px;margin-top:4px;">ai-lab.co.il</div>
  </div>

</div>
</body>
</html>`;
}

// פונקציה לבדיקה — שולחת רק לך
function testSendToMe() {
  const html = getReminderHTML('מאיר');
  GmailApp.sendEmail('laviemb@gmail.com', '🎯 תזכורת: הוובינר שלנו ביום רביעי — מחכים לכם!', '', {
    htmlBody: html,
    name: 'AI Lab',
    replyTo: 'laviemb@gmail.com'
  });
  Logger.log('Test email sent to laviemb@gmail.com');
}
