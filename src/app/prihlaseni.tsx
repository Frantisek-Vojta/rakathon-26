import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { Button } from '@/components/button';
import { Illustration } from '@/components/illustration';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { getLastEmail, useAuth } from '@/lib/auth';

type Mode = 'login' | 'register';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignInScreen() {
  const { signIn, signUp, startDemo } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState(getLastEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'form' | 'demo' | null>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const { isTablet } = useLayout();

  const isRegister = mode === 'register';

  async function submit() {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Zkontrolujte prosím, jestli je e-mail napsaný správně.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Heslo musí mít aspoň 8 znaků.');
      return;
    }
    if (!password) {
      setError('Napište prosím heslo.');
      return;
    }
    setBusy('form');
    const result = isRegister ? await signUp(email, password) : await signIn(email, password);
    setBusy(null);
    if (result.error) setError(result.error);
  }

  async function demo() {
    setError(null);
    setBusy('demo');
    const result = await startDemo();
    setBusy(null);
    if (result.error) setError(result.error);
  }

  const intro = (
    <View style={[styles.hero, isTablet && styles.heroWide]}>
      <Illustration name="krajina" maxWidth={isTablet ? 460 : 420} />
      <Title style={[styles.title, !isTablet && styles.center]}>Schránka vzpomínek</Title>
      <Body style={[styles.lead, !isTablet && styles.center]}>
        Místo pro slova, která mohou zůstat nablízku. Pro dopisy a vzkazy vašim dětem, které si jednou budou moci znovu
        přečíst.
      </Body>
    </View>
  );

  return (
    <Screen width={isTablet ? 'wide' : 'narrow'}>
      <View style={[styles.layout, isTablet && styles.layoutWide]}>
        {intro}
        <View style={[styles.side, isTablet && styles.sideWide]}>
          <View style={styles.demoCard}>
            <Heading>Jen se chcete podívat?</Heading>
            <Muted>
              Vyzkoušejte appku s fiktivní rodinou: Eliška, Matěj a Aneta. Bez registrace, ukázková data se po odhlášení
              smažou.
            </Muted>
            <Button
              label="Vyzkoušet demo"
              icon="sparkles-outline"
              onPress={demo}
              loading={busy === 'demo'}
              disabled={!!busy}
            />
          </View>

          <View style={styles.formCard}>
            <View style={styles.tabs} accessibilityRole="tablist">
              {(['login', 'register'] as const).map((m) => (
                <Pressable
                  key={m}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === m }}
                  onPress={() => {
                    setMode(m);
                    setError(null);
                  }}
                  style={[styles.tab, mode === m && styles.tabActive]}>
                  <Text style={[styles.tabLabel, mode === m && styles.tabLabelActive]}>
                    {m === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="vas@email.cz"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              maxLength={254}
            />
            <TextField
              ref={passwordRef}
              label="Heslo"
              value={password}
              onChangeText={setPassword}
              secret
              hint={isRegister ? 'Aspoň 8 znaků.' : undefined}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              textContentType={isRegister ? 'newPassword' : 'password'}
              returnKeyType="go"
              onSubmitEditing={submit}
              maxLength={72}
            />

            {error && (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              label={isRegister ? 'Vytvořit účet' : 'Přihlásit se'}
              onPress={submit}
              loading={busy === 'form'}
              disabled={!!busy}
            />
          </View>

          <View style={styles.privacy}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
            <Muted style={styles.privacyText}>
              Vaše vzpomínky vidíte jen vy. Nikdo jiný k nim přes appku nemá přístup.
            </Muted>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    gap: Spacing.lg,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxl,
  },
  hero: {
    gap: Spacing.sm,
  },
  heroWide: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
  },
  lead: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.textMuted,
  },
  side: {
    gap: Spacing.lg,
  },
  sideWide: {
    flex: 1,
    maxWidth: 480,
  },
  center: {
    textAlign: 'center',
  },
  demoCard: {
    backgroundColor: Colors.peach,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.heading,
  },
  errorBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: '#FBE9E7',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
  },
  privacy: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    flexShrink: 1,
    fontSize: 14,
  },
});
