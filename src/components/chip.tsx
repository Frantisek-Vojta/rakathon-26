import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';

/** Malé volitelné tlačítko (filtr, příležitost, písmo). */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      aria-checked={selected}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.heading,
  },
});
