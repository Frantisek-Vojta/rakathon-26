import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FONTS, PAPERS, STICKERS } from '@/constants/choices';
import { StickerIcon } from '@/components/sticker-icon';
import { Colors, Fonts, Radius, Shadows, Spacing } from '@/constants/theme';
import type { LetterFields } from '@/lib/drafts';

type Props = {
  fields: LetterFields;
  /** Bez onChange je papír jen ke čtení. */
  onChange?: (patch: Partial<LetterFields>) => void;
  footnote?: string;
  placeholder?: string;
  /** Výška pole pro text (dopis vyšší, popisek k fotce nižší). */
  minHeight?: number;
  /** Název pole pro čtečku obrazovky. */
  bodyLabel?: string;
};

/** Dopisní papír: v režimu čtení ukazuje hotový dopis, v režimu psaní je to editor. */
export function LetterPaper({
  fields,
  onChange,
  footnote,
  placeholder,
  minHeight = 320,
  bodyLabel = 'Text dopisu',
}: Props) {
  const paper = PAPERS[fields.paper] ?? PAPERS.bezova;
  const font = FONTS[fields.font] ?? FONTS.lora;
  const sticker = fields.sticker && STICKERS[fields.sticker] ? fields.sticker : null;
  const [height, setHeight] = useState(minHeight);
  const textStyle = { fontFamily: font.family, fontSize: font.size, lineHeight: font.lineHeight };

  return (
    <View style={[styles.paper, { backgroundColor: paper.color, borderColor: paper.edge }]}>
      <StickerIcon sticker={sticker} size={34} style={styles.sticker} />
      {!!fields.occasion && <Text style={styles.occasion}>{fields.occasion}</Text>}

      {onChange ? (
        <>
          <TextInput
            accessibilityLabel="Název vzkazu"
            value={fields.title}
            onChangeText={(title) => onChange({ title })}
            placeholder="Název (nepovinný)"
            placeholderTextColor={Colors.textFaint}
            maxLength={120}
            style={[styles.title, styles.titleInput, sticker && styles.titleWithSticker]}
          />
          <TextInput
            accessibilityLabel={bodyLabel}
            value={fields.body}
            onChangeText={(body) => onChange({ body })}
            placeholder={placeholder ?? 'Sem napište, co máte na srdci.\nStačí jedna věta…'}
            placeholderTextColor={Colors.textFaint}
            multiline
            maxLength={20000}
            textAlignVertical="top"
            scrollEnabled={false}
            onContentSizeChange={(e) => {
              // Pole roste s textem. Jen roste a jen o celé pixely, jinak by se
              // změna výšky a nové měření mohly točit dokola.
              const next = Math.ceil(e.nativeEvent.contentSize.height);
              setHeight((current) => (next > current + 1 ? next : current));
            }}
            style={[styles.body, textStyle, { height }]}
          />
        </>
      ) : (
        <>
          {!!fields.title.trim() && (
            <Text accessibilityRole="header" style={[styles.title, sticker && styles.titleWithSticker]}>
              {fields.title}
            </Text>
          )}
          <Text selectable style={[styles.body, styles.readBody, textStyle]}>
            {fields.body}
          </Text>
        </>
      )}

      {!!footnote && <Text style={styles.footnote}>{footnote}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
    gap: Spacing.sm,
    boxShadow: Shadows.paper,
  },
  sticker: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  occasion: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.primaryText,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 22,
    lineHeight: 30,
    color: Colors.heading,
  },
  titleInput: {
    outlineWidth: 0,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 46, 46, 0.15)',
  },
  titleWithSticker: {
    paddingRight: 44,
  },
  body: {
    color: Colors.text,
    paddingTop: Spacing.sm,
    // Na webu prohlížeč kreslí kolem pole modrý rámeček, papír má vlastní vzhled.
    outlineWidth: 0,
  },
  readBody: {
    minHeight: 120,
  },
  footnote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
});
