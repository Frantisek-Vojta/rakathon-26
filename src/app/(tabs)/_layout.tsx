import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, type ColorValue } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName, activeName: IconName) {
  return function TabBarIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activeName : name} size={24} color={color as string} />;
  };
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.heading,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarActiveBackgroundColor: Colors.surfaceSoft,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          // Na mobilu výšku počítá navigace sama (kvůli spodnímu okraji iPhonu).
          ...(Platform.OS === 'web' && { height: 64 }),
        },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 2, paddingVertical: 4 },
        tabBarLabelStyle: { fontFamily: Fonts.bodySemiBold, fontSize: 11, lineHeight: 14 },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Místo pro slova', tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="deti"
        options={{ title: 'Moje děti', tabBarIcon: tabIcon('people-outline', 'people') }}
      />
      <Tabs.Screen
        name="inspirace"
        options={{ title: 'Inspirace', tabBarIcon: tabIcon('bulb-outline', 'bulb') }}
      />
      <Tabs.Screen
        name="spravce"
        options={{ title: 'Správce', tabBarIcon: tabIcon('cube-outline', 'cube') }}
      />
    </Tabs>
  );
}
