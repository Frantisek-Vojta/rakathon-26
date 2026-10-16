import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDuration } from '@/lib/media';

/** Přehrávač hlasového vzkazu: jedno velké tlačítko, průběh a čas. */
export function AudioPlayer({ url, durationMs }: { url: string; durationMs?: number | null }) {
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);
  const duration = status.duration > 0 ? status.duration * 1000 : (durationMs ?? 0);
  const position = Math.min(status.currentTime * 1000, duration || Infinity);
  const progress = duration ? Math.min(1, position / duration) : 0;

  function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    // Po dohrání začne znovu od začátku.
    if (status.didJustFinish || (duration && position >= duration - 250)) player.seekTo(0);
    player.play();
  }

  return (
    <View style={styles.box}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pozastavit nahrávku' : 'Přehrát nahrávku'}
        onPress={toggle}
        style={({ pressed }) => [styles.play, pressed && styles.pressed]}>
        <Ionicons name={status.playing ? 'pause' : 'play'} size={30} color={Colors.onPrimary} />
      </Pressable>
      <View style={styles.track}>
        <View
          style={styles.bar}
          accessibilityRole="progressbar"
          accessibilityLabel="Průběh přehrávání"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.time}>
          {formatDuration(position)} / {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  play: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: Colors.primaryPressed,
  },
  track: {
    flex: 1,
    gap: 6,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primarySoft,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  time: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textMuted,
  },
});
