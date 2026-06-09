import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import HomeNavigator from './HomeNavigator';

export default function RootNavigator() {
  const { colors } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⚡ OPTIMISATION STYLE ZENCODER : Écoute instantanée de la session en cache local (AsyncStorage)
    // Cela évite d'attendre une réponse du serveur distant pour afficher les écrans
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false); // Le chargement s'arrête dès que le cache local parle
    });

    // Sécurité de secours : Vérification asynchrone rapide en tâche de fond
    supabase.auth.getSession().then(({ data: { session: asyncSession } }) => {
      if (asyncSession) setSession(asyncSession);
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  // Écran d'attente minimaliste et ultra-léger
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Si la session existe (locale ou cloud), on ouvre le Studio, sinon le Login */}
      {session ? <HomeNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
