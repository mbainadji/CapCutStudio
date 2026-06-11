// src/services/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config'; // Importez Config pour accéder aux variables d'environnement

// Configuration officielle de votre base de données
const SUPABASE_URL = 'https://ojtsrgkqqegmhitduwgx.supabase.co'; 
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY; // Récupération de la clé depuis .env

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
