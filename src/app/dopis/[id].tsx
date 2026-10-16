import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Button } from '@/components/button';
import { ChildAvatar } from '@/components/child-avatar';
import { ConfirmDialog, Dialog } from '@/components/dialog';
import { LetterAppearance } from '@/components/letter/appearance';
import { ChildPicker } from '@/components/letter/child-picker';
import { LetterPaper } from '@/components/letter/paper';
import { MediaField } from '@/components/media/media-field';
import { StatusBadge } from '@/components/letter-row';
import { Screen } from '@/components/screen';
import { ErrorState, Loading } from '@/components/states';
import { OCCASIONS } from '@/constants/choices';
import { ALL_PROMPTS } from '@/constants/inspiration';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useLetterAutosave, type SaveState } from '@/hooks/use-letter-autosave';
import {
  countLetters,
  deleteLetter,
  getChild,
  getLetter,
  type Child,
  type Letter,
  type LetterFont,
  type LetterStatus,
  type Paper,
  type Sticker,
} from '@/lib/data';
import { draftKey, drafts, type LetterFields } from '@/lib/drafts';
import { formatDate, plural } from '@/lib/format';
import { deleteMedia, KIND_LABELS, type MemoryKind } from '@/lib/media';
import { usePreferences } from '@/lib/preferences';

type ChildInfo = Pick<Child, 'id' | 'name' | 'color'>;

const EMPTY: LetterFields = {
  kind: 'dopis',
  title: '',
  body: '',
  paper: 'bezova',
  font: 'lora',
  sticker: null,
  occasion: null,
  media: null,
};

const KINDS: MemoryKind[] = ['dopis', 'foto', 'hlas', 'video'];

const MISSING_MEDIA: Record<Exclude<MemoryKind, 'dopis'>, string> = {
  foto: 'Nejdřív prosím přidejte fotku.',
  hlas: 'Nejdřív prosím nahrajte hlasový vzkaz.',
  video: 'Nejdřív prosím přidejte video.',
};

const BODY_PLACEHOLDER: Record<MemoryKind, string> = {
  dopis: 'Sem napište, co máte na srdci.\nStačí jedna věta…',
  foto: 'Napište k fotce pár slov (nepovinné)…',
  hlas: 'Můžete připsat pár slov k nahrávce (nepovinné)…',
  video: 'Můžete připsat pár slov k videu (nepovinné)…',
};

function fieldsOf(letter: Letter): LetterFields {
  return {
    kind: (letter.kind as MemoryKind) ?? 'dopis',
    media: letter.media_path
      ? {
          path: letter.media_path,
          mime: letter.media_mime ?? '',
          size: letter.media_size ?? 0,
          durationMs: letter.media_duration_ms,
        }
      : null,
    title: letter.title,
    body: letter.body,
    paper: letter.paper as Paper,
    font: letter.font as LetterFont,
    sticker: (letter.sticker as Sticker | null) ?? null,
    occasion: letter.occasion,
  };
}

/**
 * /dopis/novy?dite=ID      nový dopis pro dítě
 * /dopis/novy?otazka=…     nový dopis z inspirace (nejdřív výběr dítěte)
 * /dopis/novy?dite=ID&prilezitost=…   nový dopis k milníku z časové osy
 * /dopis/novy?dite=ID&druh=foto|hlas|video   fotka, hlasový nebo video vzkaz místo psaní
 * /dopis/ID                existující dopis (hotový se otevře ke čtení)
 */
export default function LetterRoute() {
  const params = useLocalSearchParams<{
    id: string;
    dite?: string;
    otazka?: string;
    prilezitost?: string;
    druh?: string;
  }>();
  // Parametry si zapamatujeme při otevření. Po prvním uložení se v adrese
  // „novy“ změní na skutečné ID a obrazovka se kvůli tomu nesmí znovu načítat.
  // Otázka přichází z adresy, kterou může kdokoli upravit: zkrátíme ji na rozumnou délku.
  const [start] = useState(() => ({
    id: params.id,
    dite: params.dite,
    otazka: params.otazka?.slice(0, 200),
    // Jen příležitosti z nabídky (adresa jde ručně upravit).
    prilezitost: OCCASIONS.find((o) => o !== 'Kdykoli' && o === params.prilezitost) ?? null,
    druh: KINDS.find((k) => k === params.druh) ?? 'dopis',
  }));
  const [childId, setChildId] = useState(start.dite);
  const isNew = start.id === 'novy';

  if (isNew && !childId) {
    return (
      <Screen showLogo={false} header={<BackHeader label="Zpět" fallback="/" />}>
        <ChildPicker
          prompt={start.otazka}
          onPick={(id) => {
            setChildId(id);
            router.setParams({ dite: id });
          }}
        />
      </Screen>
    );
  }

  return (
    <LetterLoader
      letterId={isNew ? null : start.id}
      childId={childId ?? null}
      prompt={start.otazka}
      occasion={start.prilezitost}
      kind={start.druh}
    />
  );
}

type Loaded = { child: ChildInfo; letter: Letter | null; fields: LetterFields; restored: boolean };

function LetterLoader({
  letterId,
  childId,
  prompt,
  occasion,
  kind,
}: {
  letterId: string | null;
  childId: string | null;
  prompt?: string;
  occasion: string | null;
  kind: MemoryKind;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (letterId) {
          const letter = await getLetter(letterId);
          if (!letter.child) throw new Error('Tento vzkaz už neexistuje.');
          // Pokud je v zařízení novější text (nestihl se uložit), použijeme ho.
          const local = drafts.load(draftKey(letterId, letter.child.id));
          const restored = !!local && local.savedAt > Date.parse(letter.updated_at);
          if (active) {
            setLoaded({
              child: letter.child,
              letter,
              // Starší zálohy nemusí znát nová pole (typ, soubor), proto je doplníme.
              fields: restored
                ? { ...fieldsOf(letter), ...local.fields, kind: fieldsOf(letter).kind }
                : fieldsOf(letter),
              restored,
            });
          }
        } else if (childId) {
          const child = await getChild(childId);
          const local = drafts.load(draftKey(null, childId, kind));
          if (active)
            setLoaded({
              child,
              letter: null,
              fields: local ? { ...EMPTY, ...local.fields, kind } : { ...EMPTY, kind, occasion },
              restored: !!local,
            });
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, [letterId, childId, occasion, kind, attempt]);

  if (error || !loaded) {
    return (
      <Screen showLogo={false} header={<BackHeader label="Zpět" fallback="/deti" />}>
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setAttempt((a) => a + 1);
            }}
          />
        ) : (
          <Loading />
        )}
      </Screen>
    );
  }

  return <LetterEditor {...loaded} prompt={prompt} />;
}

function LetterEditor({ child, letter, fields: initialFields, restored, prompt }: Loaded & { prompt?: string }) {
  const autosave = useLetterAutosave(child.id, letter?.id ?? null, initialFields);
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState<LetterStatus>((letter?.status as LetterStatus) ?? 'koncept');
  const [mode, setMode] = useState<'read' | 'edit'>(letter?.status === 'hotovo' && !restored ? 'read' : 'edit');
  const [dialog, setDialog] = useState<'done' | 'delete' | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);
  const { encourage } = usePreferences();
  const [busy, setBusy] = useState<'draft' | 'done' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    restored ? 'Obnovili jsme text, který se minule nestihl uložit.' : null,
  );
  const [question, setQuestion] = useState<string | null>(prompt ?? null);

  const { change, letterId } = autosave;
  const meta = autosave.lastSaved ?? letter;

  // Obnovený text z minula pošleme rovnou do databáze.
  useEffect(() => {
    if (restored) change(initialFields);
  }, [restored, change, initialFields]);

  // Po prvním uložení nového dopisu přepíšeme v adrese „novy“ na skutečné ID,
  // aby obnovení stránky otevřelo stejný dopis.
  useEffect(() => {
    if (letterId) router.setParams({ id: letterId });
  }, [letterId]);

  function update(patch: Partial<LetterFields>) {
    const next = { ...fields, ...patch };
    setFields(next);
    change(next);
    setError(null);
    setDraftSaved(false);
  }

  function backToProfile() {
    router.dismissTo({ pathname: '/dite/[id]', params: { id: child.id } });
  }

  async function save(nextStatus: LetterStatus) {
    if (nextStatus === 'hotovo' && fields.kind === 'dopis' && !fields.body.trim()) {
      setError('Napište prosím aspoň jednu větu. Pak můžete vzkaz uložit jako hotový.');
      return;
    }
    if (nextStatus === 'hotovo' && fields.kind !== 'dopis' && !fields.media) {
      setError(MISSING_MEDIA[fields.kind]);
      return;
    }
    if (!fields.title.trim() && !fields.body.trim() && !fields.media) {
      setError(fields.kind === 'dopis' ? 'Zatím tu nic není. Napište aspoň pár slov.' : MISSING_MEDIA[fields.kind]);
      return;
    }
    const wasDone = status === 'hotovo';
    setBusy(nextStatus === 'hotovo' ? 'done' : 'draft');
    try {
      const saved = await autosave.saveNow(nextStatus);
      setStatus((saved?.status as LetterStatus) ?? nextStatus);
      if (nextStatus === 'koncept') {
        setDraftSaved(true);
      } else if (wasDone) {
        setMode('read');
        setNotice('Změny jsou uložené.');
      } else {
        setFinishedCount(await countLetters('hotovo').catch(() => 0));
        setDialog('done');
      }
    } catch (e) {
      setError(`${(e as Error).message} Text máte uložený v tomto zařízení, nic se neztratí. Zkuste to prosím znovu.`);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy('delete');
    try {
      if (letterId) await deleteLetter(letterId, fields.media?.path);
      else await deleteMedia(fields.media?.path).catch(() => undefined);
      autosave.discard();
      setDialog(null);
      backToProfile();
    } catch (e) {
      setError((e as Error).message);
      setDialog(null);
    } finally {
      setBusy(null);
    }
  }

  function anotherQuestion() {
    const others = ALL_PROMPTS.filter((p) => p !== question);
    setQuestion(others[Math.floor(Math.random() * others.length)]);
  }

  const header = (
    <BackHeader
      label={`Zpět na profil: ${child.name}`}
      fallback={{ pathname: '/dite/[id]', params: { id: child.id } }}
      right={mode === 'edit' ? <SaveIndicator state={autosave.saveState} /> : undefined}
    />
  );

  const footer =
    mode === 'read' ? (
      <Button
        label={fields.kind === 'dopis' ? 'Upravit dopis' : 'Upravit vzpomínku'}
        icon="create-outline"
        onPress={() => setMode('edit')}
      />
    ) : (
      <View style={styles.footerStack}>
        {draftSaved && (
          <View style={styles.draftSaved} accessibilityLiveRegion="polite">
            <Ionicons name="bookmark" size={20} color={Colors.draft} />
            <View style={styles.draftSavedTexts}>
              <Text style={styles.draftSavedTitle}>Koncept je uložený</Text>
              <Text style={styles.draftSavedText}>Můžete se k němu kdykoli vrátit. Najdete ho v profilu dítěte.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={backToProfile}
              style={({ pressed }) => [styles.draftSavedLink, pressed && styles.pressedLink]}>
              <Text style={styles.link}>Zpět na profil</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.footerRow}>
          <Button
            label={status === 'hotovo' ? 'Do konceptů' : 'Uložit koncept'}
            variant="secondary"
            icon="download-outline"
            onPress={() => save('koncept')}
            loading={busy === 'draft'}
            disabled={!!busy}
            style={styles.footerButton}
          />
          <Button
            label={status === 'hotovo' ? 'Uložit změny' : 'Uložit vzkaz'}
            icon="checkmark"
            onPress={() => save('hotovo')}
            loading={busy === 'done'}
            disabled={!!busy}
            style={styles.footerButton}
          />
        </View>
      </View>
    );

  const footnote =
    status === 'hotovo' && meta?.finished_at
      ? `Dokončeno ${formatDate(meta.finished_at)}`
      : meta?.updated_at
        ? `Naposledy upraveno ${formatDate(meta.updated_at)}`
        : undefined;

  return (
    <Screen showLogo={false} header={header} footer={footer}>
      <View style={styles.forRow}>
        <ChildAvatar name={child.name} color={child.color} size={40} />
        <Text style={styles.forText}>
          Pro: <Text style={styles.forName}>{child.name}</Text>
        </Text>
        {fields.kind !== 'dopis' && (
          <View style={styles.kindChip}>
            <Text style={styles.kindChipText}>{KIND_LABELS[fields.kind]}</Text>
          </View>
        )}
        {(letterId || letter) && <StatusBadge status={status} />}
      </View>

      {notice && (
        <View style={styles.notice} accessibilityLiveRegion="polite">
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
          <Text style={styles.noticeText}>{notice}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zavřít oznámení"
            onPress={() => setNotice(null)}
            style={styles.noticeClose}>
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </Pressable>
        </View>
      )}

      {mode === 'edit' && (
        <>
          {question ? (
            <View style={styles.question}>
              <Ionicons name="bulb-outline" size={22} color={Colors.peachDark} />
              <View style={styles.questionTexts}>
                <Text style={styles.questionText}>{question}</Text>
                <View style={styles.questionActions}>
                  <Pressable accessibilityRole="button" onPress={anotherQuestion} style={styles.textButton}>
                    <Text style={styles.link}>Jiná otázka</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setQuestion(null)} style={styles.textButton}>
                    <Text style={styles.linkMuted}>Skrýt</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            !fields.body.trim() && (
              <Pressable accessibilityRole="button" onPress={anotherQuestion} style={styles.questionButton}>
                <Ionicons name="bulb-outline" size={20} color={Colors.peachDark} />
                <Text style={styles.link}>Nevíte, jak začít? Ukázat otázku</Text>
              </Pressable>
            )
          )}
        </>
      )}

      {fields.kind !== 'dopis' && (
        <MediaField
          kind={fields.kind}
          media={fields.media}
          onChange={mode === 'edit' ? (media) => update({ media }) : undefined}
        />
      )}

      {(mode === 'edit' || fields.kind === 'dopis' || !!fields.title.trim() || !!fields.body.trim()) && (
        <LetterPaper
          fields={fields}
          onChange={mode === 'edit' ? update : undefined}
          footnote={footnote}
          placeholder={BODY_PLACEHOLDER[fields.kind]}
          minHeight={fields.kind === 'dopis' ? 320 : 140}
        />
      )}

      {mode === 'edit' && fields.kind === 'dopis' && (
        <View style={styles.tip}>
          <Ionicons name="mic-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.tipText}>
            Nechce se vám psát? Na klávesnici telefonu klepněte na mikrofon a text se napíše sám. Nebo vytvořte hlasový
            vzkaz.
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {mode === 'edit' && <LetterAppearance fields={fields} onChange={update} />}

      {(letterId || mode === 'edit') && (
        <Button
          label={letterId ? 'Smazat vzkaz' : 'Zahodit'}
          variant="ghost"
          icon="trash-outline"
          onPress={() => {
            if (letterId) {
              setDialog('delete');
            } else {
              autosave.discard();
              backToProfile();
            }
          }}
        />
      )}

      <Dialog
        visible={dialog === 'done'}
        image="obalka"
        title={encourage ? 'Malý krok s velkým významem' : 'Vzkaz je uložený'}
        message={
          encourage
            ? `Právě jste vytvořil/a něco, k čemu se vaše dítě může jednou vrátit. ${thanks(finishedCount)}`
            : 'Najdete ho v profilu dítěte i ve Správci schránky.'
        }
        onClose={() => {
          setDialog(null);
          setMode('read');
        }}>
        <Button label="Pokračovat" icon="arrow-forward" onPress={backToProfile} />
        <Button
          label="Zobrazit dopis"
          variant="secondary"
          onPress={() => {
            setDialog(null);
            setMode('read');
          }}
        />
      </Dialog>

      <ConfirmDialog
        visible={dialog === 'delete'}
        danger
        title="Smazat tento vzkaz?"
        message="Vzkaz zmizí natrvalo. Tento krok nejde vrátit."
        confirmLabel="Ano, smazat"
        busy={busy === 'delete'}
        onConfirm={remove}
        onCancel={() => setDialog(null)}
      />
    </Screen>
  );
}

/** Laskavé poděkování. Počet je jen orientační přehled, ne cíl (podklady: „Jemná gamifikace“). */
function thanks(count: number) {
  if (count === 1) return 'Vaše první vzpomínka. Děkujeme za váš laskavý krok.';
  if ([3, 5, 10, 15, 20, 30, 50].includes(count)) {
    return `Už ${plural(count, 'vzpomínka', 'vzpomínky', 'vzpomínek')}! Děkujeme, že tvoříte.`;
  }
  return 'Děkujeme za váš laskavý krok.';
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  const map: Record<
    Exclude<SaveState, 'idle'>,
    {
      icon: 'cloud-done-outline' | 'sync-outline' | 'phone-portrait-outline' | 'cloud-offline-outline';
      text: string;
      color: string;
    }
  > = {
    local: { icon: 'phone-portrait-outline', text: 'Uloženo v zařízení', color: Colors.textMuted },
    saving: { icon: 'sync-outline', text: 'Ukládám…', color: Colors.textMuted },
    saved: { icon: 'cloud-done-outline', text: 'Uloženo', color: Colors.success },
    offline: { icon: 'cloud-offline-outline', text: 'Jen v zařízení', color: Colors.peachDark },
  };
  const item = map[state];
  return (
    <View style={styles.saveIndicator} accessibilityLiveRegion="polite" accessibilityLabel={item.text}>
      <Ionicons name={item.icon} size={16} color={item.color} />
      <Text style={[styles.saveText, { color: item.color }]}>{item.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  forRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  forText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.textMuted,
  },
  forName: {
    fontFamily: Fonts.bodyBold,
    color: Colors.heading,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  noticeText: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.success,
  },
  question: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.peach,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  questionTexts: {
    flex: 1,
    gap: Spacing.sm,
  },
  questionText: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.text,
  },
  questionActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  questionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
  },
  link: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryText,
  },
  linkMuted: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textMuted,
  },
  errorBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: '#FBE9E7',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
  },
  footerStack: {
    gap: Spacing.sm,
  },
  kindChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.lavender,
  },
  kindChipText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.lavenderDark,
  },
  tip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  draftSaved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.draftSoft,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
  },
  draftSavedTexts: {
    flex: 1,
  },
  draftSavedTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.draft,
  },
  draftSavedText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.text,
  },
  draftSavedLink: {
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  pressedLink: {
    backgroundColor: Colors.surface,
  },
  noticeClose: {
    width: 44,
    height: 44,
    marginRight: -Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  footerButton: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
  },
});
