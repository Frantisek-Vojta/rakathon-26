import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '@/components/back-header';
import { Screen } from '@/components/screen';
import { Body, Heading, Muted, Title } from '@/components/typography';
import {
  PRIVACY,
  PRIVACY_LEAD,
  PROJECT_URL,
  TERMS,
  TERMS_DATE,
  TERMS_LEAD,
  type LegalSection,
} from '@/constants/legal';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Tab = 'gdpr' | 'podminky';

/** Ochrana osobních údajů a podmínky používání. Otevře se i bez přihlášení (z registrace). */
export default function LegalScreen() {
  const params = useLocalSearchParams<{ zalozka?: string }>();
  const [tab, setTab] = useState<Tab>(params.zalozka === 'podminky' ? 'podminky' : 'gdpr');
  const sections = tab === 'gdpr' ? PRIVACY : TERMS;

  return (
    <Screen showLogo={false} header={<BackHeader label="Zpět" fallback="/" />}>
      <View style={styles.intro}>
        <Title>{tab === 'gdpr' ? 'Ochrana osobních údajů' : 'Podmínky používání'}</Title>
        <Muted>Platí od {TERMS_DATE}</Muted>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(
          [
            ['gdpr', 'Osobní údaje (GDPR)'],
            ['podminky', 'Podmínky používání'],
          ] as const
        ).map(([key, label]) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}>
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.lead}>
        <Ionicons name={tab === 'gdpr' ? 'lock-closed-outline' : 'heart-outline'} size={22} color={Colors.sageDark} />
        <Body style={styles.leadText}>{tab === 'gdpr' ? PRIVACY_LEAD : TERMS_LEAD}</Body>
      </View>

      {sections.map((section) => (
        <Section key={section.title} section={section} />
      ))}

      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(PROJECT_URL)}
        style={({ pressed }) => [styles.project, pressed && styles.pressed]}>
        <Ionicons name="open-outline" size={20} color={Colors.primaryText} />
        <Text style={styles.projectText}>Stránka projektu a kontakt</Text>
      </Pressable>
    </Screen>
  );
}

function Section({ section }: { section: LegalSection }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={styles.icon}>
          <Ionicons name={section.icon} size={20} color={Colors.primaryText} />
        </View>
        <Heading style={styles.sectionTitle}>{section.title}</Heading>
      </View>
      {section.points?.map((point) => (
        <View key={point} style={styles.point}>
          <View style={styles.dot} />
          <Body style={styles.pointText}>{point}</Body>
        </View>
      ))}
      {section.text?.map((paragraph) => (
        <Body key={paragraph} style={styles.paragraph}>
          {paragraph}
        </Body>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Colors.surface,
  },
  tabLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: Colors.heading,
  },
  lead: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.sage,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  leadText: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
  },
  section: {
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 19,
    lineHeight: 25,
  },
  point: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 10,
  },
  pointText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  project: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  projectText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryText,
  },
  pressed: {
    opacity: 0.75,
  },
});
