import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ChildAvatar } from '@/components/child-avatar';
import { EmptyState, ErrorState, Loading } from '@/components/states';
import { Heading, Muted, Title } from '@/components/typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { listChildren } from '@/lib/data';
import { formatAge } from '@/lib/format';

/** Komu je vzkaz určený: zobrazí se, když psaní začne odjinud než z profilu dítěte. */
export function ChildPicker({ prompt, onPick }: { prompt?: string; onPick: (childId: string) => void }) {
  const load = useCallback(() => listChildren(), []);
  const { data: children, error, reload } = useFocusData(load);

  return (
    <View style={styles.wrap}>
      <Title>Pro koho bude vzkaz?</Title>
      {!!prompt && (
        <View style={styles.prompt}>
          <Ionicons name="bulb-outline" size={20} color={Colors.peachDark} />
          <Muted style={styles.promptText}>{prompt}</Muted>
        </View>
      )}
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !children ? (
        <Loading />
      ) : children.length === 0 ? (
        <EmptyState icon="people-outline" title="Nejdřív přidejte dítě" text="Každý vzkaz patří ke konkrétnímu dítěti.">
          <Button label="Přidat dítě" icon="add" onPress={() => router.push('/dite/novy')} />
        </EmptyState>
      ) : (
        children.map((child) => (
          <Pressable
            key={child.id}
            accessibilityRole="button"
            accessibilityLabel={`Psát pro: ${child.name}`}
            onPress={() => onPick(child.id)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <ChildAvatar name={child.name} color={child.color} size={56} />
            <View style={styles.texts}>
              <Heading>{child.name}</Heading>
              {!!child.birth_date && <Muted>{formatAge(child.birth_date)}</Muted>}
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.textFaint} />
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.md,
  },
  prompt: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.peach,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  promptText: {
    flex: 1,
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  texts: {
    flex: 1,
  },
});
