import { Caveat_500Medium } from '@expo-google-fonts/caveat';
import { Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.surface,
    primary: Colors.primary,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lora_600SemiBold,
    Lora_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Caveat_500Medium,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="dark" />
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) return null;

  const signedIn = !!session;

  // Chráněné obrazovky: bez přihlášení se na ně nedá dostat ani přímým odkazem.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dite/novy" />
        <Stack.Screen name="dite/[id]/index" />
        <Stack.Screen name="dite/[id]/upravit" />
        <Stack.Screen name="dopis/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="prihlaseni" />
      </Stack.Protected>
    </Stack>
  );
}
