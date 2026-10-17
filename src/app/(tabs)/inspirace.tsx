import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Illustration } from '@/components/illustration';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import { LIFE_STORIES, OFFLINE_GIFTS, PROMPT_GROUPS } from '@/constants/inspiration';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { usePreferences } from '@/lib/preferences';

function startLetter(question: string) {
  router.push({ pathname: '/dopis/[id]', params: { id: 'novy', otazka: question } });
}

/** Zápis dárku mimo aplikaci (podklady: „evidence fyzických darů“): rodina pak ví, že dar existuje a kde je. */
function recordGift(title: string) {
  router.push({
    pathname: '/dopis/[id]',
    params: {
      id: 'novy',
      nazev: title,
      prilezitost: 'Dar mimo aplikaci',
      otazka: 'Co v daru je, proč vznikl a kde ho dítě jednou najde?',
    },
  });
}

/** Otázka z inspirace: klepnutím začne nový vzkaz, srdíčkem se uloží mezi oblíbené. */
function PromptRow({ prompt, saved, onToggle }: { prompt: string; saved: boolean; onToggle: () => void }) {
  return (
    <View style={styles.prompt}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Otevře nový vzkaz s touto otázkou"
        onPress={() => startLetter(prompt)}
        style={({ pressed }) => [styles.promptMain, pressed && styles.pressed]}>
        <Text style={styles.promptText}>{prompt}</Text>
        <Ionicons name="create-outline" size={20} color={Colors.primaryText} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Odebrat z oblíbených' : 'Uložit do oblíbených'}
        aria-pressed={saved}
        onPress={onToggle}
        style={({ pressed }) => [styles.heart, pressed && styles.pressed]}>
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={22} color={Colors.primaryText} />
      </Pressable>
    </View>
  );
}

export default function InspirationScreen() {
  const { isTablet } = useLayout();
  const { stories, prefs, update } = usePreferences();
  const saved = prefs.saved;
  const toggle = (prompt: string) =>
    update({ saved: saved.includes(prompt) ? saved.filter((p) => p !== prompt) : [...saved, prompt] });

  const lifeStories = (
    <View style={[styles.block, styles.stories]}>
      <View style={[styles.blockHead, isTablet && styles.blockHeadWide]}>
        <View style={styles.blockHeadText}>
          <Heading style={styles.blockTitle}>Moje životní příběhy</Heading>
          <Muted>Zachyťte části svého života, které mohou jednou dítěti pomoci porozumět vám i sobě.</Muted>
        </View>
        <Illustration name="kniha" maxWidth={isTablet ? 240 : 300} />
      </View>
      <View style={[styles.grid, isTablet && styles.gridWide]}>
        {LIFE_STORIES.map((story) => (
          <Pressable
            key={story.title}
            accessibilityRole="button"
            accessibilityHint="Otevře nový vzkaz s touto otázkou"
            onPress={() => startLetter(story.question)}
            style={({ pressed }) => [styles.story, isTablet && styles.cell, pressed && styles.pressed]}>
            <View style={[styles.storyIcon, { backgroundColor: Colors.lavender }]}>
              <Ionicons name={story.icon} size={22} color={Colors.lavenderDark} />
            </View>
            <View style={styles.storyTexts}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyText}>{story.question}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <Screen inTabs width="wide">
      <View style={styles.intro}>
        <Title>Inspirace a tipy</Title>
        <Muted style={styles.lead}>
          Otázky, které pomohou začít. Nemusíte odpovídat na všechny, nemusíte nic. Klepněte na tu, která vás osloví.
        </Muted>
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/smysl')}
        style={({ pressed }) => [styles.meaning, pressed && styles.pressed]}>
        <Illustration name="objeti" maxWidth={120} style={styles.meaningImage} />
        <View style={styles.meaningTexts}>
          <Text style={styles.meaningTitle}>Proč to má smysl?</Text>
          <Muted>Jak vzpomínkové dary pomáhají dětem i rodičům.</Muted>
        </View>
        <Ionicons name="chevron-forward" size={22} color={Colors.primaryText} />
      </Pressable>

      <View style={styles.note}>
        <Ionicons name="heart-outline" size={22} color={Colors.primaryText} />
        <Body style={styles.noteText}>Stačí jedna věta. Nemusí být dokonalá, hlavně ať je vaše.</Body>
      </View>

      {saved.length > 0 && (
        <View style={[styles.block, styles.favorites]}>
          <View style={styles.groupHead}>
            <Ionicons name="heart" size={22} color={Colors.primaryText} />
            <Heading>Moje oblíbené</Heading>
          </View>
          {saved.map((prompt) => (
            <PromptRow key={prompt} prompt={prompt} saved onToggle={() => toggle(prompt)} />
          ))}
        </View>
      )}

      {stories && lifeStories}

      <View style={[styles.grid, isTablet && styles.gridWide]}>
        {PROMPT_GROUPS.map((group) => (
          <View key={group.title} style={[styles.group, isTablet && styles.cell]}>
            <View style={styles.groupHead}>
              <Ionicons name={group.icon} size={22} color={Colors.peachDark} />
              <Heading>{group.title}</Heading>
            </View>
            {group.prompts.map((prompt) => (
              <PromptRow key={prompt} prompt={prompt} saved={saved.includes(prompt)} onToggle={() => toggle(prompt)} />
            ))}
          </View>
        ))}
      </View>

      {!stories && lifeStories}

      <View style={[styles.block, styles.gifts]}>
        <View style={[styles.blockHead, isTablet && styles.blockHeadWide]}>
          <View style={styles.blockHeadText}>
            <Heading style={styles.blockTitle}>Nemusí to být jen v aplikaci</Heading>
            <Muted>
              Vzpomínkové dary mohou vznikat i mimo digitální svět. Důležitý je záměr, společný čas a to, co chcete
              svému dítěti předat. Když dar vytvoříte, zapište si ho: rodina bude vědět, že existuje a kde ho najde.
            </Muted>
          </View>
          <Illustration name="krabice" maxWidth={isTablet ? 220 : 260} />
        </View>
        <View style={[styles.grid, isTablet && styles.gridWide]}>
          {OFFLINE_GIFTS.map((gift) => (
            <View key={gift.title} style={[styles.gift, isTablet && styles.cell]}>
              <View style={[styles.storyIcon, { backgroundColor: Colors.surface }]}>
                <Ionicons name={gift.icon} size={22} color={Colors.sageDark} />
              </View>
              <View style={styles.storyTexts}>
                <Text style={styles.storyTitle}>{gift.title}</Text>
                <Text style={styles.storyText}>{gift.text}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Zapsat dar: ${gift.title}`}
                  onPress={() => recordGift(gift.title)}
                  style={({ pressed }) => [styles.giftLink, pressed && styles.pressed]}>
                  <Ionicons name="add-circle-outline" size={18} color={Colors.sageDark} />
                  <Text style={styles.giftLinkText}>Zapsat dar</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  lead: {
    maxWidth: 640,
  },
  meaning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  meaningImage: {
    width: 96,
  },
  meaningTexts: {
    flex: 1,
    gap: 2,
  },
  meaningTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    lineHeight: 25,
    color: Colors.heading,
  },
  pressed: {
    opacity: 0.75,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
  },
  block: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  stories: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gifts: {
    backgroundColor: Colors.sage,
  },
  blockHead: {
    gap: Spacing.md,
  },
  blockHeadWide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockHeadText: {
    flex: 1,
    gap: Spacing.xs,
  },
  blockTitle: {
    fontSize: 24,
    lineHeight: 31,
  },
  grid: {
    gap: Spacing.md,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    flexBasis: '45%',
    flexGrow: 1,
    // Lichá poslední karta zůstane poloviční, neroztáhne se přes celou šířku.
    maxWidth: '49%',
  },
  story: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    minHeight: 56,
  },
  storyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTexts: {
    flex: 1,
    gap: 2,
  },
  storyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    lineHeight: 23,
    color: Colors.heading,
  },
  storyText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text,
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
    alignItems: 'stretch',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 56,
  },
  promptMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: 14,
  },
  heart: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  favorites: {
    backgroundColor: Colors.surfaceSoft,
    gap: Spacing.sm,
  },
  giftLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 44,
  },
  giftLinkText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.sageDark,
  },
  promptText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 16,
    lineHeight: 23,
    color: Colors.text,
  },
  gift: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
});
