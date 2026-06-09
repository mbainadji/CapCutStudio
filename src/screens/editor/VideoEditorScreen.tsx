import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Text, Button, Surface, IconButton, TextInput } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { supabase } from '../../services/supabase';
import { generateAISubtitles } from '../../services/aiService';
import { useTheme } from '../../context/ThemeContext';
import { HomeScreenProps } from '../../types/navigation';

export default function VideoEditorScreen({ route, navigation }: HomeScreenProps<'VideoEditor'>) {
  const { colors } = useTheme();
  
  // 🛠️ FIX ZENCODER: Extract 'projectId' safely from route params to adhere to navigation types schema blueprints
  const projectIdParam = route.params?.projectId || null;

  // Local state tracking using clean conditional parsing
  const [projectId, setProjectId] = useState<string | null>(projectIdParam);
  const [projectTitle, setProjectTitle] = useState<string>('Studio - Projet de Montage');
  const [videoUri, setVideoUri] = useState<string>('');
  const [subtitles, setSubtitles] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [processingIA, setProcessingIA] = useState<boolean>(false);

  // 🛠️ FIX ZENCODER: Dynamically determine if this is a new workflow by checking if projectId parameter is null
  const isNewWorkflow = !projectIdParam;

  useEffect(() => {
    if (!isNewWorkflow && projectIdParam) {
      const loadProject = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectIdParam)
            .single();

          if (!error && data) {
            setProjectTitle(data.title || 'Projet de Montage');
            setVideoUri(data.video_uri || '');
            setSubtitles(data.settings?.subtitles || '');
          }
        } catch (err) {
          console.error('Erreur chargement projet:', err);
        } {
          setLoading(false);
        }
      };
      loadProject();
    }
  }, [projectIdParam, isNewWorkflow]);

  const handleSelectVideo = () => {
    launchImageLibrary({ mediaType: 'video', selectionLimit: 1 }, async (response) => {
      if (response.didCancel || !response.assets || response.assets.length === 0) return;
      
      const selectedUri = response.assets[0].uri || '';
      setVideoUri(selectedUri);

      if (isNewWorkflow && !projectId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('projects')
            .insert([{
              user_id: user.id,
              title: projectTitle,
              video_uri: selectedUri,
              settings: { subtitles: '' }
            }])
            .select()
            .single();

          if (!error && data) {
            setProjectId(data.id);
            Alert.alert('Succès', 'Votre projet de montage vidéo a été initialisé !');
          }
        } catch (err) {
          console.error('Erreur création projet:', err);
        }
      } else if (projectId) {
        await supabase
          .from('projects')
          .update({ video_uri: selectedUri, updated_at: new Date().toISOString() })
          .eq('id', projectId);
      }
    });
  };

  const handleGenerateSubtitles = async () => {
    if (!videoUri) {
      Alert.alert('Attention', 'Veuillez importer une vidéo avant de lancer l’IA.');
      return;
    }

    try {
      setProcessingIA(true);
      const transcript = await generateAISubtitles(videoUri);
      setSubtitles(transcript);

      if (projectId) {
        await supabase
          .from('projects')
          .update({
            settings: { subtitles: transcript },
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingIA(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      {/* HEADER CONTROLS */}
      <Surface style={[s.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]} mode="flat" elevation={0}>
        <IconButton icon="arrow-left" iconColor={colors.text} size={24} onPress={() => navigation.goBack()} />
        <TextInput
          value={projectTitle}
          onChangeText={(text) => {
            setProjectTitle(text);
            if (projectId) supabase.from('projects').update({ title: text }).eq('id', projectId);
          }}
          mode="flat"
          dense
          style={[s.titleInput, { color: colors.text, backgroundColor: 'transparent' }]}
          underlineColor="transparent"
          activeUnderlineColor={colors.primary}
        />
      </Surface>

      <ScrollView contentContainerStyle={s.scrollContainer}>
        {/* VIDEO MONITOR VIEW BOX */}
        {/* 🛠️ FIX ZENCODER: Mode property adjusted from "outlined" to "flat" to comply with structural configurations schema definition profiles */}
        <Surface style={[s.videoMonitor, { backgroundColor: colors.card, borderColor: colors.border }]} mode="flat" elevation={0}>
          {videoUri ? (
            <View style={s.monitorContent}>
              <IconButton icon="video-check-outline" iconColor={colors.primary} size={48} />
              <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '700' }}>Vidéo chargée</Text>
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary, marginTop: 4, width: '85%', textAlign: 'center' }}>
                {videoUri}
              </Text>
              <Button mode="outlined" compact onPress={handleSelectVideo} style={{ marginTop: 12 }} textColor={colors.primary}>
                Changer de fichier
              </Button>
            </View>
          ) : (
            <View style={s.monitorContent}>
              <IconButton icon="video-plus-outline" iconColor={colors.textSecondary} size={48} />
              <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginBottom: 12 }}>
                Aucune vidéo associée à ce projet.
              </Text>
              <Button mode="contained" onPress={handleSelectVideo} buttonColor={colors.primary} textColor={colors.white}>
                Importer une vidéo
              </Button>
            </View>
          )}
        </Surface>

        {/* PROCESSING CONTROL ELEMENTS */}
        <Text variant="titleMedium" style={[s.sectionTitle, { color: colors.text }]}>Actions Intelligentes</Text>
        
        <Button
          mode="contained"
          icon="robot-outline"
          onPress={handleGenerateSubtitles}
          loading={processingIA}
          disabled={processingIA || !videoUri}
          style={s.aiBtn}
          buttonColor={colors.primary}
          textColor={colors.white}
        >
          Générer des sous-titres (Groq Whisper)
        </Button>

        {/* SUBTITLE TERMINAL CONTAINER BOX */}
        {/* 🛠️ FIX ZENCODER: Surface configuration corrected to "flat" parameters */}
        {!!subtitles && (
          <Surface style={[s.subtitlesBox, { backgroundColor: colors.card, borderColor: colors.border }]} mode="flat" elevation={0}>
            <Text variant="labelLarge" style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 6 }}>
              📝 Texte transcrit :
            </Text>
            <Text variant="bodyMedium" style={[s.subtitlesText, { color: colors.text }]}>
              {subtitles}
            </Text>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4, borderBottomWidth: 1 },
  titleInput: { flex: 1, fontSize: 18, fontWeight: 'bold', height: 40 },
  scrollContainer: { padding: 20 },
  videoMonitor: { height: 220, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  monitorContent: { alignItems: 'center', width: '100%' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  aiBtn: { borderRadius: 12, paddingVertical: 4, marginBottom: 16 },
  subtitlesBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
  subtitlesText: { lineHeight: 22, fontStyle: 'italic' }
});
