import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { useCallback, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { CreateMemory } from '@/components/create-memory';
import { Illustration } from '@/components/illustration';
import { LetterRow } from '@/components/letter-row';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { promptOfTheDay } from '@/constants/inspiration';
import { quoteOfTheDay } from '@/constants/support';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { useLayout } from '@/hooks/use-layout';
import { listChildren, listLetters } from '@/lib/data';
import { plural } from '@/lib/format';
import { usePreferences } from '@/lib/preferences';

type Energy = {
  title: string;
  text: string;
  action: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  color: string;
  href: Href;
};

/**
 * Úvodní obrazovka: „Vítejte zpět“ a průvodce energií rodiče (podle podkladů k výzvě).
 * Návrat bez výčitek: pokračovat v konceptu, napsat jen jednu větu, nebo si vše jen projít.
 */
export default function HomeScreen() {
  const { isTablet, isDesktop } = useLayout();
  const { encourage, quote, dailyPrompt } = usePreferences();
  const load = useCallback(async () => {
    const [children, letters] = await Promise.all([listChildren(), listLetters()]);
    return { children, letters };
  }, []);
  const { data } = useFocusData(load);

  const question = dailyPrompt ? promptOfTheDay() : 'Napište jednu větu, kterou by si vaše dítě mělo jednou pamatovat.';
  const drafts = data?.letters.filter((l) => l.status === 'koncept') ?? [];
  const finished = data?.letters.filter((l) => l.status === 'hotovo').length ?? 0;
  const returning = (data?.letters.length ?? 0) > 0;
  const noChildren = data?.children.length === 0;

  const energies: Energy[] = [
    {
      title: 'Mám sílu tvořit',
      text: 'Chci dnes zachytit víc vzpomínek, myšlenek nebo příběhů.',
      action: 'Napsat dopis',
      icon: 'heart-outline',
      tint: Colors.primarySoft,
      color: Colors.primaryText,
      href: { pathname: '/dopis/[id]', params: { id: 'novy' } },
    },
    {
      title: 'Zvládnu jen jednu větu',
      text: question,
      action: 'Začít jednou větou',
      icon: 'pencil-outline',
      tint: Colors.sage,
      color: Colors.sageDark,
      href: { pathname: '/dopis/[id]', params: { id: 'novy', otazka: question } },
    },
    {
      title: 'Dnes potřebuji odpočívat',
      text: 'Je v pořádku zpomalit. Někdy je důležité jen být a načerpat sílu.',
      action: 'Jen si projít inspiraci',
      icon: 'moon-outline',
      tint: Colors.peach,
      color: Colors.peachDark,
      href: '/inspirace',
    },
  ];

  return (
    <Screen inTabs width="wide">
      <View style={[styles.hero, isTablet && styles.heroWide]}>
        <View style={[styles.heroText, isTablet && styles.heroTextWide]}>
          <Title style={styles.heroTitle}>
            {returning ? 'Vítejte zpět' : 'Místo pro slova, která mohou zůstat nablízku'}
          </Title>
          <Body style={styles.lead}>
            {returning
              ? 'Můžete pokračovat svým tempem.'
              : 'Vytvářejte vzpomínky, vzkazy a příběhy pro své děti. Kdykoli můžete přestat a vrátit se.'}
          </Body>
        </View>
        <Illustration name="rodina" style={isTablet ? styles.heroImageWide : undefined} />
      </View>

      {encourage && returning && (
        <View style={styles.gentle}>
          <Ionicons name="heart" size={24} color={Colors.primaryText} />
          <Text style={styles.gentleText}>
            Není potřeba spěchat. <Text style={styles.gentleSoft}>I malý návrat má smysl.</Text>
          </Text>
        </View>
      )}

      {noChildren && (
        <View style={styles.onboarding}>
          <Heading>Začněte malým krokem</Heading>
          <Body>Přidejte dítě, pro které chcete vzpomínky uchovat. Stačí jméno, zbytek může počkat.</Body>
          <Button label="Přidat dítě" icon="add" onPress={() => router.push('/dite/novy')} />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Heading>Kolik máte dnes sil?</Heading>
          <Muted>Vyberte si, co je pro vás dnes možné. Každá možnost je v pořádku.</Muted>
        </View>
        <View style={[styles.energies, isDesktop && styles.energiesRow]}>
          {energies.map((e) => (
            <Pressable
              key={e.title}
              accessibilityRole="button"
              onPress={() => router.push(e.href)}
              style={({ pressed }) => [styles.energy, isDesktop && styles.energyColumn, pressed && styles.pressed]}>
              <View style={[styles.energyIcon, { backgroundColor: e.tint }]}>
                <Ionicons name={e.icon} size={26} color={e.color} />
              </View>
              <View style={styles.energyTexts}>
                <Text style={styles.energyTitle}>{e.title}</Text>
                <Text style={styles.energyText}>{e.text}</Text>
                <View style={styles.energyAction}>
                  <Text style={styles.energyActionText}>{e.action}</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.primaryText} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Heading>Nemusíte psát</Heading>
          <Muted>Vzpomínku můžete i namluvit, natočit nebo k ní přidat fotku. Vyberte, co je vám dnes nejbližší.</Muted>
        </View>
        <CreateMemory />
      </View>

      <View style={[styles.columns, isDesktop && styles.columnsWide]}>
        {drafts.length > 0 && (
          <View style={[styles.section, styles.column]}>
            <View style={styles.sectionHead}>
              <Heading>Pokračovat v konceptu</Heading>
              <Muted>Vraťte se k tomu, co jste začali, a pište dál, i když jen pár vět.</Muted>
            </View>
            {drafts.slice(0, 3).map((letter) => (
              <LetterRow key={letter.id} letter={letter} childName={letter.child?.name} />
            ))}
          </View>
        )}

        <View style={[styles.section, styles.column]}>
          {finished > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/mapa')}
              style={({ pressed }) => [styles.browse, pressed && styles.pressed]}>
              <View style={[styles.energyIcon, { backgroundColor: Colors.lavender }]}>
                <Ionicons name="albums-outline" size={26} color={Colors.lavenderDark} />
              </View>
              <View style={styles.energyTexts}>
                <Text style={styles.energyTitle}>Jen si vše projít</Text>
                <Text style={styles.energyText}>
                  Mapa vzpomínek: zatím {plural(finished, 'hotová vzpomínka', 'hotové vzpomínky', 'hotových vzpomínek')}
                  .
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={Colors.textFaint} />
            </Pressable>
          )}

          {quote && (
            <View style={styles.quote}>
              <Ionicons name="leaf-outline" size={22} color={Colors.sageDark} />
              <Text style={styles.quoteText}>„{quoteOfTheDay()}“</Text>
            </View>
          )}

          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/smysl')}
            style={({ pressed }) => [styles.meaning, pressed && styles.pressed]}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.primaryText} />
            <Text style={styles.meaningText}>Proč to má smysl?</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primaryText} />
          </Pressable>
        </View>
      </View>
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
    gap: Spacing.xl,
  },
  heroText: {
    gap: Spacing.sm,
  },
  heroTextWide: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 44,
  },
  heroImageWide: {
    flex: 1.4,
  },
  lead: {
    fontSize: 19,
    lineHeight: 28,
    color: Colors.textMuted,
  },
  gentle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  gentleText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 27,
    color: Colors.heading,
  },
  gentleSoft: {
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  onboarding: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHead: {
    gap: 2,
  },
  energies: {
    gap: Spacing.sm,
  },
  energiesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  energy: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  energyColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  pressed: {
    opacity: 0.75,
  },
  energyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyTexts: {
    flex: 1,
    gap: 4,
  },
  energyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 25,
    color: Colors.heading,
  },
  energyText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textMuted,
  },
  energyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  energyActionText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryText,
  },
  columns: {
    gap: Spacing.lg,
  },
  columnsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
  },
  browse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.sage,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  quoteText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.text,
  },
  meaning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    alignSelf: 'flex-start',
  },
  meaningText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.primaryText,
  },
});
