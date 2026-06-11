import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, Alert, ScrollView } from 'react-native';
import { Avatar, Button, Text, Surface, List, TextInput, Portal, Dialog } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import { HomeTabScreenProps } from '../../types/navigation';

export default function ProfileScreen({ navigation }: HomeTabScreenProps<'Profile'>) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('Chargement...');
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const name = user.user_metadata?.full_name || 'Créateur CapCut';
        setDisplayName(name);
        setOriginalDisplayName(name);
        fetchProjectCount(user.id);
      }
    };

    loadUserData();

    const unsubscribe = navigation.addListener('focus', () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) fetchProjectCount(user.id);
      });
    });

    return unsubscribe;
  }, [navigation]);

  const fetchProjectCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (!error && count !== null) setProjectCount(count);
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updates: any = {
        data: { full_name: displayName }
      };

      // Si l'utilisateur a saisi un nouveau mot de passe
      if (newPassword.length > 0) {
        if (newPassword.length < 6) {
          Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
          return;
        }
        updates.password = newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      Alert.alert('Succès', 'Vos informations ont été mises à jour !');
      setIsEditing(false);
      setOriginalDisplayName(displayName);
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(originalDisplayName);
    setNewPassword('');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.scrollContainer}>
        <View style={s.container}>
          
          {/* 1. Section Avatar & Identifiants */}
          <View style={s.avatarSection}>
            <Avatar.Text 
              size={80} 
              label={displayName ? displayName.substring(0, 2).toUpperCase() : '??'} 
              style={{ backgroundColor: colors.primary }}
              labelStyle={{ color: colors.white }}
            />
            
            {isEditing ? (
              <View style={s.editFields}>
                <TextInput
                  label="Nom complet"
                  value={displayName}
                  onChangeText={setDisplayName}
                  mode="outlined"
                  style={s.input}
                  activeOutlineColor={colors.primary}
                />
                <TextInput
                  label="Nouveau mot de passe"
                  placeholder="Laisser vide pour ne pas changer"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  mode="outlined"
                  secureTextEntry
                  style={s.input}
                  activeOutlineColor={colors.primary}
                />
                <View style={s.editButtons}>
                  <Button mode="contained" onPress={handleUpdateProfile} loading={loading} style={s.saveBtn}>
                    Enregistrer
                  </Button>
                  <Button mode="text" onPress={handleCancelEdit}>
                    Annuler
                  </Button>
                </View>
              </View>
            ) : (
              <>
                <Text variant="headlineSmall" style={[s.userName, { color: colors.text }]}>
                  {displayName}
                </Text>
                <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                  {email}
                </Text>
                <Button icon="pencil" mode="text" onPress={() => setIsEditing(true)} textColor={colors.primary}>
                  Modifier le profil
                </Button>
              </>
            )}
          </View>

          {/* 2. Tableau de bord des Statistiques */}
          <View style={s.statsContainer}>
            <Surface style={[s.statsCard, { backgroundColor: colors.card }]} elevation={0}>
              <Text variant="titleLarge" style={[s.statsNumber, { color: colors.primary }]}>{projectCount}</Text>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>Projets créés</Text>
            </Surface>
            <Surface style={[s.statsCard, { backgroundColor: colors.card }]} elevation={0}>
              <Text variant="titleLarge" style={[s.statsNumber, { color: colors.primary }]}>IA</Text>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>Services actifs</Text>
            </Surface>
          </View>

          {/* 3. Liste des Paramètres */}
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

          {/* 4. Bouton de Déconnexion */}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  avatarSection: { alignItems: 'center', marginTop: 20 },
  userName: { fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  statsCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statsNumber: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  menuSection: { marginVertical: 20 },
  logoutBtn: { borderRadius: 12, paddingVertical: 4, borderWidth: 1.5, marginBottom: 12 },
  logoutLabel: { fontWeight: 'bold', fontSize: 16 },
  editFields: { width: '100%', marginTop: 20 },
  input: { marginBottom: 12, backgroundColor: 'transparent' },
  editButtons: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveBtn: { borderRadius: 8, marginRight: 8 }
});
