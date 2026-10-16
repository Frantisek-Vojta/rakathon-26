import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Illustration } from '@/components/illustration';
import { OptionCard } from '@/components/option-card';
import { Screen } from '@/components/screen';
import { Body, Muted, Title } from '@/components/typography';
import { INTEREST_OPTIONS, REMINDER_OPTIONS, SUPPORT_OPTIONS } from '@/constants/support';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { DEFAULT_PREFERENCES, usePreferences, type Interest, type Preferences } from '@/lib/preferences';
import { applyReminders, REMINDER_TEXT, remindersSupported } from '@/lib/reminders';

type Step = 'vitejte' | 'dulezite' | 'podpora' | 'pripomenuti';

/**
 * Uvítací průvodce při prvním přihlášení (podklady „Vítejte“, „Co je pro vás důležité“,
 * „Jakou podporu si přejete“, „Připomenutí“). Všechno jde přeskočit a později změnit.
 */
export default function WelcomeScreen() {
  const { update } = usePreferences();
  const [step, setStep] = useState<Step>('vitejte');
  const [draft, setDraft] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [busy, setBusy] = useState(false);

  const wantsReminders = draft.support === 'jemne' && draft.interests.includes('pripominky');
  const steps: Step[] = ['vitejte', 'dulezite', 'podpora', ...(wantsReminders ? (['pripomenuti'] as const) : [])];
  const index = steps.indexOf(step);

  async function finish(prefs: Preferences) {
    setBusy(true);
    const reminders = prefs.support === 'jemne' && prefs.interests.includes('pripominky') ? prefs.reminders : 'ne';
    if (reminders !== 'ne') await applyReminders(reminders);
    // Po uložení se průvodce sám zavře a otevře se úvodní obrazovka.
    await update({ ...prefs, reminders, onboarded: true });
  }

  function next() {
    const following = steps[index + 1];
    if (following) setStep(following);
    else finish(draft);
  }

  function toggleInterest(key: Interest) {
    setDraft((d) => ({
      ...d,
      interests: d.interests.includes(key) ? d.interests.filter((i) => i !== key) : [...d.interests, key],
    }));
  }

  const header =
    index > 0 ? (
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zpět"
          onPress={() => setStep(steps[index - 1])}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={24} color={Colors.primaryText} />
        </Pressable>
        <Dots count={steps.length} active={index} />
        <View style={styles.back} />
      </View>
    ) : undefined;

  const footer = (
    <View style={styles.footer}>
      <Button
        label={step === 'vitejte' ? 'Začít' : index === steps.length - 1 ? 'Uložit nastavení' : 'Pokračovat'}
        icon={step === 'vitejte' ? 'arrow-forward' : undefined}
        onPress={next}
        loading={busy}
      />

    </View>
  );

  return (
    <Screen showLogo={false} width="narrow" header={header} footer={footer}>
      {step === 'vitejte' && (
        <>
          <Illustration name="krajina" maxWidth={520} />
          <View style={styles.intro}>
            <Title style={styles.big}>Vítejte!</Title>
            <Body style={styles.lead}>
              Každý malý krok má smysl. Můžete tvořit svým vlastním tempem. Neexistuje „správný“ způsob, důležité je, že
              jste tady.
            </Body>
          </View>
          <View style={styles.quote}>
            <Ionicons name="heart-outline" size={26} color={Colors.primaryText} />
            <Text style={styles.quoteText}>„I krátká vzpomínka může mít jednou velkou hodnotu.“</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => finish(DEFAULT_PREFERENCES)} style={styles.skip}>
            <Text style={styles.skipText}>Přeskočit, nastavím později</Text>
          </Pressable>
        </>
      )}

      {step === 'dulezite' && (
        <>
          <View style={styles.intro}>
            <Title>Co je pro vás důležité?</Title>
            <Muted>Vyberte, co by vám v aplikaci pomohlo. Vždy to můžete změnit ve Správci schránky.</Muted>
          </View>
          <View style={styles.options} accessibilityRole="list">
            {INTEREST_OPTIONS.map((o) => (
              <OptionCard
                key={o.key}
                kind="checkbox"
                selected={draft.interests.includes(o.key)}
                title={o.title}
                description={o.description}
                icon={o.icon}
                tint={o.tint}
                iconColor={o.iconColor}
                onPress={() => toggleInterest(o.key)}
              />
            ))}
          </View>
        </>
      )}

      {step === 'podpora' && (
        <>
          <View style={styles.intro}>
            <Title>Jakou podporu si přejete?</Title>
            <Muted>
              Můžete zvolit jemné vedení a povzbuzení, nebo klidný režim bez připomínek. Rozhodnutí můžete kdykoli
              změnit.
            </Muted>
          </View>
          <View style={styles.options} accessibilityRole="radiogroup">
            {SUPPORT_OPTIONS.map((o) => (
              <OptionCard
                key={o.key}
                kind="radio"
                selected={draft.support === o.key}
                title={o.title}
                description={o.description}
                icon={o.icon}
                tint={o.tint}
                iconColor={o.iconColor}
                onPress={() => setDraft((d) => ({ ...d, support: o.key }))}
              />
            ))}
          </View>
          <Illustration name="krajinaPruh" maxWidth={520} />
        </>
      )}

      {step === 'pripomenuti' && (
        <>
          <View style={styles.intro}>
            <Title>Připomenutí</Title>
            <Muted>
              Chcete dostávat jemná připomenutí, která vám pomohou vracet se k tvorbě vzpomínek? Je to jen na vás.
            </Muted>
          </View>
          <View style={styles.options} accessibilityRole="radiogroup">
            {REMINDER_OPTIONS.map((o) => (
              <OptionCard
                key={o.key}
                kind="radio"
                selected={draft.reminders === o.key}
                title={o.title}
                description={o.description}
                icon={o.icon}
                tint={o.tint}
                iconColor={o.iconColor}
                onPress={() => setDraft((d) => ({ ...d, reminders: o.key }))}
              />
            ))}
          </View>
          <View style={styles.preview}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
            <Muted style={styles.previewText}>
              Na zamčené obrazovce se nikdy neukáže nic z vašich vzpomínek. Připomínka zní: „{REMINDER_TEXT}“
              {remindersSupported ? '' : ' Připomínky posílá mobilní aplikace.'}
            </Muted>
          </View>
        </>
      )}
    </Screen>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Krok ${active + 1} z ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: Colors.surfaceSoft,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.borderStrong,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  intro: {
    gap: Spacing.sm,
  },
  big: {
    fontSize: 40,
    lineHeight: 48,
  },
  lead: {
    fontSize: 19,
    lineHeight: 29,
  },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  quoteText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 27,
    color: Colors.text,
  },
  options: {
    gap: Spacing.sm,
  },
  preview: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  previewText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    gap: Spacing.xs,
  },
  skip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.primaryText,
  },
});
