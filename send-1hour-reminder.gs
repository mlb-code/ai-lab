/**
 * תזכורת שעה לפני הוובינר — שליחה לכולם
 * תזמון: הרץ scheduleTrigger() פעם אחת — ישלח אוטומטית ב-18:05
 */

function scheduleTrigger() {
  // מחק טריגרים קיימים
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendOneHourReminder') ScriptApp.deleteTrigger(t);
  });
  // צור טריגר ל-18:05 היום
  ScriptApp.newTrigger('sendOneHourReminder')
    .timeBased()
    .at(new Date(2026, 3, 15, 18, 5, 0)) // חודש 3 = אפריל (0-based)
    .create();
  Logger.log('Trigger set for 15/04/2026 at 18:05');
  SpreadsheetApp.getUi().alert('תזמון נקבע! המייל ישלח אוטומטית ב-18:05');
}

function sendOneHourReminder() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var name = data[i][0];
    var email = data[i][1];

    if (!email) continue;

    var subject = 'מתחילים בעוד שעה! הנה הלינק לזום';

    var html = '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">'
      + '<div style="max-width:600px;margin:0 auto;background:#0f0f1e;border-radius:12px;overflow:hidden;direction:rtl;">'

      // Header
      + '<div style="background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:36px 24px 28px;text-align:center;">'
      + '<div style="font-size:26px;font-weight:900;color:#00D4AA;letter-spacing:1px;margin-bottom:16px;">AI Lab</div>'
      + '<h1 style="color:#fff;font-size:28px;margin:0 0 8px;line-height:1.3;">היי ' + name + ' &#x1F44B;</h1>'
      + '<p style="color:#c0c0e0;font-size:20px;margin:0;font-weight:700;">הוובינר מתחיל בעוד שעה!</p>'
      + '</div>'

      // Countdown Card
      + '<div style="margin:24px;background:linear-gradient(135deg,rgba(0,212,170,0.2),rgba(108,60,225,0.15));border:1px solid rgba(0,212,170,0.4);border-radius:14px;padding:28px;text-align:center;">'
      + '<div style="font-size:48px;margin-bottom:8px;">&#x23F0;</div>'
      + '<div style="font-size:26px;font-weight:900;color:#fff;margin-bottom:4px;">היום! יום רביעי</div>'
      + '<div style="font-size:28px;font-weight:900;color:#00D4AA;">19:00</div>'
      + '<div style="font-size:15px;color:#c0c0e0;margin-top:8px;">שמרנו לכם את הלינק — לא צריך לחפש &#x1F447;</div>'
      + '</div>'

      // ZOOM BUTTON - BIG
      + '<div style="margin:0 24px 16px;text-align:center;">'
      + '<a href="https://us06web.zoom.us/j/88285914918?pwd=YCKLQhCqpHOwsmppGiMvl21BN7Xjdk.1" style="display:block;background:linear-gradient(135deg,#6C3CE1,#8B5CF6);color:#fff;font-size:26px;font-weight:900;padding:22px 40px;border-radius:50px;text-decoration:none;text-align:center;box-shadow:0 8px 30px rgba(108,60,225,0.4);">&#x1F680; כניסה לזום — לחצו כאן</a>'
      + '</div>'

      // Tip
      + '<div style="margin:0 24px 24px;text-align:center;">'
      + '<div style="font-size:14px;color:#9090b0;">&#x1F4A1; טיפ: שבו עם הילדים מול המסך — ככה יהיה הכי כיף!</div>'
      + '</div>'

      // Second Zoom Button - smaller
      + '<div style="margin:0 24px 28px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;text-align:center;">'
      + '<div style="font-size:14px;color:#9090b0;margin-bottom:12px;">לא מצליחים ללחוץ על הכפתור? העתיקו את הלינק:</div>'
      + '<div style="font-size:13px;color:#8B5CF6;word-break:break-all;">https://us06web.zoom.us/j/88285914918?pwd=YCKLQhCqpHOwsmppGiMvl21BN7Xjdk.1</div>'
      + '</div>'

      // Share
      + '<div style="margin:0 24px 24px;text-align:center;">'
      + '<div style="font-size:15px;color:#d0d0e8;margin-bottom:10px;">&#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F467;&#x200D;&#x1F466; עוד לא שלחתם להורים שמכירים? עוד שעה מתחילים!</div>'
      + '<a href="https://wa.me/?text=%D7%94%D7%99%D7%99%2C%20%D7%A2%D7%95%D7%93%20%D7%A9%D7%A2%D7%94%20%D7%9E%D7%AA%D7%97%D7%99%D7%9C%20%D7%95%D7%95%D7%91%D7%99%D7%A0%D7%A8%20%D7%97%D7%99%D7%A0%D7%9E%D7%99%20%D7%A2%D7%9C%20AI%20%D7%95%D7%99%D7%96%D7%9E%D7%95%D7%AA%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%F0%9F%9A%80%0A%D7%91%D7%95%D7%90%D7%95%20%D7%AA%D7%99%D7%9B%D7%A0%D7%A1%D7%95!%0A%F0%9F%91%89%20https%3A%2F%2Fus06web.zoom.us%2Fj%2F88285914918%3Fpwd%3DYCKLQhCqpHOwsmppGiMvl21BN7Xjdk.1" style="display:inline-block;background:#25D366;color:#fff;font-size:16px;font-weight:800;padding:12px 28px;border-radius:50px;text-decoration:none;">&#x1F4F2; שלחו את הלינק לחברים</a>'
      + '</div>'

      // Footer
      + '<div style="background:rgba(0,0,0,0.4);padding:20px 24px;text-align:center;">'
      + '<div style="color:#00D4AA;font-weight:900;font-size:18px;letter-spacing:1px;">AI Lab</div>'
      + '<div style="color:#9090b0;font-size:12px;margin-top:4px;">ai-lab.co.il</div>'
      + '</div>'

      + '</div></body></html>';

    try {
      GmailApp.sendEmail(email, subject, '', {
        htmlBody: html,
        name: 'AI Lab',
        replyTo: 'laviemb@gmail.com'
      });
      count++;
      Utilities.sleep(1500);
    } catch (e) {
      Logger.log('Error: ' + email + ' - ' + e.message);
    }
  }

  Logger.log('Sent ' + count + ' one-hour reminder emails');
  SpreadsheetApp.getUi().alert('נשלחו ' + count + ' תזכורות שעה לפני!');
}
