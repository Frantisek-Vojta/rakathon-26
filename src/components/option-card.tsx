import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = {
  kind: 'radio' | 'checkbox';
  selected: boolean;
  title: string;
  description?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint?: string;
  iconColor?: string;
  onPress: () => void;
};

/** Volba v nastavení a v uvítacím průvodci: ikona, název, popis a jasně viditelný stav. */
export function OptionCard({
  kind,
  selected,
  title,
  description,
  icon,
  tint = Colors.primarySoft,
  iconColor = Colors.primaryText,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole={kind}
      aria-checked={selected}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}>
      <View style={[styles.icon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={[kind === 'radio' ? styles.radio : styles.checkbox, selected && styles.indicatorOn]}>
        {selected &&
          (kind === 'radio' ? (
            <View style={styles.radioDot} />
          ) : (
            <Ionicons name="checkmark" size={18} color={Colors.onPrimary} />
          ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 72,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceSoft,
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
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.heading,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.textMuted,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorOn: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.onPrimary,
  },
});
