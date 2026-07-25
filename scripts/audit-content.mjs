/**
 * audit-content.mjs — Analyze ALL Strapi content for formatting issues.
 * Reports: raw HTML tags, \r\n artifacts, encoding issues, broken markdown, etc.
 */

import { writeFileSync } from 'node:fs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;
if (!API_TOKEN) { console.error('❌ STRAPI_TOKEN required'); process.exit(1); }

const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

async function fetchAll(type) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${STRAPI_URL}/api/${type}?populate=*&pagination[page]=${page}&pagination[pageSize]=50`, { headers });
    if (!res.ok) throw new Error(`${type} page ${page}: HTTP ${res.status}`);
    const json = await res.json();
    const items = json.data || [];
    all.push(...items);
    if (items.length < 50) break;
    page++;
  }
  return all;
}

function analyze(text, label) {
  const issues = [];
  if (!text) return issues;

  // 1. Raw HTML tags (should be markdown, not HTML)
  const htmlTags = text.match(/<\/?[a-z][\s\S]*?>/gi) || [];
  if (htmlTags.length > 0) {
    issues.push(`HTML tags: ${[...new Set(htmlTags.map(t => t.replace(/\s+.*/, '>').slice(0, 30)))].join(', ')}`);
  }

  // 2. carriage return artifacts
  const crCount = (text.match(/\r/g) || []).length;
  if (crCount > 0) issues.push(`CR chars: ${crCount}`);

  // 3. Non-breaking spaces encoded
  const nbspCount = (text.match(/&nbsp;/g) || []).length;
  if (nbspCount > 0) issues.push(`&nbsp;: ${nbspCount}`);

  // 4. Double/multiple spaces
  const multiSpace = text.match(/[^\S\r\n]{3,}/g) || [];
  if (multiSpace.length > 0) issues.push(`Multiple spaces: ${multiSpace.length} occurrences`);

  // 5. Encoding artifacts (common parser issues)
  if (text.includes('â')) issues.push('UTF-8 encoding artifact: â€" (emdash)');
  if (text.includes('ï»¿')) issues.push('UTF-8 BOM: ï»¿');
  if (text.includes('�')) issues.push('Replacement character: �');
  if (text.includes('\\u')) issues.push('Escaped unicode: \\uXXXX');

  // 6. Trailing spaces at line ends
  const trailingSpace = text.match(/[^\S\r\n]+\n/g) || [];
  if (trailingSpace.length > 2) issues.push(`Trailing spaces on lines: ${trailingSpace.length}`);

  // 7. Empty paragraphs/headings
  const emptyH = text.match(/^#+\s*$/gm) || [];
  if (emptyH.length > 0) issues.push(`Empty headings: ${emptyH.length}`);

  // 8. Broken markdown links (missing closing paren)
  const brokenLinks = text.match(/\[[^\]]*\]\([^)]*$/gm) || [];  
  // const brokenLinks = text.match(/\[[^\]]+\]\([^)]*(?=\))/g) || [];

  // 9. Special: double H1 titles (duplicate content)
  const h1Count = (text.match(/^# /gm) || []).length;
  if (h1Count > 1) issues.push(`Multiple H1 headings: ${h1Count}`);

  // 10. Content length check (too short = data loss)
  if (text.length < 50) issues.push(`Short content: ${text.length} chars`);

  return issues;
}

async function main() {
  const report = { categories: [], products: [], articles: [] };

  for (const type of ['categories', 'products', 'articles']) {
    console.log(`\n=== ${type.toUpperCase()} ===`);
    const items = await fetchAll(type);
    console.log(`Total: ${items.length}`);

    let withIssues = 0;
    for (const item of items) {
      const slug = item.slug || item.id;
      const fields = [];

      // Check all text fields
      const textFields = {
        name: item.name,
        description: item.description,
        short_desc: item.short_desc,
        content: item.content,
        excerpt: item.excerpt,
      };

      for (const [field, value] of Object.entries(textFields)) {
        if (!value || typeof value !== 'string') continue;
        const issues = analyze(value, field);
        if (issues.length > 0) {
          fields.push({ field, issues });
        }
      }

      if (fields.length > 0) {
        withIssues++;
        report[type].push({ id: item.id, slug, name: item.name?.slice(0, 60) || '', fields });
      }
    }
    console.log(`With issues: ${withIssues}/${items.length}`);
  }

  // Print detailed report
  console.log('\n\n========== DETAILED REPORT ==========');
  for (const [type, entries] of Object.entries(report)) {
    if (entries.length === 0) continue;
    console.log(`\n--- ${type.toUpperCase()} (${entries.length}) ---`);
    for (const entry of entries.slice(0, 20)) {
      console.log(`\n  [${type}] ${entry.slug}`);
      console.log(`  Name: ${entry.name}`);
      for (const f of entry.fields) {
        console.log(`    ${f.field}:`);
        for (const issue of f.issues) {
          console.log(`      ⚠ ${issue}`);
        }
      }
    }
    if (entries.length > 20) console.log(`  ... and ${entries.length - 20} more`);
  }

  // Count total issues
  let totalIssues = 0;
  for (const entries of Object.values(report)) {
    for (const e of entries) {
      for (const f of e.fields) {
        totalIssues += f.issues.length;
      }
    }
  }
  console.log(`\n\nTotal issues found: ${totalIssues}`);

  // Save report
  writeFileSync('content-audit.json', JSON.stringify(report, null, 2));
  console.log('Report saved to content-audit.json');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
