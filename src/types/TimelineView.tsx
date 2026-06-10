import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { ProjectTimeline, TimelineClip, TrackType, TimelineTrack } from './timeline';

const PIXELS_PER_SECOND = 40; // Zoom factor
const TRACK_HEIGHT = 50;

interface TimelineViewProps {
  timeline: ProjectTimeline;
  onClipPress: (clip: TimelineClip) => void;
}

export default function TimelineView({ timeline, onClipPress }: TimelineViewProps) {
  const { colors } = useTheme();

  const getTrackColor = (type: TrackType) => {
    switch (type) {
      case 'video': return '#1c3d5a';
      case 'audio': return '#14532d';
      case 'text': return '#581c87';
      case 'effect': return '#7c2d12';
      default: return colors.card;
    }
  };

  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={s.tracksContainer}>
          {timeline.tracks.map((track: TimelineTrack) => (
            <View key={track.id} style={[s.track, { borderBottomColor: colors.border }]}>
              {track.clips.map((clip: TimelineClip) => (
                <TouchableOpacity
                  key={clip.id}
                  onPress={() => onClipPress(clip)}
                  style={[
                    s.clip,
                    {
                      left: clip.startTime * PIXELS_PER_SECOND,
                      width: clip.duration * PIXELS_PER_SECOND,
                      backgroundColor: getTrackColor(track.type),
                      borderColor: colors.primary,
                      opacity: clip.opacity ?? 1,
                    },
                  ]}
                >
                  {clip.speed !== 1 && (
                    <View style={s.speedBadge}><Text style={s.speedText}>{clip.speed}x</Text></View>
                  )}
                  <Text variant="labelSmall" numberOfLines={1} style={s.clipText}>
                    {clip.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          
          {/* Playhead (Curseur de lecture) - Positionné ici pour l'exemple */}
          <View style={[s.playhead, { backgroundColor: colors.danger }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { height: 250, width: '100%' },
  tracksContainer: { paddingVertical: 10, minWidth: 2000 }, // Largeur min pour le scroll
  track: {
    height: TRACK_HEIGHT,
    width: '100%',
    borderBottomWidth: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  clip: {
    position: 'absolute',
    height: TRACK_HEIGHT - 10,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 5,
    elevation: 2,
  },
  clipText: { color: 'white', fontWeight: 'bold' },
  speedBadge: { position: 'absolute', top: 2, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, paddingHorizontal: 3 },
  speedText: { color: 'white', fontSize: 8 },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, zIndex: 10, left: 0 },
});