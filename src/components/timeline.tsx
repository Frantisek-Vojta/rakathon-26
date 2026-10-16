import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { Child, Letter } from '@/lib/data';
import { formatDate } from '@/lib/format';

type Milestone = {
  occasion: string;
  title: string;
  text: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  color: string;
  /** Věk, kdy milník obvykle nastane (podle něj ukážeme datum). */
  age?: number;
};

// Milníky odpovídají příležitostem v editoru dopisu (constants/choices.ts).
const MILESTONES: Milestone[] = [
  {
    occasion: 'K narozeninám',
    title: 'Narozeniny',
    text: 'Velký den plný radosti a přání.',
    icon: 'gift-outline',
    tint: Colors.primarySoft,
    color: Colors.primaryText,
  },
  {
    occasion: 'První den ve škole',
    title: 'První den ve škole',
    text: 'Nový začátek, nová dobrodružství.',
    icon: 'school-outline',
    tint: Colors.sage,
    color: Colors.sageDark,
    age: 6,
  },
  {
    occasion: 'K 18. narozeninám',
    title: '18. narozeniny',
    text: 'Důležitý krok na cestě k dospělosti.',
    icon: 'sparkles-outline',
    tint: Colors.peach,
    color: Colors.peachDark,
    age: 18,
  },
  {
    occasion: 'K maturitě',
    title: 'Maturita',
    text: 'Konec jedné kapitoly, začátek mnoha dalších.',
    icon: 'ribbon-outline',
    tint: Colors.lavender,
    color: Colors.lavenderDark,
    age: 19,
  },
  {
    occasion: 'Na svatbu',
    title: 'Svatba',
    text: 'Nová životní cesta začíná.',
    icon: 'heart-circle-outline',
    tint: Colors.primarySoft,
    color: Colors.primaryText,
  },
  {
    occasion: 'Až budeš mít vlastní dítě',
    title: 'Až bude mít vlastní dítě',
    text: 'Slova, která se předávají dál.',
    icon: 'people-outline',
    tint: Colors.sky,
    color: Colors.skyDark,
  },
  {
    occasion: 'Až bude těžko',
    title: 'Až bude těžko',
    text: 'Pro chvíle, kdy bude potřebovat sílu.',
    icon: 'umbrella-outline',
    tint: Colors.sage,
    color: Colors.sageDark,
  },
  {
    occasion: 'Na dobrou noc',
    title: 'Na dobrou noc',
    text: 'Pohádka nebo pár slov před spaním.',
    icon: 'moon-outline',
    tint: Colors.lavender,
    color: Colors.lavenderDark,
  },
];

/** Datum milníku z data narození. Jen klidné datum, žádné odpočítávání (podle zadání). */
function milestoneDate(child: Child, m: Milestone) {
  if (!m.age || !child.birth_date) return null;
  const [y, mo, d] = child.birth_date.split('-').map(Number);
  const date = m.occasion === 'První den ve škole' ? new Date(y + m.age, 8, 1) : new Date(y + m.age, mo - 1, d);
  if (date < new Date()) return null;
  return m.occasion === 'K maturitě' ? `kolem roku ${date.getFullYear()}` : formatDate(date);
}

export function ChildTimeline({ child, letters }: { child: Child; letters: Letter[] }) {
  return (
    <View style={styles.list} accessibilityRole="list">
      {MILESTONES.map((m, i) => {
        const own = letters.filter((l) => l.occasion === m.occasion);
        const done = own.filter((l) => l.status === 'hotovo');
        const draft = own.find((l) => l.status === 'koncept');
        const open = () => {
          const existing = done[0] ?? draft;
          if (existing) router.push({ pathname: '/dopis/[id]', params: { id: existing.id } });
          else
            router.push({ pathname: '/dopis/[id]', params: { id: 'novy', dite: child.id, prilezitost: m.occasion } });
        };
        const date = milestoneDate(child, m);

        return (
          <View key={m.occasion} style={styles.item}>
            <View style={styles.rail} accessibilityElementsHidden importantForAccessibility="no">
              <View
                style={[styles.line, i === 0 && styles.lineFirst, i === MILESTONES.length - 1 && styles.lineLast]}
              />
              <View
                style={[
                  styles.dot,
                  { backgroundColor: done.length ? Colors.success : draft ? Colors.draft : Colors.borderStrong },
                ]}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={open}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={[styles.icon, { backgroundColor: m.tint }]}>
                <Ionicons name={m.icon} size={24} color={m.color} />
              </View>
              <View style={styles.texts}>
                <Text style={styles.title}>{m.title}</Text>
                <Text style={styles.text}>{date ? `${date} · ${m.text}` : m.text}</Text>
                {done.length > 0 ? (
                  <Badge
                    icon="checkmark-circle"
                    color={Colors.success}
                    bg={Colors.successSoft}
                    label={done.length > 1 ? `Vytvořeno (${done.length})` : 'Vytvořeno'}
                  />
                ) : draft ? (
                  <Badge icon="create-outline" color={Colors.draft} bg={Colors.draftSoft} label="Rozepsáno" />
                ) : (
                  <Badge icon="add" color={Colors.primaryText} bg={Colors.surfaceSoft} label="Napsat vzkaz" />
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textFaint} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function Badge({
  icon,
  color,
  bg,
  label,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
  label: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rail: {
    width: 28,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.border,
  },
  lineFirst: {
    top: '50%',
  },
  lineLast: {
    bottom: '50%',
  },
  dot: {
    position: 'absolute',
    top: '50%',
    marginTop: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginVertical: 5,
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 3,
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.heading,
  },
  text: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    marginTop: 2,
  },
  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
  },
});
