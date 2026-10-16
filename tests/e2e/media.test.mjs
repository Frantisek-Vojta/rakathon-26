// Fotky, hlas a video: ukázková média se zobrazí a přehrají, nahrání hlasu a přidání fotky funguje.
import { readFileSync } from 'node:fs';
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const photo = readFileSync(new URL('../../supabase/demo-media/foto-louka.jpg', import.meta.url)).toString('base64');
const b = await open(base);
const imageLoaded = (alt) =>
  b.page.evaluate((a) => [...document.querySelectorAll(`img[alt="${a}"]`)].some((i) => i.complete && i.naturalWidth > 0), alt);
try {
  await b.startDemo();

  // Ukázková fotka
  await b.go('/deti');
  await b.click('Matěj');
  check('Profil nabízí 4 způsoby vzpomínky', (await b.hasText('Nahrát hlas')) && (await b.hasText('Natočit video')) && (await b.hasText('Přidat fotku')));
  await b.click('Naše louka');
  await b.sleep(3000);
  check('Ukázková fotka se zobrazí', await imageLoaded('Fotka u vzpomínky'));
  await b.shot('40-fotka');

  // Ukázková ukolébavka
  await b.go('/deti');
  await b.click('Eliška');
  await b.click('Ukolébavka na dobrou noc');
  const play = await b.page.waitForSelector('[aria-label="Přehrát nahrávku"]', { timeout: 15000 }).catch(() => null);
  check('Hlasový vzkaz má přehrávač', !!play && (await b.hasText('0:26', 5000)));
  await play.click();
  await b.sleep(2500);
  check('Nahrávka se přehrává', !!(await b.page.$('[aria-label="Pozastavit nahrávku"]')));
  await b.shot('41-hlas');
  await b.page.click('[aria-label="Pozastavit nahrávku"]');

  // Ukázkové video
  await b.go('/deti');
  await b.click('Aneta');
  await b.click('Video k tvým narozeninám');
  await b.sleep(3000);
  check('Video vzkaz má přehrávač', await b.page.evaluate(() => [...document.querySelectorAll('video')].some((v) => !!v.src)));
  await b.shot('42-video');

  // Nový hlasový vzkaz (testovací mikrofon)
  await b.go('/deti');
  await b.click('Eliška');
  await b.click('Nahrát hlas');
  check('Editor hlasového vzkazu', await b.hasText('Klepněte a mluvte'));
  await b.page.click('[aria-label="Začít nahrávat hlas"]');
  check('Nahrávání běží', await b.hasText('Nahrávám', 8000));
  await b.sleep(3000);
  await b.page.click('[aria-label="Zastavit nahrávání"]');
  check('Nahrávka se nahrála a jde přehrát', !!(await b.page.waitForSelector('[aria-label="Přehrát nahrávku"]', { timeout: 20000 }).catch(() => null)));
  await b.shot('43-nahrano');
  await b.click('Uložit vzkaz');
  check('Hlasový vzkaz uložen', await b.hasText('Malý krok s velkým významem', 10000));
  await b.click('Pokračovat');
  check('Hlasový vzkaz je v profilu', await b.hasText('Hlasový vzkaz 0:0', 8000));

  // Nová fotka z galerie
  await b.go('/deti');
  await b.click('Matěj');
  await b.click('Přidat fotku');
  check('Editor fotky', await b.hasText('Vybrat z galerie'));
  await b.prepareFile(photo, 'image/jpeg', 'louka.jpg');
  await b.click('Vybrat z galerie');
  await b.sleep(4000);
  check('Vybraná fotka se nahrála a zobrazí', await imageLoaded('Fotka u vzpomínky'));
  await b.type('textarea[aria-label="Text dopisu"]', 'Testovací fotka z galerie.');
  await b.click('Uložit vzkaz');
  check('Fotka uložena', await b.hasText('Malý krok s velkým významem', 10000));
  await b.click('Pokračovat');

  // Bez souboru nejde uložit hotovou fotku
  await b.go('/deti');
  await b.click('Aneta');
  await b.click('Natočit video');
  check('Editor videa', await b.hasText('Natočte video vzkaz'));
  await b.click('Uložit vzkaz');
  check('Hotové video bez videa nejde uložit', await b.hasText('Nejdřív prosím přidejte video.'));

  // Filtr ve Správci
  await b.go('/spravce');
  const radios = await b.page.$$('[role="radio"][aria-label="Hlas"]');
  await radios[0].click();
  await b.sleep(500);
  check('Filtr Hlas ukáže ukolébavku', await b.hasText('Ukolébavka na dobrou noc', 3000));
  check('Filtr Hlas skryje dopisy', !(await b.hasText('Náš výlet k moři', 1500)));

  await b.endDemo();
  check('Demo ukončeno', await b.hasText('Vyzkoušet demo', 15000));
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 12).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
