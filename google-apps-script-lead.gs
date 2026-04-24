/**
 * AI Lab — Lead capture endpoint
 * Receives POST from /index.html lead form,
 * appends row to Google Sheet + emails laviemb@gmail.com.
 *
 * ────────────────────────────────────────────────────────
 *  SETUP (one-time, ~5 minutes):
 * ────────────────────────────────────────────────────────
 *  1. Open https://sheets.google.com → create a new Sheet
 *     name it:  "AI Lab — Leads"
 *  2. Copy the Sheet URL. It looks like:
 *        https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 *     Copy the SHEET_ID_HERE part.
 *  3. Open https://script.google.com → New project
 *  4. Paste this entire file. Replace SHEET_ID_HERE below with your ID.
 *  5. Save (Ctrl/Cmd+S), give it a name (e.g. "AI Lab Lead Webhook").
 *  6. Click Deploy → New deployment.
 *     - Type: Web app
 *     - Description: AI Lab leads
 *     - Execute as: Me (laviemb@gmail.com)
 *     - Who has access: Anyone
 *     - Click Deploy. Authorize with your Google account.
 *  7. Copy the Web App URL that appears (ends with /exec).
 *  8. Open index.html, find:    var LEAD_ENDPOINT = '...'
 *     Replace the URL with the /exec URL from step 7.
 *  9. Test: submit the form on the site — check inbox + sheet.
 *
 *  That's it. From now on every lead lands in the Sheet AND your inbox.
 * ────────────────────────────────────────────────────────
 */

// ← PUT YOUR SHEET ID HERE
var SHEET_ID = 'SHEET_ID_HERE';
var SHEET_NAME = 'Leads';
var NOTIFY_EMAIL = 'laviemb@gmail.com';

function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var now = new Date();

    var sheet = getOrCreateSheet_();
    var row = [
      Utilities.formatDate(now, 'Asia/Jerusalem', 'yyyy-MM-dd HH:mm:ss'),
      params.name || '',
      params.email || '',
      params.phone || '',
      params.track || '',
      prettySource_(params),
      params.source || '',
      params.medium || '',
      params.campaign || '',
      params.content || '',
      params.term || '',
      params.fbclid || '',
      params.gclid || '',
      params.referrer || '',
      params.landing_page || ''
    ];
    sheet.appendRow(row);

    sendEmail_(params, now);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Used by test() below — lets you verify setup without a real form submit
function doGet() {
  return ContentService
    .createTextOutput('AI Lab lead endpoint is live. POST here from the site form.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp', 'Full Name', 'Email', 'Phone', 'Track',
      'Source (pretty)', 'utm_source', 'utm_medium', 'utm_campaign',
      'utm_content', 'utm_term', 'fbclid', 'gclid',
      'Referrer', 'Landing Page'
    ]);
    sheet.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#181830').setFontColor('#f0eef5');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Human-friendly source label based on attribution fields
function prettySource_(p) {
  if (p.fbclid) return 'Facebook / Meta Ads' + (p.campaign ? ' · ' + p.campaign : '');
  if (p.gclid)  return 'Google Ads' + (p.campaign ? ' · ' + p.campaign : '');
  if (p.source) {
    var src = String(p.source).toLowerCase();
    var label = src;
    if (src.indexOf('fb') === 0 || src.indexOf('facebook') === 0) label = 'Facebook';
    else if (src.indexOf('ig') === 0 || src.indexOf('instagram') === 0) label = 'Instagram';
    else if (src.indexOf('google') === 0) label = 'Google';
    else if (src.indexOf('tiktok') === 0) label = 'TikTok';
    else if (src.indexOf('whatsapp') === 0) label = 'WhatsApp';
    return label + (p.campaign ? ' · ' + p.campaign : '');
  }
  if (p.referrer) {
    try {
      var host = String(p.referrer).replace(/^https?:\/\//,'').split('/')[0];
      return 'Referral: ' + host;
    } catch(e) {}
  }
  return 'Direct / Organic';
}

function sendEmail_(p, now) {
  var subject = '🔔 ליד חדש מהאתר — ' + (p.name || 'ללא שם') + (p.track ? ' · ' + p.track : '');
  var pretty = prettySource_(p);
  var lines = [
    'ליד חדש נקלט באתר AI Lab:',
    '',
    '👤 שם:      ' + (p.name  || '—'),
    '📧 אימייל:  ' + (p.email || '—'),
    '📱 טלפון:   ' + (p.phone || '—'),
    '🎓 מסלול:   ' + (p.track || '—'),
    '',
    '── מקור הליד ──',
    '📍 מקור:         ' + pretty,
    '   utm_source:   ' + (p.source   || '—'),
    '   utm_medium:   ' + (p.medium   || '—'),
    '   utm_campaign: ' + (p.campaign || '—'),
    '   utm_content:  ' + (p.content  || '—'),
    '   utm_term:     ' + (p.term     || '—'),
    '   fbclid:       ' + (p.fbclid   || '—'),
    '   gclid:        ' + (p.gclid    || '—'),
    '   referrer:     ' + (p.referrer     || '—'),
    '   landing_page: ' + (p.landing_page || '—'),
    '',
    '🕒 זמן: ' + Utilities.formatDate(now, 'Asia/Jerusalem', 'yyyy-MM-dd HH:mm:ss') + ' (Israel)',
    '',
    '── פעולות מהירות ──'
  ];
  if (p.phone) lines.push('☎️  חייג: tel:' + p.phone);
  if (p.phone) lines.push('💬 וואטסאפ: https://wa.me/' + cleanPhone_(p.phone));
  if (p.email) lines.push('📨 השב במייל: mailto:' + p.email);

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: lines.join('\n')
  });
}

function cleanPhone_(phone) {
  var p = String(phone).replace(/\D/g, '');
  if (p.indexOf('0') === 0) p = '972' + p.substring(1);
  return p;
}

// Optional: run this manually from the Apps Script editor to test
function test_() {
  doPost({ parameter: {
    name: 'בדיקה',
    email: 'test@example.com',
    phone: '050-0000000',
    track: 'ילדים ונוער — בסיסי',
    source: 'facebook',
    campaign: 'test_campaign',
    content: 'test_ad'
  }});
}
