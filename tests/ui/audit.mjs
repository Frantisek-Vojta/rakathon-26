// UI/UX audit: projde všechny obrazovky v 6 velikostech (od malého telefonu po široký monitor)
// a u každé zkontroluje:
//   1. přetékání do stran (vodorovné posouvání, prvky mimo obrazovku),
//   2. velikost klikacích ploch (doporučeno aspoň 44 × 44 px, minimum WCAG 2.2 je 24 × 24 px),
//   3. jestli má každé tlačítko a pole popisek pro čtečku obrazovky,
//   4. příliš malé písmo (pod 12 px),
//   5. pravidla přístupnosti WCAG 2.2 A/AA přes axe-core (kontrast, popisky, role…).
// Výsledek: tests/ui/report.md + snímky obrazovek v tests/ui/screenshots/.
//
// Spuštění:  npm run build:web && npm run serve:web   (v jiném terminálu)
//            npm run test:ui
// (axe-core se vkládá do stránky, proto audit běží proti lokálnímu serveru bez CSP.)

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { open } from '../e2e/lib.mjs';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE_URL || 'http://localhost:8765';
const OUT = new URL('./screenshots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'telefon-maly', w: 320, h: 640 },
  { name: 'telefon', w: 390, h: 844 },
  { name: 'telefon-nasirku', w: 844, h: 390 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'notebook', w: 1280, h: 800 },
  { name: 'monitor', w: 1600, h: 1000 },
];

const b = await open(BASE);
const ids = {};
const results = [];

async function waitIdle() {
  await b.sleep(1800);
}

// Přihlášení do dema a zjištění ID pro profil a hotový dopis.
await b.go('/prihlaseni');
const loginShots = [];
for (const vp of VIEWPORTS) {
  await b.page.setViewport({ width: vp.w, height: vp.h });
  await b.sleep(600);
  loginShots.push(vp);
}
await b.page.setViewport({ width: 390, height: 844 });
await b.click('Vyzkoušet demo');
await b.hasText('Vítejte!', 15000);
// Uvítací průvodce zkontrolujeme ve všech velikostech.
for (const vp of VIEWPORTS) {
  await b.page.setViewport({ width: vp.w, height: vp.h });
  await b.sleep(700);
  const file = `vitejte--${vp.name}.png`;
  await b.page.screenshot({ path: OUT + file });
  const found = await b.page.evaluate(inspect);
  results.push({ viewport: vp, screen: 'vitejte', file, ...found, violations: await axe() });
}
await b.page.setViewport({ width: 390, height: 844 });
await b.click('Přeskočit, nastavím později');
await b.hasText('Vítejte zpět', 15000);
await b.go('/deti');
await b.click('Eliška');
await b.hasText('Rozepsané');
ids.child = b.page.url().split('/dite/')[1].split(/[/?]/)[0];
await b.click('K tvým 7. narozeninám');
await b.hasText('Upravit dopis');
ids.letter = b.page.url().split('/dopis/')[1].split(/[/?]/)[0];
await b.go(`/dite/${ids.child}`);
await b.click('Ukolébavka na dobrou noc');
await b.hasText('Upravit vzpomínku');
ids.voice = b.page.url().split('/dopis/')[1].split(/[/?]/)[0];
await b.go('/deti');
await b.click('Aneta');
await b.click('Video k tvým narozeninám');
await b.hasText('Upravit vzpomínku');
ids.video = b.page.url().split('/dopis/')[1].split(/[/?]/)[0];

/** Klikne na viditelné tlačítko s přesně tímto textem a počká na výsledek (kamera v okně aplikace). */
async function press(text, waitFor) {
  await b.page.evaluate((t) => {
    const label = (el) => el.innerText.replace(/[\uE000-\uF8FF]/g, '').trim().split('\n')[0].trim();
    const el = [...document.querySelectorAll('[role="button"]')].filter((e) => label(e) === t && e.offsetParent).at(-1);
    el?.click();
  }, text);
  await b.hasText(waitFor, 10000);
  await b.sleep(1200);
}

const SCREENS = [
  { name: 'domu', path: '/' },
  { name: 'deti', path: '/deti' },
  { name: 'profil-ditete', path: `/dite/${ids.child}` },
  { name: 'nove-dite', path: '/dite/novy' },
  { name: 'dopis-psani', path: `/dopis/novy?dite=${ids.child}` },
  { name: 'dopis-cteni', path: `/dopis/${ids.letter}` },
  { name: 'inspirace', path: '/inspirace' },
  { name: 'spravce', path: '/spravce' },
  { name: 'smysl', path: '/smysl' },
  { name: 'hlas-cteni', path: `/dopis/${ids.voice}` },
  { name: 'hlas-novy', path: `/dopis/novy?dite=${ids.child}&druh=hlas` },
  { name: 'foto-novy', path: `/dopis/novy?dite=${ids.child}&druh=foto` },
  { name: 'video-novy', path: `/dopis/novy?dite=${ids.child}&druh=video` },
  { name: 'video-cteni', path: `/dopis/${ids.video}` },
  {
    name: 'kamera-video',
    path: `/dopis/novy?dite=${ids.child}&druh=video`,
    action: () => press('Natočit video', 'Začít natáčet'),
  },
  {
    name: 'kamera-foto',
    path: `/dopis/novy?dite=${ids.child}&druh=foto`,
    action: () => press('Vyfotit', 'Až budete připraveni'),
  },
];

/** Kontroly, které běží uvnitř stránky. */
function inspect() {
  const vw = window.innerWidth;
  const out = { overflow: [], smallTargets: [], unnamed: [], tinyText: [] };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };
  const label = (el) =>
    (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || '').trim().slice(0, 50);

  if (document.documentElement.scrollWidth > vw + 1) out.overflow.push(`stránka je širší než okno (${document.documentElement.scrollWidth}px)`);
  for (const el of document.querySelectorAll('#root *')) {
    const s = getComputedStyle(el);
    if (['auto', 'scroll'].includes(s.overflowX) && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
      out.overflow.push(`vodorovné posouvání: ${label(el) || el.tagName}`);
    }
  }
  for (const el of document.querySelectorAll('#root [role="button"], #root [role="radio"], #root [role="tab"], #root [role="link"], #root a, #root button, #root input, #root textarea')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) out.overflow.push(`mimo obrazovku: ${label(el)}`);
    const min = Math.min(r.width, r.height);
    if (min < 44) out.smallTargets.push(`${Math.round(r.width)}×${Math.round(r.height)} ${label(el) || el.tagName}`);
    const name = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent?.trim() || el.getAttribute('title');
    if (!name) out.unnamed.push(el.outerHTML.slice(0, 80));
  }
  const seen = new Set();
  for (const el of document.querySelectorAll('#root div[dir], #root span, #root div')) {
    if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!visible(el)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    const text = el.textContent.trim().slice(0, 30);
    if (size < 12 && !seen.has(text)) {
      seen.add(text);
      out.tinyText.push(`${size}px „${text}“`);
    }
  }
  return out;
}

async function axe() {
  const has = await b.page.evaluate(() => typeof window.axe !== 'undefined');
  if (!has) await b.page.evaluate(AXE);
  return b.page.evaluate(async () => {
    const r = await window.axe.run(document.getElementById('root'), {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      count: v.nodes.length,
      sample: v.nodes.slice(0, 3).map((n) => (n.failureSummary || '').split('\n').slice(1, 2).join(' ').trim() + ' ← ' + String(n.target).slice(0, 60)),
    }));
  });
}

async function audit(vp, screen) {
  await b.page.setViewport({ width: vp.w, height: vp.h });
  await b.page.goto(BASE + screen.path, { waitUntil: 'load' });
  await waitIdle();
  if (screen.action) await screen.action();
  const file = `${screen.name}--${vp.name}.png`;
  await b.page.screenshot({ path: OUT + file });
  const found = await b.page.evaluate(inspect);
  const violations = await axe();
  results.push({ viewport: vp, screen: screen.name, file, ...found, violations });
}

for (const vp of VIEWPORTS) {
  for (const screen of SCREENS) await audit(vp, screen);
}

// Přihlášení: odhlásit demo a projít stejné velikosti.
await b.endDemo();
await b.hasText('Vyzkoušet demo', 10000);
for (const vp of loginShots) await audit(vp, { name: 'prihlaseni', path: '/prihlaseni' });
const consoleLog = b.logs.slice();
await b.close();

// ---------------------------------------------------------------- zpráva
const lines = ['# UI/UX audit', '', `Adresa: ${BASE}  `, `Datum: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`, ''];
const total = { overflow: 0, smallTargets: 0, unnamed: 0, tinyText: 0, violations: 0 };
for (const r of results) {
  total.overflow += r.overflow.length;
  total.smallTargets += r.smallTargets.length;
  total.unnamed += r.unnamed.length;
  total.tinyText += r.tinyText.length;
  total.violations += r.violations.reduce((s, v) => s + v.count, 0);
}
lines.push(
  '## Souhrn',
  '',
  `| Kontrola | Nálezů |`,
  `|---|---|`,
  `| Přetékání do stran | ${total.overflow} |`,
  `| Klikací plochy menší než 44 px | ${total.smallTargets} |`,
  `| Ovládací prvky bez popisku | ${total.unnamed} |`,
  `| Písmo menší než 12 px | ${total.tinyText} |`,
  `| Porušení WCAG (axe-core) | ${total.violations} |`,
  `| Chyby v konzoli | ${consoleLog.length} |`,
  '',
  `Obrazovek × velikostí: ${results.length}`,
  '',
  '## Podrobnosti',
  '',
);
for (const r of results) {
  const issues = r.overflow.length + r.smallTargets.length + r.unnamed.length + r.tinyText.length + r.violations.length;
  lines.push(`### ${r.screen} · ${r.viewport.name} (${r.viewport.w}×${r.viewport.h}) ${issues ? '' : '✅'}`);
  for (const o of r.overflow) lines.push(`- ❌ přetékání: ${o}`);
  for (const t of r.smallTargets) lines.push(`- ⚠️ malá plocha: ${t}`);
  for (const u of r.unnamed) lines.push(`- ❌ bez popisku: \`${u}\``);
  for (const t of r.tinyText) lines.push(`- ⚠️ malé písmo: ${t}`);
  for (const v of r.violations) lines.push(`- ❌ WCAG ${v.id} (${v.impact}, ${v.count}×): ${v.help}${v.sample.length ? ` — ${v.sample.join(' | ')}` : ''}`);
  lines.push('');
}
if (consoleLog.length) lines.push('## Konzole', '', ...consoleLog.map((l) => `- ${l}`), '');
writeFileSync(new URL('./report.md', import.meta.url), lines.join('\n'));
writeFileSync(new URL('./report.json', import.meta.url), JSON.stringify({ total, results, console: consoleLog }, null, 2));

console.log(lines.slice(0, 20).join('\n'));
const fail = total.overflow + total.unnamed + total.violations + consoleLog.length;
process.exit(fail ? 1 : 0);
