import '../lib/i18n'; // initialise i18n before anything else
import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import '../lib/notifications'; // registers notification handler on startup

// Replace with your real RevenueCat API keys from the RevenueCat dashboard
const RC_API_KEY_IOS     = 'appl_AgVACahWeoGFdeGJBqcHqHqxyCQ';
const RC_API_KEY_ANDROID = 'goog_cFhSuvMVroPfGsGWVGDYevhwEJR';

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
      Purchases.configure({ apiKey: Platform.OS === 'android' ? RC_API_KEY_ANDROID : RC_API_KEY_IOS });
    } catch (_) {}

    // Restore Supabase session and pull cloud data if user was previously logged in
    initSession();
  }, []);

  useEffect(() => {
    // Handle deep links for email confirmation and password reset.
    // Supabase v2 uses PKCE by default → confirmation URLs carry ?code=XXX (query param).
    // Older implicit-flow URLs carry #access_token=XXX (hash fragment) — kept for password reset.
    const handleUrl = async (url: string) => {
      // ── PKCE flow: thinkpop://confirm?code=XXX ──────────────────────────────
      const queryString = url.includes('?') ? url.split('?')[1] : '';
      const queryParams = Object.fromEntries(new URLSearchParams(queryString));
      if (queryParams.code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(queryParams.code);
        if (!error && data.session) {
          await initSession();
          router.replace('/(tabs)/journey');
        }
        return;
      }

      // ── Implicit flow: thinkpop://reset#access_token=XXX (password reset) ───
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
        <StatusBar style="dark" translucent={false} />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
