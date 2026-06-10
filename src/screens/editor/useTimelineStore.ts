import { create } from 'zustand';
import { ProjectTimeline, TimelineTrack, TimelineClip } from '../types/timeline';
import { supabase } from '../services/supabase';

export interface TimelineState {
  timeline: ProjectTimeline;
  currentTime: number;
  duration: number;
  isLoading: boolean;

  // Actions
  setCurrentTime: (time: number) => void;
  setTimeline: (timeline: ProjectTimeline) => void;
  loadProjectTimeline: (projectId: string) => Promise<void>;
  updateClipPosition: (trackId: string, clipId: string, newStartTime: number) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timeline: { tracks: [] },
  currentTime: 0,
  duration: 0,
  isLoading: false,

  // Mise à jour rapide pour la boucle de rendu
  setCurrentTime: (time) => set({ currentTime: time }),

  setTimeline: (timeline) => {
    // Calcul de la durée totale basée sur la fin du dernier clip
    let maxDuration = 0;
    timeline.tracks.forEach(track => {
      track.clips.forEach(clip => {
        maxDuration = Math.max(maxDuration, clip.startTime + clip.duration);
      });
    });
    set({ timeline, duration: maxDuration });
  },

  loadProjectTimeline: async (projectId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('timeline_data')
        .eq('id', projectId)
        .single();

      if (!error && data?.timeline_data) {
        get().setTimeline(data.timeline_data as ProjectTimeline);
      } else {
        get().setTimeline({ tracks: [] });
      }
    } catch (err) {
      console.error('Erreur Store Timeline:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateClipPosition: (trackId, clipId, newStartTime) => {
    const { timeline } = get();
    const newTracks = timeline.tracks.map(track => {
      if (track.id !== trackId) return track;
      return {
        ...track,
        clips: track.clips.map(clip => 
          clip.id === clipId ? { ...clip, startTime: newStartTime } : clip
        )
      };
    });
    
    const newTimeline = { tracks: newTracks };
    get().setTimeline(newTimeline);

    // Note: Sauvegarde automatique vers Supabase possible ici
  }
}));