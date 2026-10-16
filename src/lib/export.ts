// Export všech vzkazů do čitelného textu (zadání: „Export – dlouhodobě přenosná data“).
// Na webu se stáhne soubor, v telefonu se otevře nabídka sdílení (uložit, poslat, vytisknout).
import { Platform, Share } from 'react-native';

import { FONTS } from '@/constants/choices';
import type { ChildWithCounts, LetterFont, LetterWithChild } from './data';
import { formatDate } from './format';
import { KIND_LABELS, type MemoryKind } from './media';

export function lettersToText(children: ChildWithCounts[], letters: LetterWithChild[]) {
  const lines: string[] = ['SCHRÁNKA VZPOMÍNEK', `Export ze dne ${formatDate(new Date())}`, ''];
  for (const child of children) {
    const own = letters.filter((l) => l.child_id === child.id);
    lines.push('════════════════════════════════', `PRO: ${child.name}`, '════════════════════════════════', '');
    if (own.length === 0) lines.push('(zatím bez vzkazů)', '');
    for (const letter of own) {
      const kind = (letter.kind as MemoryKind) ?? 'dopis';
      lines.push(
        `■ ${letter.title.trim() || KIND_LABELS[kind]}`,
        [
          kind === 'dopis' ? null : `${KIND_LABELS[kind]} (soubor je uložený v aplikaci)`,
          letter.status === 'hotovo' ? `Dokončeno ${formatDate(letter.finished_at)}` : 'Koncept',
          letter.occasion,
          `písmo: ${FONTS[letter.font as LetterFont]?.label ?? letter.font}`,
        ]
          .filter(Boolean)
          .join(' · '),
        '',
        letter.body.trim(),
        '',
        '',
      );
    }
  }
  return lines.join('\n');
}

export async function shareExport(text: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schranka-vzpominek-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: 'Schránka vzpomínek', message: text });
}
