import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const palette: Record<Variant, { bg: string; bgPressed: string; fg: string; border: string }> = {
  primary: { bg: Colors.primary, bgPressed: Colors.primaryPressed, fg: Colors.onPrimary, border: Colors.primary },
  secondary: { bg: Colors.surface, bgPressed: Colors.surfaceSoft, fg: Colors.heading, border: Colors.primarySoft },
  ghost: { bg: 'transparent', bgPressed: Colors.surfaceSoft, fg: Colors.heading, border: 'transparent' },
  danger: { bg: Colors.surface, bgPressed: Colors.dangerSoft, fg: Colors.danger, border: '#F3C9C4' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  accessibilityHint,
}: Props) {
  const colors = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? colors.bgPressed : colors.bg, borderColor: colors.border },
        inactive && styles.inactive,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.fg} />
        ) : (
          icon && <Ionicons name={icon} size={20} color={colors.fg} />
        )}
        <Text style={[styles.label, { color: colors.fg }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
  },
  inactive: {
    opacity: 0.55,
  },
});
