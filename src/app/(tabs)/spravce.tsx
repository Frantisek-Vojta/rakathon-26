import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ConfirmDialog } from '@/components/dialog';
import { LetterRow } from '@/components/letter-row';
import { OptionCard } from '@/components/option-card';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, Loading } from '@/components/states';
import { TextField } from '@/components/text-field';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { INTEREST_OPTIONS, REMINDER_OPTIONS, SUPPORT_OPTIONS } from '@/constants/support';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { useLayout } from '@/hooks/use-layout';
import { useAuth } from '@/lib/auth';
import { listChildren, listLetters, type LetterStatus } from '@/lib/data';
import { lettersToText, shareExport } from '@/lib/export';
import { plural } from '@/lib/format';
import { usePreferences, type Interest, type Reminders } from '@/lib/preferences';
import { applyReminders, remindersSupported } from '@/lib/reminders';

type StatusFilter = 'vse' | LetterStatus;

export default function ManagerScreen() {
  const { isDesktop } = useLayout();
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

  const library = (
    <View style={styles.section}>
      <Heading>Co už je vytvořeno</Heading>
      {data && (
        <Text style={styles.summary}>
          {plural(data.children.length, 'dítě', 'děti', 'dětí')} ·{' '}
          {plural(finished, 'hotový vzkaz', 'hotové vzkazy', 'hotových vzkazů')} ·{' '}
          {plural(drafts, 'koncept', 'koncepty', 'konceptů')}
        </Text>
      )}
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
      {data && data.children.length > 1 && (
        <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Dítě">
          <Chip label="Všechny děti" selected={!childId} onPress={() => setChildId(null)} />
          {data.children.map((c) => (
            <Chip key={c.id} label={c.name} selected={childId === c.id} onPress={() => setChildId(c.id)} />
          ))}
        </View>
      )}

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : data.letters.length === 0 ? (
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

      {data && data.letters.length > 0 && (
        <Button
          label="Stáhnout všechny vzkazy"
          variant="secondary"
          icon="download-outline"
          onPress={() => shareExport(lettersToText(data.children, data.letters))}
        />
      )}
    </View>
  );

  return (
    <Screen inTabs width="wide">
      <View style={styles.intro}>
        <Title>Správce schránky</Title>
        <Muted>Všechny vaše vzkazy na jednom místě. Upravujte, dopisujte a mějte přehled.</Muted>
      </View>

      <View style={[styles.columns, isDesktop && styles.columnsWide]}>
        <View style={[styles.column, isDesktop && styles.mainColumn]}>{library}</View>
        <View style={[styles.column, styles.side]}>
          <SupportCard />
          <PrivacyCard />
          <AccountCard />
        </View>
      </View>
    </Screen>
  );
}

function SupportCard() {
  const { prefs, update } = usePreferences();
  const [message, setMessage] = useState<string | null>(null);
  const gentle = prefs.support === 'jemne';

  async function setReminders(reminders: Reminders) {
    setMessage(null);
    const problem = await applyReminders(reminders);
    await update({
      reminders,
      interests: reminders === 'ne' ? prefs.interests : withInterest(prefs.interests, 'pripominky'),
    });
    if (problem) setMessage(problem);
    else if (!remindersSupported && reminders !== 'ne')
      setMessage('Uloženo. Připomínky posílá mobilní aplikace v telefonu.');
  }

  return (
    <View style={styles.card}>
      <Heading>Podpora a připomínky</Heading>
      <Muted>Kolik vedení chcete, je jen na vás. Změnit to můžete kdykoli.</Muted>
      <View style={styles.options} accessibilityRole="radiogroup">
        {SUPPORT_OPTIONS.map((o) => (
          <OptionCard
            key={o.key}
            kind="radio"
            selected={prefs.support === o.key}
            title={o.title}
            description={o.description}
            icon={o.icon}
            tint={o.tint}
            iconColor={o.iconColor}
            onPress={() => {
              update({ support: o.key });
              if (o.key === 'klidne') applyReminders('ne');
            }}
          />
        ))}
      </View>

      <Text style={styles.subheading}>Co vám v aplikaci pomáhá</Text>
      <View style={styles.options}>
        {INTEREST_OPTIONS.filter((o) => o.key !== 'pripominky').map((o) => (
          <OptionCard
            key={o.key}
            kind="checkbox"
            selected={prefs.interests.includes(o.key)}
            title={o.title}
            description={o.description}
            icon={o.icon}
            tint={o.tint}
            iconColor={o.iconColor}
            onPress={() =>
              update({
                interests: prefs.interests.includes(o.key)
                  ? prefs.interests.filter((i) => i !== o.key)
                  : withInterest(prefs.interests, o.key),
              })
            }
          />
        ))}
      </View>
      {!gentle && <Muted>V klidném režimu se nezobrazují ocenění, citáty ani připomínky.</Muted>}

      {gentle && (
        <>
          <Text style={styles.subheading}>Připomenutí (volitelné)</Text>
          <View style={styles.options} accessibilityRole="radiogroup">
            {REMINDER_OPTIONS.map((o) => (
              <OptionCard
                key={o.key}
                kind="radio"
                selected={prefs.reminders === o.key}
                title={o.title}
                description={o.description}
                icon={o.icon}
                tint={o.tint}
                iconColor={o.iconColor}
                onPress={() => setReminders(o.key)}
              />
            ))}
          </View>
        </>
      )}
      {message && (
        <Text style={styles.info} accessibilityLiveRegion="polite">
          {message}
        </Text>
      )}
    </View>
  );
}

function withInterest(list: Interest[], key: Interest) {
  return list.includes(key) ? list : [...list, key];
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
      await applyReminders('ne');
      await signOut();
    } else {
      await applyReminders('ne');
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
        <Ionicons name={isDemo ? 'sparkles-outline' : 'person-circle-outline'} size={22} color={Colors.primaryText} />
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
        <Button
          label="Smazat účet a všechna data"
          variant="ghost"
          icon="trash-outline"
          onPress={() => setConfirm('delete')}
        />
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
  columns: {
    gap: Spacing.xl,
  },
  columnsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    gap: Spacing.lg,
  },
  mainColumn: {
    flex: 1.4,
  },
  side: {
    flex: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  summary: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textMuted,
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
  options: {
    gap: Spacing.sm,
  },
  subheading: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  info: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.success,
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
