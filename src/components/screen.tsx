import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

// Společný rám každé obrazovky: logo nahoře, krémové pozadí, posouvání obsahu.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.inner}>
          <Logo />
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Logo() {
  return (
    <View style={styles.logo} accessibilityLabel="Schránka vzpomínek">
      <View style={styles.logoIcon}>
        <Ionicons name="mail-open-outline" size={22} color={Colors.primary} />
      </View>
      <View>
        <Text style={styles.logoTop}>Schránka</Text>
        <Text style={styles.logoBottom}>vzpomínek</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTop: {
    fontFamily: Fonts.headingBold,
    fontSize: 20,
    lineHeight: 22,
    color: Colors.heading,
  },
  logoBottom: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 16,
    color: Colors.textMuted,
  },
});
