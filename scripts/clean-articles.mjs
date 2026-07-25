const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;
const headers = { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' };

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const res = await fetch(`${STRAPI_URL}/api/articles?populate=*&pagination[pageSize]=50`, { headers });
  const items = (await res.json()).data || [];
  console.log('Articles found:', items.length);

  let fixed = 0;
  for (const a of items) {
    const id = a.documentId;
    let newTitle = (a.title || '').replace(/ - Линейные системы$/, '').trim();
    let newContent = a.content || '';

    if (newContent) {
      // Fix merged words: латиница после кириллицы
      newContent = newContent.replace(/([а-яё])([A-Z])/g, '$1 $2');
      // Fix phone/email/site formatting
      newContent = newContent.replace(/e-mail:/g, '\n\ne-mail:');
      newContent = newContent.replace(/сайт:/g, '\n\nсайт:');
      newContent = newContent.replace(/телефон:/g, 'телефон: ');
    }

    const body = { data: {} };
    if (newTitle !== a.title) body.data.title = newTitle;
    if (newContent !== a.content) body.data.content = newContent;
    if (Object.keys(body.data).length === 0) continue;

    const putRes = await fetch(`${STRAPI_URL}/api/articles/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
    const ok = putRes.ok;
    const msg = ok ? '[OK]' : `[ERR] ${(await putRes.text()).slice(0, 80)}`;
    console.log(`${msg} ${a.slug}${newTitle !== a.title ? ' (title)' : ''}${newContent !== a.content ? ' (content)' : ''}`);
    if (ok) fixed++;
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('Fixed:', fixed);
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
