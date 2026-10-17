// Ochrana osobních údajů (GDPR) a podmínky používání. Srozumitelně, bez právnické mlhy.
// Verze se ukládá k účtu spolu se souhlasem při registraci.
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export const TERMS_VERSION = '2026-10-17';
export const TERMS_DATE = '17. 10. 2026';
export const PROJECT_URL = 'https://github.com/Frantisek-Vojta/rakathon-26';

export type LegalSection = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  /** Odstavce. */
  text?: string[];
  /** Body seznamu. */
  points?: string[];
};

export const PRIVACY_LEAD =
  'Vaše vzpomínky patří vám. Vidíte je jen vy, nikomu je neposkytujeme a kdykoli si je můžete stáhnout nebo smazat.';

export const PRIVACY: LegalSection[] = [
  {
    icon: 'people-outline',
    title: 'Kdo údaje zpracovává',
    text: [
      'Tým projektu Schránka vzpomínek, který aplikaci vytvořil na hackathonu Rakathon 2026. Aplikace je zatím prototyp. Kontakt najdete na stránce projektu.',
    ],
  },
  {
    icon: 'document-text-outline',
    title: 'Jaké údaje ukládáme',
    points: [
      'E-mail a heslo. Heslo nikdy neukládáme v čitelné podobě, jen jako jeho otisk (hash).',
      'Jména nebo přezdívky dětí. Datum narození a popis jsou nepovinné.',
      'Vzpomínky, které sami vytvoříte: texty, fotky, hlasové nahrávky a videa.',
      'Vaše nastavení: míru podpory, připomínky a oblíbené otázky.',
      'Čas, kdy jste souhlasili s těmito podmínkami.',
    ],
    text: ['Neukládáme polohu, kontakty ani nic dalšího z telefonu. Nepoužíváme analytiku ani sledovací cookies.'],
  },
  {
    icon: 'flag-outline',
    title: 'Proč a na jakém základě',
    text: [
      'Údaje potřebujeme jen k tomu, aby vaše schránka fungovala (plnění smlouvy, čl. 6 odst. 1 písm. b GDPR). Vzpomínky mohou obsahovat i citlivé informace, například o zdraví. Ty zpracováváme jen s vaším výslovným souhlasem, který dáváte při registraci (čl. 9 odst. 2 písm. a GDPR).',
      'Údaje neprodáváme, nepoužíváme k reklamě ani k trénování umělé inteligence.',
    ],
  },
  {
    icon: 'server-outline',
    title: 'Kde jsou uložené',
    text: [
      'V databázi a úložišti souborů Supabase v datacentru v Londýně. Velká Británie má od Evropské unie rozhodnutí o odpovídající ochraně osobních údajů. Služba Vercel jen doručuje samotnou aplikaci, osobní údaje přes ni nejdou.',
    ],
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Jak je chráníme',
    points: [
      'Spojení s aplikací je vždy šifrované (HTTPS).',
      'Data na serveru jsou šifrovaná (AES-256), stejně jako soubory.',
      'Každý vidí jen své. Hlídá to přímo databáze u každého záznamu a souboru, ne jen aplikace. Ověřujeme to automatickým testem.',
      'Fotky, nahrávky a videa leží v soukromé složce. Aplikace k nim dostává jen odkazy platné jednu hodinu.',
      'Rozepsaný text se ukládá i ve vašem zařízení, aby se neztratil. Při odhlášení se smaže.',
    ],
    text: [
      'Upřímně: nejde zatím o šifrování „end-to-end“. Technicky by obsah mohl vidět správce serveru. Proto je šifrování přímo v zařízení naším dalším krokem.',
    ],
  },
  {
    icon: 'mic-outline',
    title: 'Diktování',
    text: [
      'Diktování textu na webu zajišťuje váš prohlížeč (Chrome k tomu používá služby Googlu). Když ho nechcete, stačí psát nebo nahrát hlasový vzkaz. Hlasové vzkazy zůstávají jen ve vaší schránce.',
    ],
  },
  {
    icon: 'time-outline',
    title: 'Jak dlouho údaje uchováváme',
    text: [
      'Dokud účet nesmažete. Smazáním účtu zmizí okamžitě a natrvalo všechno včetně souborů. Ukázkový demo účet se smaže i s daty při ukončení dema.',
    ],
  },
  {
    icon: 'hand-left-outline',
    title: 'Vaše práva',
    points: [
      'Přístup a přenositelnost: Správce schránky → Stáhnout zálohu (všechno v jednom souboru).',
      'Oprava: každou vzpomínku i profil můžete kdykoli upravit.',
      'Výmaz a odvolání souhlasu: Správce schránky → Smazat účet a všechna data.',
      'Stížnost: můžete se obrátit na Úřad pro ochranu osobních údajů (uoou.gov.cz).',
    ],
  },
  {
    icon: 'heart-outline',
    title: 'Údaje o dětech',
    text: [
      'Profily dětí zakládá a spravuje rodič. Stačí jméno nebo přezdívka. Děti do aplikace zatím přístup nemají, předání vzpomínek je další fáze projektu.',
    ],
  },
];

export const TERMS_LEAD =
  'Aplikace je laskavé a soukromé místo pro vzpomínky. Tady je jednoduše popsané, jak ji používat a co od nás můžete čekat.';

export const TERMS: LegalSection[] = [
  {
    icon: 'construct-outline',
    title: 'Prototyp',
    text: [
      'Schránka vzpomínek vznikla na hackathonu Rakathon 2026. Funguje, ale je to prototyp. Proto si důležité vzpomínky pravidelně zálohujte (Správce schránky → Stáhnout zálohu). Pro vyzkoušení používejte smyšlená data, například demo účet.',
    ],
  },
  {
    icon: 'person-outline',
    title: 'Účet',
    points: [
      'Účet je osobní, pro jednoho dospělého.',
      'Heslo si chraňte a nikomu ho nesdělujte.',
      'Demo účet je dočasný a jeho data se po ukončení dema smažou.',
    ],
  },
  {
    icon: 'images-outline',
    title: 'Váš obsah',
    points: [
      'Všechno, co vytvoříte, patří vám. Nezveřejňujeme to a nesdílíme.',
      'Nevkládejte obsah, který porušuje zákon nebo práva jiných lidí.',
      'Fotky a nahrávky jiných dospělých přidávejte jen s jejich souhlasem.',
    ],
  },
  {
    icon: 'leaf-outline',
    title: 'Bez tlaku a bez poplatků',
    text: [
      'Aplikace je zdarma a bez reklamy. Nejsou v ní žádné povinné úkoly ani odpočty. Připomínky si zapínáte jen vy a můžete je kdykoli vypnout.',
    ],
  },
  {
    icon: 'refresh-outline',
    title: 'Změny a ukončení',
    text: [
      'Když se podmínky změní, dáme vám vědět v aplikaci. Kdyby provoz někdy skončil, upozorníme vás s dostatečným předstihem, abyste si stihli stáhnout zálohu.',
    ],
  },
  {
    icon: 'information-circle-outline',
    title: 'Odpovědnost',
    text: [
      'Děláme maximum pro to, aby se nic neztratilo a aby data byla v bezpečí. Jako prototyp ale aplikace nemá zaručenou dostupnost.',
    ],
  },
];
