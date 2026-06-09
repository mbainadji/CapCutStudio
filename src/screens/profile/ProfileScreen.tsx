import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Avatar, Button, Text, Surface, List } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import { HomeScreenProps } from '../../types/navigation'; // 👈 Import de notre type de navigation principal

// 👈 Application du type strict aux props de l'écran
export default function ProfileScreen({ navigation }: HomeScreenProps<'Profile'>) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('Chargement...');

  useEffect(() => {
    let isMounted = true; // 👈 Variable de contrôle pour éviter les fuites de mémoire

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted && user?.email) {
        setEmail(user.email);
      }
    });

    return () => {
      isMounted = false; // 👈 Annulation de la mise à jour de l'état si le composant est démonté
    };
  }, []);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.container}>
        
        {/* 1. Section Avatar & Identifiants de Session */}
        <View style={s.avatarSection}>
          <Avatar.Text 
            size={80} 
            label={email !== 'Chargement...' ? email.substring(0, 2).toUpperCase() : 'CX'} 
            style={{ backgroundColor: colors.primary }}
            labelStyle={{ color: colors.white }}
          />
          <Text variant="headlineSmall" style={[s.userName, { color: colors.text }]}>
            Créateur CapCut
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
            {email}
          </Text>
        </View>

        {/* 2. Tableau de bord des Statistiques IA */}
        <View style={s.statsContainer}>
          <Surface style={[s.statsCard, { backgroundColor: colors.card }]} elevation={0}>
            <Text variant="titleLarge" style={[s.statsNumber, { color: colors.primary }]}>PostgreSQL</Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>Base synchronisée</Text>
          </Surface>
          <Surface style={[s.statsCard, { backgroundColor: colors.card }]} elevation={0}>
            <Text variant="titleLarge" style={[s.statsNumber, { color: colors.primary }]}>Groq & RVM</Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>Moteurs IA Actifs</Text>
          </Surface>
        </View>

        {/* 3. Liste des Paramètres du Compte */}
        <View style={s.menuSection}>
          <List.Item
            title="Historique des rendus IA"
            left={props => <List.Icon {...props} icon="history" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.textSecondary} />}
            titleStyle={{ color: colors.text, fontWeight: '600', fontSize: 14 }}
          />
          <List.Item
            title="Stockage Cloud (Supabase)"
            left={props => <List.Icon {...props} icon="cloud-outline" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.textSecondary} />}
            titleStyle={{ color: colors.text, fontWeight: '600', fontSize: 14 }}
          />
        </View>

        {/* 4. Bouton de Déconnexion bicolore strict */}
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
  avatarSection: { alignItems: 'center', marginTop: 20 },
  userName: { fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  statsCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statsNumber: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  menuSection: { marginVertical: 20 },
  logoutBtn: { borderRadius: 12, paddingVertical: 4, borderWidth: 1.5, marginBottom: 12 },
  logoutLabel: { fontWeight: 'bold', fontSize: 16 }
});
