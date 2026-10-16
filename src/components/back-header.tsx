import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

/** Hlavička vnořené obrazovky: „‹ Zpět na …“ a volitelně akce vpravo. */
export function BackHeader({ label, fallback, right }: { label: string; fallback: Href; right?: ReactNode }) {
  function goBack() {
    // Při otevření přímým odkazem není kam se vrátit, tak jdeme na rozumné místo.
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={goBack}
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={20} color={Colors.heading} />
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSoft,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.heading,
    flexShrink: 1,
  },
});
