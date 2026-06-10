import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Button, Card, Text, FAB, IconButton, Searchbar, Portal, Dialog, TextInput } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';
import { HomeTabScreenProps } from '../../types/navigation';

export default function DashboardProjectsScreen({ navigation }: HomeTabScreenProps<'DashboardProjects'>) {
  const { colors } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  // 1. Récupération des projets depuis Supabase
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const localProjects = data.map(p => ({ ...p, is_deleted_local: false }));
        setProjects(localProjects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProjects();
    });
    return unsubscribe;
  }, [navigation]);

  // 1b. Action de création intentionnelle d'un projet
  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez donner un nom à votre projet.');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            title: newProjectTitle, 
            user_id: user.id,
            updated_at: new Date().toISOString() 
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setIsDialogVisible(false);
      setNewProjectTitle('');
      navigation.navigate('VideoEditor', { projectId: data.id });
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Action de sauvegarde / Upload du fichier vidéo vers Supabase Storage
  const uploadVideoToStorage = async (projectId: string, localUri: string) => {
    if (!localUri) {
      Alert.alert('Erreur', 'Aucun fichier vidéo local trouvé pour ce projet.');
      return;
    }

    try {
      setUploadingId(projectId);

      const fileExtension = localUri.split('.').pop() || 'mp4';
      const fileName = `${projectId}_${Date.now()}.${fileExtension}`;

      const response = await fetch(localUri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, blob, {
          contentType: 'video/mp4',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('projects')
        .update({ video_uri: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (updateError) throw updateError;

      Alert.alert('Succès', 'Votre vidéo a été sauvegardée sur le Cloud Supabase ! ☁️');
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erreur de stockage', err.message || 'Impossible d’envoyer la vidéo.');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSoftDelete = (id: string) => {
    setProjects(prev =>
      prev.map(proj => proj.id === id ? { ...proj, is_deleted_local: true } : proj)
    );
  };

  const filteredProjects = projects.filter(p => 
    !p.is_deleted_local && 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <View style={s.container}>
        
        <View style={s.header}>
          <Text variant="headlineSmall" style={[s.title, { color: colors.primary }]}>
            Stockage
          </Text>
          <Button mode="text" compact onPress={() => supabase.auth.signOut()} textColor={colors.danger}>
            Déconnexion
          </Button>
        </View>

        {/* 🛠️ FIX ZENCODER : Correction du mode de "outlined" à "bar" pour éviter l'erreur ts(2322) */}
        <Searchbar
          placeholder="Rechercher un projet..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          placeholderTextColor={colors.textSecondary}
          iconColor={colors.primary}
          mode="bar"
          theme={{ colors: { primary: colors.primary } }}
        />

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            refreshing={loading}
            onRefresh={fetchProjects}
            ListEmptyComponent={
              <Text variant="bodyMedium" style={[s.empty, { color: colors.textSecondary }]}>
                {searchQuery ? "Aucun résultat trouvé." : "Aucun projet. Cliquez sur + pour commencer."}
              </Text>
            }
            renderItem={({ item }) => {
              const isUploadingThis = uploadingId === item.id;
              const isAlreadyInCloud = item.video_uri?.startsWith('http');

              return (
                <Card 
                  style={[s.card, { backgroundColor: colors.background, borderColor: colors.border }]} 
                  mode="outlined"
                  // 🛠️ FIX ZENCODER : Correction des paramètres envoyés pour matcher avec { projectId?: string } dans navigation.ts
                  onPress={() => navigation.navigate('VideoEditor', { projectId: item.id })}
                >
                  <Card.Content style={s.cardContent}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text variant="titleMedium" style={{ color: colors.text, fontWeight: 'bold' }}>
                        {item.title}
                      </Text>
                      <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
                        Modifié le : {new Date(item.updated_at).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={s.actionsWrapper}>
                      {isUploadingThis ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginHorizontal: 12 }} />
                      ) : (
                        <IconButton 
                          icon={isAlreadyInCloud ? "cloud-check" : "cloud-upload-outline"} 
                          iconColor={isAlreadyInCloud ? "#2e7d32" : colors.primary} 
                          size={22} 
                          disabled={isAlreadyInCloud} 
                          onPress={() => uploadVideoToStorage(item.id, item.video_uri)} 
                        />
                      )}

                      <IconButton 
                        icon="trash-can-outline" 
                        iconColor={colors.danger} 
                        size={22} 
                        onPress={() => handleSoftDelete(item.id)} 
                      />
                    </View>
                  </Card.Content>
                </Card>
              );
            }}
          />
        )}

        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)} style={{ backgroundColor: colors.background }}>
            <Dialog.Title style={{ color: colors.primary }}>Nouveau Projet</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nom du projet"
                value={newProjectTitle}
                onChangeText={setNewProjectTitle}
                mode="outlined"
                autoFocus
                activeOutlineColor={colors.primary}
                outlineColor={colors.border}
                style={{ backgroundColor: colors.background }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDialogVisible(false)} textColor={colors.textSecondary}>Annuler</Button>
              <Button 
                onPress={handleCreateProject} 
                loading={loading} 
                disabled={!newProjectTitle.trim() || loading}
              >
                Créer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <FAB
          icon="plus"
          label="Nouveau"
          style={[s.fab, { backgroundColor: colors.primary }]}
          color={colors.white}
          onPress={() => setIsDialogVisible(true)}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontWeight: 'bold' },
  searchBar: { marginBottom: 20, borderRadius: 12, height: 48, borderWidth: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { gap: 12, paddingBottom: 80 },
  card: { borderRadius: 12, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionsWrapper: { flexDirection: 'row', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 28 },
});
