import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { OFFLINE_GIFTS, PROMPT_GROUPS } from '@/constants/inspiration';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export default function InspirationScreen() {
  return (
    <Screen>
      <View style={styles.intro}>
        <Title>Inspirace a tipy</Title>
        <Muted>
          Otázky, které pomohou začít. Nemusíte odpovídat na všechny, nemusíte nic. Klepněte na tu, která
          vás osloví.
        </Muted>
      </View>

      <View style={styles.note}>
        <Ionicons name="heart-outline" size={22} color={Colors.primary} />
        <Body style={styles.noteText}>Stačí jedna věta. Nemusí být dokonalá, hlavně ať je vaše.</Body>
      </View>

      {PROMPT_GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <View style={styles.groupHead}>
            <Ionicons name={group.icon} size={22} color={Colors.peachDark} />
            <Heading>{group.title}</Heading>
          </View>
          {group.prompts.map((prompt) => (
            <Pressable
              key={prompt}
              accessibilityRole="button"
              accessibilityHint="Otevře nový vzkaz s touto otázkou"
              onPress={() => router.push({ pathname: '/dopis/[id]', params: { id: 'novy', otazka: prompt } })}
              style={({ pressed }) => [styles.prompt, pressed && styles.pressed]}>
              <Text style={styles.promptText}>{prompt}</Text>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </Pressable>
          ))}
        </View>
      ))}

      <View style={styles.gifts}>
        <Heading>Dary mimo telefon</Heading>
        <Muted>Vzpomínky nemusí být jen v appce. Pár nápadů na věci, které se dají schovat a předat.</Muted>
        {OFFLINE_GIFTS.map((gift) => (
          <View key={gift.text} style={styles.gift}>
            <Text style={styles.giftEmoji}>{gift.emoji}</Text>
            <Body style={styles.giftText}>{gift.text}</Body>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  noteText: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
  },
  group: {
    gap: Spacing.sm,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    minHeight: 56,
  },
  pressed: {
    opacity: 0.7,
  },
  promptText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.text,
  },
  gifts: {
    backgroundColor: Colors.sage,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  gift: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  giftEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: 'center',
  },
  giftText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
