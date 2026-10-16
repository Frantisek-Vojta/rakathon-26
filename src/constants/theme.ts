// Barvy, písma a rozestupy podle návrhů obrazovek od FN Olomouc.
// Teplé akvarelové tóny: krémové pozadí, vínové nadpisy, terakotová tlačítka.

export const Colors = {
  background: '#FCF7F2',
  surface: '#FFFFFF',
  surfaceSoft: '#FBEFEA',
  border: '#F0E2DA',

  heading: '#7A2E2E',
  text: '#4A3B38',
  textMuted: '#7D6B66',

  primary: '#B5655B',
  primaryPressed: '#9E5249',
  primarySoft: '#F7DEDA',
  onPrimary: '#FFFFFF',

  sage: '#E5ECDF',
  sageDark: '#5E7A5A',
  peach: '#FCE8D6',
  peachDark: '#B9733F',
  lavender: '#ECE7F6',
  lavenderDark: '#6B5A9E',
} as const;

export const Fonts = {
  heading: 'Lora_600SemiBold',
  headingBold: 'Lora_700Bold',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  md: 16,
  lg: 24,
  pill: 999,
} as const;

// Na širokém monitoru appka nepřeteče do šířky, zůstane jako telefon.
export const MaxContentWidth = 560;
