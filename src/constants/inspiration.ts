// Otázky a nápady, které pomáhají začít psát. Formulované tak, aby nikoho
// netlačily a nevyžadovaly rod (fungují pro mámu, tátu i jiné blízké).

export type PromptGroup = {
  title: string;
  icon: 'time-outline' | 'person-outline' | 'compass-outline' | 'heart-outline' | 'flag-outline';
  prompts: string[];
};

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

type IconName =
  | 'cube-outline'
  | 'create-outline'
  | 'images-outline'
  | 'bed-outline'
  | 'flower-outline'
  | 'restaurant-outline'
  | 'diamond-outline'
  | 'mic-outline'
  | 'hand-left-outline'
  | 'home-outline'
  | 'sunny-outline'
  | 'heart-outline'
  | 'people-outline'
  | 'leaf-outline';

/** Nápady na vzpomínkové dary mimo telefon (podklady „Mimo aplikaci“, princip „Otevřená nápadům“). */
export const OFFLINE_GIFTS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'cube-outline', title: 'Krabice vzpomínek', text: 'Naplněná drobnostmi, které mají příběh.' },
  { icon: 'create-outline', title: 'Ručně psané dopisy', text: 'Slova na papíře mají sílu zůstat navždy.' },
  { icon: 'images-outline', title: 'Fotokniha', text: 'Vaše společné chvíle v jedné knize.' },
  { icon: 'mic-outline', title: 'Nahraná pohádka', text: 'Váš hlas na dobrou noc, i za mnoho let.' },
  { icon: 'bed-outline', title: 'Deka s fotografiemi', text: 'Teplo vzpomínek, které obejme.' },
  { icon: 'flower-outline', title: 'Oblíbená vůně', text: 'Vůně, která vrací pocity a okamžiky.' },
  { icon: 'restaurant-outline', title: 'Rodinné recepty', text: 'Chutě dětství, které se předávají dál.' },
  { icon: 'hand-left-outline', title: 'Otisk ruky', text: 'Na papír nebo do sádry, malá i velká dlaň vedle sebe.' },
  { icon: 'diamond-outline', title: 'Šperk s fotografií', text: 'Vzpomínka, kterou má vždy u sebe.' },
];

/** Moje životní příběhy: témata pro zachycení vlastního života (podklady FN Olomouc). */
export const LIFE_STORIES: { icon: IconName; title: string; question: string }[] = [
  {
    icon: 'home-outline',
    title: 'Dětství a rodina',
    question: 'Kde jsem vyrůstal/a, jaká byla moje rodina a co mě formovalo?',
  },
  { icon: 'sunny-outline', title: 'Velké radosti', question: 'Co mi přinášelo štěstí a co dělá můj život krásnějším?' },
  {
    icon: 'heart-outline',
    title: 'Těžké chvíle a co mi pomohlo',
    question: 'S čím jsem se potýkal/a, co mi pomohlo a co jsem se z toho naučil/a?',
  },
  {
    icon: 'people-outline',
    title: 'Lidé, kteří mě formovali',
    question: 'Kteří lidé měli na můj život velký vliv a proč?',
  },
  {
    icon: 'leaf-outline',
    title: 'Hodnoty a přání pro tebe',
    question: 'V co věřím, co je pro mě důležité a co ti chci předat do života?',
  },
];
