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
  });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
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
