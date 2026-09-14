// One-shot crawler for the Tokopedia store "isak-billiard" product catalog.
// Usage: node scripts/crawl_catalog.mjs <startPage> <endPage>
// State is appended to tmp/catalog_raw.json (resume-safe: dedupes by href).
import { chromium } from 'playwright-core';
import { writeFileSync, readFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve } from 'path';

const FILE = 'tmp/catalog_raw.json';
const [s, e] = [parseInt(process.argv[2] || '1', 10), parseInt(process.argv[3] || '10', 10)];

// Chrome executable: prefer the playwright-managed path, fall back to distro chromium.
function findChrome() {
  for (const p of ['/opt/google/chrome/chrome', '/usr/bin/chromium', '/usr/bin/google-chrome']) {
    try {
      statSync(p);
      return p;
    } catch {}
  }
  throw new Error('no chrome/chromium binary found');
}

let all = [];
const seen = new Set();
if (existsSync(FILE)) {
  try {
    all = JSON.parse(readFileSync(FILE, 'utf8'));
    all.forEach((c) => seen.add(c.href));
  } catch {}
}

mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch({
  executablePath: findChrome(),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-http2'],
});
const ctx = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  locale: 'id-ID',
});
const page = await ctx.newPage();
let fails = 0;

async function getPage(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1600);
      return true;
    } catch (err) {
      await page.waitForTimeout(1000);
    }
  }
  return false;
}

// Lines that are NOT part of a product title: discount badges (">20%"), prices
// ("Rp1.950.000"), sold counts ("250+ terjual"), ratings ("5.0") and promo copy
// ("Hemat s.d 8% Pakai Bonus"). Tokopedia occasionally puts the badge in DOM
// order before the title, so we take the first non-junk line as the title.
const JUNK_LINE =
  /^(>\s*\d+(?:[.,]\d+)?\s*%|Rp\s?[\d.,]+|\d+(?:[.,]\d+)?\s*\+?\s*terjual|\d+[.,]\d*|Hemat\b.*|Pakai\b.*|Gratis\b.*|Bebas\b.*|Cashback\b.*|Diskon\b.*)$/i;

for (let n = s; n <= e; n++) {
  const url =
    n === 1
      ? 'https://www.tokopedia.com/isak-billiard/product'
      : `https://www.tokopedia.com/isak-billiard/product/page/${n}`;
  const ok = await getPage(url);
  if (!ok) {
    fails++;
    console.log(`page ${n}: FAIL`);
    continue;
  }
  const cards = await page.evaluate((junkRe) => {
    const out = [];
    for (const a of Array.from(document.querySelectorAll('a[href]'))) {
      const h = (a.getAttribute('href') || '').split('?')[0];
      if (!h.startsWith('https://www.tokopedia.com/isak-billiard/')) continue;
      const rest = h.slice('https://www.tokopedia.com/isak-billiard/'.length);
      if (
        rest === '' ||
        /^(product|etalase|ulasan|review|tentang|feed|chat|follow|bertanya|feedback|cart)\b/.test(rest)
      )
        continue;
      const img = a.querySelector('img');
      const imgUrl = (img && (img.currentSrc || img.src || img.getAttribute('data-src'))) || '';
      if (!imgUrl || imgUrl.includes('data:image')) continue;
      const lines = (a.innerText || '').split('\n').map((x) => x.trim()).filter(Boolean);
      if (!lines.length) continue;
      out.push({
        href: h,
        title: lines.find((l) => !junkRe.test(l)) || '',
        price: lines.find((l) => /^Rp\s*[\d.,]+$/.test(l)) || '',
        sold: lines.find((l) => /terjual/i.test(l)) || '',
        imgUrl,
      });
    }
    return out;
  }, JUNK_LINE);
  let fresh = 0;
  const badTitles = cards.filter((c) => /^>\s*\d/.test(c.title));
  for (const c of cards) {
    if (!seen.has(c.href)) {
      seen.add(c.href);
      all.push(c);
      fresh++;
    }
  }
  console.log(
    `page ${n}: cards=${cards.length} new=${fresh} total=${all.length} badTitles=${badTitles.length}`
  );
  writeFileSync(FILE, JSON.stringify(all));
  if (cards.length === 0 && n > 3) {
    console.log('EMPTY_GRID_STOP');
    break;
  }
  await page.waitForTimeout(300);
}
console.log(`RANGE ${s}-${e} DONE fails=${fails} total=${all.length}`);
await browser.close();