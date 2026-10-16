import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';

import { Logo } from '@/components/screen';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName, activeName: IconName) {
  return function TabBarIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activeName : name} size={24} color={color as string} />;
  };
}

const SIDEBAR_WIDTH = 248;
const SIDEBAR_TOP = 104;

/** Na počítači je menu vlevo i s logem, na telefonu a tabletu dole. */
function SidebarBackground() {
  return (
    <View style={styles.sidebarBg}>
      <View style={styles.sidebarLogo}>
        <Logo large />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isDesktop } = useLayout();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? 'left' : 'bottom',
        tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: Colors.heading,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarActiveBackgroundColor: Colors.surfaceSoft,
        tabBarBackground: isDesktop ? SidebarBackground : undefined,
        tabBarStyle: isDesktop
          ? {
              width: SIDEBAR_WIDTH,
              paddingTop: SIDEBAR_TOP,
              paddingHorizontal: Spacing.sm,
              backgroundColor: Colors.surface,
              borderRightColor: Colors.border,
            }
          : {
              backgroundColor: Colors.surface,
              borderTopColor: Colors.border,
              // Na mobilu výšku počítá navigace sama (kvůli spodnímu okraji iPhonu).
              ...(Platform.OS === 'web' && { height: 66 }),
            },
        tabBarItemStyle: isDesktop
          ? {
              borderRadius: 14,
              marginVertical: 3,
              minHeight: 52,
              paddingVertical: Spacing.sm,
              justifyContent: 'flex-start',
              paddingHorizontal: Spacing.md,
            }
          : { borderRadius: 16, marginHorizontal: 2, paddingVertical: 4 },
        tabBarLabelStyle: isDesktop
          ? { fontFamily: Fonts.bodySemiBold, fontSize: 16, lineHeight: 32, marginLeft: Spacing.md }
          : { fontFamily: Fonts.bodySemiBold, fontSize: 12, lineHeight: 15 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Místo pro slova', tabBarIcon: tabIcon('home-outline', 'home') }} />
      <Tabs.Screen name="deti" options={{ title: 'Moje děti', tabBarIcon: tabIcon('people-outline', 'people') }} />
      <Tabs.Screen name="inspirace" options={{ title: 'Inspirace', tabBarIcon: tabIcon('bulb-outline', 'bulb') }} />
      <Tabs.Screen name="spravce" options={{ title: 'Správce', tabBarIcon: tabIcon('cube-outline', 'cube') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sidebarBg: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  sidebarLogo: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
});
