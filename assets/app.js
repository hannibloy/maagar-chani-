/* ============================================================
   מאגר התוצרים של חני בלוי
   כל התוכן נטען חי מגיליון Google Sheets (TSV) — אין תוכן קבוע בקוד.
   הוספת שורה בגיליון = תוצר חדש באתר, בלי לגעת בקוד.
   ============================================================ */
(function (global) {
  'use strict';

  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQU8ESqp3BO6UtdHu7amUaPvMHywB0OZU-AcFfqRlo40XolLz3hZ3puUHYkkUryiHcDEEYcGfZtvAso/pub?gid=1755222535&single=true&output=tsv';

  /* כמה כרטיסים מוצגים באשכול לפני "הצגת כל התוצרים" */
  var PREVIEW_COUNT = 4;

  /* ---------- אשכולות: מיפוי תחום ← אשכול-על ---------- */

  var CLUSTERS = [
    { name: 'חוסן, רגש ותקווה',    slug: 'resilience',  art: 'heart',   c1: '#9B3D47', c2: '#E8B59E', domains: ['חוסן ותקווה', 'פעילויות חוסן לצוות'] },
    { name: 'חירום, מוגנות ומניעה', slug: 'emergency',   art: 'shield',  c1: '#7D1C2A', c2: '#C9BFA6', domains: ['צל"ח, חירום ומשברים', 'מניעת אובדנות', 'מוגנות ומניעת פגיעות'] },
    { name: 'כישורי חיים ומשפחה',   slug: 'life-skills', art: 'house',   c1: '#5C6228', c2: '#C9D3A0', domains: ['כישורי חיים', 'משפחה'] },
    { name: 'כלים למקצועניות',      slug: 'tools',       art: 'toolbox', c1: '#8A6A3B', c2: '#E0BC72', domains: ['כלים ליועצות', 'מדריכות', 'השתלמויות, מליאות וסדנאות'] },
    { name: 'חגים ומועדים',         slug: 'holidays',    art: 'candle',  c1: '#B8860B', c2: '#F5D5C8', domains: ['חג הפסח', 'פורים', 'חנוכה', 'מועדים ותאריכים נוספים'] },
    { name: 'שנת הלימודים',         slug: 'school-year', art: 'bag',     c1: '#4E6E8E', c2: '#C9D3A0', domains: ['חזרה ללימודים וסיכום שנה'] },
    { name: 'יהדות, רוח ושליחות',   slug: 'jewish',      art: 'star',    c1: '#8C6D1F', c2: '#F0DBB0', domains: ['תוכן יהודי-רוחני', 'בית חב"ד והקמפיין'] },
    { name: 'מיתוג ופרסומים',       slug: 'branding',    art: 'palette', c1: '#9B3D47', c2: '#C9D3A0', domains: ['פרסומים, לוגואים ומיתוג'] }
  ];
  var FALLBACK = { name: 'עוד תוצרים', slug: 'more', art: 'leaf', c1: '#7A6A60', c2: '#E8D9C5', domains: [] };

  /* ---------- אייקונים מצוירים בקו רך, ברוח האיור האקוורלי ---------- */

  var ART = {
    heart: function (a, b) { return '<circle cx="24" cy="24" r="16.5" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="72 26" transform="rotate(-118 24 24)"/><path d="M24 33c-6.4-4.3-9.6-7.6-9.6-11.3 0-2.9 2.2-5 4.9-5 1.9 0 3.6 1 4.7 2.7 1.1-1.7 2.8-2.7 4.7-2.7 2.7 0 4.9 2.1 4.9 5C33.6 25.4 30.4 28.7 24 33z" fill="' + b + '"/>'; },
    shield: function (a, b) { return '<path d="M24 6l13 4.6v10.6C37 31 31 37.5 24 41c-7-3.5-13-10-13-19.8V10.6z" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M17.5 23.5l4.6 4.8 8.6-9.2" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'; },
    house: function (a, b) { return '<path d="M9 23L24 10l15 13" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 22v17h22V22" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M20.5 39v-9h7v9" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/>'; },
    toolbox: function (a, b) { return '<rect x="9" y="19" width="30" height="20" rx="4" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M18 19v-3.5a3 3 0 013-3h6a3 3 0 013 3V19" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/><path d="M9 27h30" stroke="' + a + '" stroke-width="2.2"/>'; },
    candle: function (a, b) { return '<rect x="18" y="21" width="12" height="19" rx="3" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M24 18c3.4-2.6 3.6-5.6 1.2-9.4 3.9 1.7 6 4.6 6 7.6 0 2.6-1.8 4.6-4.2 5.2" fill="' + a + '" opacity=".85"/><path d="M13 40h22" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>'; },
    bag: function (a, b) { return '<rect x="10" y="18" width="28" height="21" rx="6" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M18 18v-3a6 6 0 0112 0v3" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/><path d="M10 28h28" stroke="' + a + '" stroke-width="2.2"/><rect x="21" y="24.5" width="6" height="7" rx="2" fill="' + a + '" opacity=".8"/>'; },
    star: function (a, b) { return '<path d="M24 8l12.1 21H11.9z" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 40L11.9 19h24.2z" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/>'; },
    palette: function (a, b) { return '<path d="M24 9c8.8 0 16 6 16 13.4 0 4.6-3.6 6.6-7 6.6h-2.6c-2.4 0-4 1.6-4 3.6 0 1 .4 1.8.9 2.6.5.8.9 1.5.9 2.4 0 1.9-1.6 3.4-4.2 3.4C15.2 41 8 34 8 24.4 8 15.4 15.2 9 24 9z" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><circle cx="16.5" cy="20" r="2.4" fill="' + a + '"/><circle cx="24" cy="16" r="2.4" fill="' + a + '" opacity=".7"/><circle cx="31.5" cy="20" r="2.4" fill="' + a + '" opacity=".5"/>'; },
    leaf: function (a, b) { return '<path d="M38 10C22 10 12 17 12 28c0 4.2 1.6 7.6 4 10 6-14 13-19.5 19-22-4.6 3.8-9.4 9.6-13 18.4 2 .8 4 1.2 6 1.2 8 0 12-7 12-14 0-5-1-9.6-2-11.6z" fill="' + b + '" stroke="' + a + '" stroke-width="2" stroke-linejoin="round"/>'; },

    /* מוטיבים נושאיים — נבחרים לפי שם התוצר */
    crown: function (a, b) { return '<path d="M9 33l-2-18 9 7 8-13 8 13 9-7-2 18z" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 38h30" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/>'; },
    matza: function (a, b) { return '<rect x="10" y="10" width="28" height="28" rx="6" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><circle cx="18" cy="18" r="1.8" fill="' + a + '"/><circle cx="30" cy="18" r="1.8" fill="' + a + '"/><circle cx="24" cy="24" r="1.8" fill="' + a + '"/><circle cx="18" cy="30" r="1.8" fill="' + a + '"/><circle cx="30" cy="30" r="1.8" fill="' + a + '"/>'; },
    cards: function (a, b) { return '<rect x="9" y="14" width="18" height="25" rx="4" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" transform="rotate(-11 18 26)"/><rect x="21" y="12" width="18" height="25" rx="4" fill="#fff" fill-opacity=".55" stroke="' + a + '" stroke-width="2.2" transform="rotate(9 30 24)"/>'; },
    book: function (a, b) { return '<path d="M24 15c-4-3-9-3.6-14-3v22c5-.6 10 0 14 3 4-3 9-3.6 14-3V12c-5-.6-10 0-14 3z" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 15v22" stroke="' + a + '" stroke-width="2.2"/>'; },
    slides: function (a, b) { return '<rect x="8" y="11" width="32" height="21" rx="4" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M24 32v6M17 40h14" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/><path d="M15 25l6-7 5 5 7-8" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'; },
    sun: function (a, b) { return '<circle cx="24" cy="24" r="9" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><g stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l3.6 3.6M33.4 33.4L37 37M37 11l-3.6 3.6M14.6 33.4L11 37"/></g>'; },
    tree: function (a, b) { return '<circle cx="24" cy="19" r="11" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M24 30v11" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/><path d="M24 35l-5-4M24 32l5-4" stroke="' + a + '" stroke-width="2" stroke-linecap="round"/>'; },
    hands: function (a, b) { return '<path d="M6 30l8-6 8 5 6-2" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 30l-8-6-8 5" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 20c-2.5-2.6-6.5-1-6.5 2.2 0 2.6 2.6 5 6.5 8.3 3.9-3.3 6.5-5.7 6.5-8.3 0-3.2-4-4.8-6.5-2.2z" fill="' + b + '" stroke="' + a + '" stroke-width="2"/>'; },
    chat: function (a, b) { return '<path d="M10 12h22a4 4 0 014 4v11a4 4 0 01-4 4H21l-8 6v-6h-3a4 4 0 01-4-4V16a4 4 0 014-4z" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 20h14M15 26h9" stroke="' + a + '" stroke-width="2.1" stroke-linecap="round"/>'; },
    medal: function (a, b) { return '<circle cx="24" cy="29" r="10" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M17 20L13 7M31 20l4-13" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/><path d="M24 24l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z" fill="' + a + '" opacity=".8"/>'; },
    flower: function (a, b) { return '<g fill="' + b + '" stroke="' + a + '" stroke-width="2"><ellipse cx="24" cy="13" rx="5" ry="7"/><ellipse cx="24" cy="27" rx="5" ry="7"/><ellipse cx="17" cy="20" rx="7" ry="5"/><ellipse cx="31" cy="20" rx="7" ry="5"/></g><circle cx="24" cy="20" r="3.6" fill="' + a + '"/><path d="M24 31v10" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>'; },
    clock: function (a, b) { return '<circle cx="24" cy="24" r="15" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M24 15v9l6 4" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'; },
    anchor: function (a, b) { return '<circle cx="24" cy="10" r="4.5" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M24 15v25" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/><path d="M16 20h16" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/><path d="M10 28c0 8 6.5 12 14 12s14-4 14-12" fill="none" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/>'; },
    bridge: function (a, b) { return '<path d="M6 32c0-10 8-16 18-16s18 6 18 16" fill="' + b + '" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/><path d="M6 32h36" stroke="' + a + '" stroke-width="2.4" stroke-linecap="round"/><path d="M14 32v-8M24 32V16M34 32v-8" stroke="' + a + '" stroke-width="2" stroke-linecap="round"/><path d="M9 38h30" stroke="' + a + '" stroke-width="2" stroke-linecap="round" opacity=".5"/>'; },
    compass: function (a, b) { return '<circle cx="24" cy="24" r="15" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M30 18l-4 10-10 4 4-10z" fill="' + a + '" opacity=".85"/><circle cx="24" cy="24" r="2" fill="#fff"/>'; },
    light: function (a, b) { return '<circle cx="24" cy="26" r="10" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M24 21c2.2-1.7 2.3-3.6.8-6 2.5 1.1 3.9 2.9 3.9 4.9 0 1.7-1.2 3-2.7 3.4" fill="' + a + '" opacity=".85"/><g stroke="' + a + '" stroke-width="2" stroke-linecap="round" opacity=".7"><path d="M24 8v4M10 26h4M34 26h4M13.5 15.5l2.8 2.8M34.5 15.5l-2.8 2.8M15 37l2.4-2.4M33 37l-2.4-2.4"/></g>'; },
    breath: function (a, b) { return '<circle cx="24" cy="24" r="5" fill="' + b + '" stroke="' + a + '" stroke-width="2.2"/><path d="M14 14a14 14 0 000 20" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M34 14a14 14 0 010 20" fill="none" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M8 9a21 21 0 000 30M40 9a21 21 0 010 30" fill="none" stroke="' + a + '" stroke-width="1.8" stroke-linecap="round" opacity=".4"/>'; }
  };

  /* מוטיבים נושאיים בלבד — מילות פורמט ("מצגת", "קנבה") לא קובעות איור */
  var MOTIFS = [
    [/עוגן|עוגנ/, 'anchor'],
    [/גשר|מאחד|מאח.?ד|חיבור/, 'bridge'],
    [/מסע|דרך|מפת|ניווט|מצפן|תחנות/, 'compass'],
    [/נשימ|אויר|אוויר|רגיע|הרפי|מיינדפ|שקט|נשימות/, 'breath'],
    [/פנקס|מחבר|חובר|ספר|יומן|דף עבוד|מערך|מדריך|כרטיסי/, 'book'],
    [/פורים|מסכ|תחפוש|משלוח מנות|מגיל/, 'crown'],
    [/פסח|הגד|מצה|ליל הסדר|חמץ|חירות/, 'matza'],
    [/חנוכ|נר |נרות|סביבון|מנור|הדלק/, 'candle'],
    [/קלפ|משחק|ערכ|קוביי|בינגו|חידון/, 'cards'],
    [/להדליק|מדליק|נדליק|אורות|(^| )אור( |$)/, 'light'],
    [/תקוו|בוקר|פתיחת שנה|שמש|זריח|אופטימ|שמחה/, 'sun'],
    [/ט.?ו בשבט|צמיח|שורש|עץ|גדיל|נטיע|פרי/, 'tree'],
    [/צוות|שיתוף|קבוצ|גיבוש|הורים|קהיל|חבר|ביחד|יחד/, 'hands'],
    [/שיח|הקשב|דיאלוג|תקשור|ליווי|היוועצ|הורות/, 'chat'],
    [/סיכום שנה|הצלח|הישג|פרס |מצטיינ|טקס|סיום/, 'medal'],
    [/נשי|אמהו|בנות|פרח|כלה|אשה|נשים/, 'flower'],
    [/שגר|סדר יום|זמן|לוח שנה|תכנון|התארגנ/, 'clock'],
    [/חירום|צל.?ח|מוגנ|מניע|בטיח|אובדנ|משבר|בטחון|בטיחות|מיגון/, 'shield'],
    [/משפח|בית|גן |גננ|כיתה|כיתת/, 'house'],
    [/כוח|חוסן|רגש|לב |לבב|תמיכ|נפש|אמפת/, 'heart'],
    [/יהד|תור|חסיד|רבי|חב.?ד|שליחו|תפיל|אמונ|נחת|קדוש/, 'star'],
    [/מיתוג|לוגו|עיצוב|פרסום|באנר|כרזה/, 'palette'],
    [/ילקוט|לימוד|בית ספר|חזרה ל|תלמיד/, 'bag'],
    [/כלים|ארגז|יועצ|מדריכ|הדרכ/, 'toolbox']
  ];

  /* לכל נושא גוון משלו — מתוך משפחת הצבעים של הלוגו */
  var MOTIF_PAL = {
    anchor:  { c1: '#3F6B78', c2: '#BBD6DA' },
    bridge:  { c1: '#4E6E8E', c2: '#C4D5E4' },
    compass: { c1: '#2F6B5E', c2: '#B8D8CD' },
    breath:  { c1: '#6C8FA6', c2: '#D3E4EC' },
    book:    { c1: '#8A6A3B', c2: '#EBD6AE' },
    crown:   { c1: '#8E3B7A', c2: '#EBC7E0' },
    matza:   { c1: '#A8642A', c2: '#F2D3B4' },
    candle:  { c1: '#B8860B', c2: '#F6E0AE' },
    cards:   { c1: '#9B3D47', c2: '#F0C9CC' },
    light:   { c1: '#A8741C', c2: '#FBE6B8' },
    sun:     { c1: '#C88A2C', c2: '#FAE2B8' },
    tree:    { c1: '#5C6228', c2: '#CFD9A6' },
    hands:   { c1: '#7A5C8E', c2: '#DCCCE9' },
    chat:    { c1: '#417A7A', c2: '#C2E0DE' },
    medal:   { c1: '#A67A1F', c2: '#F3DFAE' },
    flower:  { c1: '#B0546E', c2: '#F6CEDA' },
    clock:   { c1: '#6B6F73', c2: '#D8DBDD' },
    shield:  { c1: '#7D1C2A', c2: '#E2BEBE' },
    house:   { c1: '#7A6B4A', c2: '#E3D8BE' },
    heart:   { c1: '#9B3D47', c2: '#F1CDBE' },
    star:    { c1: '#8C6D1F', c2: '#F0DBB0' },
    palette: { c1: '#A34B6C', c2: '#EDCBD8' },
    bag:     { c1: '#4E6E8E', c2: '#CBDCE8' },
    toolbox: { c1: '#7F6438', c2: '#E6D2AC' },
    leaf:    { c1: '#6E7A4E', c2: '#D9E0C2' }
  };

  /* ---------- עזרי טקסט וחיפוש ---------- */

  var PFX = ['ושב', 'וב', 'ול', 'וכ', 'וה', 'ומ', 'שב', 'שה', 'שמ', 'שכ', 'של', 'בה', 'מה', 'לה', 'ש', 'ב', 'ל', 'מ', 'כ', 'ה', 'ו'];

  function norm(s) {
    return (s || '').toLowerCase()
      .replace(/["'״׳“”‘’]/g, '')
      .replace(/[\-–—_\.]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function tokenFound(h, t) {
    if (h.indexOf(t) !== -1) return true;
    for (var i = 0; i < PFX.length; i++) {
      var p = PFX[i];
      if (t.indexOf(p) === 0 && t.length > p.length + 1 && h.indexOf(t.slice(p.length)) !== -1) return true;
    }
    return false;
  }

  function parseDate(s) {
    if (!s) return null;
    s = s.trim();
    var m = s.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/);
    if (m) { var y = +m[3]; if (y < 100) y += 2000; return new Date(y, m[2] - 1, m[1]).getTime(); }
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return new Date(+m[1], m[2] - 1, m[3]).getTime();
    var t = Date.parse(s);
    return isNaN(t) ? null : t;
  }

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }

  /* עמודה 11 "הדגשה": מספרי חודשים (למשל "8,9" = מודגש כל אוגוסט-ספטמבר,
     שנה אחר שנה) או סימן ידני (✔ / כן / v) שמדגיש עד שמוחקים. ריק = לא מודגש. */
  function isHighlighted(p, now) {
    var v = (p.highlight || '').trim();
    if (!v) return false;
    var months = v.match(/\d{1,2}/g);
    if (months) {
      var m = (now || new Date()).getMonth() + 1;
      for (var i = 0; i < months.length; i++) if (+months[i] === m) return true;
      return false;
    }
    return /[✓✔√vV]|כן|yes/.test(v);
  }

  /* ---------- עזרי איור ---------- */

  function clusterOf(d) {
    for (var i = 0; i < CLUSTERS.length; i++) if (CLUSTERS[i].domains.indexOf(d) !== -1) return CLUSTERS[i];
    return FALLBACK;
  }

  function hashN(s, n) {
    var x = 0;
    for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 9973;
    return x % n;
  }

  function hexA(h, a) {
    var n = parseInt(h.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  var GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

  /* כתמי אקוורל רכים: כמה אליפסות שקופות שמתמזגות בלי קווי הפרדה */
  function watercolor(cl, seed) {
    var v = [
      [[18, 14, '.42'], [78, 26, '.30'], [52, 86, '.34'], [92, 74, '.22'], [8, 68, '.26']],
      [[82, 16, '.40'], [24, 30, '.32'], [60, 88, '.30'], [6, 78, '.24'], [96, 58, '.22']],
      [[50, 10, '.38'], [12, 52, '.34'], [88, 46, '.28'], [38, 92, '.30'], [74, 80, '.22']]
    ][seed % 3];
    var cols = [cl.c1, cl.c2, cl.c1, cl.c2, '#C89B3C'];
    var layers = v.map(function (p, i) {
      return 'radial-gradient(ellipse ' + (58 + i * 9) + '% ' + (52 + i * 7) + '% at ' + p[0] + '% ' + p[1] + '%,' +
        hexA(cols[i], p[2]) + ' 0%,' + hexA(cols[i], 0) + ' 70%)';
    });
    return GRAIN + ',' + layers.join(',') + ',linear-gradient(160deg,#FDFAF4,#F7EFE2)';
  }

  function iconSvg(cl, size, art) {
    var draw = ART[art || cl.art] || ART.leaf;
    return '<svg viewBox="0 0 48 48" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" style="display:block" aria-hidden="true" focusable="false">' +
      draw(cl.c1, hexA(cl.c2, '.55')) + '</svg>';
  }

  /* אייקון PNG מ-assets/icons/ מחליף את איור הקו ברגע שהקובץ קיים;
     חסר — האיור נשאר. קבצים חסרים נזכרים כדי לא לבקש אותם שוב ושוב. */
  var missingIcons = {};
  function iconEl(cl, size, art, pngName) {
    var html = '<span class="ico" style="width:' + size + 'px;height:' + size + 'px">' + iconSvg(cl, size, art);
    if (pngName && !missingIcons[pngName]) {
      html += '<img class="ico__png" src="assets/icons/' + pngName + '" alt="" loading="lazy" decoding="async" data-icon="' + pngName + '">';
    }
    return html + '</span>';
  }
  /* כריכת ציור מלאה לפי מוטיב — assets/covers/motif-X.jpg.
     נטענת מעל האקוורל; עמודה 10 (תמונת תוצר ספציפית) עדיין גוברת עליה. */
  function motifCoverHtml(art) {
    var src = 'assets/covers/motif-' + art + '.jpg';
    if (missingIcons[src]) return '';
    return '<img class="cover" src="' + src + '" alt="" loading="lazy" decoding="async">';
  }

  /* תמונת שער מופיעה רק אחרי שנטענה בהצלחה — לעולם לא ריבוע ריק */
  function wireCovers(root) {
    root.querySelectorAll('img.cover').forEach(function (img) {
      if (img.complete && img.naturalWidth) { img.classList.add('is-loaded'); return; }
      img.addEventListener('load', function () { img.classList.add('is-loaded'); });
      img.addEventListener('error', function () {
        missingIcons[img.getAttribute('src')] = 1;
        img.remove();
      });
    });
  }

  function wireIcons(root) {
    root.querySelectorAll('img.ico__png').forEach(function (img) {
      function shown() {
        img.classList.add('is-loaded');
        var svg = img.parentNode && img.parentNode.querySelector('svg');
        if (svg) svg.style.visibility = 'hidden';
      }
      if (img.complete && img.naturalWidth) { shown(); return; }
      img.addEventListener('load', shown);
      img.addEventListener('error', function () {
        missingIcons[img.getAttribute('data-icon')] = 1;
        img.remove();
      });
    });
  }

  /* קודם כל לפי שם התוצר; רק אם אין התאמה — מילות המפתח; ולבסוף אייקון האשכול */
  function motifOf(p, cl) {
    var n = norm(p.name), i;
    for (i = 0; i < MOTIFS.length; i++) if (MOTIFS[i][0].test(n)) return MOTIFS[i][1];
    var k = norm(p.kw + ' ' + p.desc);
    for (i = 0; i < MOTIFS.length; i++) if (MOTIFS[i][0].test(k)) return MOTIFS[i][1];
    return cl.art;
  }

  /* תמונת שער אמיתית מותרת אך ורק מעמודה 10, וקישורי design.canva.ai אינם תמונות */
  function usableImg(u) {
    return !!u && u.indexOf('design.canva.ai') === -1 && u.indexOf('http') === 0;
  }

  /* האיור לכל תוצר מחושב פעם אחת ונשמר במטמון */
  var artCache = {};
  function artOf(p) {
    var key = p.name + ' ' + p.domain;
    var a = artCache[key];
    if (!a) {
      var cl = clusterOf(p.domain);
      var art = motifOf(p, cl);
      var pal = { art: art, c1: (MOTIF_PAL[art] || cl).c1, c2: (MOTIF_PAL[art] || cl).c2 };
      var seed = hashN(p.name, 3);
      a = {
        pal: pal,
        wash: watercolor(pal, seed),
        icon34: iconSvg(pal, 34, art),
        icon56: iconSvg(pal, 56, art),
        short: p.name.length > 36 ? p.name.slice(0, 34) + '…' : p.name
      };
      artCache[key] = a;
    }
    return a;
  }

  /* ---------- שכבת הנתונים — משותפת לכל העמודים ---------- */

  function parseProducts(text, showPersonal) {
    var lines = text.split(/\r?\n/);
    var out = [];
    for (var i = 1; i < lines.length; i++) {
      if (!lines[i] || !lines[i].trim()) continue;
      var c = lines[i].split('\t');
      var name = (c[0] || '').trim(), link = (c[1] || '').trim();
      if (!name || !link) continue;
      var personal = ((c[6] || '').trim()).indexOf('אישי') === 0;
      if (personal && !showPersonal) continue;
      var p = {
        name: name, link: link,
        domain: (c[2] || '').trim() || 'כללי',
        aud: (c[3] || '').trim(),
        plat: (c[4] || '').trim(),
        desc: (c[5] || '').trim(),
        personal: personal,
        date: (c[7] || '').trim(),
        kw: (c[8] || '').trim(),
        img: (c[9] || '').trim(),
        highlight: (c[10] || '').trim(),
        order: i
      };
      p.hay = norm(p.name + ' ' + p.desc + ' ' + p.domain + ' ' + p.aud + ' ' + p.plat + ' ' + p.kw);
      out.push(p);
    }
    out.sort(function (a, b) {
      var da = parseDate(a.date), db = parseDate(b.date);
      if (da && db) return db - da;
      if (da) return -1;
      if (db) return 1;
      return a.order - b.order;
    });
    return out;
  }

  function loadData(showPersonal) {
    return fetch(SHEET_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (t) { return parseProducts(t, showPersonal); });
  }

  /* ============================================================
     האפליקציה
     ============================================================ */

  function createApp(options) {
    var showPersonal = !!(options && options.showPersonal);

    var state = {
      loading: true, errored: false, products: [],
      query: '', fDomain: '', fAud: '', fPlat: '',
      expanded: {}, modalIdx: -1, showTop: false
    };

    var list = [];              /* התוצרים המסוננים, בסדר התצוגה */
    var suggestions = [];
    var lastFocus = null;
    var mainTimer = 0;

    var el = {
      main: document.getElementById('main'),
      count: document.getElementById('count'),
      clear: document.getElementById('clear'),
      search: document.getElementById('search'),
      home: document.getElementById('home'),
      chips: document.getElementById('chips'),
      fDomain: document.getElementById('f-domain'),
      fAud: document.getElementById('f-aud'),
      fPlat: document.getElementById('f-plat'),
      statTotal: document.getElementById('stat-total'),
      statDomains: document.getElementById('stat-domains'),
      statAud: document.getElementById('stat-aud'),
      modalRoot: document.getElementById('modal-root'),
      about: document.getElementById('about'),
      aboutOpen: document.getElementById('about-open'),
      top: document.getElementById('to-top')
    };

    /* ---------- גלילה: עשויה לחיות ב-window, ב-documentElement או ב-body ---------- */

    function scroller() {
      var de = document.scrollingElement || document.documentElement;
      if (de && de.scrollHeight > de.clientHeight + 4) return de;
      if (document.body && document.body.scrollHeight > document.body.clientHeight + 4) return document.body;
      return de || document.body;
    }
    function scrollPos() { return Math.max(window.scrollY || 0, scroller().scrollTop || 0); }
    function toTop() {
      var sc = scroller();
      if (sc && sc.scrollTo) sc.scrollTo({ top: 0, behavior: 'smooth' });
      else if (sc) sc.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ---------- טעינה ועיבוד הגיליון ---------- */

    function load() {
      state.loading = true;
      state.errored = false;
      renderMain();
      loadData(showPersonal)
        .then(function (out) {
          /* תוצרים מודגשים (עמודה 11) עולים לראש הרשימה, ובתוכם לפי התאריך */
          out.sort(function (a, b) {
            var ha = isHighlighted(a) ? 0 : 1, hb = isHighlighted(b) ? 0 : 1;
            return ha - hb;
          });
          state.products = out;
          state.loading = false;
          state.errored = false;
          buildSuggestions();
          buildFilterOptions();
          renderAll();
          applyUrlParams();
        })
        .catch(function () {
          state.loading = false;
          state.errored = true;
          renderAll();
        });
    }

    /* קישורים עמוקים: maagar.html?q=חוסן או ?cluster=holidays */
    var urlApplied = false;
    function applyUrlParams() {
      if (urlApplied) return;
      urlApplied = true;
      var params = new URLSearchParams(location.search);
      var q = params.get('q');
      if (q) {
        state.query = q;
        if (el.search) el.search.value = q;
        renderChips();
        renderMain();
        return;
      }
      var slug = params.get('cluster');
      if (slug) {
        var target = document.querySelector('[data-cluster-slug="' + slug + '"]');
        if (target) target.scrollIntoView({ block: 'start' });
      }
    }

    /* ---------- נגזרות ---------- */

    function uniq(key) {
      var seen = {}, o = [];
      state.products.forEach(function (p) {
        var v = p[key];
        if (v && !seen[v]) { seen[v] = 1; o.push(v); }
      });
      return o.sort(function (a, b) { return a.localeCompare(b, 'he'); });
    }

    function isFiltering() {
      return !!(state.query.trim() || state.fDomain || state.fAud || state.fPlat);
    }

    function filtered() {
      var q = norm(state.query), tokens = q ? q.split(' ') : [];
      return state.products.filter(function (p) {
        if (state.fDomain && p.domain !== state.fDomain) return false;
        if (state.fAud && p.aud !== state.fAud) return false;
        if (state.fPlat && p.plat !== state.fPlat) return false;
        for (var i = 0; i < tokens.length; i++) if (!tokenFound(p.hay, tokens[i])) return false;
        return true;
      });
    }

    function buildSuggestions() {
      var freq = {};
      state.products.forEach(function (p) {
        (p.kw || '').split(/[,،;|]/).forEach(function (w) {
          w = w.trim();
          if (w.length > 2 && w.length < 16) freq[w] = (freq[w] || 0) + 1;
        });
      });
      suggestions = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 9);
    }

    function buildFilterOptions() {
      fillSelect(el.fDomain, 'כל התחומים', uniq('domain'), state.fDomain);
      fillSelect(el.fAud, 'כל הקהלים', uniq('aud'), state.fAud);
      fillSelect(el.fPlat, 'כל הפלטפורמות', uniq('plat'), state.fPlat);
    }

    function fillSelect(sel, allLabel, values, current) {
      if (!sel) return;
      var html = '<option value="">' + esc(allLabel) + '</option>';
      values.forEach(function (v) { html += '<option value="' + esc(v) + '">' + esc(v) + '</option>'; });
      sel.innerHTML = html;
      sel.value = current || '';
    }

    /* ---------- תבניות ---------- */

    function tagsHtml(p) {
      var h = '<span class="tag tag--domain">' + esc(p.domain) + '</span>';
      if (p.aud) h += '<span class="tag tag--aud">' + esc(p.aud) + '</span>';
      if (p.personal) h += '<span class="tag tag--lock">🔒 אישי</span>';
      return h;
    }

    function coverHtml(p) {
      if (!usableImg(p.img)) return '';
      return '<img class="cover" src="' + esc(p.img) + '" alt="" loading="lazy" decoding="async">';
    }

    function cardHtml(p, i) {
      var a = artOf(p);
      var tilt = [-0.5, 0.4, 0][i % 3];
      var delay = (i % 8) * 0.045;
      return '<button class="card" type="button" data-idx="' + i + '"' +
        ' style="--tilt:' + tilt + 'deg;--accent:' + a.pal.c1 + ';animation-delay:' + delay + 's">' +
        '<span class="card__thumb" style="background:' + esc(a.wash) + '">' +
          (isHighlighted(p) ? '<span class="card__now">✨ עכשיו</span>' : '') +
          '<span class="card__icon">' + iconEl(a.pal, 34, a.pal.art, 'motif-' + a.pal.art + '.png') + '</span>' +
          '<span class="card__label">' + esc(a.short) + '</span>' +
          motifCoverHtml(a.pal.art) +
          coverHtml(p) +
        '</span>' +
        '<span class="card__body">' +
          '<span class="card__name">' + esc(p.name) + '</span>' +
          '<span class="tags">' + tagsHtml(p) + '</span>' +
        '</span>' +
      '</button>';
    }

    function clusterHtml(c, entries) {
      var open = !!state.expanded[c.name];
      var shown = open ? entries : entries.slice(0, PREVIEW_COUNT);
      var cards = shown.map(function (e) { return cardHtml(e.p, e.i); }).join('');
      var more = entries.length > PREVIEW_COUNT
        ? '<button class="btn-more" type="button" data-cluster="' + esc(c.name) + '">' +
            (open ? 'הצגה מצומצמת ▲' : 'הצגת כל ' + entries.length + ' התוצרים ▼') +
          '</button>'
        : '';
      return '<section class="cluster" data-cluster-slug="' + esc(c.slug) + '">' +
        '<div class="cluster__head">' +
          '<div class="cluster__blob" style="background:linear-gradient(120deg,' + c.c2 + ',' + c.c1 + ')"></div>' +
          '<div class="cluster__icon">' + iconEl(c, 30, c.art, 'cluster-' + c.slug + '.png') + '</div>' +
          '<h2 class="cluster__title">' + esc(c.name) + '</h2>' +
          '<span class="cluster__count">' + entries.length + ' תוצרים</span>' +
        '</div>' +
        '<div class="grid">' + cards + '</div>' +
        more +
      '</section>';
    }

    /* ---------- ציור ---------- */

    function renderAll() {
      renderStats();
      renderChips();
      renderMain();
      renderModal();
    }

    function renderStats() {
      if (el.statTotal) el.statTotal.textContent = state.products.length;
      if (el.statDomains) el.statDomains.textContent = uniq('domain').length;
      if (el.statAud) el.statAud.textContent = uniq('aud').length;
    }

    function renderChips() {
      if (!el.chips) return;
      var q = norm(state.query);
      el.chips.innerHTML = suggestions.map(function (w) {
        var active = q === norm(w);
        return '<button class="chip' + (active ? ' is-active' : '') + '" type="button" data-kw="' + esc(w) + '">' + esc(w) + '</button>';
      }).join('');
    }

    function renderCount() {
      if (!el.count) return;
      el.count.textContent = state.loading ? '' : (isFiltering()
        ? 'נמצאו ' + list.length + ' תוצרים'
        : 'במאגר ' + list.length + ' תוצרים — גללו לפי נושא או חפשו למעלה');
      if (el.clear) el.clear.hidden = !isFiltering();
    }

    function renderMain() {
      if (state.loading) {
        el.main.innerHTML = '<div class="state-loading"><div class="spinner"></div>טוען את המאגר…</div>';
        list = [];
        renderCount();
        return;
      }
      if (state.errored) {
        el.main.innerHTML =
          '<div class="state-error">' +
            '<div class="state-error__mark">🌸</div>' +
            '<h3>המאגר מתקשה להיטען כרגע</h3>' +
            '<p>ייתכן שיש בעיה זמנית בחיבור. נסו שוב בעוד רגע — בדרך כלל זה מסתדר.</p>' +
            '<button class="btn-retry" type="button" id="retry">נסו שוב</button>' +
          '</div>';
        list = [];
        renderCount();
        return;
      }

      list = filtered();
      renderCount();

      if (!list.length) {
        el.main.innerHTML =
          '<div class="state-empty">' +
            '<div class="state-empty__mark">🔍</div>' +
            '<p>לא נמצאו תוצרים מתאימים.<br>נסו מילה אחרת או נקו את הסינון.</p>' +
          '</div>';
        return;
      }

      if (isFiltering()) {
        el.main.innerHTML = '<div class="grid grid--flat">' +
          list.map(function (p, i) { return cardHtml(p, i); }).join('') + '</div>';
      } else {
        var entries = list.map(function (p, i) { return { p: p, i: i }; });
        var html = '';
        CLUSTERS.concat([FALLBACK]).forEach(function (c) {
          var mine = entries.filter(function (e) { return clusterOf(e.p.domain) === c; });
          if (mine.length) html += clusterHtml(c, mine);
        });
        el.main.innerHTML = html;
      }
      wireCovers(el.main);
      wireIcons(el.main);
    }


    function renderModal() {
      var p = state.modalIdx >= 0 ? list[state.modalIdx] : null;
      if (!p) { el.modalRoot.innerHTML = ''; return; }

      var a = artOf(p);
      var noPrev = state.modalIdx <= 0;
      var noNext = state.modalIdx >= list.length - 1;

      var tags = '<span class="tag tag--domain">' + esc(p.domain) + '</span>';
      if (p.aud) tags += '<span class="tag tag--aud">' + esc(p.aud) + '</span>';
      if (p.plat) tags += '<span class="tag tag--plat">' + esc(p.plat) + '</span>';
      if (p.personal) tags += '<span class="tag tag--lock">🔒 אישי</span>';

      el.modalRoot.innerHTML =
        '<div class="overlay overlay--sheet" id="modal-overlay" dir="rtl" role="dialog" aria-modal="true" aria-label="' + esc(p.name) + '">' +
          '<div class="sheet" style="--accent:' + a.pal.c1 + '">' +
            '<button class="btn-close" type="button" id="modal-close" aria-label="סגירה">✕</button>' +
            '<div class="modal__hero" style="background:' + esc(a.wash) + '">' +
              '<span class="modal__icon">' + iconEl(a.pal, 56, a.pal.art, 'motif-' + a.pal.art + '.png') + '</span>' +
              '<span class="modal__label">' + esc(a.short) + '</span>' +
              motifCoverHtml(a.pal.art) +
              coverHtml(p) +
            '</div>' +
            '<div class="modal__body">' +
              '<h3 class="modal__name">' + esc(p.name) + '</h3>' +
              '<div class="modal__rule"></div>' +
              '<div class="modal__tags">' + tags + '</div>' +
              (p.desc ? '<p class="modal__desc">' + esc(p.desc) + '</p>' : '') +
              (p.date ? '<p class="modal__date">' + esc(p.date) + '</p>' : '') +
              '<a class="btn-open" href="' + esc(p.link) + '" target="_blank" rel="noopener">פתיחת התוצר ←</a>' +
              '<div class="modal__nav">' +
                '<button class="btn-nav" type="button" id="modal-next"' + (noNext ? ' disabled' : '') + '>→ הבא</button>' +
                '<button class="btn-nav" type="button" id="modal-prev"' + (noPrev ? ' disabled' : '') + '>הקודם ←</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      wireCovers(el.modalRoot);
      wireIcons(el.modalRoot);
      var close = document.getElementById('modal-close');
      if (close) close.focus();
    }

    /* ---------- פעולות ---------- */

    function scheduleMain() {
      clearTimeout(mainTimer);
      mainTimer = setTimeout(renderMain, 110);
    }

    function openModal(i) {
      lastFocus = document.activeElement;
      state.modalIdx = i;
      renderModal();
    }

    function closeModal() {
      state.modalIdx = -1;
      renderModal();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    }

    function nav(d) {
      var n = state.modalIdx + d;
      if (n >= 0 && n < list.length) { state.modalIdx = n; renderModal(); }
    }

    function goHome() {
      state.query = '';
      state.fDomain = state.fAud = state.fPlat = '';
      state.expanded = {};
      if (el.search) el.search.value = '';
      if (el.fDomain) el.fDomain.value = '';
      if (el.fAud) el.fAud.value = '';
      if (el.fPlat) el.fPlat.value = '';
      renderChips();
      renderMain();
      toTop();
    }

    function openAbout() {
      if (!el.about) return;
      lastFocus = document.activeElement;
      el.about.hidden = false;
      var close = el.about.querySelector('.btn-close');
      if (close) close.focus();
    }

    function closeAbout() {
      if (!el.about) return;
      el.about.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    }

    /* ---------- חיווט אירועים ---------- */

    function wire() {
      if (el.search) {
        el.search.addEventListener('input', function (e) {
          state.query = e.target.value;
          renderChips();
          scheduleMain();
        });
        el.search.addEventListener('search', function (e) {
          state.query = e.target.value;
          renderChips();
          renderMain();
        });
      }

      [['fDomain', 'fDomain'], ['fAud', 'fAud'], ['fPlat', 'fPlat']].forEach(function (pair) {
        var node = el[pair[0]];
        if (!node) return;
        node.addEventListener('change', function (e) { state[pair[1]] = e.target.value; renderMain(); });
      });

      if (el.chips) el.chips.addEventListener('click', function (e) {
        var b = e.target.closest('.chip');
        if (!b) return;
        var w = b.getAttribute('data-kw');
        state.query = norm(state.query) === norm(w) ? '' : w;
        if (el.search) el.search.value = state.query;
        renderChips();
        renderMain();
      });

      if (el.home) el.home.addEventListener('click', goHome);
      if (el.clear) el.clear.addEventListener('click', goHome);
      if (el.aboutOpen) el.aboutOpen.addEventListener('click', openAbout);

      el.main.addEventListener('click', function (e) {
        var card = e.target.closest('.card');
        if (card) { openModal(+card.getAttribute('data-idx')); return; }

        var more = e.target.closest('.btn-more');
        if (more) {
          var key = more.getAttribute('data-cluster');
          state.expanded[key] = !state.expanded[key];
          renderMain();
          return;
        }

        if (e.target.closest('#retry')) load();
      });

      el.modalRoot.addEventListener('click', function (e) {
        if (e.target.id === 'modal-overlay') { closeModal(); return; }
        if (e.target.closest('#modal-close')) { closeModal(); return; }
        if (e.target.closest('#modal-prev')) { nav(-1); return; }
        if (e.target.closest('#modal-next')) { nav(1); }
      });

      if (el.about) el.about.addEventListener('click', function (e) {
        if (e.target === el.about || e.target.closest('.btn-close')) closeAbout();
      });

      document.addEventListener('keydown', function (e) {
        if (state.modalIdx >= 0) {
          if (e.key === 'Escape') closeModal();
          if (e.key === 'ArrowRight') nav(1);
          if (e.key === 'ArrowLeft') nav(-1);
        } else if (el.about && !el.about.hidden && e.key === 'Escape') {
          closeAbout();
        }
      });

      document.addEventListener('scroll', function () {
        var s = scrollPos() > 500;
        if (s !== state.showTop) {
          state.showTop = s;
          el.top.classList.toggle('is-visible', s);
        }
      }, { passive: true, capture: true });

      if (el.top) el.top.addEventListener('click', toTop);
    }

    wire();
    load();

    return { reload: load };
  }

  global.Maagar = {
    start: createApp,
    loadData: loadData,
    helpers: {
      CLUSTERS: CLUSTERS, FALLBACK: FALLBACK,
      clusterOf: clusterOf, artOf: artOf, iconSvg: iconSvg, iconEl: iconEl,
      wireIcons: wireIcons, wireCovers: wireCovers, motifCoverHtml: motifCoverHtml,
      watercolor: watercolor, isHighlighted: isHighlighted,
      parseDate: parseDate, esc: esc, hexA: hexA
    }
  };

})(window);
