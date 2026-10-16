// Nabídky, ze kterých si rodič vybírá. Hodnoty musí odpovídat kontrolám v databázi.
import { Colors, Fonts } from './theme';
import type { ChildColor, LetterFont, Paper, Sticker } from '@/lib/data';

export const CHILD_COLORS: Record<ChildColor, { label: string; bg: string; fg: string }> = {
  rose: { label: 'Růžová', bg: Colors.primarySoft, fg: Colors.primary },
  sage: { label: 'Šalvějová', bg: Colors.sage, fg: Colors.sageDark },
  peach: { label: 'Meruňková', bg: Colors.peach, fg: Colors.peachDark },
  lavender: { label: 'Levandulová', bg: Colors.lavender, fg: Colors.lavenderDark },
  sky: { label: 'Nebeská', bg: Colors.sky, fg: Colors.skyDark },
};

export const PAPERS: Record<Paper, { label: string; color: string; edge: string }> = {
  bezova: { label: 'Béžová', color: '#FBF5EA', edge: '#EADBC4' },
  ruzova: { label: 'Růžová', color: '#FCEDEA', edge: '#F2CFC8' },
  salvejova: { label: 'Šalvějová', color: '#EFF4EA', edge: '#CFDCC6' },
  merunkova: { label: 'Meruňková', color: '#FDF0E4', edge: '#F3D3B5' },
  piskova: { label: 'Písková', color: '#F7F0E6', edge: '#E3D5BF' },
};

export const FONTS: Record<LetterFont, { label: string; family: string; size: number; lineHeight: number }> = {
  lora: { label: 'Klasické', family: Fonts.heading, size: 18, lineHeight: 30 },
  nunito: { label: 'Jednoduché', family: Fonts.body, size: 18, lineHeight: 29 },
  caveat: { label: 'Ručně psané', family: Fonts.handwriting, size: 25, lineHeight: 34 },
};

export const STICKERS: Record<Sticker, { label: string; emoji: string }> = {
  srdce: { label: 'Srdce', emoji: '❤️' },
  kvetina: { label: 'Květina', emoji: '🌸' },
  hvezda: { label: 'Hvězda', emoji: '⭐' },
  medvidek: { label: 'Medvídek', emoji: '🧸' },
  slunce: { label: 'Slunce', emoji: '☀️' },
  duha: { label: 'Duha', emoji: '🌈' },
  obalka: { label: 'Obálka', emoji: '💌' },
};

// Příležitosti, ke kterým může vzkaz patřit. Jen štítek, žádné odpočty ani připomínky.
export const OCCASIONS = [
  'Kdykoli',
  'K narozeninám',
  'První den ve škole',
  'Až bude těžko',
  'Na dobrou noc',
  'K 18. narozeninám',
  'K maturitě',
  'Na svatbu',
  'Až budeš mít vlastní dítě',
] as const;
