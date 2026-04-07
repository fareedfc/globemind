import '../lib/i18n'; // initialise i18n before anything else
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

// Replace with your real RevenueCat API key from the RevenueCat dashboard
const RC_API_KEY_IOS = 'REVENUECAT_IOS_API_KEY_PLACEHOLDER';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initSession = useAuthStore((s) => s.initSession);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    // Initialise RevenueCat (no-op in Expo Go — requires a dev/production build)
    try {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);
      Purchases.configure({ apiKey: RC_API_KEY_IOS });
    } catch (_) {}

    // Restore Supabase session and pull cloud data if user was previously logged in
    initSession();
  }, []);

  useEffect(() => {
    // Handle email confirmation deep link (thinkpop://confirm#access_token=...&refresh_token=...)
    const handleUrl = async (url: string) => {
      if (!url.includes('access_token')) return;
      const fragment = url.split('#')[1] ?? '';
      const params = Object.fromEntries(new URLSearchParams(fragment));
      if (params.access_token && params.refresh_token) {
        const { data } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (data.session) {
          if (params.type === 'recovery') {
            router.replace('/reset-password');
          } else {
            await initSession();
            router.replace('/(tabs)/journey');
          }
        }
      }
    };

    // App opened via deep link while already running
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    // App cold-started via deep link
    Linking.getInitialURL().then(url => { if (url) handleUrl(url); });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
