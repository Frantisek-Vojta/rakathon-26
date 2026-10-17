import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { STICKERS } from '@/constants/choices';
import type { Sticker } from '@/lib/data';

/** Nálepka na dopisu: barevná ikona. Je jen ozdoba, čtečka obrazovky ji přeskočí. */
export function StickerIcon({
  sticker,
  size = 28,
  style,
}: {
  sticker: Sticker | string | null | undefined;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const item = sticker ? STICKERS[sticker as Sticker] : null;
  if (!item) return null;
  return (
    <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={style}>
      <MaterialCommunityIcons name={item.icon} size={size} color={item.color} />
    </View>
  );
}
