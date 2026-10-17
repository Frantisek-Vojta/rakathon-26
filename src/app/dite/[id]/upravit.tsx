import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { BackHeader } from '@/components/back-header';
import { Button } from '@/components/button';
import { ChildForm } from '@/components/child-form';
import { ConfirmDialog } from '@/components/dialog';
import { Screen } from '@/components/screen';
import { ErrorState, Loading } from '@/components/states';
import { Title } from '@/components/typography';
import { useFocusData } from '@/hooks/use-focus-data';
import { deleteChild, getChild, updateChild } from '@/lib/data';

export default function EditChildScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(() => getChild(id), [id]);
  const { data: child, error, reload } = useFocusData(load);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    try {
      await deleteChild(id);
      setConfirm(false);
      router.dismissTo('/deti');
    } catch (e) {
      setDeleteError((e as Error).message);
      setDeleting(false);
    }
  }

  return (
    <Screen
      showLogo={false}
      header={<BackHeader label={child ? `Zpět na profil: ${child.name}` : 'Zpět'} fallback="/deti" />}>
      <Title>Upravit profil</Title>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !child ? (
        <Loading />
      ) : (
        <>
          <ChildForm
            key={child.id}
            initial={child}
            submitLabel="Uložit změny"
            onSubmit={async (input) => {
              try {
                await updateChild(id, input);
                router.back();
                return null;
              } catch (e) {
                return (e as Error).message;
              }
            }}
          />
          <Button
            label="Smazat profil"
            variant="danger"
            icon="trash-outline"
            onPress={() => {
              setDeleteError(null);
              setConfirm(true);
            }}
          />
          <ConfirmDialog
            visible={confirm}
            danger
            title={`Smazat profil: ${child.name}?`}
            message={
              deleteError ??
              'Smažou se i všechny dopisy, nahrávky, videa a fotky pro toto dítě. Tento krok nejde vrátit.'
            }
            confirmLabel="Ano, smazat"
            busy={deleting}
            onConfirm={remove}
            onCancel={() => setConfirm(false)}
          />
        </>
      )}
    </Screen>
  );
}
