// Domů, Inspirace a Správce schránky: přehled, filtry, hledání, export.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base);
try {
  await b.go('/');
  await b.click('Vyzkoušet demo');
  check('Domů: hlavní nadpis', await b.hasText('Místo pro slova, která', 15000));
  check('Domů: rozepsané vzkazy', await b.hasText('Rozepsané vzkazy'));
  check('Domů: dnešní malý krok', await b.hasText('Dnešní malý krok'));
  await b.sleep(800);
  await b.shot('30-domu');
  await b.click('Napsat jednu větu');
  check('Malý krok vede na výběr dítěte', await b.hasText('Pro koho bude vzkaz?'));

  await b.go('/inspirace');
  check('Inspirace: skupiny otázek', await b.hasText('Společné vzpomínky'));
  check('Inspirace: dary mimo telefon', await b.hasText('Dary mimo telefon'));
  await b.shot('31-inspirace');
  await b.click('Jak začal příběh vaší rodiny?');
  check('Otázka z inspirace vede na výběr dítěte', await b.hasText('Pro koho bude vzkaz?'));
  check('Otázka je vidět u výběru', await b.hasText('Jak začal příběh vaší rodiny?'));

  await b.go('/spravce');
  check('Správce: přehled', await b.hasText('Co už je vytvořeno'));
  check('Správce: počet dětí 3', await b.page.$('[aria-label="Děti: 3"]') !== null);
  check('Správce: hotové 4', await b.page.$('[aria-label="Hotové: 4"]') !== null);
  check('Správce: koncepty 3', await b.page.$('[aria-label="Koncepty: 3"]') !== null);
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
  await b.endDemo();
  check('Demo ukončeno', await b.hasText('Vítejte', 10000));
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 12).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
