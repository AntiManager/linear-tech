// Final content cleanup: strip # headings, fix PDF URLs, strip \r
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;
const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };
const delay = ms => new Promise(r => setTimeout(r, ms));

// PDF files from old site that we might have locally
const OLD_DOMAIN = 'https://www.linear-tech.ru';

function cleanContent(text) {
  if (!text) return '';

  let cleaned = text;

  // 1. Strip leading # Heading (duplicates page title)
  cleaned = cleaned.replace(/^#\s+.+(\r?\n)+/, '');

  // 2. Strip trailing empty lines
  cleaned = cleaned.replace(/\r?\n\s*$/, '');

  // 3. Strip \r characters
  cleaned = cleaned.replace(/\r/g, '');

  // 4. Fix old domain PDF links → strip broken links, keep link text only
  cleaned = cleaned.replace(
    /\[([^\]]+)\]\(https:\/\/www\.linear-tech\.ru(\/[^)]+)\)/g,
    (_, text, path) => text  // Keep the link text, drop the broken URL
  );

  // 5. Clean up multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

function cleanName(name) {
  if (!name) return '';
  return name
    .replace(/ - Линейные системы$/, '')
    .replace(/^Купить /, '')
    .replace(/ купить от официального представителя$/, '')
    .replace(/ купить с доставкой по России$/, '')
    .trim();
}

async function processCollection(type, fields = ['description', 'content', 'short_desc']) {
  console.log(`\n=== Processing ${type} ===`);
  const res = await fetch(`${STRAPI_URL}/api/${type}?populate=*&pagination[pageSize]=100`, { headers });
  const items = (await res.json()).data || [];
  console.log(`Found: ${items.length}`);

  let fixed = 0;
  for (const item of items) {
    const id = item.documentId;
    const data = {};

    // Clean name
    if (item.name && type !== 'articles') {
      const newName = cleanName(item.name);
      if (newName !== item.name) data.name = newName;
    }
    if (item.title && type === 'articles') {
      const newTitle = cleanName(item.title);
      if (newTitle !== item.title) data.title = newTitle;
    }

    // Clean content fields
    for (const field of fields) {
      if (item[field] !== undefined && item[field] !== null) {
        const cleaned = cleanContent(item[field]);
        if (cleaned !== item[field]) {
          data[field] = cleaned;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      process.stdout.write('.');
      continue;
    }

    try {
      const putRes = await fetch(`${STRAPI_URL}/api/${type}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data }),
      });

      if (putRes.ok) {
        const changed = Object.keys(data).join(', ');
        console.log(`\n✓ ${item.slug || item.name || id}: ${changed}`);
        fixed++;
      } else {
        const err = await putRes.text();
        console.log(`\n✗ ${item.slug}: ${err.slice(0, 100)}`);
      }
    } catch (e) {
      console.log(`\n✗ ${item.slug}: ${e.message}`);
    }

    await delay(150);
  }

  console.log(`\nFixed: ${fixed}/${items.length}`);
}

async function main() {
  await processCollection('categories', ['description']);
  await processCollection('products', ['description', 'short_desc']);
  await processCollection('articles', ['content', 'excerpt']);
  console.log('\nDone!');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
