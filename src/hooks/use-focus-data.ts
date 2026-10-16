import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Načte data pokaždé, když se obrazovka zobrazí (i po návratu zpět),
 * takže je seznam vždy aktuální, třeba po uložení dopisu.
 * `load` musí být stabilní funkce (useCallback).
 */
export function useFocusData<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(() => {
    let active = true;
    setLoading(true);
    load()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [load]);

  useFocusEffect(run);

  const reload = useCallback(() => {
    run();
  }, [run]);

  return { data, error, loading, reload };
}
