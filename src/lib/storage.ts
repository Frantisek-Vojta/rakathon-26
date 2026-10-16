// Jedno úložiště v zařízení pro web i telefon: localStorage.
// Na webu je to localStorage prohlížeče, v telefonu ho stejným rozhraním doplní expo-sqlite.
// Ukládáme sem přihlášení, poslední e-mail a rozepsané texty (aby se při výpadku sítě nic neztratilo).
import 'expo-sqlite/localStorage/install';

const PREFIX = 'schranka:';

function backend(): Storage | undefined {
  return typeof localStorage === 'undefined' ? undefined : localStorage;
}

export const storage = {
  get(key: string): string | null {
    try {
      return backend()?.getItem(PREFIX + key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      backend()?.setItem(PREFIX + key, value);
    } catch {
      // Plné úložiště nebo anonymní okno prohlížeče: appka funguje dál, jen si nic nepamatuje.
    }
  },
  remove(key: string) {
    try {
      backend()?.removeItem(PREFIX + key);
    } catch {
      // Viz výše.
    }
  },
  getJSON<T>(key: string): T | null {
    const raw = storage.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJSON(key: string, value: unknown) {
    storage.set(key, JSON.stringify(value));
  },
  removeWithPrefix(prefix: string) {
    try {
      const store = backend();
      if (!store) return;
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key?.startsWith(PREFIX + prefix)) keys.push(key);
      }
      keys.forEach((key) => store.removeItem(key));
    } catch {
      // Viz výše.
    }
  },
};

// Přihlášení ukládáme pod vlastním klíčem, aby ho šlo při odhlášení spolehlivě smazat.
export const authStorage = {
  getItem: (key: string) => storage.get(key),
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.remove(key),
};
