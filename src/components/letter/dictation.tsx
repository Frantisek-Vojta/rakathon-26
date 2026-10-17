import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useDictation } from '@/hooks/use-dictation';

/** Tlačítko „Diktovat“: co řeknete, napíše se do dopisu. Jen tam, kde to prohlížeč umí. */
export function DictationButton({ onText }: { onText: (text: string) => void }) {
  const dictation = useDictation(onText);
  if (!dictation.supported) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        onPress={dictation.listening ? dictation.stop : dictation.start}
        style={({ pressed }) => [styles.button, dictation.listening && styles.buttonLive, pressed && styles.pressed]}>
        <Ionicons
          name={dictation.listening ? 'stop' : 'mic'}
          size={20}
          color={dictation.listening ? Colors.onPrimary : Colors.primaryText}
        />
        <Text style={[styles.label, dictation.listening && styles.labelLive]}>
          {dictation.listening ? 'Zastavit diktování' : 'Diktovat hlasem'}
        </Text>
      </Pressable>
      {dictation.listening ? (
        <Text style={styles.live} accessibilityLiveRegion="polite">
          {dictation.interim ? `„${dictation.interim}…“` : 'Poslouchám. Mluvte klidně, text se píše sám.'}
        </Text>
      ) : (
        !dictation.error && <Text style={styles.hint}>Řekněte to nahlas a text se do dopisu napíše sám.</Text>
      )}
      {dictation.error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {dictation.error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
    backgroundColor: Colors.surface,
  },
  buttonLive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.primaryText,
  },
  labelLive: {
    color: Colors.onPrimary,
  },
  hint: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  live: {
    flexShrink: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.primaryText,
  },
  error: {
    flexBasis: '100%',
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
  },
});
