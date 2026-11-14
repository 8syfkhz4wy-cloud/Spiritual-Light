import { QUOTES, TIPS, DISHES, BIRTHDAY } from './content.js';

const NAME = 'Annett';
// Heimatort: gilt, solange kein Standort freigegeben ist
const HOME = { name: 'Jena', lat: 50.927, lon: 11.586, auto: false };

// ---------- kleine Helfer ----------

const $ = (sel) => document.querySelector(sel);

/** DOM-Element bauen; Texte werden immer als Text (nie als HTML) eingesetzt. */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k === 'html') el.innerHTML = v; // nur für eigene, feste SVG-Icons
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const svg = (inner, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}">${inner}</svg>`;

const ICONS = {
  heart: '<path d="M12 20s-7.500-4.600-7.500-10.200A4.200 4.200 0 0 1 12 7.300a4.200 4.200 0 0 1 7.500 2.500C19.500 15.400 12 20 12 20z"/>',
  bolt: '<path d="M13 3 5.500 13.500H11L10 21l8.500-10.500H13z"/>',
  bone: '<path d="M8.500 8.500l7 7"/><circle cx="7" cy="5.500" r="2"/><circle cx="5.500" cy="7" r="2"/><circle cx="17" cy="18.500" r="2"/><circle cx="18.500" cy="17" r="2"/>',
  wind: '<path d="M3 9h10.500a2.800 2.800 0 1 0-2.800-2.800M3 14h15a2.800 2.800 0 1 1-2.800 2.800M3 18.500h6"/>',
  moon: '<path d="M20 14.300A8 8 0 1 1 9.700 4a6.400 6.400 0 0 0 10.300 10.300z"/>',
  smile: '<circle cx="12" cy="12" r="8.500"/><path d="M8.500 14c1 1.300 2.100 2 3.500 2s2.500-.700 3.500-2M9 10h.010M15 10h.010"/>',
  flower: '<circle cx="12" cy="12" r="2.200"/><circle cx="12" cy="6.300" r="2.800"/><circle cx="17.400" cy="10.200" r="2.800"/><circle cx="15.300" cy="16.600" r="2.800"/><circle cx="8.700" cy="16.600" r="2.800"/><circle cx="6.600" cy="10.200" r="2.800"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>',
  cloud: '<path d="M7 18.500a4 4 0 0 1-.500-8 5.500 5.500 0 0 1 10.600 1.200A3.400 3.400 0 0 1 17 18.500z"/>',
  rain: '<path d="M7 15.500a4 4 0 0 1-.500-8 5.500 5.500 0 0 1 10.600 1.200A3.400 3.400 0 0 1 17 15.500zM8.500 18.500l-1 2M12.500 18.500l-1 2M16.500 18.500l-1 2"/>',
  snow: '<path d="M7 15a4 4 0 0 1-.500-8 5.500 5.500 0 0 1 10.600 1.200A3.400 3.400 0 0 1 17 15zM8 19h.010M12 20.500h.010M16 19h.010M10 17.500h.010M14 17.500h.010"/>',
  fog: '<path d="M7 13.500a4 4 0 0 1-.500-8 5.500 5.500 0 0 1 10.600 1.200 3.400 3.400 0 0 1-.100 6.800M4 17h16M6.500 20.500h11"/>',
  storm: '<path d="M7 15a4 4 0 0 1-.500-8 5.500 5.500 0 0 1 10.600 1.200A3.400 3.400 0 0 1 17 15M12.500 13l-2.500 4h3.500l-2 4"/>',
  suncloud: '<circle cx="8" cy="8" r="3"/><path d="M8 2.500V3.500M2.500 8H3.500M4.100 4.100l.700.700M11.900 4.100l-.700.700M10 19.500a3.500 3.500 0 0 1-.300-7 4.800 4.800 0 0 1 9.200 1 3 3 0 0 1-.400 6z"/>',
  share: '<path d="M12 15V4M8 7.500 12 3.500l4 4M5 12.500v6a1.500 1.500 0 0 0 1.500 1.500h11a1.500 1.500 0 0 0 1.500-1.500v-6"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14z"/><path d="M5 19c3-4 6-7 10-9.500"/>',
  drop: '<path d="M12 3.500c3.500 4.200 6 7.500 6 10.500a6 6 0 0 1-12 0c0-3 2.500-6.300 6-10.500z"/>',
  gauge: '<path d="M4.500 17a8 8 0 1 1 15 0"/><path d="M12 14l3.500-4.500"/><circle cx="12" cy="14" r="1.200"/>',
  sunrise: '<path d="M3 18.500h18M6.500 18.500a5.500 5.500 0 0 1 11 0M12 3.500v6M9.200 6.200 12 3.500l2.800 2.700"/>',
  sunset: '<path d="M3 18.500h18M6.500 18.500a5.500 5.500 0 0 1 11 0M12 3.500v6M9.200 6.800 12 9.500l2.800-2.700"/>',
  chevron: '<path d="M9 5.500 15.500 12 9 18.500"/>',
  back: '<path d="M15 5.500 8.500 12 15 18.500"/>',
};

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** fortlaufende Tagesnummer (lokale Zeit) – Grundlage für „jeden Tag etwas anderes“ */
const dayNumber = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
const fmt1 = (n) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

function relDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = dayNumber() - dayNumber(d);
  if (diff <= 0) return 'heute';
  if (diff === 1) return 'gestern';
  if (diff < 7) return `vor ${diff} Tagen`;
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: diff > 300 ? 'numeric' : undefined });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** JSON laden; bei kurzen Netzaussetzern bis zu zwei weitere Versuche. */
async function getJson(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i >= tries) throw err;
      await wait(800 * i);
    }
  }
}

// ---------- Kopf, Spruch, Tipp ----------

const isBirthday = (d = new Date()) => d.getMonth() + 1 === BIRTHDAY.month && d.getDate() === BIRTHDAY.day;

function renderHeader() {
  const now = new Date();
  const hour = now.getHours();
  const hello = hour < 5 ? 'Gute Nacht' : hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Schönen Tag' : 'Guten Abend';
  const date = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#greeting').textContent = isBirthday(now) ? `Alles Liebe, ${NAME}` : `${hello}, ${NAME}`;
  $('#today-date').textContent = isBirthday(now) ? `${date} · Dein Geburtstag` : date;
}

// ---------- Geburtstag ----------

function renderBirthday() {
  const box = $('#birthday');
  const today = isBirthday();
  box.hidden = !today;
  document.body.classList.toggle('is-birthday', today);
  if (!today) return box.replaceChildren();

  const note = h('p', { class: 'wish-note' }, 'Schließ kurz die Augen, denk an deinen Herzenswunsch – und zünde die Kerze an.');
  const candle = h('span', { class: 'candle', 'aria-hidden': 'true', html:
    '<svg viewBox="0 0 60 90"><g class="flame"><path d="M30 6c7 10 9 15 9 20a9 9 0 0 1-18 0c0-5 2-10 9-20z" fill="#e9b07a"/><path d="M30 16c3.5 5 4.500 8 4.500 10.500a4.500 4.500 0 0 1-9 0c0-2.500 1-5.500 4.500-10.500z" fill="#f8e2b8"/></g>' +
    '<path d="M30 30v8" stroke="#3f5144" stroke-width="2" stroke-linecap="round"/><rect x="20" y="38" width="20" height="44" rx="5" fill="#fffaf0" stroke="#c9b9a0" stroke-width="1.5"/>' +
    '<path d="M20 52c7 4 13-4 20 0M20 66c7 4 13-4 20 0" fill="none" stroke="#d9a58d" stroke-width="1.5"/></svg>' });
  const button = h('button', { class: 'wish-btn', type: 'button', onclick: () => {
    box.classList.add('is-lit');
    button.textContent = 'Dein Wunsch ist auf dem Weg ✨';
    button.disabled = true;
    note.textContent = 'Möge er sich auf die schönste Weise erfüllen – zur richtigen Zeit.';
    launchPetals(26);
  } }, 'Kerze anzünden');

  box.replaceChildren(
    h('span', { class: 'eyebrow' }, 'Dein besonderer Tag'),
    h('h2', { class: 'bday-title' }, BIRTHDAY.title),
    h('p', { class: 'bday-text' }, BIRTHDAY.blessing),
    h('p', { class: 'bday-sign' }, BIRTHDAY.sign),
    candle,
    note,
    button,
  );
  launchPetals(34);
}

/** Sanft herabschwebende Blüten und Blätter – nur kurz, und nicht bei „Bewegung reduzieren“. */
function launchPetals(count) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#d9a58d', '#e8c4b4', '#9caf88', '#bcd6c3', '#e0c98f', '#cf9a80'];
  const layer = h('div', { class: 'petals', 'aria-hidden': 'true' });
  for (let i = 0; i < count; i++) {
    const size = 8 + Math.random() * 10;
    layer.append(h('i', { style:
      `left:${Math.random() * 100}%;width:${size}px;height:${size * 0.7}px;background:${colors[i % colors.length]};` +
      `animation-duration:${5 + Math.random() * 5}s;animation-delay:${Math.random() * 2.5}s;--sway:${(Math.random() * 60 - 30).toFixed(0)}px;--spin:${(Math.random() * 540 - 270).toFixed(0)}deg` }));
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 13000);
}

function renderQuote() {
  const q = isBirthday() ? BIRTHDAY.quote : QUOTES[dayNumber() % QUOTES.length];
  const text = `„${q.text}“`;
  const shareData = { text: `${text}\n– ${q.author}` };
  const canShare = typeof navigator.share === 'function';
  $('#quote').replaceChildren(...[
    h('span', { class: 'quote-sun', html: svg('<path d="M3 17.500h18M6.500 17.500a5.500 5.500 0 0 1 11 0M12 6.500v2.500M5.300 9.800l1.800 1.800M18.700 9.800l-1.800 1.800M7 21h10"/>') }),
    h('span', { class: 'eyebrow' }, 'Spruch des Tages'),
    h('p', { class: `quote-text${q.text.length > 110 ? ' is-long' : ''}` }, text),
    h('p', { class: 'quote-author' }, `— ${q.author}`),
    canShare &&
      h('button', { class: 'share', onclick: () => navigator.share(shareData).catch(() => {}) },
        h('span', { html: svg(ICONS.share) }), 'Teilen'),
  ].filter(Boolean));
}

const inSeason = (ranges, md) => ranges.some(([from, to]) => (from <= to ? md >= from && md <= to : md >= from || md <= to));

/** Festtags- und Mondgerichte haben an ihren Tagen Vorrang, sonst wechseln die übrigen Gerichte reihum. */
function pickDish(date = new Date()) {
  const md = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const moon = moonInfo(date);
  const phase = moon.nearFull ? 'full' : moon.f < 0.04 || moon.f > 0.96 ? 'new' : null;
  const special = DISHES.find((d) => d.season && inSeason(d.season, md)) || (phase && DISHES.find((d) => d.moon === phase));
  if (special) return special;
  const pool = DISHES.filter((d) => !d.season && !d.moon);
  return pool[(dayNumber(date) * 11 + 5) % pool.length];
}

function renderDish() {
  const d = isBirthday() ? BIRTHDAY.dish : pickDish();
  const details = h('details', { class: 'recipe' },
    h('summary', {}, 'Rezept anzeigen'),
    h('div', { class: 'recipe-body' },
      h('h4', {}, 'Zutaten'),
      h('ul', {}, d.ingredients.map((i) => h('li', {}, i))),
      h('h4', {}, 'Zubereitung'),
      h('ol', {}, d.steps.map((s) => h('li', {}, s)))));
  $('#dish').replaceChildren(
    h('div', {}, h('span', { class: 'eyebrow' }, 'Gericht des Tages'), h('span', { class: 'tag' }, d.topic)),
    h('h3', {}, d.title),
    h('p', { class: 'dish-meaning' }, d.meaning),
    h('p', { class: 'dish-meta' }, `${d.time} · ${d.servings} ${d.servings === 1 ? 'Portion' : 'Portionen'}`),
    details,
  );
}

function renderTip() {
  // anderer Takt als bei den Sprüchen, damit sich Paare nicht wiederholen
  const t = isBirthday() ? BIRTHDAY.tip : TIPS[(dayNumber() * 7 + 3) % TIPS.length];
  $('#tip').replaceChildren(
    h('div', {}, h('span', { class: 'eyebrow' }, 'Tipp des Tages'), h('span', { class: 'tag' }, t.topic)),
    h('h3', {}, t.title),
    h('p', {}, t.text),
  );
}

// ---------- Standort ----------

const PLACE_KEY = 'spiritual-light:place';
let place = loadPlace() || HOME;

function loadPlace() {
  try {
    const p = JSON.parse(localStorage.getItem(PLACE_KEY));
    return p && Number.isFinite(p.lat) && Number.isFinite(p.lon) ? p : null;
  } catch {
    return null;
  }
}

function storePlace(p) {
  try { localStorage.setItem(PLACE_KEY, JSON.stringify(p)); } catch {}
}

/** Aktuelle Position (auf ca. 1 km gerundet) oder null, wenn nicht erlaubt bzw. nicht verfügbar. */
function getPosition() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    const giveUp = setTimeout(() => resolve(null), 15000); // falls die Nachfrage unbeantwortet bleibt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(giveUp);
        resolve({ lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2) });
      },
      () => {
        clearTimeout(giveUp);
        resolve(null);
      },
      { enableHighAccuracy: false, maximumAge: 30 * 60000, timeout: 12000 },
    );
  });
}

async function placeName(lat, lon) {
  try {
    const r = await getJson(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=de`, 2);
    return r.city || r.locality || r.principalSubdivision || null;
  } catch {
    return null;
  }
}

/** Standort automatisch bestimmen; sonst bleibt der letzte bekannte Ort bzw. Jena. */
async function locate() {
  const pos = await getPosition();
  if (!pos) return place;
  const same = place.auto && Math.abs(place.lat - pos.lat) < 0.03 && Math.abs(place.lon - pos.lon) < 0.03;
  if (same) return place;
  place = { name: (await placeName(pos.lat, pos.lon)) || 'Dein Standort', ...pos, auto: true };
  storePlace(place);
  return place;
}

// ---------- Mond ----------

function moonInfo(date = new Date()) {
  const SYNODIC = 29.530588853;
  const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // bekannter Neumond
  const age = ((((date.getTime() - NEW_MOON) / 86400000) % SYNODIC) + SYNODIC) % SYNODIC;
  const f = age / SYNODIC; // 0 = Neumond, 0.5 = Vollmond
  const lit = (1 - Math.cos(2 * Math.PI * f)) / 2;
  const names = [
    [0.02, 'Neumond'], [0.235, 'Zunehmende Sichel'], [0.265, 'Erstes Viertel'], [0.48, 'Zunehmender Mond'],
    [0.52, 'Vollmond'], [0.735, 'Abnehmender Mond'], [0.765, 'Letztes Viertel'], [0.98, 'Abnehmende Sichel'], [1.01, 'Neumond'],
  ];
  const name = names.find(([limit]) => f < limit)[1];
  const daysToFull = (((0.5 - f) * SYNODIC) + SYNODIC) % SYNODIC;
  const daysToNew = (1 - f) * SYNODIC;
  return { f, lit, name, daysToFull, daysToNew, nearFull: Math.abs(f - 0.5) * SYNODIC <= 1.2 };
}

function moonSvg(m) {
  // beleuchteter Teil als Pfad: Außenbogen + Terminator-Ellipse
  const r = 10;
  const waxing = m.f < 0.5;
  const rx = Math.abs(Math.cos(2 * Math.PI * m.f)) * r;
  const outer = waxing ? 1 : 0;
  const inner = m.lit > 0.5 ? outer : 1 - outer;
  const d = `M12 2 A${r} ${r} 0 0 ${outer} 12 22 A${rx.toFixed(2)} ${r} 0 0 ${inner} 12 2Z`;
  return `<svg viewBox="0 0 24 24" class="moon" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--moon-dark)"/><path d="${d}" fill="var(--moon-lit)"/></svg>`;
}

// ---------- Wetter & Biowetter ----------

const WEATHER = [
  [[0], 'Klar', 'sun'], [[1, 2], 'Heiter bis wolkig', 'suncloud'], [[3], 'Bedeckt', 'cloud'],
  [[45, 48], 'Nebel', 'fog'], [[51, 53, 55, 56, 57], 'Nieselregen', 'rain'],
  [[61, 63, 65, 66, 67, 80, 81, 82], 'Regen', 'rain'], [[71, 73, 75, 77, 85, 86], 'Schnee', 'snow'],
  [[95, 96, 99], 'Gewitter', 'storm'],
];
const weatherOf = (code) => {
  const hit = WEATHER.find(([codes]) => codes.includes(code));
  return hit ? { label: hit[1], icon: hit[2] } : { label: 'Wechselhaft', icon: 'cloud' };
};

const LEVELS = ['günstig', 'leicht', 'spürbar', 'stark'];
const clamp = (n) => Math.max(0, Math.min(3, Math.round(n)));

async function loadWeather(p = HOME) {
  const base = `latitude=${p.lat}&longitude=${p.lon}&timezone=auto`;
  const [w, air] = await Promise.all([
    getJson(
      `https://api.open-meteo.com/v1/forecast?${base}&past_days=1&forecast_days=8` +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code,is_day' +
        '&hourly=pressure_msl,temperature_2m,precipitation_probability,weather_code,is_day' +
        '&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunshine_duration,daylight_duration,weather_code,wind_gusts_10m_max' +
        ',sunrise,sunset,precipitation_probability_max,precipitation_sum',
    ),
    getJson(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${base}&forecast_days=1` +
        '&current=european_aqi,pm2_5,ozone' +
        '&hourly=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen',
    ).catch(() => null), // Luftdaten sind ein Zusatz – Biowetter geht auch ohne
  ]);
  return { w, air, place: p };
}

/** Leitet aus den Messwerten die Biowetter-Kategorien ab (0 = günstig … 3 = stark). */
function buildBio({ w, air, place: loc = HOME }) {
  const cur = w.current;
  const d = w.daily;
  const T = 1; // Index „heute“ (0 = gestern, 2 = morgen)
  const p = w.hourly.pressure_msl;
  const nowIdx = Math.max(0, w.hourly.time.indexOf(cur.time.slice(0, 13) + ':00'));
  const at = (i) => p[Math.max(0, Math.min(p.length - 1, i))];
  const dp24 = at(nowIdx) - at(nowIdx - 24); // Luftdruckänderung seit gestern
  const dpNext = at(nowIdx + 12) - at(nowIdx); // … und in den nächsten 12 Stunden
  const dayStart = w.hourly.time.findIndex((t) => t.startsWith(d.time[T]));
  let dp3max = 0; // schnellster 3-Stunden-Sprung heute
  for (let i = dayStart + 3; i < dayStart + 24 && i < p.length; i++) dp3max = Math.max(dp3max, Math.abs(p[i] - p[i - 3]));
  const tMax = d.temperature_2m_max[T];
  const tDiff = tMax - d.temperature_2m_max[0];
  const nightMin = d.temperature_2m_min[2] ?? d.temperature_2m_min[T];
  const gusts = d.wind_gusts_10m_max[T] ?? 0;
  const sunH = (d.sunshine_duration[T] ?? 0) / 3600;
  const dayH = (d.daylight_duration[T] ?? 43200) / 3600;
  const uv = d.uv_index_max[T] ?? 0;
  const rh = cur.relative_humidity_2m;
  const temp = cur.temperature_2m;
  const moon = moonInfo();
  const trend = dp24 <= -4 ? 'fallend' : dp24 >= 4 ? 'steigend' : 'stabil';

  const cats = [];

  // Kreislauf
  {
    let s = Math.abs(dp24) >= 15 ? 3 : Math.abs(dp24) >= 8 ? 2 : Math.abs(dp24) >= 4 ? 1 : 0;
    if (Math.abs(tDiff) >= 8) s += 2; else if (Math.abs(tDiff) >= 5) s += 1;
    if (tMax >= 30) s += 2; else if (tMax >= 27) s += 1;
    const level = clamp(s);
    let text;
    if (tMax >= 27) text = 'Wärme fordert den Kreislauf. Trink reichlich, meide die Mittagssonne und gönn dir Pausen im Schatten.';
    else if (level === 0) text = 'Stabile Wetterlage – dein Kreislauf hat heute leichtes Spiel.';
    else if (trend === 'fallend') text = 'Der Luftdruck fällt. Bei niedrigem Blutdruck können Müdigkeit und Schwindel auftreten: langsam aufstehen, viel trinken, Wechselduschen helfen.';
    else if (trend === 'steigend') text = 'Der Luftdruck steigt spürbar. Wer zu hohem Blutdruck neigt, sollte es heute ruhiger angehen lassen.';
    else text = `Die Temperatur ${tDiff > 0 ? 'steigt' : 'sinkt'} deutlich gegenüber gestern. Gib deinem Körper Zeit, sich umzustellen.`;
    cats.push({ id: 'kreislauf', title: 'Kreislauf', icon: 'heart', level, text });
  }

  // Kopf & Migräne
  {
    let s = dp3max >= 5 ? 3 : dp3max >= 3 ? 2 : dp3max >= 1.8 ? 1 : 0;
    if (dp24 <= -8) s += 1;
    if (gusts >= 55) s += 1;
    if (Math.abs(tDiff) >= 6) s += 1;
    const level = clamp(s);
    const text = level === 0
      ? 'Ruhige Luftdruckverhältnisse – wenig Anlass für Wetterkopfschmerz.'
      : level === 1
        ? 'Leichte Druckschwankungen. Empfindliche spüren vielleicht einen Hauch im Kopf – ausreichend trinken beugt vor.'
        : 'Schnelle Wetterwechsel können Kopfschmerz und Migräne begünstigen. Regelmäßig essen, viel trinken, Bildschirmpausen und frische Luft einplanen.';
    cats.push({ id: 'kopf', title: 'Kopf & Migräne', icon: 'bolt', level, text });
  }

  // Gelenke & Rheuma
  {
    let s = temp <= 3 && rh >= 85 ? 3 : temp <= 8 && rh >= 80 ? 2 : temp <= 12 && rh >= 75 ? 1 : 0;
    if (dp24 <= -6) s += 1;
    const level = clamp(s);
    const text = level === 0
      ? 'Trocken-milde Bedingungen – angenehm für Gelenke und Muskeln.'
      : level === 1
        ? 'Etwas feucht-kühl. Halte Gelenke warm und bleib in sanfter Bewegung.'
        : 'Nasskaltes Wetter lässt Gelenke und alte Narben oft stärker spüren. Wärme, ein Kirschkernkissen und sanftes Dehnen tun gut.';
    cats.push({ id: 'gelenke', title: 'Gelenke & Rheuma', icon: 'bone', level, text });
  }

  // Atemwege
  {
    const aqi = air?.current?.european_aqi;
    let s = aqi == null ? 0 : aqi > 80 ? 3 : aqi > 60 ? 2 : aqi > 40 ? 1 : 0;
    if (temp <= 0) s += 1;
    const level = clamp(s);
    let text = level === 0
      ? 'Gute Luft – ideal zum tiefen Durchatmen und für einen Spaziergang.'
      : level === 1
        ? 'Die Luft ist heute etwas belastet oder sehr kalt. Atme draußen am besten durch die Nase.'
        : 'Die Luftqualität ist eingeschränkt. Anstrengung im Freien lieber verschieben und kurz, aber kräftig lüften.';
    if (aqi != null) text += ` Luftqualitätsindex: ${Math.round(aqi)}.`;
    cats.push({ id: 'atem', title: 'Atemwege', icon: 'wind', level, text });
  }

  // Schlaf & Erholung
  {
    let s = nightMin >= 20 ? 3 : nightMin >= 17 ? 2 : nightMin >= 15 ? 1 : 0;
    if (Math.abs(dpNext) >= 6) s += 1;
    if (gusts >= 60) s += 1;
    if (moon.nearFull) s += 1;
    const level = clamp(s);
    let text = nightMin >= 17
      ? 'Eine warme Nacht steht bevor. Abends gut durchlüften, leichte Decke, lauwarm duschen.'
      : level === 0
        ? 'Gute Voraussetzungen für erholsamen Schlaf. Vor dem Zubettgehen kurz lüften.'
        : 'Unruhiges Wetter kann den Schlaf leichter machen. Ein festes Abendritual und ein Lavendeltee helfen beim Abschalten.';
    if (moon.nearFull) text += ' Rund um den Vollmond schlafen viele etwas unruhiger.';
    cats.push({ id: 'schlaf', title: 'Schlaf & Erholung', icon: 'moon', level, text });
  }

  // Stimmung & Energie
  {
    let s = sunH < 1 ? 2 : sunH < 3 ? 1 : 0;
    if (dayH < 9) s += 1;
    const level = clamp(s);
    const sunTxt = sunH < 0.5 ? 'kaum Sonne' : `${fmt1(sunH)} Std. Sonne`;
    const text = level === 0
      ? `Viel Licht heute (${sunTxt}) – das hebt Stimmung und Energie. Nimm so viel davon mit, wie du kannst.`
      : level === 1
        ? `Eher wenig Licht (${sunTxt}). Ein Spaziergang zur Mittagszeit gleicht das aus.`
        : `Ein trüber, kurzer Tag (${sunTxt}). Geh trotzdem zur hellsten Stunde raus, mach es dir drinnen mit Kerzen und warmen Farben gemütlich.`;
    cats.push({ id: 'stimmung', title: 'Stimmung & Energie', icon: 'smile', level, text });
  }

  // Pollen
  {
    const types = [
      ['alder_pollen', 'Erle', [10, 50, 150]], ['birch_pollen', 'Birke', [10, 50, 150]], ['grass_pollen', 'Gräser', [5, 25, 60]],
      ['mugwort_pollen', 'Beifuß', [3, 10, 30]], ['ragweed_pollen', 'Ambrosia', [3, 10, 30]],
    ];
    let level = 0;
    const active = [];
    for (const [key, label, th] of types) {
      const max = Math.max(0, ...(air?.hourly?.[key] ?? []).filter((v) => v != null));
      const l = max >= th[2] ? 3 : max >= th[1] ? 2 : max >= th[0] ? 1 : 0;
      if (l > 0) active.push(label);
      level = Math.max(level, l);
    }
    const text = !air
      ? 'Pollendaten sind gerade nicht verfügbar.'
      : level === 0
        ? 'Kaum Pollen in der Luft – Allergikerinnen und Allergiker können aufatmen.'
        : `Unterwegs: ${active.join(', ')}. ${level >= 2 ? 'Abends Haare waschen, Kleidung nicht im Schlafzimmer ablegen und am besten nach einem Regenschauer lüften.' : 'Empfindliche merken es vielleicht leicht.'}`;
    cats.push({ id: 'pollen', title: 'Pollen', icon: 'flower', level, text });
  }

  // UV & Haut
  {
    const level = uv >= 8 ? 3 : uv >= 6 ? 2 : uv >= 3 ? 1 : 0;
    const text = level === 0
      ? `UV-Index ${fmt1(uv)} – kein Sonnenschutz nötig. Tageslicht darfst du unbeschwert genießen.`
      : level === 1
        ? `UV-Index ${fmt1(uv)} – bei längerem Aufenthalt draußen Sonnenschutz auftragen.`
        : `UV-Index ${fmt1(uv)} – mittags den Schatten suchen, Kopfbedeckung und Sonnencreme nicht vergessen.`;
    cats.push({ id: 'uv', title: 'Sonne & Haut', icon: 'sun', level, text });
  }

  const max = Math.max(...cats.map((c) => c.level));
  const sum = cats.reduce((a, c) => a + c.level, 0);
  const overall = max === 0 ? 0 : max === 1 && sum <= 2 ? 1 : max <= 2 && sum <= 6 ? 2 : 3;
  const headline = ['Ein sanfter Tag', 'Überwiegend ruhig', 'Etwas wetterfühlig', 'Fordernde Wetterlage'][overall];
  const blurb = [
    'Das Wetter meint es heute gut mit Körper und Seele.',
    'Nur leichte Reize – für die meisten kaum spürbar.',
    'Wetterfühlige merken den Tag. Plane kleine Pausen ein.',
    'Heute ist das Wetter deutlich zu spüren. Sei besonders gut zu dir.',
  ][overall];

  return {
    cats, overall, headline, blurb, moon, trend, raw: w, place: loc,
    weather: { ...weatherOf(cur.weather_code), temp, feels: cur.apparent_temperature, tMax, tMin: d.temperature_2m_min[T], rh, pressure: cur.pressure_msl },
  };
}

const levelDots = (level) =>
  h('span', { class: 'level', style: `--c: var(--lvl-${level})` },
    LEVELS[level],
    h('span', { class: 'dots', 'aria-hidden': 'true' }, [1, 2, 3].map((i) => h('i', { class: i <= level ? 'on' : '' }))));

function renderBio(bio) {
  const w = bio.weather;
  $('#bio-sub').textContent = `${bio.place.name} · heute`;
  renderWeather(bio);
  // Startseite: Wetter + Mond
  const moonNext = bio.moon.daysToFull < bio.moon.daysToNew
    ? `Vollmond in ${Math.max(1, Math.round(bio.moon.daysToFull))} T.`
    : `Neumond in ${Math.max(1, Math.round(bio.moon.daysToNew))} T.`;
  $('#weather-strip').replaceChildren(
    h('div', { class: 'weather' },
      h('button', { class: 'pill-card is-link', type: 'button', 'aria-label': `Wetter in ${bio.place.name}: Details und 7-Tage-Vorhersage`, onclick: () => showView('wetter') },
        h('span', { html: svg(ICONS[w.icon]) }),
        h('div', {}, h('strong', {}, `${Math.round(w.temp)}°`), h('small', {}, `${bio.place.name} · ${w.label}`)),
        h('span', { class: 'pill-go', html: svg(ICONS.chevron) })),
      h('div', { class: 'pill-card' },
        h('span', { html: moonSvg(bio.moon) }),
        h('div', {}, h('strong', {}, bio.moon.name), h('small', {}, ['Vollmond', 'Neumond'].includes(bio.moon.name) ? `${Math.round(bio.moon.lit * 100)} % beleuchtet` : moonNext)))),
  );

  // Startseite: Kurzfassung
  const notable = [...bio.cats].sort((a, b) => b.level - a.level).slice(0, 3);
  $('#home-bio').replaceChildren(
    h('div', { class: 'stack' },
      h('div', { class: 'section-head' },
        h('h2', {}, 'Biowetter heute'),
        h('button', { class: 'more', onclick: () => showView('bio') }, 'Alle Kategorien →')),
      summaryCard(bio),
      h('div', { class: 'chips' }, notable.map((c) => h('span', { class: 'chip', style: `--c: var(--lvl-${c.level})` }, h('i'), `${c.title}: ${LEVELS[c.level]}`)))),
  );

  // Biowetter-Ansicht
  $('#bio').replaceChildren(
    h('div', { class: 'stack' },
      summaryCard(bio),
      h('div', { class: 'facts' },
        fact(`${Math.round(w.tMin)}° / ${Math.round(w.tMax)}°`, 'Tief / Hoch'),
        fact(`${Math.round(w.pressure)} hPa`, `Luftdruck ${bio.trend}`),
        fact(`${Math.round(w.rh)} %`, 'Luftfeuchte')),
      h('button', { class: 'card link-card', type: 'button', onclick: () => showView('wetter') },
        h('span', { html: svg(ICONS.suncloud) }), 'Wetter heute & 7-Tage-Vorhersage', h('span', { class: 'pill-go', html: svg(ICONS.chevron) })),
      bio.cats.map((c) =>
        h('article', { class: 'card bio-item' },
          h('span', { class: 'bio-icon', html: svg(ICONS[c.icon]) }),
          h('div', { class: 'bio-head' }, h('h3', {}, c.title), levelDots(c.level)),
          h('p', { class: 'bio-text' }, c.text))),
      h('p', { class: 'note' }, 'Orientierung auf Basis aktueller Wetter- und Luftdaten von ',
        h('a', { href: 'https://open-meteo.com/', target: '_blank', rel: 'noopener' }, 'Open-Meteo'),
        ` für ${bio.place.name}. ${bio.offline ? 'Ohne Verbindung – letzter' : ''}${bio.offline ? ' ' : ''}Stand: ${new Date(bio.stamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr, wird stündlich aktualisiert. Kein Ersatz für ärztlichen Rat.`)),
  );
}

// ---------- Wetter-Details & 7 Tage ----------

const hhmm = (t) => (t ? t.slice(11, 16) : '–');

function iconFor(code, isDay = 1) {
  const { icon } = weatherOf(code);
  if (!isDay && icon === 'sun') return 'moon';
  if (!isDay && icon === 'suncloud') return 'cloud';
  return icon;
}

function renderWeather(bio) {
  const w = bio.raw;
  const cur = w.current;
  const d = w.daily;
  const T = 1;
  const now = bio.weather;
  $('#wetter-sub').textContent = `${bio.place.name}${bio.place.auto ? ' · dein Standort' : ''}`;

  // Die nächsten 24 Stunden
  const hTimes = w.hourly.time;
  const start = Math.max(0, hTimes.indexOf(cur.time.slice(0, 13) + ':00'));
  const hours = [];
  for (let i = start; i < Math.min(start + 24, hTimes.length); i++) {
    const rain = w.hourly.precipitation_probability[i];
    hours.push(h('div', { class: 'hour' },
      h('small', {}, i === start ? 'Jetzt' : `${hTimes[i].slice(11, 13)} Uhr`),
      h('span', { html: svg(ICONS[iconFor(w.hourly.weather_code[i], w.hourly.is_day[i])]) }),
      h('strong', {}, `${Math.round(w.hourly.temperature_2m[i])}°`),
      h('small', { class: 'rain' }, rain >= 10 ? `${rain} %` : ' ')));
  }

  // 7 Tage
  const days = [];
  for (let i = T; i < Math.min(T + 7, d.time.length); i++) days.push(i);
  const lo = Math.min(...days.map((i) => d.temperature_2m_min[i]));
  const hi = Math.max(...days.map((i) => d.temperature_2m_max[i]));
  const pct = (t) => ((t - lo) / Math.max(1, hi - lo)) * 100;
  const dayLabel = (i) => {
    if (i === T) return 'Heute';
    if (i === T + 1) return 'Morgen';
    return new Date(d.time[i] + 'T12:00').toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '');
  };
  const dateLabel = (i) => new Date(d.time[i] + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' });

  const detail = (icon, label, value) =>
    h('div', { class: 'detail' }, h('span', { html: svg(ICONS[icon]) }), h('div', {}, h('small', {}, label), h('strong', {}, value)));

  $('#wetter').replaceChildren(
    h('div', { class: 'stack' },
      h('article', { class: 'card now-card' },
        h('span', { class: 'now-icon', html: svg(ICONS[iconFor(cur.weather_code, cur.is_day)]) }),
        h('div', {},
          h('p', { class: 'now-temp' }, `${Math.round(now.temp)}°`),
          h('p', { class: 'now-label' }, now.label),
          h('p', { class: 'now-sub' }, `Gefühlt ${Math.round(now.feels)}° · Tief ${Math.round(now.tMin)}° · Hoch ${Math.round(now.tMax)}°`))),
      h('div', { class: 'section-head' }, h('h2', {}, 'Die nächsten 24 Stunden')),
      h('div', { class: 'hours', tabindex: '0', 'aria-label': 'Stündliche Vorhersage, seitlich wischen' }, hours),
      h('div', { class: 'section-head' }, h('h2', {}, 'Heute im Detail')),
      h('div', { class: 'details' },
        detail('drop', 'Regenrisiko', `${d.precipitation_probability_max[T] ?? 0} % · ${fmt1(d.precipitation_sum[T] ?? 0)} mm`),
        detail('wind', 'Wind', `${Math.round(cur.wind_speed_10m)} km/h · Böen ${Math.round(d.wind_gusts_10m_max[T] ?? 0)}`),
        detail('gauge', 'Luftdruck', `${Math.round(now.pressure)} hPa · ${bio.trend}`),
        detail('leaf', 'Luftfeuchte', `${Math.round(now.rh)} %`),
        detail('sunrise', 'Sonnenaufgang', `${hhmm(d.sunrise[T])} Uhr`),
        detail('sunset', 'Sonnenuntergang', `${hhmm(d.sunset[T])} Uhr`),
        detail('sun', 'UV-Index', fmt1(d.uv_index_max[T] ?? 0)),
        detail('suncloud', 'Sonnenstunden', `${fmt1((d.sunshine_duration[T] ?? 0) / 3600)} Std.`)),
      h('div', { class: 'section-head' }, h('h2', {}, '7-Tage-Vorhersage')),
      h('article', { class: 'card week' },
        days.map((i) => {
          const rain = d.precipitation_probability_max[i] ?? 0;
          return h('div', { class: 'day' },
            h('div', { class: 'day-name' }, h('strong', {}, dayLabel(i)), h('small', {}, dateLabel(i))),
            h('span', { class: 'day-icon', html: svg(ICONS[iconFor(d.weather_code[i])]) }),
            h('small', { class: 'rain' }, rain >= 10 ? `${rain} %` : ''),
            h('span', { class: 'lo' }, `${Math.round(d.temperature_2m_min[i])}°`),
            h('span', { class: 'range', 'aria-hidden': 'true' },
              h('i', { style: `left:${pct(d.temperature_2m_min[i]).toFixed(1)}%;right:${(100 - pct(d.temperature_2m_max[i])).toFixed(1)}%` })),
            h('span', { class: 'hi' }, `${Math.round(d.temperature_2m_max[i])}°`));
        })),
      !bio.place.auto &&
        h('p', { class: 'note' }, 'Tipp: Erlaube der App den Standort, dann zeigt sie das Wetter dort, wo du gerade bist. Sonst gilt Jena.'),
      h('p', { class: 'note' }, 'Wetterdaten: ', h('a', { href: 'https://open-meteo.com/', target: '_blank', rel: 'noopener' }, 'Open-Meteo'),
        `. Stand: ${new Date(bio.stamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr.`)),
  );
}

const fact = (value, label) => h('div', { class: 'fact' }, h('strong', {}, value), h('small', {}, label));

const summaryCard = (bio) =>
  h('article', { class: 'card bio-summary' },
    h('div', { class: 'bio-ring', style: `--p: ${[12, 38, 68, 100][bio.overall]}; --c: var(--lvl-${bio.overall})`, html: svg(ICONS.leaf) }),
    h('div', {}, h('h3', {}, bio.headline), h('p', {}, bio.blurb)));

function renderBioError() {
  const msg = h('article', { class: 'card empty' },
    h('div', { html: svg(ICONS.cloud) }),
    h('p', {}, 'Das Biowetter konnte gerade nicht geladen werden. Bitte prüfe deine Internetverbindung.'),
    h('button', { class: 'more', onclick: () => initBio() }, 'Erneut versuchen'));
  $('#bio').replaceChildren(msg);
  $('#wetter').replaceChildren(msg.cloneNode(true));
  $('#wetter .more')?.addEventListener('click', () => initBio());
  $('#home-bio').replaceChildren();
  // Der Mond lässt sich auch ohne Netz berechnen
  const m = moonInfo();
  $('#weather-strip').replaceChildren(
    h('div', { class: 'pill-card' }, h('span', { html: moonSvg(m) }),
      h('div', {}, h('strong', {}, m.name), h('small', {}, `${Math.round(m.lit * 100)} % beleuchtet`))));
}

let weatherLoadedAt = 0;
let hasWeather = false;

/** Lädt Wetter und Biowetter. Mit quiet = true wird still im Hintergrund aufgefrischt. */
const WEATHER_KEY = 'spiritual-light:weather';

function saveWeather(data) {
  try { localStorage.setItem(WEATHER_KEY, JSON.stringify({ day: dayKey(), stamp: Date.now(), data })); } catch {}
}

/** Letzter Wetterstand von heute – damit das Biowetter auch ohne Netz da ist. */
function lastWeather() {
  try {
    const saved = JSON.parse(localStorage.getItem(WEATHER_KEY));
    return saved?.day === dayKey() && saved.data?.w ? saved : null;
  } catch {
    return null;
  }
}

async function initBio({ quiet = false } = {}) {
  if (!quiet || !hasWeather) {
    $('#bio').replaceChildren(h('div', { class: 'stack' }, h('div', { class: 'skeleton' }), h('div', { class: 'skeleton' }), h('div', { class: 'skeleton' })));
  }
  try {
    const data = await loadWeather(await locate());
    applyTheme(); // Sonnenzeiten hängen vom (evtl. neuen) Standort ab
    renderBio({ ...buildBio(data), stamp: Date.now() });
    saveWeather(data);
    weatherLoadedAt = Date.now();
    hasWeather = true;
  } catch (err) {
    console.warn('Biowetter:', err);
    // Beim stillen Auffrischen bleibt der angezeigte Stand stehen, statt einer Fehlermeldung
    if (quiet && hasWeather) return;
    const saved = lastWeather();
    if (saved) {
      try {
        renderBio({ ...buildBio(saved.data), stamp: saved.stamp, offline: true });
        hasWeather = true;
        return;
      } catch {}
    }
    renderBioError();
  }
}

// ---------- News ----------

let news = null;
let region = 'germany';

function newsCard(item) {
  return h('a', { class: 'card news-item', href: item.link, target: '_blank', rel: 'noopener noreferrer' },
    h('p', { class: 'meta' }, item.source, h('span', {}, ` · ${relDate(item.date)}`)),
    h('h3', {}, item.title),
    item.summary && h('p', {}, item.summary));
}

function renderNews() {
  const list = news?.[region] ?? [];
  const box = $('#news');
  if (!news) return box.replaceChildren(emptyCard('Die News konnten gerade nicht geladen werden.'));
  if (!list.length) {
    return box.replaceChildren(emptyCard(region === 'jena'
      ? 'Aktuell gibt es keine neuen Meldungen aus Jena und Thüringen. Schau morgen wieder vorbei.'
      : 'Heute sind noch keine Meldungen eingetroffen.'));
  }
  box.replaceChildren(h('div', { class: 'stack' }, list.map(newsCard), updatedNote(news.updated)));
}

const emptyCard = (text) => h('article', { class: 'card empty' }, h('div', { html: svg(ICONS.leaf) }), h('p', {}, text));
const updatedNote = (iso) =>
  iso && h('p', { class: 'note' }, `Zuletzt aktualisiert: ${new Date(iso).toLocaleString('de-DE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} Uhr`);

// ---------- Bücher ----------

let books = null;

const COVER_TONES = [['#c4e2d1', '#9caf88'], ['#e6ecdc', '#b9c8a4'], ['#ece2cf', '#cdb893'], ['#d5e8df', '#8fb3a0'], ['#e9d9cc', '#cf9a80']];

function bookCard(b, i) {
  const [c1, c2] = COVER_TONES[i % COVER_TONES.length];
  const cover = h('div', { class: 'cover', style: `--c1:${c1};--c2:${c2}` }, h('span', {}, (b.title.match(/[A-Za-zÄÖÜäöü]/) || ['✦'])[0].toUpperCase()));
  if (b.cover) {
    // Titelbild (beim täglichen Update von der DNB geladen); fehlt es, bleibt der gemalte Einband stehen.
    // Das Bild muss im Dokument hängen, sonst lädt „lazy“ es nie.
    const img = h('img', { alt: '', loading: 'lazy', decoding: 'async' });
    img.addEventListener('load', () => (img.naturalWidth > 20 ? img.classList.add('is-loaded') : img.remove()));
    img.addEventListener('error', () => img.remove());
    img.src = b.cover;
    cover.append(img);
  }
  return h('a', { class: 'card book', href: b.link, target: '_blank', rel: 'noopener noreferrer' },
    cover,
    h('div', {},
      h('h3', {}, b.title),
      b.subtitle && h('p', { class: 'sub' }, b.subtitle),
      b.author && h('p', { class: 'by' }, b.author),
      h('p', { class: 'pub' }, [b.publisher, b.price].filter(Boolean).join(' · '))));
}

function renderBooks() {
  const box = $('#books');
  if (!books?.books?.length) return box.replaceChildren(emptyCard('Die Buchtipps konnten gerade nicht geladen werden.'));
  box.replaceChildren(h('div', { class: 'stack' }, books.books.map(bookCard),
    h('p', { class: 'note' }, 'Neuerscheinungen aus dem Katalog der Deutschen Nationalbibliothek. Antippen öffnet den Katalogeintrag.')));
}

function renderTeasers() {
  const parts = [];
  const top = news?.germany?.[0];
  if (top) {
    parts.push(h('a', { class: 'card teaser', href: top.link, target: '_blank', rel: 'noopener noreferrer' },
      h('span', { class: 'eyebrow' }, 'Neu in der Szene'), h('h3', {}, top.title), h('p', {}, `${top.source} · ${relDate(top.date)}`)));
  }
  const list = books?.books ?? [];
  if (list.length) {
    const b = list[dayNumber() % Math.min(list.length, 12)];
    parts.push(h('a', { class: 'card teaser', href: b.link, target: '_blank', rel: 'noopener noreferrer' },
      h('span', { class: 'eyebrow' }, 'Buch des Tages'), h('h3', {}, b.title), h('p', {}, [b.author, b.publisher].filter(Boolean).join(' · '))));
  }
  $('#home-teasers').replaceChildren(h('div', { class: 'stack' }, parts));
}

let feedsLoadedAt = 0;

async function initFeeds() {
  feedsLoadedAt = Date.now();
  const [n, b] = await Promise.allSettled([getJson('data/news.json'), getJson('data/books.json')]);
  news = n.status === 'fulfilled' ? n.value : null;
  books = b.status === 'fulfilled' ? b.value : null;
  renderNews();
  renderBooks();
  renderTeasers();
}

// ---------- Farbwelt ----------

const THEME_KEY = 'spiritual-light:theme';
const THEMES = [
  ['auto', 'Automatisch', 'Nach Tageszeit: tagsüber Salbei, in der Dämmerung gedämpft, nachts Abend'],
  ['hell', 'Hell', ''],
  ['salbei', 'Salbei', ''],
  ['abend', 'Abend', ''],
];
const THEME_BAR = { hell: '#bcd6c3', salbei: '#a2c4ad', daemmerung: '#8fb39c', abend: '#1f2923' };
const THEME_NAMES = { hell: 'Hell', salbei: 'Salbei', daemmerung: 'Dämmerung', abend: 'Abend' };

function themePref() {
  try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch { return 'auto'; }
}

function applyTheme(pref = themePref()) {
  const t = pref === 'auto' ? window.SL?.pickTheme?.() || 'salbei' : pref;
  if ((document.documentElement.dataset.theme || 'hell') !== t) document.documentElement.classList.add('theme-fade');
  if (t === 'hell') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_BAR[t]);
  for (const b of document.querySelectorAll('#theme-picker button')) b.setAttribute('aria-checked', String(b.dataset.theme === pref));
  // Bei „Automatisch“ zeigen, was gerade gilt und wann es wechselt
  const info = $('#theme-info');
  if (info) {
    const next = pref === 'auto' ? window.SL?.nextChange?.(new Date()) : null;
    const at = next && next.at.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    info.textContent = pref === 'auto'
      ? `Nach Tageszeit · jetzt ${THEME_NAMES[t]}${next ? ` · ab ${at} Uhr ${THEME_NAMES[next.theme]}` : ''}`
      : 'Feste Farbwelt – „Automatisch“ passt sich der Tageszeit an';
  }
}

function renderThemePicker() {
  $('#theme-picker').replaceChildren(
    h('span', { class: 'eyebrow' }, 'Farbwelt'),
    h('div', { class: 'theme-options' },
      THEMES.map(([id, label, hint]) =>
        h('button', { type: 'button', role: 'radio', 'data-theme': id, title: hint || label, 'aria-checked': 'false',
          onclick: () => { try { localStorage.setItem(THEME_KEY, id); } catch {} applyTheme(id); } },
          h('i', { class: `swatch swatch-${id}`, 'aria-hidden': 'true' }), label))),
    h('p', { class: 'theme-info', id: 'theme-info' }),
  );
  applyTheme();
}

renderThemePicker();

// ---------- Navigation ----------

let currentView = 'heute';

function showView(name, { push = true } = {}) {
  // Die Zurück-Taste des Handys führt zur Startseite statt die App zu schließen
  if (push && name !== currentView) {
    if (name === 'heute') {
      if (history.state?.view) history.back();
    } else if (currentView === 'heute') history.pushState({ view: name }, '');
    else history.replaceState({ view: name }, '');
  }
  currentView = name;
  const tab = name === 'wetter' ? 'heute' : name;
  for (const view of document.querySelectorAll('.view')) {
    const on = view.id === `view-${name}`;
    view.hidden = !on;
    view.classList.toggle('is-active', on);
  }
  for (const btn of document.querySelectorAll('.tabs button')) {
    const on = btn.dataset.view === tab;
    btn.classList.toggle('is-active', on);
    if (on) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  document.querySelector('.top').hidden = name !== 'heute';
  window.scrollTo(0, 0);
}

window.addEventListener('popstate', (e) => showView(e.state?.view || 'heute', { push: false }));
$('#wetter-back').addEventListener('click', () => (history.state?.view ? history.back() : showView('heute', { push: false })));

document.querySelector('.tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-view]');
  if (btn) showView(btn.dataset.view);
});

document.querySelector('.segment').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-region]');
  if (!btn) return;
  region = btn.dataset.region;
  for (const b of document.querySelectorAll('.segment button')) {
    b.classList.toggle('is-active', b === btn);
    b.setAttribute('aria-selected', String(b === btn));
  }
  renderNews();
});

// ---------- Start ----------

let renderedDay = null;

function start() {
  renderedDay = dayKey();
  renderHeader();
  renderBirthday();
  renderQuote();
  renderTip();
  renderDish();
  initBio();
  initFeeds();
}

start();

const HOUR = 3600000;

/** Hält die Inhalte frisch: neuer Tag = alles neu, Wetter stündlich, News und Bücher alle paar Stunden. */
function refresh() {
  if (document.visibilityState !== 'visible') return;
  applyTheme(); // Helligkeit folgt der Tageszeit
  if (renderedDay !== dayKey()) return start();
  renderHeader();
  if (Date.now() - weatherLoadedAt >= HOUR) initBio({ quiet: true });
  if (Date.now() - feedsLoadedAt >= 3 * HOUR) initFeeds();
}

// Beim Zurückkehren in die App und regelmäßig, solange sie offen ist
document.addEventListener('visibilitychange', refresh);
setInterval(refresh, 5 * 60000);

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  // Gibt es eine neue Version, lädt die App sich einmal neu – so ist sie sofort aktuell
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    // Beim Zurückkehren in die App nach einer neuen Version schauen
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && reg.update().catch(() => {}));
  }).catch(() => {});
}
