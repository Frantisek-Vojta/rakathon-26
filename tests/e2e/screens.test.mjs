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

  await b.go('/smysl');
  check('Proč to má smysl', await b.hasText('Vzpomínky mají smysl'));

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
  check('Správce: souhrn', await b.hasText('3 děti · 4 hotové vzkazy · 3 koncepty'));
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
  check('Export je k dispozici', await b.hasText('Stáhnout všechny vzkazy'));
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
