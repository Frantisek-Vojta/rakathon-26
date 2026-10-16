import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ConfirmDialog } from '@/components/dialog';
import { LetterRow } from '@/components/letter-row';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, Loading } from '@/components/states';
import { TextField } from '@/components/text-field';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { useAuth } from '@/lib/auth';
import { listChildren, listLetters, type LetterStatus } from '@/lib/data';
import { lettersToText, shareExport } from '@/lib/export';

type StatusFilter = 'vse' | LetterStatus;

export default function ManagerScreen() {
  const load = useCallback(async () => {
    const [children, letters] = await Promise.all([listChildren(), listLetters()]);
    return { children, letters };
  }, []);
  const { data, error, reload } = useFocusData(load);
  const [status, setStatus] = useState<StatusFilter>('vse');
  const [childId, setChildId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLocaleLowerCase('cs');
    return data.letters.filter(
      (l) =>
        (status === 'vse' || l.status === status) &&
        (!childId || l.child_id === childId) &&
        (!q || `${l.title} ${l.body} ${l.occasion ?? ''}`.toLocaleLowerCase('cs').includes(q)),
    );
  }, [data, status, childId, query]);

  const finished = data?.letters.filter((l) => l.status === 'hotovo').length ?? 0;
  const drafts = (data?.letters.length ?? 0) - finished;

  return (
    <Screen>
      <View style={styles.intro}>
        <Title>Správce schránky</Title>
        <Muted>Všechny vaše vzkazy na jednom místě. Upravujte, dopisujte a mějte přehled.</Muted>
      </View>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <View style={styles.stats}>
            <Stat icon="people-outline" value={data.children.length} label="Děti" tint={Colors.sage} color={Colors.sageDark} />
            <Stat icon="mail-outline" value={finished} label="Hotové" tint={Colors.primarySoft} color={Colors.primary} />
            <Stat icon="create-outline" value={drafts} label="Koncepty" tint={Colors.draftSoft} color={Colors.draft} />
          </View>

          <View style={styles.section}>
            <Heading>Co už je vytvořeno</Heading>
            <TextField
              label="Hledat ve vzkazech"
              value={query}
              onChangeText={setQuery}
              placeholder="např. narozeniny"
              autoCorrect={false}
              returnKeyType="search"
            />
            <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Stav">
              <Chip label="Vše" selected={status === 'vse'} onPress={() => setStatus('vse')} />
              <Chip label="Hotové" selected={status === 'hotovo'} onPress={() => setStatus('hotovo')} />
              <Chip label="Koncepty" selected={status === 'koncept'} onPress={() => setStatus('koncept')} />
            </View>
            {data.children.length > 1 && (
              <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Dítě">
                <Chip label="Všechny děti" selected={!childId} onPress={() => setChildId(null)} />
                {data.children.map((c) => (
                  <Chip key={c.id} label={c.name} selected={childId === c.id} onPress={() => setChildId(c.id)} />
                ))}
              </View>
            )}

            {data.letters.length === 0 ? (
              <EmptyState
                icon="mail-open-outline"
                title="Zatím tu nejsou žádné vzkazy"
                text="Až něco napíšete, najdete to tady. I jedna věta má velkou hodnotu."
              />
            ) : visible.length === 0 ? (
              <Muted style={styles.center}>Tomuto výběru neodpovídá žádný vzkaz.</Muted>
            ) : (
              visible.map((letter) => <LetterRow key={letter.id} letter={letter} childName={letter.child?.name} />)
            )}

            {data.letters.length > 0 && (
              <Button
                label="Stáhnout všechny vzkazy"
                variant="secondary"
                icon="download-outline"
                onPress={() => shareExport(lettersToText(data.children, data.letters))}
              />
            )}
          </View>
        </>
      )}

      <PrivacyCard />
      <AccountCard />
    </Screen>
  );
}

function Stat({
  icon,
  value,
  label,
  tint,
  color,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  value: number;
  label: string;
  tint: string;
  color: string;
}) {
  return (
    <View style={[styles.stat, { backgroundColor: tint }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const PRIVACY_POINTS: { icon: ComponentProps<typeof Ionicons>['name']; text: string }[] = [
  { icon: 'lock-closed-outline', text: 'Vzkazy vidíte jen vy. Databáze to hlídá u každého záznamu zvlášť.' },
  { icon: 'shield-checkmark-outline', text: 'Spojení se serverem je šifrované.' },
  { icon: 'phone-portrait-outline', text: 'Rozepsaný text se ukládá i v zařízení, aby se neztratil.' },
  { icon: 'eye-off-outline', text: 'Žádné sdílení, žádná reklama, žádná sociální síť.' },
  { icon: 'trash-outline', text: 'Smazáním účtu zmizí natrvalo i všechny vzkazy.' },
];

function PrivacyCard() {
  return (
    <View style={styles.card}>
      <Heading>Jak chráníme vaše vzpomínky</Heading>
      {PRIVACY_POINTS.map((p) => (
        <View key={p.text} style={styles.point}>
          <Ionicons name={p.icon} size={20} color={Colors.sageDark} />
          <Body style={styles.pointText}>{p.text}</Body>
        </View>
      ))}
    </View>
  );
}

function AccountCard() {
  const { email, isDemo, signOut, deleteAccount } = useAuth();
  const [confirm, setConfirm] = useState<'signout' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: 'signout' | 'delete') {
    setBusy(true);
    setError(null);
    if (action === 'signout') {
      await signOut();
    } else {
      const result = await deleteAccount();
      if (result.error) {
        setError(result.error);
        setBusy(false);
        setConfirm(null);
      }
    }
  }

  return (
    <View style={styles.card}>
      <Heading>Účet</Heading>
      <View style={styles.point}>
        <Ionicons name={isDemo ? 'sparkles-outline' : 'person-circle-outline'} size={22} color={Colors.primary} />
        <Body style={styles.pointText}>{isDemo ? 'Demo účet s fiktivní rodinou' : email}</Body>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        label={isDemo ? 'Ukončit demo' : 'Odhlásit se'}
        variant="secondary"
        icon="log-out-outline"
        onPress={() => (isDemo ? setConfirm('signout') : run('signout'))}
      />
      {!isDemo && (
        <Button label="Smazat účet a všechna data" variant="ghost" icon="trash-outline" onPress={() => setConfirm('delete')} />
      )}

      <ConfirmDialog
        visible={confirm === 'signout'}
        title="Ukončit demo?"
        message="Ukázková data se smažou. Vlastní vzkazy si můžete uložit po vytvoření účtu."
        confirmLabel="Ukončit demo"
        busy={busy}
        onConfirm={() => run('signout')}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm === 'delete'}
        danger
        title="Smazat účet?"
        message="Natrvalo smažeme váš účet, všechny profily dětí i všechny vzkazy. Tento krok nejde vrátit."
        confirmLabel="Ano, smazat vše"
        busy={busy}
        onConfirm={() => run('delete')}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: 2,
  },
  statValue: {
    fontFamily: Fonts.headingBold,
    fontSize: 26,
    lineHeight: 32,
  },
  statLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.text,
  },
  section: {
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  center: {
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  point: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
  },
});
