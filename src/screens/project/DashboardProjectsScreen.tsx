// src/screens/project/DashboardProjectsScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { Button, Card, Text, FAB, Surface } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardProjectsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les projets depuis PostgreSQL
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) setProjects(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fonction temporaire pour ajouter rapidement un projet et tester la base
  const handleCreateTestProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('projects').insert([
      { user_id: user.id, title: `Nouveau Projet ${projects.length + 1}` }
    ]);

    if (!error) fetchProjects();
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.container}>
        
        {/* Barre supérieure épurée */}
        <View style={s.header}>
          <Text variant="headlineSmall" style={[s.title, { color: colors.primary }]}>
            Mes Projets
          </Text>
          <Button mode="text" compact onPress={() => supabase.auth.signOut()} textColor={colors.danger}>
            Déconnexion
          </Button>
        </View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            refreshing={loading}
            onRefresh={fetchProjects}
            ListEmptyComponent={
              <Text variant="bodyMedium" style={[s.empty, { color: colors.textSecondary }]}>
                Aucun projet pour le moment. Cliquez sur le bouton + pour commencer.
              </Text>
            }
            renderItem={({ item }) => (
              <Card style={[s.card, { backgroundColor: colors.background, borderColor: colors.border }]} mode="outlined">
                <Card.Content>
                  <Text variant="titleMedium" style={{ color: colors.text, fontWeight: 'bold' }}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
                    Modifié le : {new Date(item.updated_at).toLocaleDateString()}
                  </Text>
                </Card.Content>
              </Card>
            )}
          />
        )}

        {/* Bouton d'action flottant bicolore */}
        <FAB
          icon="plus"
          label="Nouveau"
          style={[s.fab, { backgroundColor: colors.primary }]}
          color={colors.white}
          onPress={handleCreateTestProject}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { gap: 12, paddingBottom: 80 },
  card: { borderRadius: 12, borderWidth: 1 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});
