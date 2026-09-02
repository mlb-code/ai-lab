/**
 * מעקב פתיחות — Tracking Pixel
 * 1. Deploy → New deployment → Web app → Anyone
 * 2. העתק את ה-URL ושים אותו ב-TRACKER_URL למטה
 */
var TRACKER_URL = ''; // ← הדבק כאן את ה-Web App URL אחרי Deploy

function doGet(e) {
  var email = e.parameter.e || 'unknown';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('opens');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('opens');
    sheet.appendRow(['email', 'opened_at', 'count']);
  }

  // בדוק אם כבר יש שורה לאימייל הזה
  var data = sheet.getDataRange().getValues();
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      sheet.getRange(i + 1, 2).setValue(new Date());
      sheet.getRange(i + 1, 3).setValue((data[i][2] || 0) + 1);
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([email, new Date(), 1]);
  }

  // החזר תמונה שקופה 1x1
  var pixel = Utilities.base64Decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function sendToAll() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var count = 0;

  for (var i = 1; i < data.length; i++) {
    var name = data[i][0];
    var email = data[i][1];
    var sent = data[i][5];

    if (!email || sent === 'yes') continue;

    var rsvpBase = 'https://ai-lab.co.il/rsvp.html';
    var rsvpYes = rsvpBase + '?r=yes&name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);
    var rsvpMaybe = rsvpBase + '?r=maybe&name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);
    var rsvpNo = rsvpBase + '?r=no&name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email);

    // Tracking pixel
    var trackPixel = '';
    if (TRACKER_URL) {
      trackPixel = '<img src="' + TRACKER_URL + '?e=' + encodeURIComponent(email) + '" width="1" height="1" style="display:none;" />';
    }

    var subject = 'תזכורת: הוובינר שלנו ביום רביעי — מחכים לכם!';

    var html = '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">'
      + '<div style="max-width:600px;margin:0 auto;background:#0f0f1e;border-radius:12px;overflow:hidden;direction:rtl;">'

      // Header
      + '<div style="background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:36px 24px 28px;text-align:center;">'
      + '<div style="font-size:26px;font-weight:900;color:#00D4AA;letter-spacing:1px;margin-bottom:16px;">AI Lab</div>'
      + '<h1 style="color:#fff;font-size:28px;margin:0 0 8px;line-height:1.3;">היי ' + name + ' &#x1F44B;</h1>'
      + '<p style="color:#c0c0e0;font-size:18px;margin:0;font-weight:600;">רק תזכורת — הוובינר שלנו ביום רביעי!</p>'
      + '</div>'

      // Date Card
      + '<div style="margin:24px;background:linear-gradient(135deg,rgba(108,60,225,0.2),rgba(0,212,170,0.1));border:1px solid rgba(108,60,225,0.3);border-radius:14px;padding:24px;text-align:center;">'
      + '<div style="font-size:42px;margin-bottom:8px;">&#x1F4C5;</div>'
      + '<div style="font-size:24px;font-weight:900;color:#fff;margin-bottom:4px;">יום רביעי, 15 באפריל</div>'
      + '<div style="font-size:22px;font-weight:800;color:#00D4AA;">19:00 &#x1F1EE;&#x1F1F1;</div>'
      + '<div style="font-size:14px;color:#9090b0;margin-top:6px;">זום אונליין — הלינק בהמשך &#x1F447;</div>'
      + '</div>'

      // Content
      + '<div style="padding:0 24px 8px;color:#d0d0e8;font-size:16px;line-height:1.7;">'
      + '<p style="margin:0 0 16px;">בוובינר הזה נראה איך ילדים ובני נוער יכולים ללמוד <strong style="color:#fff;">AI ויזמות</strong> ולבנות פרויקטים אמיתיים — אתרים, בוטים, אפליקציות ועוד &#x1F680;</p>'
      + '<p style="margin:0 0 8px;">&#x1F4A1; מומלץ מאוד לשבת יחד עם הילדים מול המסך</p>'
      + '</div>'

      // RSVP
      + '<div style="margin:24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:24px;text-align:center;">'
      + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:16px;">אתם מגיעים? &#x1F3AF;</div>'
      + '<div><a href="' + rsvpYes + '" style="display:inline-block;background:#6C3CE1;color:#fff;font-size:18px;font-weight:800;padding:14px 32px;border-radius:50px;text-decoration:none;margin:4px;">&#x2705; מגיעים!</a></div>'
      + '<div style="margin-top:8px;">'
      + '<a href="' + rsvpMaybe + '" style="display:inline-block;background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.3);color:#F5A623;font-size:16px;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;margin:4px;">&#x1F914; אולי</a>'
      + '<a href="' + rsvpNo + '" style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#9090b0;font-size:16px;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;margin:4px;">לא הפעם &#x1F614;</a>'
      + '</div></div>'

      // Zoom
      + '<div style="text-align:center;padding:0 24px;margin-bottom:16px;">'
      + '<a href="https://us06web.zoom.us/j/88285914918?pwd=YCKLQhCqpHOwsmppGiMvl21BN7Xjdk.1" style="display:block;background:linear-gradient(135deg,#6C3CE1,#8B5CF6);color:#fff;font-size:20px;font-weight:900;padding:16px 40px;border-radius:50px;text-decoration:none;text-align:center;">&#x1F680; הצטרפו לזום</a>'
      + '</div>'

      // Calendar
      + '<div style="text-align:center;margin-bottom:28px;">'
      + '<a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=%D7%95%D7%95%D7%91%D7%99%D7%A0%D7%A8%20AI%20%D7%95%D7%99%D7%96%D7%9E%D7%95%D7%AA%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%E2%80%94%20AI%20Lab&dates=20260415T160000Z/20260415T170000Z&details=%D7%9C%D7%99%D7%A0%D7%A7%20%D7%9C%D7%9B%D7%A0%D7%99%D7%A1%D7%94%3A%0Ahttps%3A%2F%2Fus06web.zoom.us%2Fj%2F88285914918%3Fpwd%3DYCKLQhCqpHOwsmppGiMvl21BN7Xjdk.1&location=Zoom%20Online" style="display:inline-block;background:rgba(0,212,170,0.12);border:1px solid rgba(0,212,170,0.3);color:#00D4AA;font-size:15px;font-weight:700;padding:10px 24px;border-radius:50px;text-decoration:none;">&#x1F4C5; הוסיפו ליומן</a>'
      + '</div>'

      + '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 24px;">'

      // Student Showcase
      + '<div style="padding:28px 24px 8px;text-align:center;">'
      + '<div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:4px;">תראו מה ילדים כבר בנו אצלנו &#x1F92F;</div>'
      + '<div style="color:#9090b0;font-size:14px;margin-bottom:20px;">אתרים אמיתיים שילדים בנו מאפס — בתוך הקורס</div>'
      + '</div>'

      // Project 1: Horse Fashion
      + '<a href="https://ai-lab.co.il/horse-fashion/" style="display:block;text-decoration:none;margin:0 24px 12px;">'
      + '<div style="background:linear-gradient(135deg,rgba(226,130,70,0.15),rgba(180,90,40,0.1));border:1px solid rgba(226,130,70,0.3);border-radius:14px;padding:20px;text-align:center;">'
      + '<div style="font-size:32px;margin-bottom:8px;">&#x1F40E;</div>'
      + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;">Horse Fashion</div>'
      + '<div style="font-size:13px;color:#e2a06a;font-weight:700;margin-bottom:6px;">שיר, בת 14</div>'
      + '<div style="font-size:14px;color:#c0c0e0;line-height:1.5;">חנות אונליין לציוד מקצועי לסוסים ולרוכבים — עם קטלוג מוצרים, עגלת קניות ועיצוב מקצועי</div>'
      + '<div style="margin-top:10px;display:inline-block;background:rgba(226,130,70,0.2);border:1px solid rgba(226,130,70,0.4);color:#e2a06a;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;">דרופשיפינג &#x1F6D2;</div>'
      + '</div></a>'

      // Project 2: GameBuddy
      + '<a href="https://ai-lab.co.il/gamebuddy/" style="display:block;text-decoration:none;margin:0 24px 12px;">'
      + '<div style="background:linear-gradient(135deg,rgba(108,60,225,0.15),rgba(139,92,246,0.1));border:1px solid rgba(108,60,225,0.3);border-radius:14px;padding:20px;text-align:center;">'
      + '<div style="font-size:32px;margin-bottom:8px;">&#x1F3AE;</div>'
      + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;">GameBuddy</div>'
      + '<div style="font-size:13px;color:#8B5CF6;font-weight:700;margin-bottom:6px;">אבינועם וגבריאל, בני 13</div>'
      + '<div style="font-size:14px;color:#c0c0e0;line-height:1.5;">פלטפורמה להתאמת שחקני פורטנייט לפי רמה — עם מערכת דירוג ואפשרות לזכות בפרסים</div>'
      + '<div style="margin-top:10px;display:inline-block;background:rgba(108,60,225,0.2);border:1px solid rgba(108,60,225,0.4);color:#8B5CF6;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;">גיימינג &#x1F579;</div>'
      + '</div></a>'

      // Project 3: Nadav Lego
      + '<a href="https://ai-lab.co.il/nadavlego/" style="display:block;text-decoration:none;margin:0 24px 12px;">'
      + '<div style="background:linear-gradient(135deg,rgba(0,212,170,0.15),rgba(46,204,113,0.1));border:1px solid rgba(0,212,170,0.3);border-radius:14px;padding:20px;text-align:center;">'
      + '<div style="font-size:32px;margin-bottom:8px;">&#x1F9F1;</div>'
      + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;">חגיגת לגו</div>'
      + '<div style="font-size:13px;color:#00D4AA;font-weight:700;margin-bottom:6px;">נדב, בן 12</div>'
      + '<div style="font-size:14px;color:#c0c0e0;line-height:1.5;">אתר לתערוכת לגו עם פעילויות בנייה, חידון, וגלריית תמונות — פרויקט עצמאי לגמרי</div>'
      + '<div style="margin-top:10px;display:inline-block;background:rgba(0,212,170,0.2);border:1px solid rgba(0,212,170,0.4);color:#00D4AA;font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;">אירוע &#x1F3AA;</div>'
      + '</div></a>'

      + '<div style="text-align:center;padding:8px 24px 20px;">'
      + '<div style="font-size:15px;color:#00D4AA;font-weight:700;">גם הילד/ה שלכם יכול/ה לבנות כזה &#x1F4AA;</div>'
      + '</div>'

      + '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 24px;">'

      // Share Section - Enhanced
      + '<div style="margin:24px;background:linear-gradient(135deg,rgba(37,211,102,0.1),rgba(37,211,102,0.05));border:1px solid rgba(37,211,102,0.25);border-radius:14px;padding:28px 20px;text-align:center;">'
      + '<div style="font-size:36px;margin-bottom:10px;">&#x1F381;</div>'
      + '<div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:8px;">יש לכם חברים עם ילדים?</div>'
      + '<div style="font-size:15px;color:#d0d0e8;line-height:1.6;margin-bottom:6px;">שלחו להם את ההזמנה — הוובינר <strong style="color:#25D366;">בחינם</strong> ופתוח לכולם!</div>'
      + '<div style="font-size:13px;color:#9090b0;margin-bottom:18px;">עוד הורה שישלחו = עוד ילד שיגלה את העולם של AI ויזמות &#x1F31F;</div>'
      + '<a href="https://wa.me/?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%94%D7%95%D7%9C%D7%9A%2F%D7%AA%20%D7%9C%D7%95%D7%95%D7%91%D7%99%D7%A0%D7%A8%20%D7%97%D7%99%D7%A0%D7%9E%D7%99%20%D7%A2%D7%9C%20AI%20%D7%95%D7%99%D7%96%D7%9E%D7%95%D7%AA%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%F0%9F%9A%80%0A%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%D7%91%D7%95%D7%A0%D7%99%D7%9D%20%D7%A9%D7%9D%20%D7%90%D7%AA%D7%A8%D7%99%D7%9D%20%D7%90%D7%9E%D7%99%D7%AA%D7%99%D7%99%D7%9D%20%D7%9B%D7%9E%D7%95%20%D7%97%D7%A0%D7%95%D7%99%D7%95%D7%AA%20%D7%95%D7%90%D7%A4%D7%9C%D7%99%D7%A7%D7%A6%D7%99%D7%95%D7%AA%20%F0%9F%A4%AF%0A%D7%99%D7%95%D7%9D%20%D7%A8%D7%91%D7%99%D7%A2%D7%99%2015.4%20%D7%91%D7%A9%D7%A2%D7%94%2019%3A00%20%D7%91%D7%96%D7%95%D7%9D%0A%D7%91%D7%95%D7%90%D7%95%20%D7%AA%D7%99%D7%A8%D7%A9%D7%9E%D7%95%20%D7%92%D7%9D!%20%D7%96%D7%94%20%D7%91%D7%97%D7%99%D7%A0%D7%9D%20%F0%9F%92%AF%0A%F0%9F%91%89%20https%3A%2F%2Fai-lab.co.il%2Fwebinar-general.html" style="display:block;background:#25D366;color:#fff;font-size:20px;font-weight:900;padding:16px 32px;border-radius:50px;text-decoration:none;margin-bottom:10px;">&#x1F4F2; שלחו לחבר/ה בוואטסאפ</a>'
      + '<div style="font-size:12px;color:#6ab07a;">לוקח 5 שניות, יכול לשנות לילד את החיים &#x2764;</div>'
      + '</div>'

      // Footer + Tracking Pixel
      + '<div style="background:rgba(0,0,0,0.4);padding:20px 24px;text-align:center;">'
      + '<div style="color:#00D4AA;font-weight:900;font-size:18px;letter-spacing:1px;">AI Lab</div>'
      + '<div style="color:#9090b0;font-size:12px;margin-top:4px;">ai-lab.co.il</div>'
      + '<div style="color:#606080;font-size:11px;margin-top:8px;">קיבלתם את המייל הזה כי נרשמתם לוובינר באתר AI Lab</div>'
      + trackPixel
      + '</div>'

      + '</div></body></html>';

    try {
      GmailApp.sendEmail(email, subject, '', {
        htmlBody: html,
        name: 'AI Lab',
        replyTo: 'laviemb@gmail.com'
      });
      sheet.getRange(i + 1, 6).setValue('yes');
      count++;
      Utilities.sleep(1500);
    } catch (e) {
      sheet.getRange(i + 1, 6).setValue('error');
      Logger.log('Error: ' + email + ' - ' + e.message);
    }
  }

  Logger.log('Sent ' + count + ' emails');
  SpreadsheetApp.getUi().alert('נשלחו ' + count + ' מיילים!');
}
