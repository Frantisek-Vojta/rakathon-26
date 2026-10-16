import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import { useCallback, type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { LetterRow } from '@/components/letter-row';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { promptOfTheDay } from '@/constants/inspiration';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { listChildren, listLetters } from '@/lib/data';

type Tile = {
  title: string;
  text: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  iconColor: string;
  href: Href;
};

const tiles: Tile[] = [
  {
    title: 'Vytvořit vzkaz',
    text: 'Napište svému dítěti dopis, vzpomínku nebo vzkaz.',
    icon: 'create-outline',
    tint: Colors.primarySoft,
    iconColor: Colors.primary,
    href: { pathname: '/dopis/[id]', params: { id: 'novy' } },
  },
  {
    title: 'Moje děti',
    text: 'Každé dítě má svůj vlastní prostor.',
    icon: 'people-outline',
    tint: Colors.sage,
    iconColor: Colors.sageDark,
    href: '/deti',
  },
  {
    title: 'Inspirace a tipy',
    text: 'Otázky a nápady, které pomohou začít.',
    icon: 'bulb-outline',
    tint: Colors.peach,
    iconColor: Colors.peachDark,
    href: '/inspirace',
  },
  {
    title: 'Správce schránky',
    text: 'Všechny vzkazy bezpečně na jednom místě.',
    icon: 'cube-outline',
    tint: Colors.lavender,
    iconColor: Colors.lavenderDark,
    href: '/spravce',
  },
];

export default function HomeScreen() {
  const load = useCallback(async () => {
    const [children, drafts] = await Promise.all([listChildren(), listLetters({ status: 'koncept' })]);
    return { children, drafts };
  }, []);
  const { data } = useFocusData(load);
  const question = promptOfTheDay();
  const noChildren = data?.children.length === 0;

  return (
    <Screen>
      <View style={styles.hero}>
        <Title style={styles.center}>Místo pro slova, která mohou zůstat nablízku.</Title>
        <Muted style={styles.center}>
          Vytvářejte vzpomínky, vzkazy a příběhy pro své děti, které si jednou budou moci znovu přečíst a
          prožít.
        </Muted>
      </View>

      {noChildren && (
        <View style={styles.onboarding}>
          <Heading>Začněte malým krokem</Heading>
          <Body>Přidejte dítě, pro které chcete psát. Stačí jméno, zbytek může počkat.</Body>
          <Button label="Přidat dítě" icon="add" onPress={() => router.push('/dite/novy')} />
        </View>
      )}

      {!!data?.drafts.length && (
        <View style={styles.section}>
          <Heading>Rozepsané vzkazy</Heading>
          <Muted>Můžete pokračovat, kdykoli budete chtít. Nic nespěchá.</Muted>
          {data.drafts.slice(0, 3).map((letter) => (
            <LetterRow key={letter.id} letter={letter} childName={letter.child?.name} />
          ))}
        </View>
      )}

      <View style={styles.smallStep}>
        <View style={styles.smallStepHead}>
          <Ionicons name="sunny-outline" size={24} color={Colors.peachDark} />
          <Heading>Dnešní malý krok</Heading>
        </View>
        <Body style={styles.question}>{question}</Body>
        <Muted>Stačí jedna věta, kterou by si vaše dítě mělo jednou pamatovat.</Muted>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/dopis/[id]', params: { id: 'novy', otazka: question } })}
          style={({ pressed }) => [styles.smallStepButton, pressed && styles.pressed]}>
          <Ionicons name="pencil-outline" size={20} color={Colors.heading} />
          <Body style={styles.smallStepLabel}>Napsat jednu větu</Body>
          <Ionicons name="chevron-forward" size={20} color={Colors.heading} />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.title}
            accessibilityRole="button"
            onPress={() => router.push(tile.href)}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
            <View style={[styles.tileIcon, { backgroundColor: tile.tint }]}>
              <Ionicons name={tile.icon} size={26} color={tile.iconColor} />
            </View>
            <Heading style={styles.tileTitle}>{tile.title}</Heading>
            <Muted style={styles.tileText}>{tile.text}</Muted>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  center: {
    textAlign: 'center',
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
    gap: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  tileTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  tileText: {
    fontSize: 14,
    lineHeight: 20,
  },
  smallStep: {
    backgroundColor: Colors.peach,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  smallStepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  question: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 26,
  },
  smallStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  smallStepLabel: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
  },
});
