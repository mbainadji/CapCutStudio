import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { supabase } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';


import DashboardProjectsScreen from '../screens/project/DashboardProjectsScreen'; 
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen'; 
import HomeNavigator from './HomeNavigator';
const Stack = createNativeStackNavigator();

// Écran temporaire affiché uniquement quand vous serez connecté avec succès
function EcranConnecte() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text variant="headlineMedium" style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 12 }}>
        🎉 Connecté !
      </Text>
      <Button mode="outlined" textColor={colors.primary} style={{ borderColor: colors.primary }} onPress={() => supabase.auth.signOut()}>
        Se déconnecter
      </Button>
    </View>
  );
}

export default function AuthNavigator() {
  const { colors } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Demande à Supabase si un utilisateur possède une session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. S'abonne aux événements d'authentification (Connexion / Déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

    return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      {session ? (
        // L'utilisateur connecté accède maintenant à l'arborescence des onglets
        <Stack.Screen name="Home" component={HomeNavigator} /> 
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );


}
