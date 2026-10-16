import { Screen } from '@/components/screen';
import { Muted, Title } from '@/components/typography';

export default function ChildrenScreen() {
  return (
    <Screen>
      <Title>Moje děti</Title>
      <Muted>Vyberte dítě, pro které chcete tvořit vzpomínky a uchovávat vzkazy.</Muted>
    </Screen>
  );
}
