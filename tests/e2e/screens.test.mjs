// Domů, Inspirace a Správce schránky: přehled, filtry, hledání, export.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base);
try {
  await b.startDemo();
  check('Domů: návrat „Vítejte zpět“', await b.hasText('Vítejte zpět'));
  check('Domů: jemné povzbuzení', await b.hasText('Není potřeba spěchat'));
  check('Domů: průvodce energií', await b.hasText('Kolik máte dnes sil?'));
  check('Domů: pokračovat v konceptu', await b.hasText('Pokračovat v konceptu'));
  await b.sleep(800);
  await b.shot('30-domu');
  await b.click('Začít jednou větou');
  check('Jedna věta vede na výběr dítěte', await b.hasText('Pro koho bude vzkaz?'));

  await b.go('/inspirace');
  check('Inspirace: skupiny otázek', await b.hasText('Společné vzpomínky'));
  check('Inspirace: životní příběhy', await b.hasText('Moje životní příběhy'));
  check('Inspirace: mimo aplikaci', await b.hasText('Nemusí to být jen v aplikaci'));
  await b.shot('31-inspirace');
  await b.click('Jak začal příběh vaší rodiny?');
  check('Otázka z inspirace vede na výběr dítěte', await b.hasText('Pro koho bude vzkaz?'));
  check('Otázka je vidět u výběru', await b.hasText('Jak začal příběh vaší rodiny?'));

  // Oblíbené otázky (srdíčko) přežijí obnovení stránky
  await b.go('/inspirace');
  const hearts = await b.page.$$('[role="button"][aria-label="Uložit do oblíbených"]');
  await hearts[0].click();
  check('Oblíbená otázka se ukáže v Moje oblíbené', await b.hasText('Moje oblíbené', 5000));
  await b.sleep(1500);
  await b.go('/inspirace', 3500);
  check('Oblíbené zůstanou i po obnovení', await b.hasText('Moje oblíbené', 5000));
  await (await b.page.waitForSelector('[role="button"][aria-label="Odebrat z oblíbených"]')).click();
  check('Oblíbenou otázku jde odebrat', !(await b.hasText('Moje oblíbené', 2000)));

  // Zápis dárku mimo aplikaci
  await (await b.page.waitForSelector('[role="button"][aria-label="Zapsat dar: Krabice vzpomínek"]')).click();
  check('Zápis daru začíná výběrem dítěte', await b.hasText('Pro koho bude vzkaz?'));
  await b.click('Eliška');
  check(
    'Dar má předvyplněný název a příležitost',
    (await b.hasText('Dar mimo aplikaci')) &&
      (await b.page.evaluate(() => document.querySelector('input[aria-label="Název vzkazu"]')?.value === 'Krabice vzpomínek')),
  );
  await b.type('textarea[aria-label="Text dopisu"]', 'Krabice je v šatně nahoře, jsou v ní tvoje první botičky.');
  await b.click('Uložit vzkaz');
  check('Zapsaný dar se uloží', await b.hasText('Malý krok s velkým významem', 10000));

  await b.go('/smysl');
  check('Proč to má smysl', await b.hasText('Vzpomínky mají smysl'));

  // Mapa vzpomínek: z domovské obrazovky přes „Jen si vše projít“
  await b.go('/');
  await b.click('Jen si vše projít');
  check('Mapa vzpomínek se otevře', await b.hasText('Mapa vzpomínek'));
  check('Souhrn pod mapou', await b.hasText('Zatím 8 hotových vzpomínek'));
  const places = await b.page.evaluate(
    () => [...document.querySelectorAll('[role="button"]')].filter((e) => /\n(Eliška|Matěj|Aneta)$/.test(e.innerText.trim())).length,
  );
  check('Na mapě je 8 hotových vzpomínek', places === 8, `${places} míst`);
  await b.click('Náš výlet k moři');
  check('Místo na mapě otevře vzpomínku', await b.hasText('Upravit dopis'));

  await b.go('/deti');
  await b.click('Eliška');
  await b.click('Časová osa');
  check('Časová osa: milníky', await b.hasText('18. narozeniny'));
  check('Časová osa: hotový vzkaz u školy', await b.hasText('Vytvořeno'));
  await b.shot('33-casova-osa');
  await b.click('Svatba');
  check('Milník otevře nový vzkaz s příležitostí', await b.hasText('Na svatbu'));

  await b.go('/spravce');
  check('Správce: přehled', await b.hasText('Co už je vytvořeno'));
  check('Správce: souhrn', await b.hasText('3 děti · 8 hotových vzpomínek · 3 koncepty'));
  await b.shot('32-spravce');
  const radios = await b.page.$$('[role="radio"][aria-label="Koncepty"]');
  await radios[0].click();
  await b.sleep(500);
  check('Filtr koncepty: koncept je vidět', await b.hasText('Vzkaz, když budeš potřebovat sílu', 3000));
  check('Filtr koncepty: hotový skrytý', !(await b.hasText('Náš výlet k moři', 1500)));
  const all = await b.page.$$('[role="radio"][aria-label="Vše"]');
  await all[0].click();
  await b.type('input[aria-label="Hledat ve vzkazech"]', 'moř');
  await b.sleep(500);
  check('Hledání najde vzkaz o moři', await b.hasText('Náš výlet k moři', 3000));
  check('Hledání skryje ostatní', !(await b.hasText('Na první den ve škole', 1500)));
  check('Záloha je k dispozici', await b.hasText('Stáhnout zálohu'));
  check('Informace o ochraně dat', await b.hasText('Jak chráníme vaše vzpomínky'));

  // Klidný režim: bez povzbuzení a motivačních prvků
  await b.click('Klidný režim');
  await b.sleep(1500);
  await b.go('/');
  check('Klidný režim: bez povzbuzení', !(await b.hasText('Není potřeba spěchat', 2000)));
  await b.endDemo();
  check('Demo ukončeno', await b.hasText('Vyzkoušet demo', 10000));
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 12).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
