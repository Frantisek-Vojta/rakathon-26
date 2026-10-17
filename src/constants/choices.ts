// Nabídky, ze kterých si rodič vybírá. Hodnoty musí odpovídat kontrolám v databázi.
import { Colors, Fonts } from './theme';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import type { ChildColor, LetterFont, Paper, Sticker } from '@/lib/data';

type StickerIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const CHILD_COLORS: Record<ChildColor, { label: string; bg: string; fg: string }> = {
  rose: { label: 'Růžová', bg: Colors.primarySoft, fg: Colors.primary },
  sage: { label: 'Šalvějová', bg: Colors.sage, fg: Colors.sageDark },
  peach: { label: 'Meruňková', bg: Colors.peach, fg: Colors.peachDark },
  lavender: { label: 'Levandulová', bg: Colors.lavender, fg: Colors.lavenderDark },
  sky: { label: 'Nebeská', bg: Colors.sky, fg: Colors.skyDark },
};

// `name` je celý název („papír“ je rodu mužského: Béžový papír, ne Béžová papír).
export const PAPERS: Record<Paper, { label: string; name: string; color: string; edge: string }> = {
  bezova: { label: 'Béžová', name: 'Béžový papír', color: '#FBF5EA', edge: '#EADBC4' },
  ruzova: { label: 'Růžová', name: 'Růžový papír', color: '#FCEDEA', edge: '#F2CFC8' },
  salvejova: { label: 'Šalvějová', name: 'Šalvějový papír', color: '#EFF4EA', edge: '#CFDCC6' },
  merunkova: { label: 'Meruňková', name: 'Meruňkový papír', color: '#FDF0E4', edge: '#F3D3B5' },
  piskova: { label: 'Písková', name: 'Pískový papír', color: '#F7F0E6', edge: '#E3D5BF' },
};

export const FONTS: Record<LetterFont, { label: string; family: string; size: number; lineHeight: number }> = {
  lora: { label: 'Klasické', family: Fonts.heading, size: 18, lineHeight: 30 },
  nunito: { label: 'Jednoduché', family: Fonts.body, size: 18, lineHeight: 29 },
  caveat: { label: 'Ručně psané', family: Fonts.handwriting, size: 25, lineHeight: 34 },
};

// Nálepky jsou ikony (ne emoji), aby vypadaly všude stejně a ladily s aplikací.
export const STICKERS: Record<Sticker, { label: string; icon: StickerIconName; color: string }> = {
  srdce: { label: 'Srdce', icon: 'heart', color: '#C2453D' },
  kvetina: { label: 'Květina', icon: 'flower', color: '#C4577D' },
  hvezda: { label: 'Hvězda', icon: 'star', color: '#B98419' },
  medvidek: { label: 'Medvídek', icon: 'teddy-bear', color: '#8A5A35' },
  slunce: { label: 'Slunce', icon: 'white-balance-sunny', color: '#C97516' },
  duha: { label: 'Duha', icon: 'looks', color: '#6E5BA8' },
  obalka: { label: 'Obálka', icon: 'email-heart-outline', color: '#94473F' },
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
