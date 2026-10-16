// Děti: seznam, profil, úprava, přidání s kontrolou chyb, smazání.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base);
try {
  await b.startDemo();
  await b.go('/deti');
  check('Seznam ukazuje Elišku', await b.hasText('Eliška'));
  check('Seznam ukazuje Matěje a Anetu', (await b.hasText('Matěj')) && (await b.hasText('Aneta')));
  check('Počty vzpomínek podle typu', (await b.hasText('3 dopisy')) && (await b.hasText('1 nahrávka')));
  await b.shot('10-deti');
  await b.click('Eliška');
  check('Profil Elišky se otevřel', await b.hasText('Vytvořit novou vzpomínku'));
  check('Profil ukazuje věk', await b.hasText('6 let'));
  check('Profil ukazuje rozepsané vzkazy', await b.hasText('Rozepsané'));
  check('Profil ukazuje hotové vzkazy', await b.hasText('K tvým 7. narozeninám'));
  await b.shot('11-profil');
  await b.click('Upravit');
  check('Úprava profilu se otevřela', await b.hasText('Upravit profil'));
  await b.fill('textarea[aria-label="Pár slov o dítěti (nepovinné)"]', 'Upravený popis z testu.');
  await b.click('Uložit změny');
  check('Změna popisu se uložila', await b.hasText('Upravený popis z testu.', 10000));
  await b.go('/dite/novy');
  check('Formulář nového dítěte', await b.hasText('Přidat dítě'));
  await b.click('Uložit profil');
  check('Prázdné jméno ukáže chybu', await b.hasText('Napište prosím jméno.'));
  await b.type('input[aria-label="Jméno nebo oslovení"]', 'Toník');
  await b.type('input[aria-label="Datum narození (nepovinné)"]', '31. 2. 2020');
  await b.click('Uložit profil');
  check('Neplatné datum ukáže chybu', await b.hasText('Napište datum jako'));
  await b.fill('input[aria-label="Datum narození (nepovinné)"]', '1. 2. 2020');
  await b.click('Uložit profil');
  check('Nové dítě má profil', await b.hasText('Zatím tu není žádný vzkaz', 10000));
  await b.shot('12-novy-profil');
  await b.click('Upravit');
  await b.click('Smazat profil');
  check('Potvrzení smazání', await b.hasText('Tento krok nejde vrátit'));
  await b.shot('13-smazat');
  await b.click('Ano, smazat');
  await b.sleep(2500);
  await b.go('/deti');
  check('Smazané dítě zmizelo', !(await b.hasText('Toník', 2500)));
  await b.endDemo();
  await b.hasText('Vyzkoušet demo', 10000);
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 10).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
