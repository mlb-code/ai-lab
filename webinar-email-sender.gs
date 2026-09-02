/**
 * Webinar Email Sender — Today's Webinar (28/04/2026)
 *
 * SETUP:
 *   1. הדבק את הקובץ הזה לתוך Apps Script של גוגל שיטס "webinar 28/04/26"
 *   2. שמור (Cmd+S)
 *   3. ב-TEST_MODE = true: ירוץ רק על TEST_EMAIL שלך — לבדיקה
 *   4. אחרי שהמייל נראה טוב — שנה TEST_MODE = false ותריץ שוב
 *
 * FUNCTIONS:
 *   • sendNowEmail()        — שולח את המייל הראשון (תזכורת היום) עכשיו
 *   • schedule10MinEmail()  — קובע טריגר אוטומטי ל-20:10 לשליחת המייל השני
 *   • send10MinEmail()      — נקרא אוטומטית ע"י הטריגר ב-20:10
 *   • testBoth()            — שולח את שני המיילים אליך עכשיו לבדיקה
 */

// ============= CONFIG =============
const TEST_MODE = false;                      // true = רק TEST_EMAIL ; false = כל הרשימה
const TEST_EMAIL = 'laviemb@gmail.com';
const SENDER_NAME = 'AI Lab — מאיר לביא';

const ZOOM_LINK = 'https://us06web.zoom.us/j/81274026746?pwd=bUvfnNxiqY9XgBmlI7mUvjjZHEBuDZ.1';
const WHATSAPP_GROUP = 'https://chat.whatsapp.com/LpbKfD25gYF6Tx2K9Lj5WG?mode=hqctcli';
const WEBINAR_DATE = new Date(2026, 3, 28, 20, 10, 0); // 28 April 2026, 20:10 (month is 0-indexed)
// ===================================


// ============= MAIN FUNCTIONS =============

function sendNowEmail() {
  const recipients = getRecipients_();
  const subject = 'תזכורת - היום בערב הוובינר! הלינק לזום במייל הזה';
  let count = 0;
  recipients.forEach(r => {
    GmailApp.sendEmail(r.email, subject, '', {
      htmlBody: buildTodayHtml_(r.name),
      name: SENDER_NAME
    });
    count++;
    Utilities.sleep(300);
  });
  Logger.log('Sent to ' + count + ' recipients' + (TEST_MODE ? ' (TEST MODE)' : ''));
}

function send10MinEmail() {
  const recipients = getRecipients_();
  const subject = 'הוובינר נפתח! מתחילים בעוד 10 דקות - לחצו כאן';
  let count = 0;
  recipients.forEach(r => {
    GmailApp.sendEmail(r.email, subject, '', {
      htmlBody: build10MinHtml_(r.name),
      name: SENDER_NAME
    });
    count++;
    Utilities.sleep(300);
  });
  Logger.log('Sent 10-min email to ' + count + ' recipients');
}

function schedule10MinEmail() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'send10MinEmail') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('send10MinEmail').timeBased().at(WEBINAR_DATE).create();
  Logger.log('Trigger scheduled for ' + Utilities.formatDate(WEBINAR_DATE, 'Asia/Jerusalem', 'dd/MM/yyyy HH:mm'));
}

function testBoth() {
  const html1 = buildTodayHtml_('מאיר');
  const html2 = build10MinHtml_('מאיר');
  GmailApp.sendEmail(TEST_EMAIL, '[TEST 1/2] תזכורת - היום בערב הוובינר!', '', { htmlBody: html1, name: SENDER_NAME });
  Utilities.sleep(500);
  GmailApp.sendEmail(TEST_EMAIL, '[TEST 2/2] הוובינר נפתח! מתחילים בעוד 10 דקות', '', { htmlBody: html2, name: SENDER_NAME });
  Logger.log('Test emails sent to ' + TEST_EMAIL);
}

// ============= HELPERS =============

function getRecipients_() {
  if (TEST_MODE) return [{ name: 'מאיר', email: TEST_EMAIL }];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const email = data[i][1];
    if (email && String(email).indexOf('@') > -1) out.push({ name: name || '', email: String(email).trim() });
  }
  return out;
}

function buildTodayHtml_(name) {
  return '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">'
    + '<div style="max-width:600px;margin:0 auto;background:#0f0f1e;border-radius:12px;overflow:hidden;direction:rtl;">'

    // Header
    + '<div style="background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:36px 24px 28px;text-align:center;">'
    + '<div style="font-size:26px;font-weight:900;color:#00D4AA;letter-spacing:1px;margin-bottom:16px;">AI Lab</div>'
    + '<h1 style="color:#fff;font-size:30px;margin:0 0 8px;line-height:1.3;font-family:Arial,sans-serif;">היי ' + name + ' &#x1F680;</h1>'
    + '<p style="color:#FFD700;font-size:22px;margin:0;font-weight:900;">היום הוובינר! נתראה בערב &#x1F389;</p>'
    + '</div>'

    // Save email notice
    + '<div style="margin:20px 24px 0;background:linear-gradient(135deg,rgba(0,212,170,0.18),rgba(108,60,225,0.12));border:2px solid rgba(0,212,170,0.5);border-radius:14px;padding:22px 20px;text-align:center;">'
    + '<div style="font-size:36px;line-height:1;margin-bottom:8px;">&#x1F4CC;</div>'
    + '<div style="font-size:20px;font-weight:900;color:#00D4AA;margin-bottom:8px;line-height:1.3;">שמרו את המייל הזה!</div>'
    + '<div style="font-size:16px;font-weight:600;color:#fff;line-height:1.5;">הלינק לזום נמצא כאן למטה &#x1F447;<br><span style="color:#FFD700;">אין צורך לחפש בשום מקום אחר</span></div>'
    + '</div>'

    // Today card
    + '<div style="margin:24px;background:linear-gradient(135deg,rgba(108,60,225,0.2),rgba(0,212,170,0.15));border:1px solid rgba(108,60,225,0.4);border-radius:14px;padding:28px;text-align:center;">'
    + '<div style="font-size:48px;margin-bottom:8px;line-height:1;">&#x23F0;</div>'
    + '<div style="font-size:14px;color:#FFD700;font-weight:800;letter-spacing:2px;margin-bottom:6px;">היום &bull; TODAY</div>'
    + '<div style="font-size:26px;font-weight:900;color:#fff;margin-bottom:4px;">יום שלישי, 28 באפריל</div>'
    + '<div style="font-size:32px;font-weight:900;color:#00D4AA;line-height:1.2;">20:30 &#x1F1EE;&#x1F1F1;</div>'
    + '<div style="font-size:14px;color:#c0c0e0;margin-top:8px;">בזום &mdash; הלינק כאן למטה &#x1F447;</div>'
    + '</div>'

    // Zoom button
    + '<div style="margin:0 24px 16px;text-align:center;">'
    + '<a href="' + ZOOM_LINK + '" style="display:block;background:linear-gradient(135deg,#6C3CE1,#8B5CF6);color:#fff;font-size:26px;font-weight:900;padding:24px 40px;border-radius:50px;text-decoration:none;text-align:center;">&#x1F3A5; כניסה לזום</a>'
    + '<div style="font-size:13px;color:#9090b0;margin-top:10px;">לחיצה אחת &mdash; נכנסים ישר!</div>'
    + '</div>'

    // Tip
    + '<div style="margin:24px;background:linear-gradient(135deg,rgba(255,215,0,0.18),rgba(245,166,35,0.1));border:2px solid rgba(255,215,0,0.5);border-radius:14px;padding:24px 20px;text-align:center;">'
    + '<div style="font-size:48px;margin-bottom:10px;line-height:1;">&#x1F4A1;</div>'
    + '<div style="font-size:22px;font-weight:900;color:#FFD700;margin-bottom:8px;line-height:1.3;">טיפ חשוב!</div>'
    + '<div style="font-size:18px;font-weight:700;color:#fff;line-height:1.5;">שבו עם הילדים מול המסך &#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F467;&#x200D;&#x1F466;</div>'
    + '<div style="font-size:15px;color:#FFE066;line-height:1.6;margin-top:8px;">ככה זה הכי כיף ואפקטיבי &#x1F60A;</div>'
    + '</div>'

    // Backup link
    + '<div style="margin:0 24px 24px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px 20px;text-align:center;">'
    + '<div style="font-size:13px;color:#9090b0;margin-bottom:8px;">&#x1F4CB; לא עובד הכפתור? העתיקו ידנית:</div>'
    + '<div style="font-size:12px;color:#8B5CF6;word-break:break-all;font-family:monospace;">' + ZOOM_LINK + '</div>'
    + '</div>'

    + '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 24px;">'

    // WhatsApp group
    + '<div style="margin:24px;background:linear-gradient(135deg,rgba(37,211,102,0.15),rgba(37,211,102,0.05));border:1px solid rgba(37,211,102,0.35);border-radius:14px;padding:24px;text-align:center;">'
    + '<div style="font-size:36px;margin-bottom:8px;line-height:1;">&#x1F4AC;</div>'
    + '<div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:6px;">להצטרפות לקבוצת הוואטסאפ</div>'
    + '<div style="font-size:14px;color:#c0c0e0;line-height:1.6;margin-bottom:18px;">עדכונים, חומרים מהוובינר ושאלות &mdash; הכול בקבוצה</div>'
    + '<a href="' + WHATSAPP_GROUP + '" style="display:inline-block;background:#25D366;color:#fff;font-size:18px;font-weight:900;padding:14px 32px;border-radius:50px;text-decoration:none;">&#x1F4F2; הצטרפו לקבוצה</a>'
    + '</div>'

    + '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 24px;">'

    // Share
    + '<div style="margin:24px;background:linear-gradient(135deg,rgba(245,166,35,0.12),rgba(245,166,35,0.04));border:1px solid rgba(245,166,35,0.3);border-radius:14px;padding:28px 20px;text-align:center;">'
    + '<div style="font-size:36px;margin-bottom:10px;line-height:1;">&#x1F381;</div>'
    + '<div style="font-size:20px;font-weight:900;color:#fff;margin-bottom:8px;">תשתפו את החברים!</div>'
    + '<div style="font-size:14px;color:#d0d0e8;line-height:1.6;margin-bottom:16px;">הוובינר <strong style="color:#FFD700;">בחינם</strong> ופתוח לכולם &mdash; תעבירו לחברים שיש להם ילדים</div>'
    + '<a href="https://wa.me/?text=%D7%94%D7%99%D7%99%2C%20%D7%94%D7%99%D7%95%D7%9D%20%D7%91%D7%A2%D7%A8%D7%91%2020%3A30%20%D7%99%D7%A9%20%D7%95%D7%95%D7%91%D7%99%D7%A0%D7%A8%20%D7%97%D7%99%D7%A0%D7%9E%D7%99%20%D7%A2%D7%9C%20AI%20%D7%95%D7%99%D7%96%D7%9E%D7%95%D7%AA%20%D7%9C%D7%99%D7%9C%D7%93%D7%99%D7%9D%20%F0%9F%9A%80%0A%F0%9F%91%89%20https%3A%2F%2Fai-lab.co.il%2Fwebinar%2F" style="display:block;background:#25D366;color:#fff;font-size:18px;font-weight:900;padding:16px 32px;border-radius:50px;text-decoration:none;margin-bottom:14px;">&#x1F4F2; שיתוף בוואטסאפ</a>'
    + '<div style="font-size:13px;color:#9090b0;margin-bottom:8px;">או העתיקו את הקישור ושלחו לאן שתרצו:</div>'
    + '<div style="background:rgba(255,255,255,0.06);border:1px dashed rgba(245,166,35,0.4);border-radius:10px;padding:10px;font-size:13px;color:#FFD700;font-family:monospace;word-break:break-all;">https://ai-lab.co.il/webinar/</div>'
    + '</div>'

    // Footer
    + '<div style="background:rgba(0,0,0,0.4);padding:20px 24px;text-align:center;">'
    + '<div style="color:#00D4AA;font-weight:900;font-size:18px;letter-spacing:1px;">AI Lab</div>'
    + '<div style="color:#9090b0;font-size:12px;margin-top:4px;">ai-lab.co.il</div>'
    + '<div style="color:#606080;font-size:11px;margin-top:8px;">קיבלתם את המייל כי נרשמתם לוובינר באתר AI Lab</div>'
    + '</div>'

    + '</div></body></html>';
}

function build10MinHtml_(name) {
  return '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background:#f4f4f8;font-family:Arial,sans-serif;">'
    + '<div style="max-width:600px;margin:0 auto;background:#0f0f1e;border-radius:12px;overflow:hidden;direction:rtl;">'

    // Header - Urgent
    + '<div style="background:linear-gradient(135deg,#6C3CE1,#2d1b69);padding:36px 24px 28px;text-align:center;">'
    + '<div style="font-size:22px;font-weight:900;color:#00D4AA;letter-spacing:1px;margin-bottom:14px;">AI Lab</div>'
    + '<div style="font-size:60px;line-height:1;margin-bottom:12px;">&#x1F534;</div>'
    + '<h1 style="color:#fff;font-size:32px;margin:0 0 10px;line-height:1.2;font-family:Arial,sans-serif;font-weight:900;">היי ' + name + ',<br>הוובינר נפתח!</h1>'
    + '<p style="color:#FFD700;font-size:22px;margin:0;font-weight:900;">&#x23F1; מתחילים בעוד 10 דקות</p>'
    + '</div>'

    // Big zoom button
    + '<div style="padding:28px 24px 12px;text-align:center;">'
    + '<a href="' + ZOOM_LINK + '" style="display:block;background:linear-gradient(135deg,#6C3CE1,#8B5CF6);color:#fff;font-size:30px;font-weight:900;padding:28px 40px;border-radius:50px;text-decoration:none;text-align:center;">&#x1F3A5; כניסה לזום עכשיו</a>'
    + '<div style="font-size:14px;color:#FFD700;font-weight:700;margin-top:14px;">&#x1F449; לחיצה אחת ואתם בפנים!</div>'
    + '</div>'

    // Live indicator
    + '<div style="margin:24px;background:linear-gradient(135deg,rgba(255,68,68,0.18),rgba(255,68,68,0.05));border:2px solid rgba(255,68,68,0.45);border-radius:14px;padding:20px;text-align:center;">'
    + '<div style="display:inline-block;width:12px;height:12px;background:#ff4444;border-radius:50%;margin-left:8px;vertical-align:middle;"></div>'
    + '<span style="font-size:18px;font-weight:900;color:#ff4444;letter-spacing:1px;vertical-align:middle;">LIVE &bull; השידור חי</span>'
    + '<div style="font-size:15px;color:#fff;margin-top:8px;font-weight:600;">חדר הזום פתוח &mdash; אפשר להיכנס כבר עכשיו</div>'
    + '</div>'

    // Backup link
    + '<div style="margin:0 24px 20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px 20px;text-align:center;">'
    + '<div style="font-size:13px;color:#9090b0;margin-bottom:8px;">&#x1F4CB; הכפתור לא עובד? העתיקו את הלינק:</div>'
    + '<div style="font-size:12px;color:#8B5CF6;word-break:break-all;font-family:monospace;">' + ZOOM_LINK + '</div>'
    + '</div>'

    // Quick tips
    + '<div style="margin:0 24px 20px;background:linear-gradient(135deg,rgba(255,215,0,0.12),rgba(245,166,35,0.05));border:1px solid rgba(255,215,0,0.3);border-radius:14px;padding:20px;">'
    + '<div style="font-size:16px;font-weight:900;color:#FFD700;margin-bottom:12px;text-align:center;">&#x1F4A1; לפני שאתם נכנסים:</div>'
    + '<div style="font-size:14px;color:#d0d0e8;line-height:1.8;">&#x2705; קראו לילדים &mdash; שיהיו לידכם<br>&#x2705; כוס מים, אוזניות אם צריך<br>&#x2705; שמרו את הלינק לכל מקרה</div>'
    + '</div>'

    // WhatsApp direct
    + '<div style="margin:0 24px 24px;background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.25);border-radius:14px;padding:20px;text-align:center;">'
    + '<div style="font-size:15px;color:#fff;font-weight:700;margin-bottom:6px;">&#x1F198; בעיה טכנית? כתבו ישירות למאיר:</div>'
    + '<div style="font-size:13px;color:#9090b0;margin-bottom:12px;">תמיכה אישית 1:1 &mdash; נענה מיד</div>'
    + '<a href="https://wa.me/972546500795?text=%D7%94%D7%99%D7%99%2C%20%D7%99%D7%A9%20%D7%9C%D7%99%20%D7%91%D7%A2%D7%99%D7%94%20%D7%9C%D7%94%D7%AA%D7%97%D7%91%D7%A8%20%D7%9C%D7%95%D7%95%D7%91%D7%99%D7%A0%D7%A8" style="display:inline-block;background:#25D366;color:#fff;font-size:16px;font-weight:800;padding:12px 28px;border-radius:50px;text-decoration:none;">&#x1F4F1; וואטסאפ &mdash; 054-650-0795</a>'
    + '</div>'

    // Footer
    + '<div style="background:rgba(0,0,0,0.4);padding:20px 24px;text-align:center;">'
    + '<div style="color:#00D4AA;font-weight:900;font-size:18px;letter-spacing:1px;">AI Lab</div>'
    + '<div style="color:#9090b0;font-size:12px;margin-top:4px;">ai-lab.co.il</div>'
    + '<div style="color:#606080;font-size:11px;margin-top:8px;">נתראה בעוד רגע! &#x1F680;</div>'
    + '</div>'

    + '</div></body></html>';
}
