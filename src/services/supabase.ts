// src/services/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Configuration officielle de votre base de données
const SUPABASE_URL = 'https://ojtsrgkqqegmhitduwgx.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_MGVx7fz5bNsmI9fF5gM2BA_f0a1CSRR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
