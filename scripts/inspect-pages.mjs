/**
 * inspect-pages.mjs — Browse ALL pages via Playwright, extract visible text, find issues.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;

const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };
const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchAll(type) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${STRAPI_URL}/api/${type}?populate=*&pagination[page]=${page}&pagination[pageSize]=50`, { headers });
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data || [];
    all.push(...items);
    if (items.length < 50) break;
    page++;
  }
  return all;
}

async function inspectPage(browser, url, label) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await delay(500);

    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);

    const issues = [];

    // Check for visible artifacts
    if (bodyText.includes('\r')) issues.push('visible \\r chars');
    if (bodyText.includes('&nbsp;')) issues.push('visible &nbsp;');
    if (bodyText.includes('â€')) issues.push('encoding artifact: â€');
    if (bodyText.includes('\\u')) issues.push('escaped unicode');
    if (bodyText.includes('Подробнее..')) issues.push('stale navigation text');
    if (bodyText.includes('>>')) issues.push('raw >> markup');
    if (bodyText.includes('Â ')) issues.push('encoding: Â');
    
    // Check for markdown syntax visible as text
    const mdVisible = bodyText.match(/^#{1,6}\s/gm);
    if (mdVisible) issues.push(`visible markdown headings: ${mdVisible.length}`);

    const brokenImgs = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      let broken = 0;
      for (const img of imgs) {
        if (!img.complete) continue;
        if (img.naturalWidth === 0 || img.naturalHeight === 0) broken++;
      }
      return { total: imgs.length, broken };
    });
    if (brokenImgs.broken > 0) issues.push(`broken images: ${brokenImgs.broken}/${brokenImgs.total}`);

    // Content quality
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
    const status = issues.length === 0 ? '✓ OK' : `⚠ ${issues.length} issues`;

    await page.close();
    return { url, title: title?.slice(0, 80), wordCount, issues, status };
  } catch (err) {
    await page.close().catch(() => {});
    return { url, title: 'ERR', wordCount: 0, issues: [`Load error: ${err.message.slice(0, 80)}`], status: '✗ ERROR' };
  }
}

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });

  // Build URL list
  const urls = [];

  // Static pages
  for (const slug of ['', 'about', 'contacts', 'partners', 'production', 'news', 'catalog', 'rfq']) {
    urls.push({ url: `${BASE}/${slug}`, label: `📄 ${slug || 'home'}` });
  }

  // Categories
  const cats = await fetchAll('categories');
  for (const c of cats.slice(0, 5)) {
    urls.push({ url: `${BASE}/catalog/${c.slug}`, label: `📁 ${c.name?.slice(0, 40)}` });
  }

  // Products (sample 5)
  const prods = await fetchAll('products');
  for (const p of prods.slice(0, 5)) {
    urls.push({ url: `${BASE}/catalog/${p.category?.slug || 'servodrives'}/${p.slug}`, label: `🛒 ${p.name?.slice(0, 40)}` });
  }

  // Articles (all)
  const articles = await fetchAll('articles');
  for (const a of articles) {
    urls.push({ url: `${BASE}/news/${a.slug}`, label: `📰 ${a.title?.slice(0, 50) || a.slug}` });
  }

  console.log(`Inspecting ${urls.length} pages...\n`);

  const results = [];
  let okCount = 0, warnCount = 0, errCount = 0;

  for (const { url, label } of urls) {
    const r = await inspectPage(browser, url, label);
    const icon = r.status.startsWith('✓') ? '✅' : r.status.startsWith('⚠') ? '⚠️' : '❌';
    
    if (r.status.startsWith('✓')) okCount++;
    else if (r.status.startsWith('⚠')) warnCount++;
    else errCount++;
    
    console.log(`${icon} ${label}`);
    if (r.issues.length > 0) {
      for (const issue of r.issues) {
        console.log(`   ↳ ${issue}`);
      }
    }
    if (r.status.includes('ERROR')) {
      console.log(`   ↳ ${r.issues[0]}`);
    }
    
    results.push(r);
    await delay(300);
  }

  await browser.close();

  console.log(`\n=== Summary ===`);
  console.log(`✅ OK: ${okCount}, ⚠️ Warnings: ${warnCount}, ❌ Errors: ${errCount}`);
  console.log(`Total: ${results.length}`);

  // List pages with issues
  const problemPages = results.filter(r => !r.status.startsWith('✓'));
  if (problemPages.length > 0) {
    console.log(`\nPages needing attention:`);
    for (const p of problemPages) {
      console.log(`  ${p.url} — ${p.issues.join('; ')}`);
    }
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
