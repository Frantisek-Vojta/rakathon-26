import { StyleSheet, Text, View } from 'react-native';

import { CHILD_COLORS } from '@/constants/choices';
import { Colors, Fonts } from '@/constants/theme';
import type { ChildColor } from '@/lib/data';

type Props = {
  name: string;
  color: string;
  size?: number;
  /** Na barevném podkladu (profil) je kolečko bílé, aby nesplývalo. */
  onTint?: boolean;
};

export function ChildAvatar({ name, color, size = 64, onTint }: Props) {
  const palette = CHILD_COLORS[color as ChildColor] ?? CHILD_COLORS.rose;
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: onTint ? Colors.surface : palette.bg }]}>
      <Text style={[styles.initial, { color: palette.fg, fontSize: size * 0.42, lineHeight: size * 0.55 }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: Fonts.headingBold,
  },
});
