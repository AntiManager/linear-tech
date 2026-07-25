// Clean category names — strip SEO suffixes
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;
const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

const delay = ms => new Promise(r => setTimeout(r, ms));

// Clean name: remove SEO garbage
function cleanCategoryName(name) {
  if (!name) return name;
  let cleaned = name.trim();

  // Strip known SEO suffixes and prefixes
  cleaned = cleaned
    .replace(/ - Линейные системы$/, '')
    .replace(/^Купить /, '')
    .replace(/ купить от официального представителя$/, '')
    .replace(/ купить от официального дилера$/, '')
    .replace(/ купить в ООО Линейные Системы$/, '')
    .replace(/ купить с доставкой по России$/, '')
    .replace(/ от официального представителя$/, '')
    .replace(/ от производителя$/, '')
    .replace(/ от производителя Hiwin$/, '')
    .replace(/ для ЧПУ станков$/, '')
    .replace(/ для ЧПУ$/, '')
    .replace(/ и дополнительных аксессуаров$/, '')
    .replace(/ и другого оборудования$/, '')
    .replace(/ и гаек$/, '')
    .replace(/ с доставкой по России$/, '')
    .replace(/ 12 Вольт/, '')  // random voltage in name
    .replace(/ Хивин/, '')
    .replace(/ \(Хивин\)/, '')
    .replace(/ Hiwin/, ' HIWIN')
    .replace(/\s+/g, ' ')
    .trim();

  // Fix capitalization: "hiwin" → "HIWIN"
  cleaned = cleaned
    .replace(/\bHiwin\b/g, 'HIWIN')
    .replace(/\bhiwin\b/gi, 'HIWIN');

  // Ensure HIWIN suffix for HIWIN categories
  const hiwinCats = ['направляющие', 'швп', 'актуатор', 'модули', 'серво'];
  const isHiwin = hiwinCats.some(kw => cleaned.toLowerCase().includes(kw));

  if (isHiwin && !cleaned.includes('HIWIN')) {
    cleaned = cleaned + ' HIWIN';
  }

  return cleaned.trim();
}

async function main() {
  console.log('Fetching categories...');
  const res = await fetch(`${STRAPI_URL}/api/categories?populate=*&pagination[pageSize]=50`, { headers });
  const items = (await res.json()).data || [];
  console.log(`Found ${items.length} categories\n`);

  let fixed = 0;
  for (const cat of items) {
    const oldName = cat.name;
    const newName = cleanCategoryName(oldName);

    if (newName !== oldName) {
      console.log(`BEFORE: "${oldName}"`);
      console.log(`AFTER:  "${newName}"`);

      const putRes = await fetch(`${STRAPI_URL}/api/categories/${cat.documentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ data: { name: newName } }),
      });

      if (putRes.ok) {
        console.log('  ✓ UPDATED\n');
        fixed++;
      } else {
        const err = await putRes.text();
        console.log(`  ✗ FAILED: ${err.slice(0, 100)}\n`);
      }
    } else {
      console.log(`SKIP: "${oldName}" (no change)\n`);
    }

    await delay(150);
  }

  console.log(`\nFixed: ${fixed}/${items.length}`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
