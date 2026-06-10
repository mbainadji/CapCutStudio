import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, IconButton, List } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { HomeTabScreenProps } from '../../types/navigation';

const FEATURE_CATEGORIES = [
  {
    title: "Montage et découpe",
    icon: "movie-edit",
    features: [
      { id: 'timeline', title: 'Timeline multipiste', desc: 'Superposition vidéos, audios et textes', icon: 'layers-outline' },
      { id: 'split', title: 'Division et découpage', desc: 'Ajustement précis au millième de seconde', icon: 'content-cut' },
      { id: 'speed', title: 'Courbes de vitesse', desc: 'Accélérations et ralentissements fluides', icon: 'speedometer' },
      { id: 'keyframes', title: 'Images clés', desc: 'Animation sur-mesure des éléments', icon: 'key-variant' },
    ]
  },
  {
    title: "Outils d'Intelligence Artificielle",
    icon: "robot",
    features: [
      { id: 'subtitles', title: 'Sous-titres automatiques', desc: 'Transcription instantanée Whisper', icon: 'closed-caption' },
      { id: 'remove_bg', title: 'Suppression du fond', desc: 'Détourage automatique sans écran vert', icon: 'human-edit' },
      { id: 'tts', title: 'Synthèse vocale', desc: 'Textes en voix réalistes', icon: 'account-voice' },
      { id: 'ia_gen', title: 'Générateur IA', desc: 'Création via invites textuelles', icon: 'auto-fix' },
    ]
  },
  {
    title: "Audio et musique",
    icon: "music-note",
    features: [
      { id: 'audio_lib', title: 'Bibliothèque intégrée', desc: 'Musiques et effets sonores libres de droits', icon: 'library-music' },
      { id: 'audio_ext', title: 'Extraction audio', desc: 'Son de n\'importe quelle vidéo', icon: 'file-music' },
      { id: 'voice_fx', title: 'Effets vocaux', desc: 'Robot, écho, distorsion', icon: 'microphone-variant' },
      { id: 'noise_red', title: 'Réduction de bruit', desc: 'Nettoyage des parasites audio', icon: 'waveform' },
    ]
  },
  {
    title: "Habillage visuel",
    icon: "palette",
    features: [
      { id: 'filters', title: 'Filtres et LUTs', desc: 'Étalonnage des couleurs en un clic', icon: 'filter-variant' },
      { id: 'body_fx', title: 'Effets vidéo et corps', desc: 'Suivis de mouvement et lueurs', icon: 'star-face' },
      { id: 'text_models', title: 'Modèles de texte', desc: 'Titres animés et polices stylisées', icon: 'format-text' },
      { id: 'stickers', title: 'Autocollants', desc: 'Stickers dynamiques', icon: 'sticker-emoji' },
    ]
  },
  {
    title: "Formats et partage",
    icon: "share-variant",
    features: [
      { id: 'formats', title: 'Formats prédéfinis', desc: 'TikTok, Shorts, Instagram', icon: 'aspect-ratio' },
      { id: 'templates', title: 'Modèles (Templates)', desc: 'Création automatisée rythmée', icon: 'view-quilt' },
      { id: 'export_4k', title: 'Export HD / 4K', desc: 'Rendus jusqu\'à 4K 60 FPS', icon: 'video-check' },
    ]
  }
];

export default function StudioScreen({ navigation }: HomeTabScreenProps<'Studio'>) {
  const { colors } = useTheme();

  return (
    <ScrollView style={[s.container, { backgroundColor: colors.background }]}>
      <View style={s.header}>
        <Text variant="headlineMedium" style={[s.title, { color: colors.primary }]}>Studio Créatif</Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>Choisissez un effet pour commencer</Text>
      </View>

      <View style={s.content}>
        {FEATURE_CATEGORIES.map((category, index) => (
          <View key={index} style={s.section}>
            <List.Subheader style={[s.subtitle, { color: colors.primary }]}>{category.title}</List.Subheader>
            <View style={s.grid}>
              {category.features.map((feature) => (
                <Card 
                  key={feature.id} 
                  style={[s.card, { backgroundColor: colors.card }]} 
                  onPress={() => navigation.navigate('VideoEditor', { effectType: feature.id })}
                >
                  <Card.Title 
                    title={feature.title} 
                    titleStyle={s.cardTitle}
                    left={(props) => (
                      <IconButton 
                        {...props} 
                        icon={feature.icon} 
                        iconColor={colors.primary} 
                      />
                    )} 
                  />
                  <Card.Content>
                    <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{feature.desc}</Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, marginTop: 20 },
  title: { fontWeight: 'bold' },
  subtitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
  content: { paddingBottom: 30 },
  section: { marginBottom: 20 },
  grid: { padding: 15, gap: 15 },
  card: { borderRadius: 12, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600' }
});