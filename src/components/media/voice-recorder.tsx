import Ionicons from '@expo/vector-icons/Ionicons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDuration } from '@/lib/media';

/** Nejdelší nahrávka. Delší vyprávění jde rozdělit do více vzkazů. */
const MAX_RECORDING_MS = 10 * 60 * 1000;

type Props = {
  /** Hotová nahrávka: adresa souboru v zařízení a délka. */
  onRecorded: (uri: string, durationMs: number) => void;
  disabled?: boolean;
};

/** Nahrávání hlasu jedním velkým tlačítkem: začít, zastavit, hotovo. */
export function VoiceRecorder({ onRecorded, disabled }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 250);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [pulse] = useState(() => new Animated.Value(1));
  const stopping = useRef(false);

  useEffect(() => {
    if (!state.isRecording) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state.isRecording, pulse]);

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError(
          'Bez přístupu k mikrofonu nahrávat nejde. Povolení můžete zapnout v nastavení telefonu nebo prohlížeče.',
        );
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setError('Nahrávání se nepodařilo spustit. Zkuste to prosím znovu.');
    } finally {
      setStarting(false);
    }
  }

  async function stop() {
    if (stopping.current) return;
    stopping.current = true;
    const duration = state.durationMillis;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
      if (recorder.uri) onRecorded(recorder.uri, duration);
      else setError('Nahrávka se nepodařila. Zkuste to prosím znovu.');
    } finally {
      stopping.current = false;
    }
  }

  // Pojistka: po deseti minutách se nahrávání samo zastaví a uloží.
  useEffect(() => {
    if (state.isRecording && state.durationMillis >= MAX_RECORDING_MS) stop();
  });

  return (
    <View style={styles.box}>
      {state.isRecording ? (
        <>
          <View style={styles.liveRow} accessibilityLiveRegion="polite">
            <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
            <Text style={styles.liveText}>Nahrávám {formatDuration(state.durationMillis)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zastavit nahrávání"
            onPress={stop}
            style={({ pressed }) => [styles.round, styles.stop, pressed && styles.pressed]}>
            <Ionicons name="stop" size={36} color={Colors.onPrimary} />
          </Pressable>
          <Text style={styles.hint}>Až budete hotovi, klepněte na tlačítko. Nahrávka se uloží sama.</Text>
        </>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Začít nahrávat hlas"
            onPress={start}
            disabled={disabled || starting}
            style={({ pressed }) => [
              styles.round,
              pressed && styles.pressed,
              (disabled || starting) && styles.disabled,
            ]}>
            <Ionicons name="mic" size={40} color={Colors.onPrimary} />
          </Pressable>
          <Text style={styles.title}>Klepněte a mluvte</Text>
          <Text style={styles.hint}>
            Nemusíte psát. Řekněte to, co máte na srdci, vlastními slovy. Nahrávku si pak můžete pustit a případně
            nahrát znovu.
          </Text>
        </>
      )}
      {error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  round: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 8px 20px rgba(163, 85, 75, 0.35)',
  },
  stop: {
    backgroundColor: Colors.danger,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.55,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.heading,
    marginTop: Spacing.xs,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 420,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  liveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.danger,
  },
  liveText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.danger,
    fontVariant: ['tabular-nums'],
  },
  error: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
    textAlign: 'center',
  },
});
