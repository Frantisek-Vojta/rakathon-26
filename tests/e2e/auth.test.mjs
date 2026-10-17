// Přihlášení: demo, zapamatované přihlášení v localStorage, chráněné stránky, odhlášení.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base);
try {
  await b.go('/');
  check('Nepřihlášený vidí přihlášení', await b.hasText('Vyzkoušet demo'));
  await b.shot('01-prihlaseni');
  await b.click('Vyzkoušet demo');
  check('Demo otevře uvítacího průvodce', await b.hasText('Vítejte!', 15000));
  await b.shot('02-vitejte');
  await b.click('Přeskočit, nastavím později');
  check('Po průvodci se otevře appka', await b.hasText('Vítejte zpět', 15000));
  const session = await b.local('schranka:prihlaseni');
  check('Přihlášení je uložené v localStorage', !!session && session.includes('access_token'));
  await b.go('/');
  check('Po obnovení stránky zůstává přihlášen', await b.hasText('Vítejte zpět'));
  await b.go('/prihlaseni');
  check('Přihlášený se na přihlášení nedostane', !(await b.hasText('Vyzkoušet demo', 2500)));
  await b.go('/spravce');
  check('Správce ukazuje demo účet', await b.hasText('Demo účet'));
  await b.endDemo();
  check('Po ukončení dema je zpět přihlášení', await b.hasText('Vyzkoušet demo', 10000));
  check('Přihlášení smazané z localStorage', !(await b.local('schranka:prihlaseni')));
  await b.go('/deti');
  check('Bez přihlášení nejde otevřít Moje děti', await b.hasText('Vyzkoušet demo'));

  // Podmínky a GDPR jsou dostupné i bez přihlášení
  await b.go('/zasady');
  check('GDPR je dostupné bez přihlášení', await b.hasText('Jaké údaje ukládáme'));
  await (await b.page.waitForSelector('[role="tab"]::-p-text(Podmínky používání)')).click();
  check('Záložka Podmínky používání', await b.hasText('Váš obsah', 4000));

  // Registrace: e-mail, heslo dvakrát, souhlas s podmínkami
  const email = `e2e-${Date.now()}@example.com`;
  await b.go('/prihlaseni');
  await (await b.page.waitForSelector('[role="tab"]::-p-text(Vytvořit účet)')).click();
  check('Registrace má pole Heslo znovu', await b.hasText('Heslo znovu'));
  await b.type('input[aria-label="E-mail"]', email);
  await b.type('input[aria-label="Heslo"]', 'Tajne-heslo-123');
  await b.type('input[aria-label="Heslo znovu"]', 'Jine-heslo-456');
  const register = async () => (await b.page.$$('[role="button"]::-p-text(Vytvořit účet)')).at(-1).click();
  await register();
  check('Různá hesla nejdou', await b.hasText('Hesla se neshodují', 4000));
  await b.fill('input[aria-label="Heslo znovu"]', 'Tajne-heslo-123');
  await register();
  check('Bez souhlasu nejde účet vytvořit', await b.hasText('potřebujeme váš souhlas', 4000));
  await (await b.page.waitForSelector('[role="checkbox"]')).click();
  check(
    'Souhlas je zaškrtnutý',
    await b.page.evaluate(() => document.querySelector('[role="checkbox"]')?.getAttribute('aria-checked') === 'true'),
  );
  await register();
  check('Po registraci se otevře průvodce', await b.hasText('Vítejte!', 15000));
  const saved = JSON.parse((await b.local('schranka:prihlaseni')) || '{}');
  check('Souhlas s podmínkami je uložený u účtu', saved?.user?.user_metadata?.souhlas?.verze === '2026-10-17');
  await b.click('Přeskočit, nastavím později');
  await b.hasText('Vítejte zpět', 15000);
  await b.go('/spravce');
  check('Správce ukazuje e-mail účtu', await b.hasText(email));
  await b.click('Smazat účet a všechna data');
  await b.hasText('Smazat účet?');
  await b.sleep(400);
  await b.click('Ano, smazat vše');
  check('Smazaný účet je odhlášený', await b.hasText('Vyzkoušet demo', 15000));
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 10).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
