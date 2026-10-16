import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

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
    href: '/deti',
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
    text: 'Nápady, které vám mohou pomoci začít.',
    icon: 'bulb-outline',
    tint: Colors.peach,
    iconColor: Colors.peachDark,
    href: '/inspirace',
  },
  {
    title: 'Správce schránky',
    text: 'Vše bezpečně na jednom místě.',
    icon: 'cube-outline',
    tint: Colors.lavender,
    iconColor: Colors.lavenderDark,
    href: '/spravce',
  },
];

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Title style={styles.center}>Místo pro slova, která mohou zůstat nablízku.</Title>
        <Muted style={styles.center}>
          Vytvářejte vzpomínky, vzkazy a příběhy pro své děti, které si jednou budou moci znovu
          přečíst, poslechnout a prožít.
        </Muted>
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

      <View style={styles.smallStep}>
        <Heading>Dnešní malý krok</Heading>
        <Body>Napište jednu větu, kterou by si vaše dítě mělo jednou pamatovat.</Body>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/deti')}
          style={({ pressed }) => [styles.smallStepButton, pressed && styles.pressed]}>
          <Ionicons name="pencil-outline" size={20} color={Colors.heading} />
          <Body style={styles.smallStepLabel}>Napsat jednu větu</Body>
          <Ionicons name="chevron-forward" size={20} color={Colors.heading} />
        </Pressable>
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
  smallStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  smallStepLabel: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
  },
});
