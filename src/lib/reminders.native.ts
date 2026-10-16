// Jemné připomínky v telefonu. Zapnou se jen když o ně rodič sám požádá.
// Text na zamčené obrazovce nikdy neprozradí obsah vzpomínek (podklady: „Notifikace“).
import type { Reminders } from './preferences';

export const remindersSupported = true;

export const REMINDER_TEXT = 'Možná je dnes hezký okamžik na malou vzpomínku. I jedna věta má velkou hodnotu.';

// Dny v týdnu podle expo-notifications: 1 = neděle … 7 = sobota.
const SCHEDULE: Record<Exclude<Reminders, 'ne'>, number[]> = {
  tydne: [5], // čtvrtek
  casteji: [2, 5, 7], // pondělí, čtvrtek, sobota
};

export async function applyReminders(frequency: Reminders): Promise<string | null> {
  try {
    // Modul načteme až když je potřeba (appka bez připomínek ho vůbec nepoužije).
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (frequency === 'ne') return null;

    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return 'Telefon nepovolil oznámení. Můžete je povolit v nastavení telefonu.';

    for (const weekday of SCHEDULE[frequency]) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Schránka vzpomínek', body: REMINDER_TEXT },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour: 18, minute: 0 },
      });
    }
    return null;
  } catch {
    return 'Připomínky se teď nepodařilo nastavit. Zkuste to prosím později.';
  }
}
