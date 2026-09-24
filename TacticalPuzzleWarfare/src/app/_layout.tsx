import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { appFonts, colors } from '../theme';
import { useGameStore } from '../store/useGameStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const ensureInitialized = useGameStore((s) => s.ensureInitialized);
  const tickEnergy = useGameStore((s) => s.tickEnergy);
  const hasHydrated = useGameStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      ensureInitialized();
    }
  }, [hasHydrated, ensureInitialized]);

  useEffect(() => {
    const id = setInterval(() => tickEnergy(), 15000);
    return () => clearInterval(id);
  }, [tickEnergy]);

  const ready = (fontsLoaded || !!fontError) && hasHydrated;

  const onLayoutRootView = useCallback(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <View style={styles.flex} onLayout={onLayoutRootView}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.surface } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="battle/[stageId]" options={{ animation: 'fade' }} />
            <Stack.Screen name="victory/[stageId]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
            <Stack.Screen name="hero/[heroId]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="chest/[chestId]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
});
