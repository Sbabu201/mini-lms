// @ts-ignore - NativeWind CSS import
import '../global.css';
import React, { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthProvider } from '../src/stores/auth.store';
import { CourseProvider } from '../src/stores/course.store';
import { AppProvider } from '../src/stores/app.store';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { notificationService } from '../src/services/notification.service';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Record app open for inactivity notifications
  useEffect(() => {
    notificationService.recordAppOpen();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <CourseProvider>
            <View className="flex-1 bg-dark-950" onLayout={onLayoutRootView}>
              <StatusBar style="light" />
              <OfflineBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0F0D23' },
                  animation: 'slide_from_right',
                }}
              />
            </View>
          </CourseProvider>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
