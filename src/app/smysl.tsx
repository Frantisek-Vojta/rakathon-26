import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Button } from '@/components/button';
import { Illustration } from '@/components/illustration';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

// Texty vycházejí z podkladů k výzvě („Proč to má smysl“).
const REASONS: {
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  color: string;
  title: string;
  text: string;
}[] = [
  {
    icon: 'heart-outline',
    tint: Colors.primarySoft,
    color: Colors.primaryText,
    title: 'Zachování vztahu',
    text: 'Dítě si uchovává spojení s rodičem i tehdy, když už nemohou být spolu každý den.',
  },
  {
    icon: 'leaf-outline',
    tint: Colors.sage,
    color: Colors.sageDark,
    title: 'Rodičovská role',
    text: 'Rodič může tvořit a předávat svou lásku, zkušenosti a hodnoty i v těžkém období.',
  },
  {
    icon: 'book-outline',
    tint: Colors.peach,
    color: Colors.peachDark,
    title: 'Životní příběh a identita',
    text: 'Příběhy a vzpomínky pomáhají dítěti chápat, odkud pochází a kým je.',
  },
  {
    icon: 'sunny-outline',
    tint: Colors.lavender,
    color: Colors.lavenderDark,
    title: 'Pocit smyslu pro rodiče',
    text: 'I malé kroky mohou dát pocit klidu, naplnění a smyslu, že zanecháváte něco důležitého.',
  },
];

export default function MeaningScreen() {
  const { isTablet } = useLayout();

  return (
    <Screen showLogo={false} header={<BackHeader label="Zpět" fallback="/inspirace" />}>
      <View style={[styles.hero, isTablet && styles.heroWide]}>
        <View style={styles.heroText}>
          <Title style={styles.big}>Vzpomínky mají smysl</Title>
          <Body style={styles.lead}>
            Vzpomínkové dary pomáhají udržet blízkost, předat důležité hodnoty a zanechat stopu lásky i do budoucna.
          </Body>
        </View>
        <Illustration name="objeti" maxWidth={isTablet ? 320 : 360} style={isTablet && styles.heroImage} />
      </View>

      <View style={styles.what}>
        <Heading>Co jsou vzpomínkové dary?</Heading>
        <Body>
          Osobní vzkazy, příběhy, fotografie, nahrávky nebo malé předměty, které vytváříte pro své dítě. Mohou mu v
          budoucnu připomínat vaši lásku, hodnoty a společné chvíle.
        </Body>
      </View>

      <View style={styles.section}>
        <Heading>Jak mohou pomáhat</Heading>
        <View style={[styles.grid, isTablet && styles.gridWide]}>
          {REASONS.map((r) => (
            <View key={r.title} style={[styles.reason, isTablet && styles.reasonWide]}>
              <View style={[styles.icon, { backgroundColor: r.tint }]}>
                <Ionicons name={r.icon} size={24} color={r.color} />
              </View>
              <View style={styles.reasonTexts}>
                <Text style={styles.reasonTitle}>{r.title}</Text>
                <Muted>{r.text}</Muted>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.quote}>
        <Text style={styles.quoteText}>„Technologie nenahrazuje vztah, ale může ho pomoci uchovat.“</Text>
      </View>

      <Button
        label="Napsat vzkaz"
        icon="create-outline"
        onPress={() => router.push({ pathname: '/dopis/[id]', params: { id: 'novy' } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.md,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    gap: Spacing.sm,
  },
  heroImage: {
    flex: 1,
  },
  big: {
    fontSize: 36,
    lineHeight: 44,
  },
  lead: {
    fontSize: 18,
    lineHeight: 28,
  },
  what: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.md,
  },
  grid: {
    gap: Spacing.lg,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reason: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  reasonWide: {
    flexBasis: '45%',
    flexGrow: 1,
    // Lichá poslední karta zůstane poloviční, neroztáhne se přes celou šířku.
    maxWidth: '49%',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonTexts: {
    flex: 1,
    gap: 2,
  },
  reasonTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.heading,
  },
  quote: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  quoteText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 31,
    color: Colors.heading,
  },
});
