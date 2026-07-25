import { readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;
if (!API_TOKEN) {
  console.error('❌ STRAPI_TOKEN environment variable is required');
  process.exit(1);
}
const ROOT_DIR = 'C:\\Users\\evgeniy.bogdanov\\Documents\\Python\\linear-tech';
const DATA_DIR = join(ROOT_DIR, 'data');
const IMAGES_DIR = join(DATA_DIR, 'images');
const IMAGES_WEBP_DIR = join(DATA_DIR, 'images-webp');

const authHeaders = { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };
const authHeadersGet = { 'Authorization': `Bearer ${API_TOKEN}` };

function getSlugFromUrl(url) {
  const u = new URL(url);
  let path = u.pathname.replace(/\/$/, '') || '/';
  if (path === '/') return 'index';
  return path.split('/').filter(Boolean).pop();
}

function getContentType(url) {
  const u = new URL(url);
  let path = u.pathname.replace(/\/$/, '') || '/';
  if (path === '/')               return 'article';
  if (path === '/about')          return 'article';
  if (path === '/contacts')       return 'article';
  if (path === '/partners')       return 'article';
  if (path === '/news')           return 'article';
  if (path.startsWith('/news/'))  return 'article';
  if (/^\/[a-z0-9-]+$/.test(path))   return 'category';
  if (/^\/[a-z0-9-]+\/[a-z0-9-]+$/.test(path)) return 'product';
  return 'article';
}

function parseMarkdown(content) {
  const lines = content.split('\n');
  let title = '';
  let description = '';
  let metaEnd = -1;

  if (lines[0] && lines[0].startsWith('# ')) {
    title = lines[0].replace(/^# /, '').replace(/ - Линейные системы$/, '').trim();
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('> Description:')) {
      description = line.replace('> Description:', '').trim();
    }
    if (line === '---') {
      metaEnd = i;
      break;
    }
  }

  const body = metaEnd >= 0 ? lines.slice(metaEnd + 1).join('\n').trim() : lines.slice(1).join('\n').trim();
  return { title, description, body };
}

function extractImageRefs(markdown) {
  const regex = /!\[.*?\]\(([^)]+)\)/g;
  const refs = [];
  let m;
  while ((m = regex.exec(markdown)) !== null) refs.push(m[1]);
  return [...new Set(refs)];
}

async function strapiGet(apiPath, params = '') {
  const url = `${STRAPI_URL}/api/${apiPath}${params}`;
  const res = await fetch(url, { headers: authHeadersGet, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`GET ${apiPath} HTTP ${res.status}`);
  return res.json();
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function strapiPost(apiPath, data) {
  const url = `${STRAPI_URL}/api/${apiPath}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ data: { ...data, publishedAt: new Date().toISOString() } }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const errText = (await res.text()).slice(0, 300);
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  return res.json();
}

async function strapiUpload(filePath, filename) {
  const formData = new FormData();
  const buffer = readFileSync(filePath);
  const blob = new Blob([buffer]);
  formData.append('files', blob, filename);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_TOKEN}` },
    body: formData,
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const errText = (await res.text()).slice(0, 200);
    throw new Error(`Upload HTTP ${res.status}: ${errText}`);
  }
  const arr = await res.json();
  return arr[0]?.url || null;
}

async function checkStrapiAlive() {
  try {
    const res = await fetch(`${STRAPI_URL}/_health`, { signal: AbortSignal.timeout(5000) });
    return res.status === 204 || res.ok;
  } catch {
    try {
      const res = await fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=1`, {
        headers: authHeaders,
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

async function main() {
  const index = JSON.parse(readFileSync(join(DATA_DIR, 'index.json'), 'utf-8'));
  const pages = index.pages;

  // -- connectivity --
  console.log('Checking Strapi connectivity...');
  if (!(await checkStrapiAlive())) {
    console.log('[ERR] Strapi is not reachable at ' + STRAPI_URL);
    process.exit(1);
  }
  console.log('Strapi is alive.\n');

  // -- STEP 1: convert images to WebP --
  if (!existsSync(IMAGES_WEBP_DIR)) mkdirSync(IMAGES_WEBP_DIR, { recursive: true });

  console.log('=== Converting images to WebP ===');
  const imageFiles = readdirSync(IMAGES_DIR)
    .filter(f => /\.(gif|png|jpe?g)$/i.test(f) && f !== '.gitkeep')
    .sort();

  let imgConv = 0, imgSkip = 0, imgErr = 0;
  for (const file of imageFiles) {
    const webpName = basename(file, extname(file)) + '.webp';
    const webpPath = join(IMAGES_WEBP_DIR, webpName);
    if (existsSync(webpPath)) { imgSkip++; continue; }
    try {
      await sharp(join(IMAGES_DIR, file)).webp({ quality: 80 }).toFile(webpPath);
      imgConv++;
    } catch (err) {
      console.log(`  [ERR] ${file} — ${err.message}`);
      imgErr++;
    }
  }
  console.log(`Images: ${imgConv} converted, ${imgSkip} skipped, ${imgErr} errors\n`);

  // -- STEP 2: import pages --
  const apiPathMap = { category: 'categories', product: 'products', article: 'articles' };
  const imageUploadCache = new Map();

  let total = 0, created = 0, skipped = 0, errors = 0;

  console.log('=== Importing pages to Strapi ===');
  for (const page of pages) {
    total++;
    const slug = getSlugFromUrl(page.url);
    const type = getContentType(page.url);
    const apiPath = apiPathMap[type];

    // read and parse markdown
    const relativePath = page.file.replace(/^data[\\\/]/, '');
    const mdPath = join(DATA_DIR, relativePath);
    let parsed;
    try {
      parsed = parseMarkdown(readFileSync(mdPath, 'utf-8'));
    } catch (err) {
      console.log(`[ERR] ${slug} — file read error: ${err.message}`);
      errors++;
      continue;
    }

    const firstLineTitle = parsed.title;
    if (!firstLineTitle) {
      console.log(`[ERR] ${slug} — no H1 found in markdown`);
      errors++;
      continue;
    }

    // replace image refs with uploaded Strapi URLs
    const imageRefs = extractImageRefs(parsed.body);
    let updatedBody = parsed.body;
    for (const ref of imageRefs) {
      const refName = basename(ref);
      const refExt = extname(ref).toLowerCase();
      if (!['.gif', '.png', '.jpg', '.jpeg'].includes(refExt)) continue;

      const webpName = basename(ref, extname(ref)) + '.webp';
      const webpPath = join(IMAGES_WEBP_DIR, webpName);
      if (!existsSync(webpPath)) continue;

      let strapiUrl = imageUploadCache.get(webpName);
      if (!strapiUrl) {
        try {
          strapiUrl = await strapiUpload(webpPath, webpName);
          if (strapiUrl) {
            if (!strapiUrl.startsWith('http')) strapiUrl = `${STRAPI_URL}${strapiUrl}`;
            imageUploadCache.set(webpName, strapiUrl);
          }
        } catch (err) {
          console.log(`  [WARN] ${slug} — upload ${refName}: ${err.message}`);
        }
      }
      if (strapiUrl) updatedBody = updatedBody.replaceAll(ref, strapiUrl);
    }

    // check existence
    try {
      const checkData = await strapiGet(apiPath, `?filters[slug][$eq]=${encodeURIComponent(slug)}`);
      if (Array.isArray(checkData.data) && checkData.data.length > 0) {
        console.log(`[SKIP] ${slug} — already exists`);
        skipped++;
        continue;
      }
    } catch (err) {
      console.log(`[ERR] ${slug} — check failed: ${err.message}`);
      errors++;
      continue;
    }

    // build payload — field names match actual Strapi schemas
    let payload;
    if (type === 'article') {
      payload = { title: firstLineTitle, slug, content: updatedBody, excerpt: parsed.description };
    } else if (type === 'category') {
      payload = { name: firstLineTitle, slug, description: updatedBody };
    } else {
      payload = { name: firstLineTitle, slug, description: updatedBody, short_desc: parsed.description };
    }

    // create
    try {
      const result = await strapiPost(apiPath, payload);
      const id = result.data?.documentId || result.data?.id || '?';
      console.log(`[OK] ${type} ${slug} — created (id: ${id})`);
      created++;
    } catch (err) {
      console.log(`[ERR] ${slug} — ${err.message}`);
      errors++;
    }

    await delay(150);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${total}, Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
  if (errors === 0) console.log('Migration completed successfully.');
  else process.exit(1);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
