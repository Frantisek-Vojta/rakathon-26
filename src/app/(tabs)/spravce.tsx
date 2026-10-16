import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function ManagerScreen() {
  const { email, isDemo, signOut } = useAuth();

  return (
    <Screen>
      <Title>Správce schránky</Title>
      <Muted>Vaše vzpomínky jsou soukromé a uložené bezpečně na jednom místě.</Muted>

      <View style={styles.card}>
        <Heading>Účet</Heading>
        <Body>{isDemo ? 'Demo účet s fiktivní rodinou' : email}</Body>
        <Button label={isDemo ? 'Ukončit demo' : 'Odhlásit se'} variant="secondary" icon="log-out-outline" onPress={signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
});
