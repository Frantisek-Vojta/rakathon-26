import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import type { MemoryKind } from '@/lib/media';

const OPTIONS: {
  kind: MemoryKind;
  title: string;
  text: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  color: string;
}[] = [
  {
    kind: 'dopis',
    title: 'Napsat dopis',
    text: 'Slova, která zůstanou',
    icon: 'create-outline',
    tint: Colors.primarySoft,
    color: Colors.primaryText,
  },
  {
    kind: 'hlas',
    title: 'Nahrát hlas',
    text: 'Bez psaní, vlastním hlasem',
    icon: 'mic-outline',
    tint: Colors.sage,
    color: Colors.sageDark,
  },
  {
    kind: 'video',
    title: 'Natočit video',
    text: 'Pár slov do kamery',
    icon: 'videocam-outline',
    tint: Colors.lavender,
    color: Colors.lavenderDark,
  },
  {
    kind: 'foto',
    title: 'Přidat fotku',
    text: 'Společná chvíle',
    icon: 'image-outline',
    tint: Colors.peach,
    color: Colors.peachDark,
  },
];

/** Volba, jak vzpomínku vytvořit: psaním, hlasem, videem, nebo fotkou. */
export function CreateMemory({ childId }: { childId?: string }) {
  const { isTablet } = useLayout();

  return (
    <View style={styles.grid}>
      {OPTIONS.map((o) => (
        <Pressable
          key={o.kind}
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/dopis/[id]',
              params: { id: 'novy', druh: o.kind, ...(childId ? { dite: childId } : {}) },
            })
          }
          style={({ pressed }) => [styles.option, isTablet && styles.optionWide, pressed && styles.pressed]}>
          <View style={[styles.icon, { backgroundColor: o.tint }]}>
            <Ionicons name={o.icon} size={26} color={o.color} />
          </View>
          <View style={styles.texts}>
            <Text style={styles.title}>{o.title}</Text>
            <Text style={styles.text}>{o.text}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    flexBasis: '45%',
    flexGrow: 1,
    maxWidth: '49%',
    minHeight: 64,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  optionWide: {
    flexBasis: '22%',
    maxWidth: '25%',
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    color: Colors.heading,
  },
  text: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textMuted,
  },
});
