// Česká čísla, data a věk.

/** Skloňování: plural(3, 'rok', 'roky', 'let') → "3 roky". */
export function plural(n: number, one: string, few: string, many: string) {
  const word = n === 1 ? one : n >= 2 && n <= 4 ? few : many;
  return `${n} ${word}`;
}

/** Datum ve tvaru "15. 5. 2025". */
export function formatDate(value: string | Date | null | undefined) {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

/** Datum narození z databáze ("2019-05-15") → "15. 5. 2019". */
export function formatBirthDate(isoDate: string | null | undefined) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d}. ${m}. ${y}`;
}

/**
 * Přečte datum napsané česky ("15. 5. 2019", "15.5.2019", "15/5/2019").
 * Vrací "2019-05-15" pro databázi, null pro prázdný vstup, nebo 'invalid'.
 */
export function parseCzechDate(input: string): string | null | 'invalid' {
  const text = input.trim();
  if (!text) return null;
  const m = text.match(/^(\d{1,2})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{4})$/);
  if (!m) return 'invalid';
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1900 ||
    year > 2100 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return 'invalid';
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Věk z data narození: "6 let", "8 měsíců", "narodí se brzy". */
export function formatAge(isoDate: string | null | undefined, today = new Date()) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m);
  if (today.getDate() < d) months -= 1;
  if (months < 0) return 'teprve se narodí';
  if (months < 12) return months === 0 ? 'novorozeně' : plural(months, 'měsíc', 'měsíce', 'měsíců');
  return plural(Math.floor(months / 12), 'rok', 'roky', 'let');
}

/** Začátek textu pro náhled. Přeskočí krátké oslovení typu „Milá Eliško,“. */
export function excerpt(text: string, max = 90) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const isGreeting = (l: string) => l.endsWith(',') && l.length <= 30;
  const line = (lines.length > 1 && isGreeting(lines[0]) ? lines[1] : lines[0]) ?? '';
  return line.length > max ? `${line.slice(0, max).trimEnd()}…` : line;
}
