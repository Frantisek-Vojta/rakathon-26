// Barvy, písma a rozestupy podle návrhů obrazovek od FN Olomouc.
// Teplé akvarelové tóny: krémové pozadí, vínové nadpisy, terakotová tlačítka.
// Všechny dvojice text/pozadí splňují kontrast WCAG AA (aspoň 4,5 : 1), ověřeno auditem.

export const Colors = {
  background: '#FCF7F2',
  surface: '#FFFFFF',
  surfaceSoft: '#FBEFEA',
  border: '#F0E2DA',
  borderStrong: '#E3CFC6',

  heading: '#7A2E2E',
  text: '#4A3B38',
  textMuted: '#6F5E59',
  /** Zástupný text v polích a drobné ikony. */
  textFaint: '#7F6E69',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  success: '#426C3E',
  successSoft: '#E6EFE2',
  draft: '#355A9C',
  draftSoft: '#E5EEFB',

  /** Pozadí hlavních tlačítek (bílý text 5,3 : 1). */
  primary: '#A3554B',
  primaryPressed: '#8F463D',
  /** Terakotová pro text a odkazy na světlém podkladu. */
  primaryText: '#94473F',
  primarySoft: '#F7DEDA',
  onPrimary: '#FFFFFF',

  sage: '#E5ECDF',
  sageDark: '#52704E',
  peach: '#FCE8D6',
  peachDark: '#9C5F30',
  lavender: '#ECE7F6',
  lavenderDark: '#5F4F92',
  sky: '#E1ECF5',
  skyDark: '#3F6E93',
} as const;

export const Fonts = {
  heading: 'Lora_600SemiBold',
  headingBold: 'Lora_700Bold',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  handwriting: 'Caveat_500Medium',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Šířky obsahu: formuláře, běžný obsah, čtení dopisu, mřížky na počítači. */
export const ContentWidth = {
  narrow: 560,
  content: 760,
  wide: 1080,
} as const;

/** Body zlomu podle obsahu: od tabletu dvě kolony, od počítače boční menu. */
export const Breakpoints = {
  tablet: 700,
  desktop: 1024,
} as const;

/** Jemný stín papíru a karet (posun + rozostření, ne ostrá hrana). */
export const Shadows = {
  paper: '0px 8px 24px rgba(122, 46, 46, 0.08)',
  card: '0px 2px 10px rgba(122, 46, 46, 0.05)',
  dialog: '0px 18px 48px rgba(74, 59, 56, 0.22)',
} as const;
