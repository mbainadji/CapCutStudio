// src/services/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Configuration officielle de votre base de données
const SUPABASE_URL = 'https://ojtsrgkqqegmhitduwgx.supabase.co'; 
// ⚠️ Remplacez la valeur ci-dessous par votre clé 'anon' 'public' récupérée sur Supabase (commence par eyJ...)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHNyZ2txcWVnbWhpdGR1d2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTg2OTcsImV4cCI6MjA5NjMzNDY5N30.qHseHo09M8_1hHPt7LSPfOiimMf5xzIwURhX0ZLhomM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
