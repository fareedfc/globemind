import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://nfxxmhtzgyklxlzueztz.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5meHhtaHR6Z3lrbHhsenVlenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTY2NzAsImV4cCI6MjA5MDY3MjY3MH0.hVN-MgEv1AHRCV6j9wrx_ILYD7pgtTw3YBxx770cKg8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
