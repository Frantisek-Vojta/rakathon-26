import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, ContentWidth, Fonts, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = {
  children: ReactNode;
  /** Logo nahoře. Vnořené obrazovky (profil dítěte, dopis) ho nahrazují tlačítkem zpět. */
  showLogo?: boolean;
  /** Obrazovka ze spodního menu: na počítači je logo v bočním menu, ne nad obsahem. */
  inTabs?: boolean;
  /** Maximální šířka obsahu: formulář, běžný obsah, nebo široká mřížka. */
  width?: keyof typeof ContentWidth;
  /** Obsah nad posouvanou částí, např. hlavička s tlačítkem zpět. */
  header?: ReactNode;
  /** Obsah přilepený dole, např. tlačítka pro uložení dopisu. */
  footer?: ReactNode;
};

// Společný rám každé obrazovky: krémové pozadí, posouvání obsahu, klávesnice nepřekryje pole.
export function Screen({ children, showLogo = true, inTabs, width = 'content', header, footer }: Props) {
  const { isDesktop, isTablet } = useLayout();
  const maxWidth = ContentWidth[width];
  const gutter = isTablet ? Spacing.xl : Spacing.md;
  const logo = showLogo && !(inTabs && isDesktop);

  return (
    <SafeAreaView edges={footer ? ['top', 'bottom'] : ['top']} style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header && <View style={[styles.bar, { maxWidth, paddingHorizontal: gutter }]}>{header}</View>}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: gutter, paddingTop: isDesktop ? Spacing.xl : 0 }]}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.inner, { maxWidth }]}>
            {logo && <Logo />}
            {children}
          </View>
        </ScrollView>
        {footer && (
          <View style={styles.footerWrap}>
            <View style={[styles.footer, { maxWidth, paddingHorizontal: gutter }]}>{footer}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Logo({ large }: { large?: boolean }) {
  return (
    <View style={styles.logo} accessibilityRole="header" accessibilityLabel="Schránka vzpomínek">
      <View style={[styles.logoIcon, large && styles.logoIconLarge]}>
        <Ionicons name="mail-open-outline" size={large ? 26 : 22} color={Colors.primaryText} />
      </View>
      <View>
        <Text style={[styles.logoTop, large && styles.logoTopLarge]}>Schránka</Text>
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
  bar: {
    width: '100%',
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  inner: {
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.lg,
  },
  footerWrap: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footer: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
  logoIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  logoTop: {
    fontFamily: Fonts.headingBold,
    fontSize: 20,
    lineHeight: 22,
    color: Colors.heading,
  },
  logoTopLarge: {
    fontSize: 22,
    lineHeight: 25,
  },
  logoBottom: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 17,
    color: Colors.textMuted,
  },
});
