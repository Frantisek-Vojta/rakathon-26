import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Button } from '@/components/button';
import { ChildAvatar } from '@/components/child-avatar';
import { LetterRow } from '@/components/letter-row';
import { Screen } from '@/components/screen';
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
  const newLetter = () => router.push({ pathname: '/dopis/[id]', params: { id: 'novy', dite: child.id } });

  return (
    <Screen showLogo={false} header={header}>
      <View style={[styles.profile, { backgroundColor: palette.bg }]}>
        <ChildAvatar name={child.name} color={child.color} size={96} onTint />
        <View style={styles.profileTexts}>
          <Muted style={styles.kicker}>Profil dítěte</Muted>
          <Title>{child.name}</Title>
          {!!age && <Body style={styles.age}>{age}</Body>}
        </View>
      </View>
      {!!child.description && <Body style={styles.description}>{child.description}</Body>}

      <View style={styles.create}>
        <Heading>Napsat nový vzkaz</Heading>
        <Muted>Zachyťte myšlenky, slova a okamžiky, které budou mít jednou velkou hodnotu.</Muted>
        <Button label="Napsat dopis" icon="create-outline" onPress={newLetter} />
      </View>

      {letters.length === 0 ? (
        <EmptyState icon="mail-open-outline" title="Zatím tu není žádný vzkaz" text="I jedna věta má velkou hodnotu. Začněte, kdy budete chtít." />
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
  kicker: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
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
});
