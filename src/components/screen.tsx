import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Logo nahoře. Vnořené obrazovky (profil dítěte, dopis) ho nahrazují tlačítkem zpět. */
  showLogo?: boolean;
  /** Obsah nad posouvanou částí, např. hlavička s tlačítkem zpět. */
  header?: ReactNode;
  /** Obsah přilepený dole, např. tlačítka pro uložení dopisu. */
  footer?: ReactNode;
};

// Společný rám každé obrazovky: krémové pozadí, posouvání obsahu, klávesnice nepřekryje pole.
export function Screen({ children, showLogo = true, header, footer }: Props) {
  return (
    <SafeAreaView edges={footer ? ['top', 'bottom'] : ['top']} style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header && <View style={styles.headerBar}>{header}</View>}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            {showLogo && <Logo />}
            {children}
          </View>
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Logo() {
  return (
    <View style={styles.logo} accessibilityRole="header" accessibilityLabel="Schránka vzpomínek">
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
  flex: {
    flex: 1,
  },
  headerBar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
