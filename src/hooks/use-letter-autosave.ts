import { useCallback, useEffect, useRef, useState } from 'react';

import { createLetter, updateLetter, type Letter, type LetterStatus } from '@/lib/data';
import { draftKey, drafts, type LetterFields } from '@/lib/drafts';

/**
 * Stav ukládání:
 * - idle: nic se nezměnilo
 * - local: změna je uložená v zařízení (localStorage), za chvilku půjde do databáze
 * - saving: právě se ukládá do databáze
 * - saved: uloženo v databázi
 * - offline: databáze nedostupná, text je v bezpečí v zařízení a uloží se později
 */
export type SaveState = 'idle' | 'local' | 'saving' | 'saved' | 'offline';

const AUTOSAVE_DELAY_MS = 1200;

/**
 * Průběžné ukládání dopisu. Každá změna jde hned do localStorage,
 * po krátké pauze v psaní i do databáze. Ukládání běží za sebou (nikdy dvě najednou),
 * takže nový dopis vznikne v databázi jen jednou.
 */
export function useLetterAutosave(childId: string, initialLetterId: string | null, initialFields: LetterFields) {
  const [letterId, setLetterId] = useState(initialLetterId);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSaved, setLastSaved] = useState<Letter | null>(null);

  const letterIdRef = useRef(initialLetterId);
  const fieldsRef = useRef(initialFields);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const persist = useCallback(
    async (status?: LetterStatus): Promise<Letter | null> => {
      const fields = fieldsRef.current;
      const hasContent = !!(fields.title.trim() || fields.body.trim() || fields.media);
      // Prázdný nový dopis do databáze nezakládáme.
      if (!letterIdRef.current && !hasContent) return null;

      setSaveState('saving');
      const payload = {
        title: fields.title.trim(),
        body: fields.body,
        paper: fields.paper,
        font: fields.font,
        sticker: fields.sticker,
        occasion: fields.occasion,
        media_path: fields.media?.path ?? null,
        media_mime: fields.media?.mime ?? null,
        media_size: fields.media?.size ?? null,
        media_duration_ms: fields.media?.durationMs ?? null,
      };

      let saved: Letter;
      if (!letterIdRef.current) {
        saved = await createLetter({ child_id: childId, kind: fields.kind, ...payload, status: status ?? 'koncept' });
        drafts.clear(draftKey(null, childId, fields.kind));
        letterIdRef.current = saved.id;
        setLetterId(saved.id);
      } else {
        saved = await updateLetter(letterIdRef.current, status ? { ...payload, status } : payload);
      }

      // Místní zálohu smažeme jen když se mezitím nic dalšího nenapsalo.
      if (fieldsRef.current === fields) drafts.clear(draftKey(saved.id, childId));
      setLastSaved(saved);
      setSaveState('saved');
      return saved;
    },
    [childId],
  );

  /** Uloží hned (tlačítka „Uložit…“). Volitelně změní stav koncept/hotovo. */
  const saveNow = useCallback(
    (status?: LetterStatus) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      const run = queue.current.then(() => persist(status));
      queue.current = run.catch(() => undefined);
      return run.catch((e: Error) => {
        setSaveState('offline');
        throw e;
      });
    },
    [persist],
  );

  /** Zaznamená změnu: hned do zařízení, s malým zpožděním do databáze. */
  const change = useCallback(
    (fields: LetterFields) => {
      fieldsRef.current = fields;
      drafts.save(draftKey(letterIdRef.current, childId, fields.kind), fields);
      setSaveState('local');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        saveNow().catch(() => undefined);
      }, AUTOSAVE_DELAY_MS);
    },
    [childId, saveNow],
  );

  /** Zahodí místní zálohu (např. při smazání dopisu). */
  const discard = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    drafts.clear(draftKey(letterIdRef.current, childId, fieldsRef.current.kind));
    drafts.clear(draftKey(null, childId, fieldsRef.current.kind));
  }, [childId]);

  // Při odchodu z obrazovky dokončíme rozpracované uložení.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
        saveNow().catch(() => undefined);
      }
    },
    [saveNow],
  );

  return { letterId, saveState, lastSaved, change, saveNow, discard };
}
