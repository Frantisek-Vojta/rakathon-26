// Otázky a nápady, které pomáhají začít psát. Formulované tak, aby nikoho
// netlačily a nevyžadovaly rod (fungují pro mámu, tátu i jiné blízké).

export type PromptGroup = { title: string; icon: 'time-outline' | 'person-outline' | 'compass-outline' | 'heart-outline' | 'flag-outline'; prompts: string[] };

export const PROMPT_GROUPS: PromptGroup[] = [
  {
    title: 'Společné vzpomínky',
    icon: 'time-outline',
    prompts: [
      'Jaký byl den, kdy se vaše dítě narodilo?',
      'Která společná chvíle vás vždycky rozesměje?',
      'Na jaký výlet nebo dovolenou se nedá zapomenout?',
      'Jakou pohádku nebo písničku máte spolu nejraději?',
      'Co vaše dítě dělá tak, že se u toho musíte usmát?',
    ],
  },
  {
    title: 'O vás a vaší rodině',
    icon: 'person-outline',
    prompts: [
      'Jaké bylo vaše dětství a co z něj chcete předat dál?',
      'Jak začal příběh vaší rodiny?',
      'Jaký recept, tradice nebo rodinný zvyk má zůstat v rodině?',
      'Čeho si ve svém životě nejvíc vážíte?',
      'Co vás v životě nejvíc naučilo?',
    ],
  },
  {
    title: 'Rady na cestu',
    icon: 'compass-outline',
    prompts: [
      'Co by vaše dítě mělo vědět o přátelství?',
      'Jak se dá zvládnout první velké zklamání?',
      'Co dělat, když se něco nepovede?',
      'Jak poznat, co je v životě opravdu důležité?',
    ],
  },
  {
    title: 'Pro těžší chvíle',
    icon: 'heart-outline',
    prompts: [
      'Co by mělo vaše dítě slyšet ve chvíli, kdy je mu smutno?',
      'Jak ho povzbudit, když se bude bát?',
      'Co chcete, aby vaše dítě vědělo o vaší lásce?',
    ],
  },
  {
    title: 'Budoucí milníky',
    icon: 'flag-outline',
    prompts: [
      'Co popřát k prvnímu dni ve škole?',
      'Co napsat k osmnáctým narozeninám?',
      'Co vzkázat k maturitě nebo prvnímu zaměstnání?',
      'Co popřát do dne svatby?',
      'Co říct, až bude mít samo dítě?',
    ],
  },
];

export const ALL_PROMPTS = PROMPT_GROUPS.flatMap((g) => g.prompts);

/** Otázka dne: každý den jiná, ale celý den stejná. */
export function promptOfTheDay(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return ALL_PROMPTS[day % ALL_PROMPTS.length];
}

/** Nápady na vzpomínkové dary mimo telefon (zadání: „Otevřená nápadům“). */
export const OFFLINE_GIFTS = [
  { emoji: '✋', text: 'Otisk ruky nebo nožičky na papír či do sádry.' },
  { emoji: '📦', text: 'Krabička drobností: lístek z kina, mušle z dovolené, oblíbená hračka.' },
  { emoji: '📖', text: 'Kniha, kterou jste spolu četli, s věnováním na první stránce.' },
  { emoji: '🎙️', text: 'Nahraná pohádka na dobrou noc vaším hlasem.' },
  { emoji: '📷', text: 'Fotoalbum s popisky psanými vaší rukou.' },
  { emoji: '🧣', text: 'Šála nebo svetr, který voní domovem.' },
  { emoji: '🍰', text: 'Rodinný recept napsaný vaším písmem.' },
];
