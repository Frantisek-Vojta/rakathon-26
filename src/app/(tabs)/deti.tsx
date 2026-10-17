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
import { useLayout } from '@/hooks/use-layout';
import { listChildren, type ChildWithCounts } from '@/lib/data';
import { formatAge, plural } from '@/lib/format';

export default function ChildrenScreen() {
  const load = useCallback(() => listChildren(), []);
  const { data: children, error, loading, reload } = useFocusData(load);
  const { isTablet } = useLayout();

  return (
    <Screen inTabs width="wide">
      <View style={styles.intro}>
        <Title>Moje děti</Title>
        <Muted>Každé dítě má svůj vlastní prostor. Vyberte, pro koho chcete tvořit.</Muted>
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
          <View style={[styles.grid, isTablet && styles.gridWide]}>
            {children?.map((child) => (
              <View key={child.id} style={isTablet ? styles.cell : undefined}>
                <ChildCard child={child} />
              </View>
            ))}
          </View>
          <Button
            label="Přidat dítě"
            variant="secondary"
            icon="add"
            onPress={() => router.push('/dite/novy')}
            style={isTablet ? styles.addWide : undefined}
          />
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
        onPress={openProfile}
        style={({ pressed }) => [styles.cardTop, pressed && styles.pressed]}>
        <ChildAvatar name={child.name} color={child.color} size={72} />
        <View style={styles.cardTexts}>
          <Heading style={styles.name}>{child.name}</Heading>
          {!!age && <Muted>{age}</Muted>}
          <View style={styles.counts}>
            {countsOf(child).length === 0 ? (
              <Text style={styles.countText}>Zatím bez vzpomínek</Text>
            ) : (
              countsOf(child).map((c) => <Count key={c.icon} icon={c.icon} text={c.text} />)
            )}
            {child.drafts > 0 && (
              <Text style={styles.draftsText}>{plural(child.drafts, 'rozepsaná', 'rozepsané', 'rozepsaných')}</Text>
            )}
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

type CountIcon = 'mail-outline' | 'mic-outline' | 'videocam-outline' | 'image-outline';

function countsOf(child: ChildWithCounts): { icon: CountIcon; text: string }[] {
  const { dopis, hlas, video, foto } = child.byKind;
  return [
    { icon: 'mail-outline' as const, n: dopis, text: plural(dopis, 'dopis', 'dopisy', 'dopisů') },
    { icon: 'mic-outline' as const, n: hlas, text: plural(hlas, 'nahrávka', 'nahrávky', 'nahrávek') },
    { icon: 'videocam-outline' as const, n: video, text: plural(video, 'video', 'videa', 'videí') },
    { icon: 'image-outline' as const, n: foto, text: plural(foto, 'fotka', 'fotky', 'fotek') },
  ]
    .filter((c) => c.n > 0)
    .map(({ icon, text }) => ({ icon, text }));
}

function Count({ icon, text }: { icon: CountIcon; text: string }) {
  return (
    <View style={styles.count}>
      <Ionicons name={icon} size={16} color={Colors.primaryText} />
      <Text style={styles.countText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  grid: {
    gap: Spacing.md,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    flexBasis: '45%',
    flexGrow: 1,
    // Lichá poslední karta zůstane poloviční, neroztáhne se přes celou šířku.
    maxWidth: '49%',
  },
  addWide: {
    alignSelf: 'flex-start',
  },
  card: {
    flex: 1,
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
  draftsText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.draft,
  },
});
