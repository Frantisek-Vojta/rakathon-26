// Osobní nastavení: jakou podporu si rodič přeje (podle podkladů „Jakou podporu si přejete?“
// a „Co je pro vás důležité?“). Všechno je dobrovolné a jde kdykoli změnit.
// Ukládá se k účtu (Supabase user metadata), takže platí na všech zařízeních,
// a zároveň do localStorage, aby appka fungovala i bez internetu.

import type { User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from './auth';
import { toMessage } from './errors';
import { storage } from './storage';
import { supabase } from './supabase';

/** Jemné vedení (povzbuzení, ocenění, připomínky) nebo klidný režim (nic z toho). */
export type Support = 'jemne' | 'klidne';
export type Interest = 'inspirace' | 'oceneni' | 'citat' | 'pribehy' | 'pripominky';
export type Reminders = 'ne' | 'tydne' | 'casteji';

export type Preferences = {
  onboarded: boolean;
  support: Support;
  interests: Interest[];
  reminders: Reminders;
};

export const DEFAULT_PREFERENCES: Preferences = {
  onboarded: false,
  support: 'jemne',
  interests: ['inspirace', 'oceneni', 'pribehy'],
  reminders: 'ne',
};

const INTERESTS: Interest[] = ['inspirace', 'oceneni', 'citat', 'pribehy', 'pripominky'];

/** Metadata si uživatel může měnit sám, proto hodnoty vždy zkontrolujeme. */
function sanitize(raw: unknown): Preferences {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof Preferences, unknown>>;
  return {
    onboarded: value.onboarded === true,
    support: value.support === 'klidne' ? 'klidne' : 'jemne',
    interests: Array.isArray(value.interests)
      ? INTERESTS.filter((i) => (value.interests as unknown[]).includes(i))
      : DEFAULT_PREFERENCES.interests,
    reminders: value.reminders === 'tydne' || value.reminders === 'casteji' ? value.reminders : 'ne',
  };
}

const localKey = (uid: string) => `nastaveni:${uid}`;

function readPreferences(user: User | null): Preferences {
  if (!user) return DEFAULT_PREFERENCES;
  const fromAccount = user.user_metadata?.nastaveni;
  if (fromAccount) return sanitize(fromAccount);
  const fromDevice = storage.getJSON(localKey(user.id));
  return fromDevice ? sanitize(fromDevice) : DEFAULT_PREFERENCES;
}

type PreferencesValue = {
  prefs: Preferences;
  update: (patch: Partial<Preferences>) => Promise<string | null>;
  /** Povzbudivé zprávy a ocenění malých kroků. */
  encourage: boolean;
  /** Citát dne na domovské obrazovce. */
  quote: boolean;
  /** Otázka „Dnešní malý krok“. */
  dailyPrompt: boolean;
  /** Výrazněji nabízet „Moje životní příběhy“. */
  stories: boolean;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const user = session?.user ?? null;
  const uid = user?.id ?? null;
  const fromAccount = useMemo(() => readPreferences(user), [user]);
  // Změna se projeví hned, ještě než ji potvrdí server.
  const [optimistic, setOptimistic] = useState<{ uid: string; prefs: Preferences } | null>(null);
  const prefs = optimistic && optimistic.uid === uid ? optimistic.prefs : fromAccount;

  const update = useCallback(
    async (patch: Partial<Preferences>) => {
      if (!uid) return 'Nejste přihlášeni.';
      const next = sanitize({ ...prefs, ...patch });
      setOptimistic({ uid, prefs: next });
      storage.setJSON(localKey(uid), next);
      const { error } = await supabase.auth.updateUser({ data: { nastaveni: next } });
      // Nastavení zůstává uložené v zařízení i když se nepovede uložit k účtu.
      return error ? toMessage(error) : null;
    },
    [uid, prefs],
  );

  const value = useMemo<PreferencesValue>(() => {
    const gentle = prefs.support === 'jemne';
    return {
      prefs,
      update,
      encourage: gentle && prefs.interests.includes('oceneni'),
      quote: gentle && prefs.interests.includes('citat'),
      dailyPrompt: prefs.interests.includes('inspirace'),
      stories: prefs.interests.includes('pribehy'),
    };
  }, [prefs, update]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences musí být uvnitř <PreferencesProvider>');
  return ctx;
}
