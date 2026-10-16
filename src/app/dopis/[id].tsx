import { useLocalSearchParams } from 'expo-router';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Muted, Title } from '@/components/typography';

// Dočasná obrazovka, editor dopisu přibude v dalším kroku.
export default function LetterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen showLogo={false} header={<BackHeader label="Zpět" fallback="/deti" />}>
      <Title>Dopis</Title>
      <Muted>{id}</Muted>
    </Screen>
  );
}
