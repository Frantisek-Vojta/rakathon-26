import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { KIND_STYLE, MAP_PLACES, MemoryMap } from '@/components/memory-map';
import { Screen } from '@/components/screen';
import { ErrorState, Loading } from '@/components/states';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useFocusData } from '@/hooks/use-focus-data';
import { listLetters } from '@/lib/data';
import { plural } from '@/lib/format';
import type { MemoryKind } from '@/lib/media';

const FILTERS: { kind: MemoryKind; label: string }[] = [
  { kind: 'dopis', label: 'Dopisy' },
  { kind: 'hlas', label: 'Hlas' },
  { kind: 'video', label: 'Video' },
  { kind: 'foto', label: 'Fotky' },
];

const COUNT_WORDS: Record<MemoryKind, [string, string, string]> = {
  dopis: ['dopis', 'dopisy', 'dopisů'],
  hlas: ['nahrávka', 'nahrávky', 'nahrávek'],
  video: ['video', 'videa', 'videí'],
  foto: ['fotka', 'fotky', 'fotek'],
};

/** Mapa vzpomínek: přehled hotových vzpomínek jako jemná krajina. */
export default function MemoryMapScreen() {
  const load = useCallback(() => listLetters({ status: 'hotovo' }), []);
  const { data: letters, error, reload } = useFocusData(load);
  const [kind, setKind] = useState<MemoryKind | null>(null);

  const visible = useMemo(() => (letters ?? []).filter((l) => !kind || (l.kind ?? 'dopis') === kind), [letters, kind]);
  const counts = useMemo(() => {
    const result: Record<MemoryKind, number> = { dopis: 0, hlas: 0, video: 0, foto: 0 };
    for (const l of letters ?? []) result[(l.kind as MemoryKind) ?? 'dopis']++;
    return result;
  }, [letters]);

  return (
    <Screen showLogo={false} header={<BackHeader label="Zpět" fallback="/" />}>
      <View style={styles.intro}>
        <Title>Mapa vzpomínek</Title>
        <Muted>Přehled toho, co už vzniklo, jako jemná krajina. Klepnutím vzpomínku otevřete.</Muted>
      </View>

      {error && !letters ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !letters ? (
        <Loading />
      ) : (
        <>
          {letters.length > 0 && (
            <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Typ vzpomínky">
              <Chip label="Vše" selected={!kind} onPress={() => setKind(null)} />
              {FILTERS.map((f) => (
                <Chip key={f.kind} label={f.label} selected={kind === f.kind} onPress={() => setKind(f.kind)} />
              ))}
            </View>
          )}

          <MemoryMap letters={visible} />

          {letters.length === 0 ? (
            <View style={styles.empty}>
              <Body>Až uložíte první vzpomínku, objeví se tady jako místo v krajině. Stačí jedna věta.</Body>
              <Button label="Vytvořit vzpomínku" icon="add" onPress={() => router.push('/deti')} />
            </View>
          ) : visible.length === 0 ? (
            <Muted style={styles.center}>V tomto výběru zatím nic není.</Muted>
          ) : (
            visible.length > MAP_PLACES && (
              <Muted style={styles.center}>Na mapě je {MAP_PLACES} nejnovějších. Všechny najdete v seznamu.</Muted>
            )
          )}

          {letters.length > 0 && (
            <View style={styles.summary}>
              <View style={styles.summaryHead}>
                <Ionicons name="heart-outline" size={22} color={Colors.primaryText} />
                <Heading>Vaše vzpomínky</Heading>
              </View>
              <Body>
                Zatím {plural(letters.length, 'hotová vzpomínka', 'hotové vzpomínky', 'hotových vzpomínek')}. Každá z
                nich je kousek příběhu vaší rodiny.
              </Body>
              <View style={styles.counts}>
                {FILTERS.filter((f) => counts[f.kind] > 0).map((f) => (
                  <View key={f.kind} style={styles.count}>
                    <View style={[styles.countIcon, { backgroundColor: KIND_STYLE[f.kind].tint }]}>
                      <Ionicons name={KIND_STYLE[f.kind].icon} size={20} color={KIND_STYLE[f.kind].color} />
                    </View>
                    <Text style={styles.countText}>{plural(counts[f.kind], ...COUNT_WORDS[f.kind])}</Text>
                  </View>
                ))}
              </View>
              <Button
                label="Otevřít seznam vzpomínek"
                variant="secondary"
                icon="list-outline"
                onPress={() => router.push('/spravce')}
              />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  empty: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  summary: {
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceSoft,
  },
  countIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.heading,
  },
});
