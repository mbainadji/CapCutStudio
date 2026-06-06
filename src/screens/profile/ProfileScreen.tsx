// src/screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Avatar, Button, Text, Surface } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.container}>
        
        {/* Section Avatar & Utilisateur */}
        <View style={s.avatarSection}>
         <Avatar.Text 
            size={80} 
            label={email ? email.substring(0, 2).toUpperCase() : 'CX'} 
            style={{ backgroundColor: colors.primary }} // Gère le fond ici
            color={colors.white}                        // Gère le texte ici
            />

          <Text variant="headlineSmall" style={[s.userName, { color: colors.text }]}>
            Créateur CapCut
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
            {email}
          </Text>
        </View>

        {/* Espace central décoratif ou d'information */}
        <Surface style={[s.infoBox, { backgroundColor: colors.card }]} elevation={0}>
          <Text variant="bodyMedium" style={{ color: colors.text, textAlign: 'center' }}>
            Base de données Supabase connectée en mode sécurisé.
          </Text>
        </Surface>

        {/* Bouton de Déconnexion Épuré */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={() => supabase.auth.signOut()}
          style={[s.logoutBtn, { borderColor: colors.primary }]}
          textColor={colors.primary}
          labelStyle={s.logoutLabel}
        >
          Se déconnecter
        </Button>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  avatarSection: { alignItems: 'center', marginTop: 40 },
  userName: { fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  infoBox: { padding: 16, borderRadius: 12, marginVertical: 40 },
  logoutBtn: { borderRadius: 12, paddingVertical: 4, borderWidth: 1.5 },
  logoutLabel: { fontWeight: 'bold', fontSize: 16 }
});
