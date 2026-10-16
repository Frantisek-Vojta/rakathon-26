import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

/** Přehrávač video vzkazu se standardními ovládacími prvky systému. */
export function VideoPlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      nativeControls
      contentFit="contain"
      fullscreenOptions={{ enable: true }}
      accessibilityLabel="Video vzkaz"
      style={styles.video}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.heading,
  },
});
