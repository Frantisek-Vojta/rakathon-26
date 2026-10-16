// Akvarelové ilustrace vyříznuté z podkladů FN Olomouc (assets/images/ilustrace).
// Okraje jsou prolnuté do průhledna, takže splynou s pozadím aplikace.

export const ILLUSTRATIONS = {
  krajina: { source: require('@/assets/images/ilustrace/krajina.webp'), ratio: 900 / 689 },
  rodina: { source: require('@/assets/images/ilustrace/rodina.webp'), ratio: 860 / 330 },
  obalka: { source: require('@/assets/images/ilustrace/obalka.webp'), ratio: 820 / 680 },
  kytice: { source: require('@/assets/images/ilustrace/kytice.webp'), ratio: 800 / 720 },
  krajinaPruh: { source: require('@/assets/images/ilustrace/krajina-pruh.webp'), ratio: 900 / 335 },
  objeti: { source: require('@/assets/images/ilustrace/objeti.webp'), ratio: 471 / 420 },
  kniha: { source: require('@/assets/images/ilustrace/kniha.webp'), ratio: 478 / 340 },
  krabice: { source: require('@/assets/images/ilustrace/krabice.webp'), ratio: 401 / 370 },
} as const;

export type IllustrationName = keyof typeof ILLUSTRATIONS;
