import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import http from 'http';
import path from 'path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');
const TSV = readFileSync(new URL('fixture.tsv', import.meta.url), 'utf8');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  try {
    const body = readFileSync(p);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nope'); }
});
await new Promise(r => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : '')); };

const browser = await chromium.launch();

async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => ok('no page errors', false, e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|fonts.googleapis|ERR_|Failed to load resource/.test(m.text())) ok('no console errors', false, m.text()); });
  // stub the sheet fetch + block google fonts (offline env)
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('docs.google.com')) return route.fulfill({ status: 200, contentType: 'text/tab-separated-values; charset=utf-8', body: TSV });
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    return route.continue();
  });
  return page;
}

/* ---------- public page ---------- */
const page = await newPage();
await page.goto(base + '/maagar.html', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.card', { timeout: 8000 });

const cards = await page.locator('.card').count();
const clusters = await page.locator('.cluster').count();
ok('renders clustered view', clusters >= 7, `${clusters} clusters, ${cards} cards visible`);

ok('personal rows excluded from public page',
  !(await page.locator('.card__name', { hasText: 'משהו אישי לגמרי' }).count()));

ok('rows without a link are skipped',
  !(await page.locator('.card__name', { hasText: 'תוצר בלי קישור' }).count()));


const countText = await page.locator('#count').textContent();
ok('count line reads correctly', countText.includes('במאגר 17 תוצרים'), countText);

ok('unknown domain falls into "עוד תוצרים"',
  await page.locator('.cluster__title', { hasText: 'עוד תוצרים' }).count() === 1);

// per-product motif: anchor for העוגן, bridge for גשר, compass for המסע
const motifs = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('.card').forEach(c => {
    const n = c.querySelector('.card__name').textContent;
    out[n] = c.querySelector('.card__thumb').getAttribute('style').slice(0, 200);
  });
  return out;
});
const accentOf = name => {
  const el = name;
  return el;
};
const accents = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll('.card').forEach(c => {
    out[c.querySelector('.card__name').textContent] = c.style.getPropertyValue('--accent').trim();
  });
  return out;
});
ok('anchor motif palette on "העוגן שבפנים"', accents['העוגן שבפנים'] === '#3F6B78', accents['העוגן שבפנים']);
ok('bridge motif palette on "גש\"ר מאח\"ד"', accents['גש"ר מאח"ד'] === '#4E6E8E', accents['גש"ר מאח"ד']);
ok('compass motif palette on "המסע שלי לבטחון"', accents['המסע שלי לבטחון'] === '#2F6B5E', accents['המסע שלי לבטחון']);
ok('breath motif palette on "לוקחים אויר"', accents['לוקחים אויר'] === '#6C8FA6', accents['לוקחים אויר']);
ok('distinct colours across products', new Set(Object.values(accents)).size >= 8, `${new Set(Object.values(accents)).size} distinct accents`);

// watercolour background actually applied (grain + gradients)
const bg = await page.locator('.card__thumb').first().evaluate(e => getComputedStyle(e).backgroundImage);
ok('watercolour background renders', bg.includes('data:image/svg+xml') && (bg.match(/radial-gradient/g) || []).length === 5, bg.slice(0, 60) + '…');
const blend = await page.locator('.card__thumb').first().evaluate(e => getComputedStyle(e).backgroundBlendMode);
ok('soft-light blend preserved', blend.startsWith('soft-light'), blend);

// sort: newest first
const order = await page.evaluate(() => [...document.querySelectorAll('.cluster')][0].querySelectorAll('.card__name'));
const firstCluster = await page.locator('.cluster').first().locator('.card__name').allTextContents();
ok('highlight-then-newest inside a cluster', firstCluster[0] === 'תקווה בכל יום' && firstCluster[1] === 'העוגן שבפנים', firstCluster.join(' | '));

/* ---------- search ---------- */
await page.fill('#search', 'חוסן');
await page.waitForTimeout(300);
ok('search switches to flat grid', await page.locator('.grid--flat').count() === 1);
let n = await page.locator('.card').count();
ok('search "חוסן" finds matches', n >= 3, `${n} results`);

// Hebrew prefix tolerance: "לחוסן" should still find "חוסן"
await page.fill('#search', 'לחוסן');
await page.waitForTimeout(300);
ok('prefix tolerance: "לחוסן" → חוסן', await page.locator('.card').count() === n, `${await page.locator('.card').count()} vs ${n}`);

// quote normalisation: "צלח" finds צל"ח
await page.fill('#search', 'צלח');
await page.waitForTimeout(300);
ok('quote normalisation: "צלח" → צל"ח', await page.locator('.card').count() === 2, `${await page.locator('.card').count()} results`);

// multi-word AND
await page.fill('#search', 'חוסן צוות');
await page.waitForTimeout(300);
ok('multi-word AND search', await page.locator('.card').count() === 1, `${await page.locator('.card').count()} results`);

// empty state
await page.fill('#search', 'זזזזזז');
await page.waitForTimeout(300);
ok('empty state shown', await page.locator('.state-empty').count() === 1);
ok('clear-search button visible while filtering', await page.locator('#clear').isVisible());

// reset via clear
await page.click('#clear');
await page.waitForTimeout(300);
ok('clear resets to clusters', await page.locator('.cluster').count() >= 7 && (await page.inputValue('#search')) === '');

/* ---------- chips ---------- */
const chipCount = await page.locator('.chip').count();
ok('keyword chips built from the sheet', chipCount > 0 && chipCount <= 9, `${chipCount} chips`);
const chipLabel = await page.locator('.chip').first().textContent();
await page.locator('.chip').first().click();
await page.waitForTimeout(300);
ok('chip sets the query', (await page.inputValue('#search')) === chipLabel);
ok('chip marked active', await page.locator('.chip.is-active').count() === 1);
await page.locator('.chip.is-active').click();
await page.waitForTimeout(300);
ok('chip toggles off', (await page.inputValue('#search')) === '');

/* ---------- filters ---------- */
await page.selectOption('#f-domain', 'חוסן ותקווה');
await page.waitForTimeout(300);
ok('domain filter works', await page.locator('.card').count() === 4, `${await page.locator('.card').count()} results`);
await page.click('#home');
await page.waitForTimeout(300);
ok('home button resets filters', (await page.inputValue('#f-domain')) === '' && await page.locator('.cluster').count() >= 7);

/* ---------- show all ---------- */
const before = await page.locator('.cluster').first().locator('.card').count();
ok('cluster previews 4 cards', before === 4, `${before}`);
await page.locator('.cluster').first().locator('.btn-more').click();
await page.waitForTimeout(200);
const after = await page.locator('.cluster').first().locator('.card').count();
ok('"show all" expands the cluster', after > before, `${before} → ${after}`);
await page.locator('.cluster').first().locator('.btn-more').click();
await page.waitForTimeout(200);
ok('"show all" collapses again', await page.locator('.cluster').first().locator('.card').count() === before);

/* ---------- modal ---------- */
/* חיפוש קודם — כדי שהכרטיס הראשון יהיה באמת הראשון ברשימה (מודגשים משנים את הסדר באשכולות) */
await page.fill('#search', 'חוסן');
await page.waitForTimeout(300);
await page.locator('.card').first().click();
await page.waitForSelector('#modal-overlay');
ok('modal opens', await page.locator('.modal__name').isVisible());
const mName = await page.locator('.modal__name').textContent();
ok('modal shows the product link', (await page.locator('.btn-open').getAttribute('href')).startsWith('http'));
ok('modal prev disabled on first item', await page.locator('#modal-prev').isDisabled());
await page.click('#modal-next');
await page.waitForTimeout(150);
ok('next navigates', (await page.locator('.modal__name').textContent()) !== mName);
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(150);
ok('ArrowLeft goes back', (await page.locator('.modal__name').textContent()) === mName);
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
ok('Escape closes modal', await page.locator('#modal-overlay').count() === 0);

await page.locator('.card').first().click();
await page.waitForSelector('#modal-overlay');
await page.mouse.click(195, 60); // overlay area above the sheet
await page.waitForTimeout(150);
ok('overlay click closes modal', await page.locator('#modal-overlay').count() === 0);


/* ---------- back to top ---------- */
await page.fill('#search', '');
await page.waitForTimeout(300);
await page.evaluate(() => window.scrollTo(0, 1400));
await page.waitForTimeout(300);
ok('back-to-top appears after scrolling', await page.locator('#to-top').isVisible());
await page.click('#to-top');
await page.waitForTimeout(700);
ok('back-to-top scrolls up', await page.evaluate(() => window.scrollY) < 50, String(await page.evaluate(() => window.scrollY)));

/* ---------- no horizontal overflow at 390px ---------- */
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('no horizontal overflow at 390px', overflow <= 0, `${overflow}px`);

/* ---------- error state ---------- */
const errPage = await browser.newContext({ viewport: { width: 390, height: 844 } }).then(c => c.newPage());
await errPage.route('**/*', route => {
  const url = route.request().url();
  if (url.includes('docs.google.com')) return route.fulfill({ status: 500, body: 'boom' });
  if (url.includes('fonts.')) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
  return route.continue();
});
await errPage.goto(base + '/maagar.html', { waitUntil: 'domcontentloaded' });
await errPage.waitForSelector('.state-error', { timeout: 8000 });
ok('friendly Hebrew error state on failure', (await errPage.locator('.state-error h3').textContent()).includes('מתקשה להיטען'));

/* ---------- /ishi ---------- */
const ishi = await newPage();
let sheetRequested = false;
ishi.on('request', r => { if (r.url().includes('docs.google.com')) sheetRequested = true; });
await ishi.goto(base + '/ishi.html', { waitUntil: 'domcontentloaded' });
await ishi.waitForTimeout(600);
ok('gate blocks content before unlock', await ishi.locator('#app-shell').isVisible() === false);
ok('no data fetched before unlock', !sheetRequested);

await ishi.fill('#gate-input', 'סיסמה שגויה');
await ishi.click('#gate-form button[type=submit]');
await ishi.waitForTimeout(200);
ok('wrong password rejected', (await ishi.locator('#gate-err').textContent()).includes('אינה נכונה'));
ok('still locked after wrong password', !(await ishi.locator('#app-shell').isVisible()));

await ishi.fill('#gate-input', '  חני בלוי 770  ');
await ishi.click('#gate-form button[type=submit]');
await ishi.waitForSelector('.card', { timeout: 8000 });
ok('correct password unlocks (trimmed)', await ishi.locator('#app-shell').isVisible());
ok('personal rows included on /ishi',
  await ishi.locator('.tag--lock').count() >= 1, `${await ishi.locator('.tag--lock').count()} locked tags`);
ok('/ishi total includes personal row',
  (await ishi.locator('#stat-total').textContent()) === '18', await ishi.locator('#stat-total').textContent());
ok('plaintext password not in source',
  !(await ishi.content()).includes('חני בלוי 770'));

await browser.close();
server.close();

const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
