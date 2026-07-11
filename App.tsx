import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts as usePoppinsFonts,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  useFonts as useNunitoFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { RootNavigator } from '@/navigation/RootNavigator';
import { ensureNotificationPermissions } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Safety net: never let a slow/failed font fetch keep the app on the splash
// screen forever. If fonts haven't loaded within this window, render anyway
// with the system font fallback rather than blocking the whole app.
const MAX_FONT_WAIT_MS = 4000;

function AppShell() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  const [poppinsLoaded, poppinsError] = usePoppinsFonts({ Poppins_600SemiBold, Poppins_700Bold });
  const [nunitoLoaded, nunitoError] = useNunitoFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
  const [timedOut, setTimedOut] = useState(false);
  const hasHiddenSplash = useRef(false);

  const fontsSettled = (poppinsLoaded && nunitoLoaded) || !!poppinsError || !!nunitoError || timedOut;

  useEffect(() => {
    if (poppinsError) console.warn('Poppins font failed to load:', poppinsError);
    if (nunitoError) console.warn('Nunito font failed to load:', nunitoError);
  }, [poppinsError, nunitoError]);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), MAX_FONT_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Notification permissions are requested in the background — this must
    // NEVER gate the first render. Denying, ignoring, or a slow OS dialog
    // should never leave the user staring at a blank splash screen.
    ensureNotificationPermissions().catch((err) => {
      console.warn('Notification permission request failed:', err);
    });
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsSettled && !hasHiddenSplash.current) {
      hasHiddenSplash.current = true;
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsSettled]);

  if (!fontsSettled) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

