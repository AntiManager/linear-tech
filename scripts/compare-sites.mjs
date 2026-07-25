// Compare new site vs old site — marketing content audit
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;

const results = [];

async function fetchAPI(path) {
  const res = await fetch(`${STRAPI_URL}/api/${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) return null;
  return (await res.json()).data;
}

async function checkPage(browser, path, label, checks) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const url = `${BASE}${path}`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    
    const issues = [];
    
    // Screenshot
    const safeName = path === '/' ? 'homepage' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-').replace(/[?&=]/g, '_');
    await page.screenshot({ path: `screenshots/${safeName}.png`, fullPage: true });
    
    // Check title
    const title = await page.title();
    if (!title || title.includes('404')) {
      issues.push(`EMPTY/404 TITLE: "${title}"`);
    }
    
    // Run custom checks
    for (const check of checks || []) {
      const result = await check(page);
      if (result) issues.push(result);
    }
    
    // Check for visible HTML/Markdown artifacts
    const visibleHashes = await page.evaluate(() => {
      const body = document.body.innerText;
      return (body.match(/^#\s/gm) || []).length;
    });
    if (visibleHashes > 0) {
      issues.push(`VISIBLE MARKDOWN: ${visibleHashes} raw heading hashes found`);
    }
    
    // Check for error boundaries / empty states
    const errorTexts = await page.evaluate(() => {
      const body = document.body.innerText.toLowerCase();
      const patterns = ['unhandled error', 'application error', '500', 'something went wrong'];
      return patterns.filter(p => body.includes(p));
    });
    if (errorTexts.length) issues.push(`ERROR PATTERNS: ${errorTexts.join(', ')}`);
    
    const status = issues.length === 0 ? '✅' : '⚠️';
    const msg = issues.length ? `\n  ${issues.join('\n  ')}` : '';
    console.log(`${status} ${label} (${path})${msg}`);
    
    results.push({ label, path, url, issues });
  } catch (err) {
    console.log(`❌ ${label} (${path}): ${err.message}`);
    results.push({ label, path, url, issues: [`LOAD ERROR: ${err.message}`] });
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('Starting comparison audit...\n');
  
  // Ensure screenshots directory
  mkdirSync('screenshots', { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  
  // ===== HOMEPAGE CHECKS =====
  await checkPage(browser, '/', 'Главная', [
    async (page) => {
      const text = await page.evaluate(() => document.body.innerText);
      const missing = [];
      // Key value propositions from old site
      if (!text.includes('официальн')) missing.push('no "официальный представитель"');
      if (!text.includes('382-11-72')) missing.push('no main phone visible');
      if (!text.includes('Екатеринбург')) missing.push('no city visible');
      if (!text.includes('Фронтовых')) missing.push('no address visible');
      // Check that all 17 categories are on page
      const cats = ['Направляющие', 'ШВП', 'Актуатор', 'Модули', 'Сервопривод', 'Профиль', 'Шаговый', 
                     'Подшипники скольжения', 'Прецизионные', 'Роликовые', 'Муфты', 'Виброопоры',
                     'Подшипники качения', 'Рейки', 'Трапецеидальные', 'Шарнирные', 'Шлицевые'];
      const foundCats = cats.filter(c => text.toLowerCase().includes(c.toLowerCase()));
      if (foundCats.length < 15) missing.push(`only ${foundCats.length}/17 categories visible`);
      // Image slider equivalent (hero/banner)
      const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
      if (imgCount < 5) missing.push(`only ${imgCount} images (old site had slider + category images)`);
      return missing.length ? missing.map(m => `HOMEPAGE: ${m}`).join('\n  ') : null;
    }
  ]);
  
  // ===== CATALOG PAGE =====
  await checkPage(browser, '/catalog', 'Каталог (root)', [
    async (page) => {
      const text = await page.evaluate(() => document.body.innerText);
      const missing = [];
      if (!text.includes('Поиск')) missing.push('no search visible');
      const catCount = (text.match(/Направляющие|ШВП|Актуатор|Модули|Сервопривод|Профиль/g) || []).length;
      if (catCount < 4) missing.push('few categories on catalog page');
      return missing.length ? `CATALOG: ${missing.join('; ')}` : null;
    }
  ]);
  
  // ===== CATEGORY PAGES =====
  const categories = await fetchAPI('categories?populate=*&pagination[pageSize]=50');
  if (categories?.length) {
    console.log(`Checking ${categories.length} category pages...`);
    for (const cat of categories) {
      await checkPage(browser, `/catalog/${cat.slug}`, `Категория: ${cat.name}`, [
        async (page) => {
          const text = await page.evaluate(() => document.body.innerText);
          const issues = [];
          if (!text || text.length < 100) issues.push('EMPTY/TOO SHORT content');
          // Check for description (old site had rich descriptions)
          if (!text.includes('Перейти') && !text.includes('Подробнее') && !text.includes('описани')) {
            issues.push('no description text visible');
          }
          // Check for PDF links (old site had PDF download links)
          const pdfLinks = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('.pdf')).length;
          });
          if (pdfLinks === 0) issues.push('no PDF downloads visible');
          // Check product count
          const productCards = await page.evaluate(() => {
            const cards = document.querySelectorAll('article, .card, [data-product]');
            return cards.length;
          });
          if (productCards === 0) issues.push('no product cards found');
          return issues.length ? issues.map(i => `CAT: ${i}`).join('\n  ') : null;
        }
      ]);
    }
  }
  
  // ===== PRODUCT PAGES =====
  const products = await fetchAPI('products?populate=*&pagination[pageSize]=100');
  if (products?.length) {
    console.log(`Checking ${products.length} product pages...`);
    for (const prod of products) {
      const catSlug = prod.category?.slug || 'unknown';
      await checkPage(browser, `/catalog/${catSlug}/${prod.slug}`, `Продукт: ${prod.name}`, [
        async (page) => {
          const text = await page.evaluate(() => document.body.innerText);
          const issues = [];
          if (!text || text.length < 50) issues.push('EMPTY content');
          // Check for specs/characteristics
          const hasSpecs = text.includes('арактеристик') || text.includes('параметр') || text.includes('ехническ');
          if (!hasSpecs) issues.push('no specs/characteristics visible');
          // Check for image
          const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
          if (imgCount < 1) issues.push('no product image');
          // Check for CTA
          const hasCTA = text.includes('Заявк') || text.includes('заказ') || text.includes('опрос');
          if (!hasCTA) issues.push('no call-to-action visible');
          return issues.length ? issues.map(i => `PROD: ${i}`).join('\n  ') : null;
        }
      ]);
    }
  }
  
  // ===== ARTICLE PAGES =====
  const articles = await fetchAPI('articles?populate=*&pagination[pageSize]=50');
  if (articles?.length) {
    console.log(`Checking ${articles.length} article pages...`);
    for (const art of articles) {
      await checkPage(browser, `/news/${art.slug}`, `Статья: ${art.title}`, [
        async (page) => {
          const text = await page.evaluate(() => document.body.innerText);
          const issues = [];
          if (!text || text.length < 50) issues.push('EMPTY content');
          const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
          return issues.length ? `ART: ${issues.join('; ')}` : null;
        }
      ]);
    }
  }
  
  // ===== SERVICE PAGES =====
  await checkPage(browser, '/about', 'О компании', [
    async (page) => {
      const text = await page.evaluate(() => document.body.innerText);
      const missing = [];
      if (!text.includes('официальн')) missing.push('no official rep mention');
      if (!text.includes('склад')) missing.push('no warehouse mention');
      if (!text.includes('2011')) missing.push('no founding year');
      return missing.length ? missing.map(m => `ABOUT: ${m}`).join('\n  ') : null;
    }
  ]);
  
  await checkPage(browser, '/contacts', 'Контакты', [
    async (page) => {
      const text = await page.evaluate(() => document.body.innerText);
      const missing = [];
      if (!text.includes('382-11-72')) missing.push('phone not visible');
      if (!text.includes('Фронтовых')) missing.push('address not visible');
      if (!text.includes('9:00') && !text.includes('18:00')) missing.push('working hours not visible');
      return missing.length ? missing.map(m => `CONTACTS: ${m}`).join('\n  ') : null;
    }
  ]);
  
  await checkPage(browser, '/partners', 'Партнёры');
  await checkPage(browser, '/production', 'Производство');
  await checkPage(browser, '/rfq', 'RFQ/Заявка');
  
  await browser.close();
  
  // Summary
  const totalIssues = results.filter(r => r.issues?.length).length;
  console.log(`\n=== AUDIT SUMMARY ===`);
  console.log(`Total pages: ${results.length}`);
  console.log(`Pages with issues: ${totalIssues}`);
  console.log(`Passed: ${results.length - totalIssues}`);
  
  // Print all issues grouped
  if (totalIssues > 0) {
    console.log(`\n--- DETECTED ISSUES ---`);
    for (const r of results) {
      if (r.issues?.length) {
        console.log(`\n[${r.label}] ${r.url}`);
        r.issues.forEach(i => console.log(`  ${i}`));
      }
    }
  }
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
