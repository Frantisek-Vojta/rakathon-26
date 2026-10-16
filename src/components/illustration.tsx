import { Image } from 'expo-image';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { ILLUSTRATIONS, type IllustrationName } from '@/constants/illustrations';

/** Dekorativní ilustrace: čtečka obrazovky ji přeskočí, místo pro ni je rezervované (žádné poskakování). */
export function Illustration({
  name,
  style,
  maxWidth,
}: {
  name: IllustrationName;
  style?: StyleProp<ViewStyle>;
  maxWidth?: number;
}) {
  const { source, ratio } = ILLUSTRATIONS[name];
  return (
    <View aria-hidden style={[{ width: '100%', maxWidth, alignSelf: 'center' }, style]}>
      <Image
        source={source}
        alt=""
        contentFit="contain"
        transition={250}
        style={{ width: '100%', aspectRatio: ratio }}
      />
    </View>
  );
}
