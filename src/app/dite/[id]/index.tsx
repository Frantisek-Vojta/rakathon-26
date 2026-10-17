import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { ChildAvatar } from '@/components/child-avatar';
import { CreateMemory } from '@/components/create-memory';
import { LetterRow } from '@/components/letter-row';
import { Screen } from '@/components/screen';
import { ChildTimeline } from '@/components/timeline';
import { EmptyState, ErrorState, Loading } from '@/components/states';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { CHILD_COLORS } from '@/constants/choices';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { getChild, listLetters, type ChildColor } from '@/lib/data';
import { formatAge } from '@/lib/format';

export default function ChildProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(async () => {
    const [child, letters] = await Promise.all([getChild(id), listLetters({ childId: id })]);
    return { child, letters };
  }, [id]);
  const { data, error, reload } = useFocusData(load);
  const [view, setView] = useState<'vzkazy' | 'osa'>('vzkazy');

  const header = (
    <BackHeader
      label="Moje děti"
      fallback="/deti"
      right={
        data && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Upravit profil"
            onPress={() => router.push({ pathname: '/dite/[id]/upravit', params: { id } })}
            style={({ pressed }) => [styles.edit, pressed && styles.pressed]}>
            <Ionicons name="create-outline" size={18} color={Colors.heading} />
            <Text style={styles.editLabel}>Upravit</Text>
          </Pressable>
        )
      }
    />
  );

  if (error) {
    return (
      <Screen showLogo={false} header={header}>
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }
  if (!data) {
    return (
      <Screen showLogo={false} header={header}>
        <Loading />
      </Screen>
    );
  }

  const { child, letters } = data;
  const drafts = letters.filter((l) => l.status === 'koncept');
  const finished = letters.filter((l) => l.status === 'hotovo');
  const palette = CHILD_COLORS[child.color as ChildColor] ?? CHILD_COLORS.rose;
  const age = formatAge(child.birth_date);

  return (
    <Screen showLogo={false} header={header}>
      <View style={[styles.profile, { backgroundColor: palette.bg }]}>
        <ChildAvatar name={child.name} color={child.color} size={96} onTint />
        <View style={styles.profileTexts}>
          <Title>{child.name}</Title>
          {!!age && <Body style={styles.age}>{age}</Body>}
        </View>
      </View>
      {!!child.description && <Body style={styles.description}>{child.description}</Body>}

      <View style={styles.create}>
        <Heading>Vytvořit novou vzpomínku</Heading>
        <Muted>Napište, namluvte, natočte nebo přidejte fotku. Vyberte, co je vám nejbližší.</Muted>
        <CreateMemory childId={child.id} />
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['vzkazy', 'osa'] as const).map((key) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === key }}
            onPress={() => setView(key)}
            style={[styles.tab, view === key && styles.tabActive]}>
            <Ionicons
              name={key === 'vzkazy' ? 'mail-outline' : 'git-commit-outline'}
              size={18}
              color={view === key ? Colors.heading : Colors.textMuted}
            />
            <Text style={[styles.tabLabel, view === key && styles.tabLabelActive]}>
              {key === 'vzkazy' ? 'Vzkazy' : 'Časová osa'}
            </Text>
          </Pressable>
        ))}
      </View>

      {view === 'osa' ? (
        <View style={styles.section}>
          <Muted>Důležité okamžiky v životě dítěte. Ke každému můžete napsat vzkaz, kdykoli budete chtít.</Muted>
          <ChildTimeline child={child} letters={letters} />
        </View>
      ) : letters.length === 0 ? (
        <EmptyState
          icon="mail-open-outline"
          title="Zatím tu není žádný vzkaz"
          text="I jedna věta má velkou hodnotu. Začněte, kdy budete chtít."
        />
      ) : (
        <>
          {drafts.length > 0 && (
            <View style={styles.section}>
              <Heading>Rozepsané</Heading>
              {drafts.map((letter) => (
                <LetterRow key={letter.id} letter={letter} />
              ))}
            </View>
          )}
          {finished.length > 0 && (
            <View style={styles.section}>
              <Heading>Hotové</Heading>
              {finished.map((letter) => (
                <LetterRow key={letter.id} letter={letter} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.heading,
  },
  pressed: {
    opacity: 0.7,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  profileTexts: {
    flex: 1,
  },
  age: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.heading,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
  },
  create: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.heading,
  },
});
