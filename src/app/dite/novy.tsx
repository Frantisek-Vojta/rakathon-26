import { router } from 'expo-router';

import { BackHeader } from '@/components/back-header';
import { ChildForm } from '@/components/child-form';
import { Screen } from '@/components/screen';
import { Muted, Title } from '@/components/typography';
import { createChild } from '@/lib/data';

export default function NewChildScreen() {
  return (
    <Screen showLogo={false} header={<BackHeader label="Moje děti" fallback="/deti" />}>
      <Title>Přidat dítě</Title>
      <Muted>Stačí jméno. Ostatní můžete doplnit kdykoli později.</Muted>
      <ChildForm
        submitLabel="Uložit profil"
        onSubmit={async (input) => {
          try {
            const child = await createChild(input);
            router.replace({ pathname: '/dite/[id]', params: { id: child.id } });
            return null;
          } catch (e) {
            return (e as Error).message;
          }
        }}
      />
    </Screen>
  );
}
