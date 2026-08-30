/* ============================================================
   המעטפת המשותפת של האתר: תפריט, פוטר, נגישות, פופאפ, דף בית, טופס.
   כל עמוד קורא Site.init({page:'home'|'maagar'|'about'|'contact'|'a11y'|'ishi'}).
   ============================================================ */
(function (global) {
  'use strict';

  var WA_URL = 'https://wa.me/972545918770?text=' + encodeURIComponent('שלום חני, הגעתי מהאתר ואשמח להתייעץ');
  var MAIL = 'bloyarava1@gmail.com';
  var PHONE = '054-591-8770';

  /* כתובת ה-Web App של Google Apps Script לטופס הקשר.
     כל עוד היא ריקה — הטופס מציג את חלופת הוואטסאפ במקום להיכשל בשקט. */
  var CONTACT_ENDPOINT = '';

  var NAV = [
    { page: 'home',    href: 'index.html',   label: 'בית',      icon: 'menu-home.png' },
    { page: 'maagar',  href: 'maagar.html',  label: 'המאגר',    icon: 'menu-maagar.png' },
    { page: 'about',   href: 'about.html',   label: 'אודותיי',  icon: 'menu-about.png' },
    { page: 'contact', href: 'contact.html', label: 'צרו קשר',  icon: 'menu-contact.png' }
  ];

  function esc(s) { return Maagar.helpers.esc(s); }

  /* ---------- זיכרון העדפות נגישות — בלבד. עטוף כדי לשרוד דפדפנים חוסמים ---------- */

  var A11Y_KEY = 'chb-a11y';
  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(A11Y_KEY)) || {}; } catch (e) { return {}; }
  }
  function writePrefs(p) {
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(p)); } catch (e) { /* אין אחסון — ההעדפה תחיה רק בעמוד הזה */ }
  }
  function applyPrefs(p) {
    var h = document.documentElement;
    h.className = h.className.replace(/\ba11y-[\w-]+/g, '').trim();
    if (p.fs && p.fs !== 100) h.classList.add('a11y-fs-' + p.fs);
    ['contrast', 'links', 'motion', 'font'].forEach(function (k) {
      if (p[k]) h.classList.add('a11y-' + k);
    });
  }

  /* ---------- הרכבת התפריט והפוטר ---------- */

  function navHtml(current) {
    var items = NAV.map(function (n) {
      return '<li><a class="nav__link" href="' + n.href + '"' +
        (n.page === current ? ' aria-current="page"' : '') + '>' +
        '<span class="ico"><img class="ico__png" src="assets/icons/' + n.icon + '" alt="" data-icon="' + n.icon + '"></span>' +
        esc(n.label) + '</a></li>';
    }).join('');
    return '<a class="skip-link" href="#main-content">דילוג לתוכן</a>' +
      '<div class="nav__inner">' +
        '<a class="nav__brand" href="index.html"><img src="assets/logo.png" alt="הלוגו של חני בלוי"><span>חני בלוי</span></a>' +
        '<button class="nav__burger" type="button" aria-expanded="false" aria-controls="nav-list" aria-label="פתיחת התפריט">☰</button>' +
        '<ul class="nav__list" id="nav-list">' + items + '</ul>' +
      '</div>';
  }

  function footerHtml() {
    return '<div class="footer__rule"></div>' +
      '<div class="footer__name">חני בלוי</div>' +
      '<div class="footer__role">יועצת, מדריכה ומטמיעת כישורי חיים</div>' +
      '<div class="footer__links">' +
        NAV.map(function (n) { return '<a href="' + n.href + '">' + esc(n.label) + '</a>'; }).join('') +
        '<a href="accessibility.html">הצהרת נגישות</a>' +
      '</div>';
  }

  function wireNav(nav) {
    var burger = nav.querySelector('.nav__burger');
    var list = nav.querySelector('.nav__list');
    if (!burger) return;
    function close() {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.textContent = '☰';
    }
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.textContent = open ? '✕' : '☰';
      if (open) { var first = list.querySelector('a'); if (first) first.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); burger.focus(); }
    });
    list.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  }

  /* ---------- פאנל הנגישות ---------- */

  function buildA11y() {
    var prefs = readPrefs();
    applyPrefs(prefs);

    var btn = document.createElement('button');
    btn.className = 'a11y-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'פתיחת תפריט הנגישות');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '♿';
    document.body.appendChild(btn);

    var panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'הגדרות נגישות');
    panel.hidden = true;
    panel.innerHTML =
      '<button class="btn-close" type="button" aria-label="סגירה">✕</button>' +
      '<h2>נגישות</h2>' +
      '<div class="a11y-row"><span id="a11y-fs-label">גודל טקסט</span>' +
        '<div class="a11y-fs" role="group" aria-labelledby="a11y-fs-label">' +
          [100, 115, 130, 150].map(function (v, i) {
            return '<button type="button" data-fs="' + v + '" aria-pressed="false" aria-label="גודל טקסט ' + v + ' אחוז">א' + (i > 0 ? '+'.repeat(i) : '') + '</button>';
          }).join('') +
        '</div></div>' +
      [['contrast', 'ניגודיות גבוהה'], ['links', 'הדגשת קישורים'], ['motion', 'עצירת תנועה'], ['font', 'גופן קריא']]
        .map(function (f) {
          return '<div class="a11y-row"><span>' + f[1] + '</span>' +
            '<button class="a11y-toggle" type="button" data-flag="' + f[0] + '" aria-pressed="false">כבוי</button></div>';
        }).join('') +
      '<div class="a11y-panel__footer">' +
        '<button class="a11y-toggle" type="button" data-reset>איפוס</button>' +
        '<a href="accessibility.html">הצהרת נגישות</a>' +
      '</div>';
    document.body.appendChild(panel);

    function sync() {
      panel.querySelectorAll('[data-fs]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(+b.getAttribute('data-fs') === (prefs.fs || 100)));
      });
      panel.querySelectorAll('[data-flag]').forEach(function (b) {
        var on = !!prefs[b.getAttribute('data-flag')];
        b.setAttribute('aria-pressed', String(on));
        b.textContent = on ? 'פעיל' : 'כבוי';
      });
    }
    sync();

    function toggle(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('.btn-close').focus(); else btn.focus();
    }
    btn.addEventListener('click', function () { toggle(panel.hidden); });
    panel.querySelector('.btn-close').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) toggle(false);
    });

    panel.addEventListener('click', function (e) {
      var fs = e.target.closest('[data-fs]');
      if (fs) { prefs.fs = +fs.getAttribute('data-fs'); }
      var flag = e.target.closest('[data-flag]');
      if (flag) { var k = flag.getAttribute('data-flag'); prefs[k] = !prefs[k]; }
      if (e.target.closest('[data-reset]')) prefs = {};
      if (fs || flag || e.target.closest('[data-reset]')) {
        applyPrefs(prefs); writePrefs(prefs); sync();
      }
    });
  }

  /* ---------- הפופאפ "חדש ורלוונטי עכשיו" — דף הבית בלבד ---------- */

  function showPopup(products) {
    var H = Maagar.helpers;
    var picks = products.filter(function (p) { return H.isHighlighted(p); });
    if (!picks.length) {
      var dated = products.filter(function (p) { return H.parseDate(p.date); });
      if (dated.length) picks = [dated[0]];
    }
    if (!picks.length) return;
    var p = picks[0];
    var a = H.artOf(p);

    var overlay = document.createElement('div');
    overlay.className = 'overlay overlay--center';
    overlay.id = 'popup-overlay';
    overlay.setAttribute('dir', 'rtl');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'חדש ורלוונטי עכשיו');
    overlay.innerHTML =
      '<div class="popup">' +
        '<span class="popup__badge">✨ חדש</span>' +
        '<button class="btn-close" type="button" aria-label="סגירה">✕</button>' +
        '<div class="popup__hero" style="background:' + esc(a.wash) + '">' +
          H.iconEl(a.pal, 44, a.pal.art, 'motif-' + a.pal.art + '.png') +
          H.motifCoverHtml(a.pal.art) +
          H.linkCoverHtml(p) +
        '</div>' +
        '<div class="popup__body">' +
          '<h2 class="popup__title">🌸 חדש ורלוונטי עכשיו</h2>' +
          '<p class="popup__name">' + esc(p.name) + '</p>' +
          (p.desc ? '<p class="popup__desc">' + esc(p.desc) + '</p>' : '') +
          '<div class="popup__actions">' +
            '<a class="btn-primary" href="' + esc(p.link) + '" target="_blank" rel="noopener">לצפייה בתוצר</a>' +
            '<button class="btn-secondary" type="button" data-dismiss>לא עכשיו</button>' +
          '</div>' +
          (picks.length > 1
            ? '<p class="popup__more"><a href="maagar.html">ועוד ' + (picks.length - 1) + ' תוצרים רלוונטיים במאגר ←</a></p>'
            : '') +
        '</div>' +
      '</div>';

    var lastFocus = document.activeElement;
    function close() {
      overlay.remove();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('.btn-close') || e.target.closest('[data-dismiss]')) close();
    });
    document.addEventListener('keydown', onKey);

    setTimeout(function () {
      document.body.appendChild(overlay);
      Maagar.helpers.wireIcons(overlay);
      Maagar.helpers.wireCovers(overlay);
      overlay.querySelector('.btn-close').focus();
    }, 1200);
  }

  /* ---------- דף הבית: סטטיסטיקות, "רלוונטי עכשיו", קוביות האשכולות ---------- */

  function renderHome() {
    var H = Maagar.helpers;
    Maagar.loadData(false).then(function (products) {

      var stats = { total: products.length, domains: {}, auds: {} };
      products.forEach(function (p) {
        if (p.domain) stats.domains[p.domain] = 1;
        if (p.aud) stats.auds[p.aud] = 1;
      });
      var set = function (id, v) { var n = document.getElementById(id); if (n) n.textContent = v; };
      set('stat-total', stats.total);
      set('stat-domains', Object.keys(stats.domains).length);
      set('stat-aud', Object.keys(stats.auds).length);

      /* רלוונטי עכשיו */
      var nowSec = document.getElementById('now-section');
      var nowGrid = document.getElementById('now-grid');
      if (nowSec && nowGrid) {
        var picks = products.filter(function (p) { return H.isHighlighted(p); }).slice(0, 4);
        if (!picks.length) {
          nowSec.hidden = true;
        } else {
          nowSec.hidden = false;
          nowGrid.innerHTML = picks.map(function (p) {
            var a = H.artOf(p);
            return '<a class="card" href="maagar.html?q=' + encodeURIComponent(p.name) + '" style="--accent:' + a.pal.c1 + '">' +
              '<span class="card__thumb" style="background:' + esc(a.wash) + '">' +
                '<span class="card__now">✨ עכשיו</span>' +
                '<span class="card__icon">' + H.iconEl(a.pal, 34, a.pal.art, 'motif-' + a.pal.art + '.png') + '</span>' +
                '<span class="card__label" style="color:' + a.pal.c1 + '">' + esc(a.short) + '</span>' +
                H.motifCoverHtml(a.pal.art) +
                H.linkCoverHtml(p) +
              '</span>' +
              '<span class="card__body">' +
                '<span class="card__name">' + esc(p.name) + '</span>' +
                '<span class="tags"><span class="tag tag--domain">' + esc(p.domain) + '</span></span>' +
              '</span>' +
            '</a>';
          }).join('');
          H.wireIcons(nowGrid);
          H.wireCovers(nowGrid);
        }
      }

      /* קוביות האשכולות */
      var tiles = document.getElementById('cluster-tiles');
      if (tiles) {
        var groups = H.CLUSTERS.concat([H.FALLBACK]);
        tiles.innerHTML = groups.map(function (c) {
          var count = products.filter(function (p) { return H.clusterOf(p.domain) === c; }).length;
          if (!count) return '';
          return '<a class="tile tile--art" href="maagar.html?cluster=' + c.slug + '"' +
            ' style="--tile-wash:' + esc(H.watercolor(c, 1)) + '">' +
            '<span class="tile__artwrap"><img class="tile__art" src="assets/img/cluster-' + c.slug + '.jpg"' +
              ' alt="" loading="lazy" decoding="async"' +
              ' onerror="var t=this.closest(\'.tile\');if(t)t.classList.add(\'tile--noart\');this.parentNode.removeChild(this)"></span>' +
            H.iconEl(c, 46, c.art, 'cluster-' + c.slug + '.png') +
            '<span class="tile__name">' + esc(c.name) + '</span>' +
            '<span class="tile__count">' + count + ' תוצרים</span>' +
          '</a>';
        }).join('');
        H.wireIcons(tiles);
      }

      showPopup(products);
    }).catch(function () {
      var nowSec = document.getElementById('now-section');
      if (nowSec) nowSec.hidden = true;
      /* דף הבית שמיש גם בלי הגיליון — הקוביות פשוט לא יופיעו */
    });
  }

  /* ---------- טופס הקשר ---------- */

  function wireContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="website"]').value) return; /* מלכודת ספאם */

      var name = form.querySelector('[name="name"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();
      if (!name || !message) {
        status.className = 'form-status is-err';
        status.textContent = 'נשמח לשם ולכמה מילים — כדי שנדע למי לחזור ועל מה.';
        return;
      }

      if (!CONTACT_ENDPOINT) {
        /* ה-Apps Script עדיין לא חובר — מפנים לוואטסאפ כדי שאף פנייה לא תלך לאיבוד */
        var text = 'שלום חני, ' + name + ' כאן. ' + message;
        window.open('https://wa.me/972545918770?text=' + encodeURIComponent(text), '_blank', 'noopener');
        status.className = 'form-status is-ok';
        status.textContent = 'פתחנו לך וואטסאפ עם ההודעה המוכנה — רק לשלוח 💬';
        return;
      }

      status.className = 'form-status';
      status.textContent = 'שולחת…';
      var data = new URLSearchParams(new FormData(form));
      fetch(CONTACT_ENDPOINT, { method: 'POST', body: data })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function () {
          form.reset();
          status.className = 'form-status is-ok';
          status.textContent = 'ההודעה נשלחה! אחזור אליכם בהקדם 🌸';
        })
        .catch(function () {
          status.className = 'form-status is-err';
          status.innerHTML = 'משהו השתבש בשליחה. אפשר לנסות שוב — או <a href="' + WA_URL + '" target="_blank" rel="noopener">לכתוב לי ישירות בוואטסאפ</a>.';
        });
    });
  }

  /* ---------- אתחול עמוד ---------- */

  function init(opts) {
    opts = opts || {};
    var header = document.getElementById('site-header');
    if (header) {
      header.innerHTML = navHtml(opts.page);
      wireNav(header);
      Maagar.helpers.wireIcons(header);
    }
    var footer = document.getElementById('site-footer');
    if (footer) footer.innerHTML = footerHtml();

    buildA11y();

    if (opts.page === 'home') renderHome();
    if (opts.page === 'contact') wireContactForm();
  }

  global.Site = { init: init, WA_URL: WA_URL, MAIL: MAIL, PHONE: PHONE };

})(window);
