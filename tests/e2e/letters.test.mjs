// Dopisy: všech 5 akceptačních kroků ze zadání, obnova z localStorage, smazání, inspirace.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base);
const url = () => b.page.url();
try {
  await b.go('/');
  await b.click('Vyzkoušet demo');
  await b.hasText('Místo pro slova, která', 15000);

  // 1) Otevřít profil fiktivního dítěte (Eliška)
  await b.go('/deti');
  await b.click('Eliška');
  check('1. Profil Elišky otevřen', await b.hasText('Profil dítěte'));

  // 2) Napsat dopis a uložit jako koncept
  await b.click('Napsat dopis');
  check('Editor se otevřel', await b.hasText('Pro:'));
  await b.type('input[aria-label="Název vzkazu"]', 'Testovací dopis');
  await b.type('textarea[aria-label="Text dopisu"]', 'Milá Eliško,\nmoc tě mám ráda.');
  await b.sleep(3000);
  check('Automatické uložení proběhlo', await b.hasText('Uloženo', 5000));
  check('Adresa se změnila na ID dopisu', /\/dopis\/[0-9a-f-]{36}/.test(url()), url());
  await b.shot('20-editor');
  await b.click('Uložit koncept');
  check('2. Koncept uložen (okno)', await b.hasText('Koncept je uložený'));
  await b.sleep(600);
  await b.shot('21-koncept-dialog');
  await b.click('Zpět na profil');
  check('Koncept je v profilu mezi rozepsanými', await b.hasText('Testovací dopis', 8000));

  // 3) Koncept znovu otevřít, upravit a dokončit
  await b.click('Testovací dopis');
  check('Koncept se otevřel v úpravách', await b.hasText('Uložit vzkaz'));
  const ta = await b.page.waitForSelector('textarea[aria-label="Text dopisu"]');
  await ta.click();
  await b.page.keyboard.press('End');
  await b.page.keyboard.down('Control'); await b.page.keyboard.press('End'); await b.page.keyboard.up('Control');
  await b.page.keyboard.type(' Dopsáno později.');
  await b.click('Uložit vzkaz');
  check('3. Dokončeno: okno „Malý krok s velkým významem“', await b.hasText('Malý krok s velkým významem'));
  await b.sleep(600);
  await b.shot('22-hotovo-dialog');
  await b.click('Pokračovat');
  check('Zpět v profilu', await b.hasText('Profil dítěte'));

  // 4) Najít hotový dopis v přehledu a otevřít ho
  check('4. Hotový dopis je v přehledu', await b.hasText('Testovací dopis'));
  await b.click('Testovací dopis');
  check('Hotový dopis se otevřel ke čtení', await b.hasText('Upravit dopis'));
  check('Text obsahuje doplněnou větu', await b.hasText('Dopsáno později.'));
  await b.shot('23-cteni');
  const letterUrl = url();

  // 5) Restartovat demo: uložený dopis stále existuje
  await b.page.goto('about:blank');
  await b.sleep(500);
  await b.page.goto(letterUrl, { waitUntil: 'load' });
  await b.sleep(3000);
  check('5. Po restartu dopis stále existuje', await b.hasText('Dopsáno později.'));

  // Místní záloha: napsat a hned zavřít (před uložením do databáze)
  await b.click('Upravit dopis');
  const ta2 = await b.page.waitForSelector('textarea[aria-label="Text dopisu"]');
  await ta2.click();
  await b.page.keyboard.down('Control'); await b.page.keyboard.press('End'); await b.page.keyboard.up('Control');
  await b.page.keyboard.type(' Záloha v zařízení.');
  await b.page.goto('about:blank');
  await b.page.goto(letterUrl, { waitUntil: 'load' });
  await b.sleep(3000);
  check('Neuložený text se obnovil z localStorage', await b.hasText('Obnovili jsme text'));
  check('Obnovený text je v dopisu', await b.page.evaluate(() => [...document.querySelectorAll('textarea')].some((t) => t.value.includes('Záloha v zařízení.'))));
  await b.sleep(2500);

  // Smazání vzkazu
  await b.page.goto(letterUrl, { waitUntil: 'load' });
  await b.sleep(3000);
  await b.click('Smazat vzkaz');
  check('Potvrzení smazání vzkazu', await b.hasText('Smazat tento vzkaz?'));
  await b.click('Ano, smazat');
  await b.sleep(2500);
  check('Po smazání zpět v profilu', await b.hasText('Profil dítěte'));
  check('Smazaný vzkaz zmizel', !(await b.hasText('Testovací dopis', 2000)));

  // Psaní z inspirace: výběr dítěte
  await b.go('/dopis/novy?otazka=' + encodeURIComponent('Co vaše dítě dělá tak, že se u toho musíte usmát?'));
  check('Inspirace: výběr dítěte', await b.hasText('Pro koho bude vzkaz?'));
  await b.click('Matěj');
  check('Inspirace: otázka v editoru', await b.hasText('musíte usmát'));
  await b.click('Uložit vzkaz');
  check('Prázdný vzkaz nejde uložit jako hotový', await b.hasText('Napište prosím aspoň jednu větu'));
  await b.shot('24-inspirace-editor');

  await b.endDemo();
  await b.hasText('Vítejte', 10000);
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 12).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
