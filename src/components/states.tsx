import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Body, Heading, Muted } from '@/components/typography';
import { Colors, Radius, Spacing } from '@/constants/theme';

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.primary} accessibilityLabel="Načítám" />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.box} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={36} color={Colors.textMuted} />
      <Body style={styles.center}>{message}</Body>
      {onRetry && <Button label="Zkusit znovu" variant="secondary" icon="refresh" onPress={onRetry} />}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={30} color={Colors.primary} />
      </View>
      <Heading style={styles.center}>{title}</Heading>
      <Muted style={styles.center}>{text}</Muted>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
  },
  box: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
