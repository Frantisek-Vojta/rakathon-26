import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export function Title({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" style={[styles.title, style]} {...props} />;
}

export function Heading({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" style={[styles.heading, style]} {...props} />;
}

export function Body({ style, ...props }: TextProps) {
  return <Text style={[styles.body, style]} {...props} />;
}

export function Muted({ style, ...props }: TextProps) {
  return <Text style={[styles.body, styles.muted, style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.heading,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.heading,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  muted: {
    color: Colors.textMuted,
  },
});
