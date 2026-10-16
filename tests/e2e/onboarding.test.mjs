// Uvítací průvodce: Vítejte → Co je pro vás důležité → Jakou podporu → Připomenutí, volby se uloží.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base);
try {
  await b.go('/');
  await b.click('Vyzkoušet demo');
  check('Krok 1: Vítejte', await b.hasText('Vítejte!', 15000));
  await b.click('Začít');
  check('Krok 2: Co je pro vás důležité', await b.hasText('Co je pro vás důležité?'));
  await b.shot('03-dulezite');
  await b.click('Jemné připomínky');
  await b.click('Citát dne');
  await b.click('Pokračovat');
  check('Krok 3: Jakou podporu si přejete', await b.hasText('Jakou podporu si přejete?'));
  await b.shot('04-podpora');
  await b.click('Pokračovat');
  check('Krok 4: Připomenutí (jen když o ně stojím)', await b.hasText('Chcete dostávat jemná připomenutí'));
  check('Připomínka neprozradí obsah', await b.hasText('Na zamčené obrazovce se nikdy neukáže'));
  await b.click('Ano, jemně');
  await b.click('Uložit nastavení');
  check('Po průvodci se otevře appka', await b.hasText('Vítejte zpět', 15000));
  check('Zvolený citát dne je na úvodní obrazovce', await b.hasText('Citát dne', 1500) || (await b.page.evaluate(() => document.body.innerText.includes('„'))));
  await b.go('/');
  check('Po obnovení se průvodce už neukáže', await b.hasText('Vítejte zpět'));
  await b.go('/spravce');
  check('Nastavení je vidět ve Správci', await b.hasText('Podpora a připomínky'));
  check('Volba připomenutí se uložila', !!(await b.page.$('::-p-text(Ano, jemně)')));
  await b.endDemo();
  await b.hasText('Vyzkoušet demo', 10000);
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 12).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
