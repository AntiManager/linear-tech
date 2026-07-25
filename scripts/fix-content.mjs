/**
 * fix-content.mjs — Clean up migrated Strapi content:
 * 1. Strip SEO suffix from names + truncate to 100 chars
 * 2. Remove metadata block from descriptions
 * 3. Assign images from data/images-webp/ (with manual overrides)
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;
if (!API_TOKEN) { console.error('❌ STRAPI_TOKEN env var required'); process.exit(1); }
const ROOT_DIR = 'C:\\Users\\evgeniy.bogdanov\\Documents\\Python\\linear-tech';
const WEBP_DIR = join(ROOT_DIR, 'data', 'images-webp');

const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── image mapping — manual overrides for categories ──
// slug → webp filename (without extension) — use the BEST product image
const CATEGORY_IMAGES = {
  'profilnie-napravlyajushie':     'Expo_HG',       // Линейные направляющие HIWIN
  'shariko-vintovye-peredachi-shvp': 'Expo_FSI',    // ШВП
  'actuators-hiwin':               'Expo_LAS',       // Актуаторы
  'linear-modules-hiwin':          'modules_kk',     // Линейные модули
  'servodrives':                   'hiwin-d1',       // Серводвигатели
  'shagovyj-privod':               'FL60STH_500p',   // Шаговый привод
  'alyuminievyj-profil':           'aluminum_profile_t_slot_150', // Алюм. профиль
  'podshipniki-skolzheniya':       'bearing_slide_2',// Подшипники скольжения
  'linyeinye-podshipniki-kacheniya':'fgwh',          // Линейные подшипники
  'pretsizionnye-valy':            'download',       // Прецизионные валы
  'soedinitelnye-mufty':           'BK',             // Соед. муфты
  'promyshlennye-vibroopory':      'FRITEX',         // Виброопоры
  'rolikovie-lineinie-peremecheniya':'dvpic',        // Роликовые направляющие
  'sharnirnye-nakonechniki':       'hex1',           // Шарнирные наконечники
  'shlitsevye-napravlyayushchie':  'fgo',            // Шлицевые направляющие
  'trapetseidalnye-khodovye-vinty-i-gajki': 'female',// Трапец. винты
  'zubchatye-rejki-i-shesterni':   'gear_wheels',    // Зубчатые рейки
};

async function strapiGet(apiPath, params = '') {
  const url = `${STRAPI_URL}/api/${apiPath}${params}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`GET ${apiPath} HTTP ${res.status}`);
  return res.json();
}
async function strapiPut(apiPath, id, data) {
  const url = `${STRAPI_URL}/api/${apiPath}/${id}`;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ data }), signal: AbortSignal.timeout(15000) });
  if (!res.ok) { const err = (await res.text()).slice(0, 200); throw new Error(`PUT HTTP ${res.status}: ${err}`); }
  return res.json();
}
async function strapiUpload(filePath, filename) {
  const buf = readFileSync(filePath);
  const formData = new FormData();
  const blob = new Blob([buf], { type: 'image/webp' });
  formData.append('files', blob, filename);
  const res = await fetch(`${STRAPI_URL}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${API_TOKEN}` }, body: formData, signal: AbortSignal.timeout(60000) });
  if (!res.ok) { const err = (await res.text()).slice(0, 200); throw new Error(`Upload ${res.status}: ${err}`); }
  const arr = await res.json();
  return arr?.[0]?.id || null;
}

function cleanName(name) {
  let n = name
    .replace(/ - Линейные системы$/, '').replace(/ \| Линейные системы$/, '')
    .replace(/^Купить /i, '').replace(/\s+купить(\s+от)?\s*$/i, '')
    .trim();
  if (n.length > 100) n = n.slice(0, 97) + '…';
  if (!n) n = name.slice(0, 100);
  return n;
}

function cleanDescription(desc) {
  if (!desc) return '';
  const lines = desc.split('\n');
  let cleaned = [];
  let inMeta = true;
  for (const line of lines) {
    const t = line.trim();
    if (inMeta) {
      if (t.startsWith('> URL:') || t.startsWith('> Description:') || t.startsWith('> Keywords:') || t === '>' || t === '---') continue;
      inMeta = false;
    }
    if (t.startsWith('> ') && !t.startsWith('> URL:') && !t.startsWith('> Description:') && !t.startsWith('> Keywords:')) { inMeta = false; }
    cleaned.push(line);
  }
  // Trim leading empty lines
  while (cleaned.length > 0 && !cleaned[0].trim()) cleaned.shift();
  while (cleaned.length > 0 && !cleaned[cleaned.length - 1].trim()) cleaned.pop();
  return cleaned.join('\n').trim();
}

function findBestImage(slug, name, webpFiles) {
  // Manual override
  if (CATEGORY_IMAGES[slug]) {
    const target = CATEGORY_IMAGES[slug] + '.webp';
    if (webpFiles.includes(target)) return target;
  }
  // Heuristic: score each image by slug parts
  const parts = slug.toLowerCase().split('-').filter(p => p.length >= 3);
  let best = null, bestScore = 0;
  for (const f of webpFiles) {
    const base = basename(f, '.webp').toLowerCase().replace(/_/g, '-');
    let score = 0;
    for (const p of parts) {
      if (base.includes(p)) score += 8;
      if (base === p) score += 20;
    }
    // Additional matching against product name  
    const nameWords = name.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
    for (const w of nameWords) {
      if (base.replace(/-/g, '').includes(w.replace(/[^a-z0-9]/g, ''))) score += 5;
    }
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return bestScore >= 8 ? best : null;
}

async function main() {
  let webpFiles = readdirSync(WEBP_DIR).filter(f => f.endsWith('.webp'));
  let namesFixed = 0, descsFixed = 0, imagesSet = 0, errors = 0;

  for (const type of ['categories', 'products']) {
    console.log(`\n=== ${type.toUpperCase()} ===`);
    const res = await strapiGet(type, `?populate=*&pagination[pageSize]=100`);
    const items = res.data || [];

    for (const item of items) {
      const id = item.documentId || item.id;
      const slug = item.slug;
      const oldName = item.name || '';
      const oldDesc = item.description || '';

      const newName = cleanName(oldName);
      const newDesc = cleanDescription(oldDesc);

      const update = {};
      const changes = [];

      if (newName !== oldName) { update.name = newName; namesFixed++; changes.push('name'); }
      if (newDesc !== oldDesc) { update.description = newDesc; descsFixed++; changes.push('desc'); }

      if (!item.image) {
        let imgFile = findBestImage(slug, newName, webpFiles);
        if (imgFile) {
          try {
            const imgId = await strapiUpload(join(WEBP_DIR, imgFile), imgFile);
            if (imgId) {
              update.image = imgId;
              webpFiles = webpFiles.filter(f => f !== imgFile); // don't reuse
              imagesSet++;
              changes.push(`image:${imgFile}`);
            }
          } catch (err) {
            console.log(`  [WARN] ${slug}: img upload ${imgFile} — ${err.message}`);
          }
        }
      }

      if (Object.keys(update).length > 0) {
        try {
          await strapiPut(type, id, update);
          console.log(`  [OK] ${slug}: ${changes.join(', ')}`);
        } catch (err) {
          console.log(`  [ERR] ${slug}: ${err.message}`);
          errors++;
        }
      }
      await delay(150);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Names fixed: ${namesFixed}, Descriptions fixed: ${descsFixed}`);
  console.log(`Images assigned: ${imagesSet}, Errors: ${errors}`);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
