import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/chip';
import { FONTS, OCCASIONS, PAPERS, STICKERS } from '@/constants/choices';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import type { LetterFont, Paper, Sticker } from '@/lib/data';
import type { LetterFields } from '@/lib/drafts';

type Props = {
  fields: LetterFields;
  onChange: (patch: Partial<LetterFields>) => void;
};

/** Volby vzhledu: schované pod jedním tlačítkem, aby psaní zůstalo jednoduché. */
export function LetterAppearance({ fields, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.box}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={styles.toggle}>
        <Ionicons name="color-palette-outline" size={22} color={Colors.primary} />
        <View style={styles.toggleTexts}>
          <Text style={styles.toggleTitle}>Vzhled a příležitost</Text>
          <Text style={styles.toggleSummary} numberOfLines={1}>
            {PAPERS[fields.paper].label} papír · {FONTS[fields.font].label} písmo
            {fields.occasion ? ` · ${fields.occasion}` : ''}
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
      </Pressable>

      {open && (
        <View style={styles.options}>
          <Group label="Papír">
            {(Object.keys(PAPERS) as Paper[]).map((key) => {
              const selected = fields.paper === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="radio"
                  accessibilityLabel={`${PAPERS[key].label} papír`}
                  accessibilityState={{ selected }}
                  onPress={() => onChange({ paper: key })}
                  style={[
                    styles.swatch,
                    { backgroundColor: PAPERS[key].color, borderColor: selected ? Colors.primary : PAPERS[key].edge },
                  ]}>
                  {selected && <Ionicons name="checkmark" size={20} color={Colors.primary} />}
                </Pressable>
              );
            })}
          </Group>

          <Group label="Písmo">
            {(Object.keys(FONTS) as LetterFont[]).map((key) => (
              <Chip key={key} label={FONTS[key].label} selected={fields.font === key} onPress={() => onChange({ font: key })} />
            ))}
          </Group>

          <Group label="Nálepka">
            <Chip label="Žádná" selected={!fields.sticker} onPress={() => onChange({ sticker: null })} />
            {(Object.keys(STICKERS) as Sticker[]).map((key) => {
              const selected = fields.sticker === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="radio"
                  accessibilityLabel={STICKERS[key].label}
                  accessibilityState={{ selected }}
                  onPress={() => onChange({ sticker: key })}
                  style={[styles.sticker, selected && styles.stickerSelected]}>
                  <Text style={styles.stickerEmoji}>{STICKERS[key].emoji}</Text>
                </Pressable>
              );
            })}
          </Group>

          <Group label="K jaké příležitosti">
            {OCCASIONS.map((occasion) => {
              const value = occasion === 'Kdykoli' ? null : occasion;
              return (
                <Chip
                  key={occasion}
                  label={occasion}
                  selected={fields.occasion === value}
                  onPress={() => onChange({ occasion: value })}
                />
              );
            })}
          </Group>
        </View>
      )}
    </View>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.groupRow} accessibilityRole="radiogroup">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    minHeight: 56,
  },
  toggleTexts: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.text,
  },
  toggleSummary: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  options: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  group: {
    gap: Spacing.sm,
  },
  groupLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textMuted,
  },
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sticker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  stickerSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  stickerEmoji: {
    fontSize: 22,
  },
});
