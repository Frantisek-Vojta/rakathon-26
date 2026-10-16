// Volby podpory: sdílené pro uvítacího průvodce i pro nastavení ve Správci schránky.
import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { Colors } from './theme';
import type { Interest, Reminders, Support } from '@/lib/preferences';

type Option<K> = {
  key: K;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  iconColor: string;
};

export const INTEREST_OPTIONS: Option<Interest>[] = [
  {
    key: 'inspirace',
    title: 'Inspirace a tipy',
    description: 'Otázka na každý den a nápady, jak začít.',
    icon: 'bulb-outline',
    tint: Colors.peach,
    iconColor: Colors.peachDark,
  },
  {
    key: 'oceneni',
    title: 'Ocenění malých kroků',
    description: 'Laskavé poděkování, když něco uložíte.',
    icon: 'heart-outline',
    tint: Colors.primarySoft,
    iconColor: Colors.primaryText,
  },
  {
    key: 'citat',
    title: 'Citát dne',
    description: 'Krátká myšlenka na úvodní obrazovce.',
    icon: 'leaf-outline',
    tint: Colors.sage,
    iconColor: Colors.sageDark,
  },
  {
    key: 'pribehy',
    title: 'Prostor pro vlastní příběhy',
    description: 'Podněty k zachycení vašeho života a hodnot.',
    icon: 'book-outline',
    tint: Colors.lavender,
    iconColor: Colors.lavenderDark,
  },
  {
    key: 'pripominky',
    title: 'Jemné připomínky',
    description: 'Občas připomenout, že je tu prostor pro vzpomínku.',
    icon: 'notifications-outline',
    tint: Colors.sky,
    iconColor: Colors.skyDark,
  },
];

export const SUPPORT_OPTIONS: Option<Support>[] = [
  {
    key: 'jemne',
    title: 'Jemné vedení',
    description: 'Občasné povzbuzení a malé ocenění kroků. Připomínky jen když si je zapnete.',
    icon: 'flower-outline',
    tint: Colors.primarySoft,
    iconColor: Colors.primaryText,
  },
  {
    key: 'klidne',
    title: 'Klidný režim',
    description: 'Bez připomínek a motivačních prvků. Jen vy a vaše slova.',
    icon: 'leaf-outline',
    tint: Colors.sage,
    iconColor: Colors.sageDark,
  },
];

export const REMINDER_OPTIONS: Option<Reminders>[] = [
  {
    key: 'tydne',
    title: 'Ano, jemně',
    description: 'Jednou týdně, ve čtvrtek večer.',
    icon: 'notifications-outline',
    tint: Colors.sky,
    iconColor: Colors.skyDark,
  },
  {
    key: 'casteji',
    title: 'Ano, častěji',
    description: 'Třikrát týdně.',
    icon: 'notifications-circle-outline',
    tint: Colors.sky,
    iconColor: Colors.skyDark,
  },
  {
    key: 'ne',
    title: 'Ne, děkuji',
    description: 'Žádné připomínky.',
    icon: 'notifications-off-outline',
    tint: Colors.surfaceSoft,
    iconColor: Colors.textMuted,
  },
];

/** Citáty dne (v jemném vedení, když si je rodič zapne). */
export const QUOTES = [
  'I malý krok je stále krokem vpřed.',
  'Jsem tady s tebou, jen jiným způsobem.',
  'Technologie nenahrazuje vztah, ale může ho pomoci uchovat.',
  'I krátká vzpomínka může mít jednou velkou hodnotu.',
  'Stačí jedna věta, jedna myšlenka, jeden pocit.',
  'Není potřeba spěchat. I malý návrat má smysl.',
];

export function quoteOfTheDay(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return QUOTES[day % QUOTES.length];
}
