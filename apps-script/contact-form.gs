/**
 * טופס הקשר של האתר — Google Apps Script
 * ------------------------------------------------
 * מה הסקריפט עושה: כל שליחת טופס באתר —
 *   1. נשמרת כשורה חדשה בלשונית "פניות" בגיליון הזה
 *   2. נשלחת כמייל מיידי לכתובת NOTIFY_EMAIL
 *
 * הוראות פריסה מלאות: apps-script/הוראות-פריסה.md
 */

var NOTIFY_EMAIL = 'bloyarava1@gmail.com';
var SHEET_NAME = 'פניות';

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // מלכודת ספאם: בני אדם לא ממלאים את השדה הנסתר
    if (p.website) return json_({ ok: true });

    var name = String(p.name || '').trim();
    var message = String(p.message || '').trim();
    if (!name || !message) return json_({ ok: false, error: 'missing fields' });

    var row = [
      new Date(),
      name,
      String(p.phone || '').trim(),
      String(p.email || '').trim(),
      String(p.topic || '').trim(),
      message
    ];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['תאריך', 'שם', 'טלפון', 'אימייל', 'נושא', 'הודעה']);
      sheet.setRightToLeft(true);
      sheet.getRange('1:1').setFontWeight('bold');
    }
    sheet.appendRow(row);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '🌸 פנייה חדשה מהאתר — ' + name + (p.topic ? ' (' + p.topic + ')' : ''),
      htmlBody:
        '<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7">' +
        '<h2 style="color:#7D1C2A">פנייה חדשה מהאתר</h2>' +
        '<p><b>שם:</b> ' + html_(name) + '</p>' +
        (p.phone ? '<p><b>טלפון:</b> ' + html_(p.phone) + '</p>' : '') +
        (p.email ? '<p><b>אימייל:</b> ' + html_(p.email) + '</p>' : '') +
        (p.topic ? '<p><b>נושא:</b> ' + html_(p.topic) + '</p>' : '') +
        '<p><b>ההודעה:</b></p>' +
        '<div style="background:#FBF6ED;border-right:4px solid #C89B3C;padding:12px 16px;border-radius:8px">' +
        html_(message).replace(/\n/g, '<br>') + '</div>' +
        '<p style="color:#888;font-size:12px">הפנייה נשמרה גם בלשונית "פניות" בגיליון.</p>' +
        '</div>'
    });

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* בדיקת חיים: פתיחת כתובת ה-Web App בדפדפן צריכה להציג ok */
function doGet() {
  return json_({ ok: true, service: 'chani-bloy-contact' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function html_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
