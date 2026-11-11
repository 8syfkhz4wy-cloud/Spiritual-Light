#!/usr/bin/env node
// Holt täglich News (RSS) und neue Bücher (Deutsche Nationalbibliothek)
// und schreibt sie nach site/data/*.json. Läuft ohne Abhängigkeiten (Node 20+).
// Fällt eine Quelle aus, bleibt der bisherige Stand dieser Rubrik erhalten.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const DATA_DIR = path.join(SITE_DIR, 'data');
const COVER_DIR = path.join(SITE_DIR, 'covers');
const UA = 'Mozilla/5.0 (compatible; SpiritualLight/1.0; feed reader)';

// ---------- Quellen ----------

const GERMANY_FEEDS = [
  { source: 'newslichter', url: 'https://www.newslichter.de/feed/' },
  { source: 'SEIN', url: 'https://www.sein.de/feed/' },
  { source: 'Yoga Aktuell', url: 'https://www.yoga-aktuell.de/feed/' },
  { source: 'Spirit Online', url: 'https://spirit-online.de/feed' },
];

const googleNews = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=de&gl=DE&ceid=DE:de`;

// Kurze Suchanfragen liefern bei Google News deutlich bessere Treffer als lange ODER-Ketten.
const PLACES = ['Jena', 'Thüringen', 'Weimar OR Apolda OR Saale-Holzland'];
const TOPIC_GROUPS = [
  'Yoga OR Meditation OR Achtsamkeit OR spirituell OR Esoterik',
  'Klangschale OR Qigong OR Heilpraktiker OR Schamanismus OR Ayurveda OR Reiki',
  'Kloster OR Pilgern OR Kräuter OR Waldbaden OR Buddhismus OR Retreat',
];
const JENA_FEEDS = PLACES.flatMap((place) =>
  TOPIC_GROUPS.map((topics) => ({ url: googleNews(`${place.includes(' OR ') ? `(${place})` : place} (${topics}) when:120d`) })),
);

// Ein Treffer in der Region muss thematisch passen (Google liefert sonst Beifang).
const TOPIC_RE =
  /yoga|meditat|achtsam|spirit|esoteri|klangschal|qi ?gong|heilprakti|schaman|tarot|astrolog|ayurveda|reiki|pilger|kloster|heilpflanz|kräuter|räucher|mondphase|vollmond|buddhis|mystik|seelsorge|waldbaden|retreat|mantra|chakra/i;
const REGION_RE =
  /(?<![a-zäöüß])(jena|gera(?![a-zäöüß]))|weimar|apolda|saale|thüring|erfurt|eisenberg|kahla|stadtroda|dornburg|rudolstadt|naumburg/i;
// Werbliche / themenfremde Beiträge aus den Magazin-Feeds aussortieren.
const BLOCK_RE = /haschisch|cannabis|cbd|casino|krypto|bitcoin|wettanbieter|sportwetten|kredit|gewinnspiel/i;

// ---------- Hilfen ----------

async function fetchText(url, tries = 2) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
        signal: AbortSignal.timeout(30000),
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '', hellip: '…', ndash: '–', mdash: '—', bdquo: '„', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', laquo: '«', raquo: '»', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', euro: '€' };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : '';
    }
    return e in ENTITIES ? ENTITIES[e] : m;
  });
}

// XML-Feldinhalt -> reiner Text (CDATA auflösen, Entities dekodieren, HTML entfernen)
function clean(raw) {
  if (!raw) return '';
  let s = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  s = decodeEntities(s);
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s); // doppelt kodierte Entities
  return s.replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim();
}

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
};

function shorten(text, max = 180) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 40)).replace(/[\s,;:–-]+$/, '') + ' …';
}

function parseRss(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const it = m[0];
    const link = clean(tag(it, 'link'));
    const title = clean(tag(it, 'title'));
    if (!title || !/^https?:\/\//.test(link)) continue;
    const date = new Date(clean(tag(it, 'pubDate')));
    let summary = clean(tag(it, 'description'))
      .replace(/Der Beitrag .* erschien zuerst auf .*$/i, '')
      .replace(/\[(…|\.\.\.|&hellip;)\]\s*$/, '…')
      .trim();
    items.push({
      title,
      link,
      source: clean(tag(it, 'source')),
      date: isNaN(date) ? null : date.toISOString(),
      summary,
    });
  }
  return items;
}

const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');
const normTitle = (t) => t.toLowerCase().replace(/[^a-z0-9äöüß]+/g, ' ').trim();

function dedupe(items) {
  const seen = new Set();
  return items.filter((i) => {
    const k = normTitle(i.title);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------- News ----------

async function loadGermany() {
  const results = await Promise.allSettled(
    GERMANY_FEEDS.map(async (f) => {
      const items = parseRss(await fetchText(f.url));
      return items
        .filter((i) => !BLOCK_RE.test(i.title + ' ' + i.summary))
        .slice(0, 6)
        .map((i) => ({ ...i, source: f.source, summary: shorten(i.summary) }));
    }),
  );
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.warn(`  ! ${GERMANY_FEEDS[i].source}: ${r.reason?.message}`);
    else console.log(`  ✓ ${GERMANY_FEEDS[i].source}: ${r.value.length} Beiträge`);
  });
  const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  if (!ok.length) return null;
  return dedupe(ok.flat()).sort(byDateDesc).slice(0, 18);
}

async function loadJena() {
  const results = await Promise.allSettled(JENA_FEEDS.map(async (f) => parseRss(await fetchText(f.url))));
  const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.warn(`  ! Region-Suche ${i + 1}: ${r.reason?.message}`);
  });
  if (!ok.length) return null;
  const cutoff = Date.now() - 120 * 86400000;
  const items = ok
    .flat()
    .map((i) => {
      // Google News hängt " - Quelle" an den Titel an
      let title = i.title;
      if (i.source && title.endsWith(` - ${i.source}`)) title = title.slice(0, -(i.source.length + 3));
      return { ...i, title, summary: '' };
    })
    .filter((i) => i.date && new Date(i.date).getTime() > cutoff)
    .filter((i) => TOPIC_RE.test(i.title) && REGION_RE.test(i.title + ' ' + i.source))
    .filter((i) => !BLOCK_RE.test(i.title));
  console.log(`  ✓ Region Jena: ${items.length} passende Treffer`);
  // Meldungen direkt aus Jena zuerst, danach das übrige Thüringen – jeweils die neuesten oben
  const isJena = (i) => /(?<![a-zäöüß])jena/i.test(i.title + ' ' + i.source);
  return dedupe(items)
    .sort((a, b) => isJena(b) - isJena(a) || byDateDesc(a, b))
    .slice(0, 12);
}

// ---------- Bücher (Deutsche Nationalbibliothek, SRU) ----------

async function dnbQuery(query, max = 800) {
  const records = [];
  for (let start = 1; start <= max; start += 100) {
    const url =
      'https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&recordSchema=oai_dc' +
      `&maximumRecords=100&startRecord=${start}&query=${encodeURIComponent(query)}`;
    const xml = await fetchText(url);
    const total = parseInt(tag(xml, 'numberOfRecords'), 10) || 0;
    for (const m of xml.matchAll(/<dc\s[\s\S]*?<\/dc>/g)) records.push(m[0]);
    if (start + 99 >= total) break;
  }
  return records;
}

function parseBook(rec) {
  const all = (name) => [...rec.matchAll(new RegExp(`<dc:${name}([^>]*)>([\\s\\S]*?)</dc:${name}>`, 'g'))];
  const rawTitle = clean(all('title')[0]?.[2] || '');
  if (!rawTitle) return null;
  // "Titel : Untertitel / Verantwortliche"
  // Originaltitel in eckigen Klammern („[The missing peace] ; …“) entfernen
  const main = rawTitle.replace(/\s\/\s[^/]*$/, '').replace(/^\[[^\]]*\]\s*;?\s*/, '');
  const [title, ...rest] = main.split(' : ');
  const ids = all('identifier').map((m) => ({ type: (m[1].match(/xsi:type="([^"]+)"/) || [])[1], value: clean(m[2]) }));
  const idn = ids.find((i) => i.type === 'dnb:IDN')?.value;
  if (!idn) return null;
  const isbnRaw = ids.find((i) => i.type === 'tel:ISBN' && /^97[89]/.test(i.value))?.value || '';
  const isbn = (isbnRaw.match(/^[\d-]+/) || [''])[0].replace(/-/g, '');
  const price = (isbnRaw.match(/EUR (\d+[.,]\d{2}) \(DE\)/) || [])[1];
  const authors = all('creator')
    .map((m) => clean(m[2]).replace(/\s*\[[^\]]*\]\s*$/, ''))
    .filter(Boolean)
    .map((n) => (n.includes(', ') ? n.split(', ').reverse().join(' ') : n));
  const publisher = clean(all('publisher')[0]?.[2] || '').replace(/^.*?\s:\s/, '');
  return {
    idn,
    title: title.trim(),
    subtitle: shorten(rest.join(' – ').trim(), 140),
    author: [...new Set(authors)].filter((a) => a !== publisher).slice(0, 2).join(', '),
    publisher,
    year: clean(all('date')[0]?.[2] || ''),
    isbn,
    price: price ? price.replace('.', ',') + ' €' : '',
    link: `https://d-nb.info/${idn}`,
    type: clean(all('type')[0]?.[2] || ''),
  };
}

const BOOK_SKIP_RE = /kalender|tagesabreiß|planer 20\d\d|notizbuch|malbuch|postkarten|satan/i;
const PUBLISHER_SKIP_RE = /epubli|books on demand|bod –|tredition|independently published|neopubli|remote verlag|\[s\.l\.\]/i;

async function loadBooks() {
  const now = new Date();
  const years = now.getMonth() < 2 ? [now.getFullYear(), now.getFullYear() - 1] : [now.getFullYear()];
  const yearQ = years.map((y) => `jhr=${y}`).join(' or ');
  const queries = [
    `sgt=130 and (${yearQ}) and mat=books and spr=ger`,
    `(sw=Spiritualität or sw=Esoterik or sw=Meditation or sw=Achtsamkeit) and (${yearQ}) and mat=books and spr=ger`,
  ];
  const results = await Promise.allSettled(queries.map((q) => dnbQuery(q)));
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.warn(`  ! DNB-Abfrage ${i + 1}: ${r.reason?.message}`);
    else console.log(`  ✓ DNB-Abfrage ${i + 1}: ${r.value.length} Datensätze`);
  });
  const recs = results.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
  if (!recs.length) return null;

  const seenIdn = new Set();
  const seenTitle = new Set();
  const books = recs
    .map(parseBook)
    .filter(Boolean)
    .filter((b) => b.isbn && b.type !== 'Online-Ressource' && !/^\d{4}$/.test(b.title))
    .filter((b) => !BOOK_SKIP_RE.test(b.title + ' ' + b.subtitle) && !PUBLISHER_SKIP_RE.test(b.publisher))
    // Die IDN wird fortlaufend vergeben: höchste Nummer = zuletzt katalogisiert
    .sort((a, b) => parseInt(b.idn, 10) - parseInt(a.idn, 10))
    .filter((b) => {
      const k = normTitle(b.title);
      if (seenIdn.has(b.idn) || seenTitle.has(k)) return false;
      seenIdn.add(b.idn);
      seenTitle.add(k);
      return true;
    })
    .slice(0, 30)
    .map(({ type, idn, ...b }) => b);
  return books.length ? books : null;
}

// ---------- Buchcover ----------
// Der Cover-Server der DNB zeigt Browsern eine Bot-Prüfung. Darum laden wir die Bilder hier
// herunter und liefern sie zusammen mit der App aus (Ordner site/covers, nicht im Repository).

async function downloadCover(isbn) {
  const res = await fetch(`https://portal.dnb.de/opac/mvb/cover?isbn=${isbn}`, {
    headers: { 'User-Agent': 'SpiritualLight/1.0 (cover fetch)' },
    signal: AbortSignal.timeout(20000),
  });
  const type = res.headers.get('content-type') || '';
  if (!res.ok || !type.startsWith('image/')) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) return null; // Platzhalter
  const file = `${isbn}.${type.includes('png') ? 'png' : 'jpg'}`;
  await writeFile(path.join(COVER_DIR, file), buf);
  return `covers/${file}`;
}

async function addCovers(books) {
  await rm(COVER_DIR, { recursive: true, force: true });
  await mkdir(COVER_DIR, { recursive: true });
  let found = 0;
  const queue = [...books];
  const worker = async () => {
    for (let b; (b = queue.shift()); ) {
      delete b.cover;
      if (!b.isbn) continue;
      const cover = await downloadCover(b.isbn).catch(() => null);
      if (cover) { b.cover = cover; found++; }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log(`  ✓ Cover: ${found} von ${books.length}`);
}

// ---------- Schreiben ----------

async function readJson(file) {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  const stamp = new Date().toISOString();

  console.log('News Deutschland …');
  const germany = await loadGermany();
  console.log('News Region Jena …');
  const jena = await loadJena();
  const oldNews = (await readJson('news.json')) || {};
  const news = {
    updated: germany || jena ? stamp : oldNews.updated || stamp,
    germany: germany || oldNews.germany || [],
    jena: jena || oldNews.jena || [],
  };
  await writeFile(path.join(DATA_DIR, 'news.json'), JSON.stringify(news, null, 1) + '\n');

  console.log('Neue Bücher …');
  const books = await loadBooks().catch((e) => (console.warn('  ! Bücher:', e.message), null));
  const oldBooks = (await readJson('books.json')) || {};
  const out = { updated: books ? stamp : oldBooks.updated || stamp, books: books || oldBooks.books || [] };
  await addCovers(out.books).catch((e) => console.warn('  ! Cover:', e.message));
  await writeFile(path.join(DATA_DIR, 'books.json'), JSON.stringify(out, null, 1) + '\n');

  console.log(`Fertig: ${news.germany.length} News (D), ${news.jena.length} News (Jena), ${out.books.length} Bücher.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
