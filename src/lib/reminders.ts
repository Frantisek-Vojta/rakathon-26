// Webová verze: připomínky posílá jen mobilní aplikace (naplánované přímo v telefonu).
// Volba se uloží a projeví se, jakmile si rodič appku otevře v telefonu.
import type { Reminders } from './preferences';

export const remindersSupported = false;

export async function applyReminders(_frequency: Reminders): Promise<string | null> {
  return null;
}

export const REMINDER_TEXT = 'Možná je dnes hezký okamžik na malou vzpomínku. I jedna věta má velkou hodnotu.';
