import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PAPERS, STICKERS } from '@/constants/choices';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Letter, Paper, Sticker } from '@/lib/data';
import { excerpt, formatDate } from '@/lib/format';

export function StatusBadge({ status }: { status: string }) {
  const done = status === 'hotovo';
  return (
    <View style={[styles.badge, { backgroundColor: done ? Colors.successSoft : Colors.draftSoft }]}>
      <Ionicons
        name={done ? 'checkmark' : 'create-outline'}
        size={14}
        color={done ? Colors.success : Colors.draft}
      />
      <Text style={[styles.badgeText, { color: done ? Colors.success : Colors.draft }]}>
        {done ? 'Hotové' : 'Koncept'}
      </Text>
    </View>
  );
}

/** Jeden vzkaz v přehledu: obálka v barvě papíru, název, začátek textu, datum a stav. */
export function LetterRow({ letter, childName }: { letter: Letter; childName?: string }) {
  const paper = PAPERS[letter.paper as Paper] ?? PAPERS.bezova;
  const sticker = letter.sticker ? STICKERS[letter.sticker as Sticker]?.emoji : null;
  const title = letter.title.trim() || excerpt(letter.body, 40) || 'Vzkaz bez názvu';
  const preview = letter.title.trim() ? excerpt(letter.body) : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${letter.status === 'hotovo' ? 'hotové' : 'koncept'}${childName ? `, pro ${childName}` : ''}`}
      onPress={() => router.push({ pathname: '/dopis/[id]', params: { id: letter.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.envelope, { backgroundColor: paper.color, borderColor: paper.edge }]}>
        {sticker ? <Text style={styles.sticker}>{sticker}</Text> : <Ionicons name="mail-outline" size={22} color={Colors.primary} />}
      </View>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!preview && (
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        )}
        <View style={styles.meta}>
          <StatusBadge status={letter.status} />
          <Text style={styles.date}>
            {childName ? `${childName} · ` : ''}
            {formatDate(letter.updated_at)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  envelope: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sticker: {
    fontSize: 24,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.heading,
  },
  preview: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  date: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
  },
});
