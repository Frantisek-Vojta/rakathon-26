// Mapa vzpomínek (podklady: „Mapa vzpomínek v pastelové krajině“): hotové vzpomínky jako místa
// v akvarelové krajině. Přibývají postupně, bez cílů a čísel ke splnění.
// Běžný seznam zůstává ve Správci schránky, jak podklady doporučují.
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ILLUSTRATIONS } from '@/constants/illustrations';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import type { LetterWithChild } from '@/lib/data';
import { KIND_LABELS, type MemoryKind } from '@/lib/media';

/**
 * Místa v krajině: cesta od popředí ke kopcům, střídavě vlevo a vpravo (v procentech šířky a výšky mapy).
 * Bubliny jsou široké nejvýš 42 % mapy, takže se levá a pravá strana nikdy nepřekryjí.
 */
const SLOTS = [
  { x: 28, y: 93 },
  { x: 72, y: 84 },
  { x: 28, y: 75 },
  { x: 72, y: 66 },
  { x: 28, y: 57 },
  { x: 72, y: 48 },
  { x: 28, y: 39 },
  { x: 72, y: 30 },
];

export const MAP_PLACES = SLOTS.length;

export const KIND_STYLE: Record<
  MemoryKind,
  { icon: ComponentProps<typeof Ionicons>['name']; tint: string; color: string }
> = {
  dopis: { icon: 'mail-outline', tint: Colors.primarySoft, color: Colors.primaryText },
  hlas: { icon: 'mic-outline', tint: Colors.sage, color: Colors.sageDark },
  video: { icon: 'videocam-outline', tint: Colors.lavender, color: Colors.lavenderDark },
  foto: { icon: 'image-outline', tint: Colors.peach, color: Colors.peachDark },
};

export function MemoryMap({ letters }: { letters: LetterWithChild[] }) {
  const { isTablet } = useLayout();
  return (
    <View style={[styles.map, isTablet ? styles.mapWide : styles.mapTall]}>
      <View aria-hidden style={styles.landscape}>
        <Image
          source={ILLUSTRATIONS.krajina.source}
          alt=""
          contentFit="cover"
          transition={250}
          style={styles.landscapeImage}
        />
      </View>
      {byTime(letters.slice(0, SLOTS.length)).map((letter, i) => (
        <Place key={letter.id} letter={letter} x={SLOTS[i].x} y={SLOTS[i].y} />
      ))}
    </View>
  );
}

/** Nejstarší vzpomínka je v popředí, nové přibývají dál po cestě. */
function byTime(letters: LetterWithChild[]) {
  const time = (l: LetterWithChild) => Date.parse(l.finished_at ?? l.updated_at);
  return [...letters].sort((a, b) => time(a) - time(b));
}

function Place({ letter, x, y }: { letter: LetterWithChild; x: number; y: number }) {
  const kind = (letter.kind as MemoryKind) ?? 'dopis';
  const look = KIND_STYLE[kind];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/dopis/[id]', params: { id: letter.id } })}
      style={({ pressed }) => [styles.place, { left: `${x}%`, top: `${y}%` }, pressed && styles.pressed]}>
      <View style={styles.bubble}>
        <View style={[styles.icon, { backgroundColor: look.tint }]}>
          <Ionicons name={look.icon} size={18} color={look.color} />
        </View>
        <View style={styles.texts}>
          <Text numberOfLines={1} style={styles.title}>
            {letter.title.trim() || KIND_LABELS[kind]}
          </Text>
          {!!letter.child?.name && (
            <Text numberOfLines={1} style={styles.child}>
              {letter.child.name}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.stem} />
      <View style={styles.pin} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSoft,
  },
  // Na telefonu je mapa na výšku (krajina se ořízne po stranách), na větší obrazovce celá.
  mapTall: {
    aspectRatio: 4 / 5,
  },
  mapWide: {
    aspectRatio: 900 / 689,
  },
  landscape: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  landscapeImage: {
    width: '100%',
    height: '100%',
  },
  // Špendlík leží přesně na místě v krajině, bublina s názvem nad ním.
  place: {
    position: 'absolute',
    alignItems: 'center',
    maxWidth: '42%',
    transform: [{ translateX: '-50%' }, { translateY: '-100%' }],
  },
  pressed: {
    opacity: 0.8,
  },
  bubble: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 10,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    boxShadow: '0px 4px 12px rgba(122, 46, 46, 0.16)',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flexShrink: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    lineHeight: 17,
    color: Colors.heading,
  },
  child: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 15,
    color: Colors.textMuted,
  },
  stem: {
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.surface,
    backgroundColor: Colors.primary,
    marginTop: -1,
  },
});
