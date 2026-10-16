import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ChildAvatar } from '@/components/child-avatar';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, Loading } from '@/components/states';
import { Heading, Muted, Title } from '@/components/typography';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { listChildren, type ChildWithCounts } from '@/lib/data';
import { formatAge, plural } from '@/lib/format';

export default function ChildrenScreen() {
  const load = useCallback(() => listChildren(), []);
  const { data: children, error, loading, reload } = useFocusData(load);

  return (
    <Screen>
      <View style={styles.intro}>
        <Title>Moje děti</Title>
        <Muted>Každé dítě má svůj vlastní prostor. Vyberte, pro koho chcete psát.</Muted>
      </View>

      {loading && !children ? (
        <Loading />
      ) : error && !children ? (
        <ErrorState message={error} onRetry={reload} />
      ) : children && children.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Zatím tu nikdo není"
          text="Přidejte první dítě. Vznikne mu vlastní prostor pro vaše dopisy a vzkazy.">
          <Button label="Přidat dítě" icon="add" onPress={() => router.push('/dite/novy')} />
        </EmptyState>
      ) : (
        <>
          {children?.map((child) => <ChildCard key={child.id} child={child} />)}
          <Button label="Přidat dítě" variant="secondary" icon="add" onPress={() => router.push('/dite/novy')} />
        </>
      )}
    </Screen>
  );
}

function ChildCard({ child }: { child: ChildWithCounts }) {
  const age = formatAge(child.birth_date);
  const openProfile = () => router.push({ pathname: '/dite/[id]', params: { id: child.id } });

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Otevřít profil: ${child.name}`}
        onPress={openProfile}
        style={({ pressed }) => [styles.cardTop, pressed && styles.pressed]}>
        <ChildAvatar name={child.name} color={child.color} size={72} />
        <View style={styles.cardTexts}>
          <Heading style={styles.name}>{child.name}</Heading>
          {!!age && <Muted>{age}</Muted>}
          <View style={styles.counts}>
            <Count icon="mail-outline" text={plural(child.finished, 'hotový', 'hotové', 'hotových')} />
            <Count icon="create-outline" text={plural(child.drafts, 'koncept', 'koncepty', 'konceptů')} />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={Colors.textFaint} />
      </Pressable>
      <Button
        label="Napsat vzkaz"
        variant="secondary"
        icon="create-outline"
        onPress={() => router.push({ pathname: '/dopis/[id]', params: { id: 'novy', dite: child.id } })}
      />
    </View>
  );
}

function Count({ icon, text }: { icon: 'mail-outline' | 'create-outline'; text: string }) {
  return (
    <View style={styles.count}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
      <Text style={styles.countText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  cardTexts: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: 4,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.text,
  },
});
