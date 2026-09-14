// Debug: dump innerText lines + aria-label + candidate selectors for product cards.
// Usage: node scripts/debug_cards.mjs <pageN>
import { chromium } from 'playwright-core';

const n = parseInt(process.argv[2] || '1', 10);
const url =
  n === 1
    ? 'https://www.tokopedia.com/isak-billiard/product'
    : `https://www.tokopedia.com/isak-billiard/product/page/${n}`;

const browser = await chromium.launch({
  executablePath: '/opt/google/chrome/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-http2'],
});
const ctx = await browser.newContext({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  locale: 'id-ID',
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
await page.waitForTimeout(2000);

const cards = await page.evaluate(() => {
  const out = [];
  for (const a of Array.from(document.querySelectorAll('a[href]'))) {
    const h = (a.getAttribute('href') || '').split('?')[0];
    if (!h.startsWith('https://www.tokopedia.com/isak-billiard/')) continue;
    const rest = h.slice('https://www.tokopedia.com/isak-billiard/'.length);
    if (rest === '' || /^(product|etalase|ulasan|review|tentang|feed|chat|follow|bertanya|feedback|cart)\b/.test(rest)) continue;
    const img = a.querySelector('img');
    const imgUrl = (img && (img.currentSrc || img.src || img.getAttribute('data-src'))) || '';
    if (!imgUrl || imgUrl.includes('data:image')) continue;
    const lines = (a.innerText || '').split('\n').map((x) => x.trim()).filter(Boolean);
    out.push({
      href: h,
      lines,
      aria: a.getAttribute('aria-label') || '',
      titleAttr: a.getAttribute('title') || '',
      nameSel: (a.querySelector('[data-testid*="ProductName"],[data-testid*="product-name"],h2,h3,[class*="name" i]') || {}).innerText || '',
      html: a.innerHTML.slice(0, 1200),
    });
  }
  return out;
});

console.log('URL:', url);
console.log('cards matched:', cards.length);
cards.slice(0, 6).forEach((c, i) => {
  console.log('----- card', i, c.href.replace('https://www.tokopedia.com/isak-billiard/', ''));
  console.log('lines[0..5]:', JSON.stringify(c.lines.slice(0, 6)));
  console.log('aria:', c.aria);
  console.log('titleAttr:', c.titleAttr);
  console.log('namedSel:', c.parent);
  console.log('html head:', c.html.slice(0, 500));
});
await browser.close();