import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';
import { authStorage } from './storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Veřejný (publishable) klíč smí být v appce. Data chrání pravidla v databázi (RLS),
// tajný klíč (service role) appka nikdy nevidí.
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Chybí EXPO_PUBLIC_SUPABASE_URL nebo EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY v .env.local');
}

export const supabase = createClient<Database>(url, publishableKey, {
  auth: {
    storage: authStorage,
    storageKey: 'prihlaseni',
    autoRefreshToken: true,
    persistSession: true,
    // Telefon nemá adresní řádek, ze kterého by se dalo přihlášení přečíst.
    detectSessionInUrl: false,
  },
});

// V telefonu obnovujeme přihlášení jen když je appka na popředí (šetří baterii).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
