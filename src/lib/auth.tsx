import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { drafts } from './drafts';
import { toMessage } from './errors';
import { storage } from './storage';
import { supabase } from './supabase';

type Result = { error: string | null };

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  /** Demo účet bez e-mailu s fiktivní rodinou. */
  isDemo: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  startDemo: () => Promise<Result>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<Result>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LAST_EMAIL_KEY = 'posledni-email';

export function getLastEmail() {
  return storage.get(LAST_EMAIL_KEY) ?? '';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Přihlášení uložené v localStorage přežije zavření appky i restart telefonu.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      session,
      isLoading,
      isDemo: !!user?.is_anonymous,
      email: user?.email ?? null,

      async signIn(email, password) {
        const cleanEmail = email.trim().toLowerCase();
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error) storage.set(LAST_EMAIL_KEY, cleanEmail);
        return { error: error ? toMessage(error) : null };
      },

      async signUp(email, password) {
        const cleanEmail = email.trim().toLowerCase();
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) return { error: toMessage(error) };
        // Supabase z bezpečnostních důvodů neprozradí, že e-mail už je registrovaný:
        // vrátí uživatele bez přihlášení. Poznáme to podle prázdného seznamu identit.
        if (!data.session || data.user?.identities?.length === 0) {
          return { error: 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.' };
        }
        storage.set(LAST_EMAIL_KEY, cleanEmail);
        return { error: null };
      },

      async startDemo() {
        // Každý návštěvník dostane vlastní oddělený demo účet. Databáze do něj
        // rovnou vloží fiktivní rodinu (Eliška, Matěj, Aneta).
        const { error } = await supabase.auth.signInAnonymously();
        return { error: error ? toMessage(error) : null };
      },

      async signOut() {
        // Demo účet po odhlášení nemá smysl uchovávat, smažeme ho i s ukázkovými daty.
        if (user?.is_anonymous) {
          await supabase.rpc('delete_my_account');
        }
        // "local" smaže přihlášení ze zařízení i když už účet na serveru neexistuje.
        await supabase.auth.signOut({ scope: 'local' });
        drafts.clearAll();
      },

      async deleteAccount() {
        const { error } = await supabase.rpc('delete_my_account');
        if (error) return { error: toMessage(error) };
        await supabase.auth.signOut({ scope: 'local' });
        storage.remove(LAST_EMAIL_KEY);
        drafts.clearAll();
        return { error: null };
      },
    };
  }, [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musí být uvnitř <AuthProvider>');
  return ctx;
}
