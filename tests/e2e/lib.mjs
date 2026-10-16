// Pomocné funkce pro testy v prohlížeči (Firefox bez okna, ovládaný přes puppeteer-core).
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

export const OUT = new URL('./screenshots', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

function firefoxPath() {
  if (process.env.FIREFOX) return process.env.FIREFOX;
  try {
    return execSync('command -v firefox', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('Nenašel jsem Firefox. Nastavte cestu: FIREFOX=/cesta/k/firefox');
  }
}

export async function open(base, { w = 390, h = 844 } = {}) {
  const browser = await puppeteer.launch({
    browser: 'firefox',
    executablePath: firefoxPath(),
    headless: true,
    userDataDir: mkdtempSync(join(tmpdir(), 'schranka-e2e-')),
    // Testovací mikrofon a kamera místo skutečných (pro nahrávání hlasu), bez dotazu na povolení.
    extraPrefsFirefox: {
      'media.navigator.streams.fake': true,
      'media.navigator.permission.disabled': true,
      'media.autoplay.default': 0,
    },
  });
  const page = await browser.newPage();
  const logs = [];
  // Hláška Firefoxu o cookie „__cf_bm“ pochází z Cloudflare před úložištěm Supabase, ne z aplikace.
  const ignored = (text) => /__cf_bm/.test(text);
  page.on('console', (m) => {
    if (['error', 'warn'].includes(m.type()) && !ignored(m.text())) logs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => {
    if (!ignored(e.message)) logs.push(`[pageerror] ${e.message}`);
  });
  await page.setViewport({ width: w, height: h });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const api = {
    page, browser, logs, sleep,
    async go(path, wait = 2500) { await page.goto(base + path, { waitUntil: 'load' }); await sleep(wait); },
    async shot(name) { await page.screenshot({ path: `${OUT}/${name}.png` }); return `${OUT}/${name}.png`; },
    async hasText(text, timeout = 8000) {
      try { await page.waitForSelector(`::-p-text(${text})`, { timeout }); return true; } catch { return false; }
    },
    async click(text, timeout = 8000) {
      const el = await page.waitForSelector(`::-p-text(${text})`, { timeout });
      await el.click();
    },
    /** Přihlásí demo účet a projde uvítacího průvodce tlačítkem „Přeskočit“. */
    async startDemo() {
      await page.goto(base + '/', { waitUntil: 'load' });
      await sleep(2000);
      await (await page.waitForSelector('::-p-text(Vyzkoušet demo)', { timeout: 8000 })).click();
      await page.waitForSelector('::-p-text(Vítejte!)', { timeout: 15000 });
      await (await page.waitForSelector('::-p-text(Přeskočit, nastavím později)', { timeout: 8000 })).click();
      await page.waitForSelector('::-p-text(Vítejte zpět)', { timeout: 15000 });
    },
    async endDemo() {
      await page.goto(base + '/spravce', { waitUntil: 'load' });
      await sleep(2500);
      await (await page.waitForSelector('::-p-text(Ukončit demo)', { timeout: 8000 })).click();
      await page.waitForSelector('::-p-text(Ukázková data se smažou)', { timeout: 8000 });
      await sleep(400);
      const buttons = await page.$$('[role="button"][aria-label="Ukončit demo"]');
      await buttons[buttons.length - 1].click();
    },
    async type(selector, text) { const el = await page.waitForSelector(selector, { timeout: 8000 }); await el.click(); await el.type(text); },
    async fill(selector, text) {
      const el = await page.waitForSelector(selector, { timeout: 8000 });
      await el.click();
      await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      if (text) await page.keyboard.type(text);
    },
    /** Další výběr souboru (fotka, video) dostane tento soubor místo dialogu. */
    async prepareFile(base64, type, name) {
      await page.evaluate(
        (b64, mime, fileName) => {
          const observer = new MutationObserver(() => {
            const input = document.querySelector('input[type="file"]:not([data-test-filled])');
            if (!input) return;
            input.setAttribute('data-test-filled', '1');
            const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            const transfer = new DataTransfer();
            transfer.items.add(new File([bytes], fileName, { type: mime }));
            input.files = transfer.files;
            setTimeout(() => input.dispatchEvent(new Event('change')), 50);
            observer.disconnect();
          });
          observer.observe(document.body, { childList: true });
        },
        base64,
        type,
        name,
      );
    },
    async local(key) { return page.evaluate((k) => localStorage.getItem(k), key); },
    async close() { await browser.close(); },
  };
  return api;
}

let failures = 0;
export function check(name, ok, detail = '') {
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}
export const failed = () => failures;
