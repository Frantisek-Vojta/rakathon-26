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
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 10).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
