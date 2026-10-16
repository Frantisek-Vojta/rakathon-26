import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
  /** Heslo: skryje text a přidá tlačítko „ukázat“. */
  secret?: boolean;
};

export const TextField = forwardRef<TextInputInstance, Props>(function TextField(
  { label, hint, error, secret, style, multiline, ...props },
  ref,
) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          secret && styles.boxSecret,
          multiline && styles.boxMultiline,
          focused && styles.boxFocused,
          !!error && styles.boxError,
        ]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={Colors.textFaint}
          selectionColor={Colors.primary}
          secureTextEntry={secret && hidden}
          multiline={multiline}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {secret && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Ukázat heslo' : 'Skrýt heslo'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            style={styles.eye}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  boxSecret: {
    paddingRight: Spacing.xs,
  },
  boxMultiline: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  boxFocused: {
    borderColor: Colors.primary,
  },
  boxError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    minWidth: 0,
    // Zvýraznění při psaní řeší rámeček pole (boxFocused), ne prohlížeč.
    outlineWidth: 0,
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.text,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  eye: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  error: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.danger,
  },
});
