// Místní záloha rozepsaných dopisů v localStorage.
// Každá změna se okamžitě uloží do zařízení a teprve pak do databáze.
// Když vypadne internet nebo se appka zavře, text se při dalším otevření obnoví.

import type { LetterFont, Paper, Sticker } from './data';
import { storage } from './storage';

export type LetterFields = {
  title: string;
  body: string;
  paper: Paper;
  font: LetterFont;
  sticker: Sticker | null;
  occasion: string | null;
};

type LocalDraft = { fields: LetterFields; savedAt: number };

const PREFIX = 'rozepsano:';

/** Klíč: existující dopis podle ID, nový dopis podle dítěte. */
export function draftKey(letterId: string | null, childId: string) {
  return PREFIX + (letterId ?? `novy-${childId}`);
}

export const drafts = {
  load(key: string): LocalDraft | null {
    return storage.getJSON<LocalDraft>(key);
  },
  save(key: string, fields: LetterFields) {
    storage.setJSON(key, { fields, savedAt: Date.now() } satisfies LocalDraft);
  },
  clear(key: string) {
    storage.remove(key);
  },
  /** Při odhlášení smažeme všechny místní zálohy, aby na sdíleném zařízení nic nezůstalo. */
  clearAll() {
    storage.removeWithPrefix(PREFIX);
  },
};
