import { create } from 'zustand';
import { ProjectTimeline, TimelineTrack, TimelineClip } from '../../types/timeline';
import { supabase } from '../../services/supabase';

export interface TimelineState {
  timeline: ProjectTimeline;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null; // ← Ajouté pour exposer les erreurs à l'UI

  setCurrentTime: (time: number) => void;
  setTimeline: (timeline: ProjectTimeline) => void;
  loadProjectTimeline: (projectId: string) => Promise<void>;
  updateClipPosition: (trackId: string, clipId: string, newStartTime: number) => Promise<void>;
  saveTimeline: (projectId: string) => Promise<void>; // ← Nouvelle action
}

// Identifiant de la dernière requête en cours pour éviter les race conditions
let loadRequestId = 0;

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timeline: { tracks: [] },
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,

  setCurrentTime: (time) => set({ currentTime: time }),

  setTimeline: (timeline) => {
    // Calcul avec reduce — pas de mutation de variable externe
    const duration = timeline.tracks
      .flatMap(track => track.clips)
      .reduce((max, clip) => Math.max(max, clip.startTime + clip.duration), 0);

    set({ timeline, duration });
  },

  loadProjectTimeline: async (projectId) => {
    // Chaque appel reçoit un ID unique — seul le dernier est traité
    const requestId = ++loadRequestId;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('timeline_data')
        .eq('id', projectId)
        .single();

      // Si une requête plus récente a déjà été lancée, on abandonne celle-ci
      if (requestId !== loadRequestId) return;

      if (error) throw error;

      get().setTimeline(
        data?.timeline_data ? (data.timeline_data as ProjectTimeline) : { tracks: [] }
      );
    } catch (err) {
      if (requestId !== loadRequestId) return;
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur Store Timeline:', err);
      set({ error: message });
    } finally {
      // On ne remet isLoading à false que si c'est encore notre requête
      if (requestId === loadRequestId) set({ isLoading: false });
    }
  },

  updateClipPosition: async (trackId, clipId, newStartTime) => {
    // Validation de l'entrée
    if (!Number.isFinite(newStartTime) || newStartTime < 0) {
      console.warn(`updateClipPosition: newStartTime invalide (${newStartTime})`);
      return;
    }

    const { timeline } = get();
    const newTracks = timeline.tracks.map(track => {
      if (track.id !== trackId) return track;
      return {
        ...track,
        clips: track.clips.map(clip =>
          clip.id === clipId ? { ...clip, startTime: newStartTime } : clip
        ),
      };
    });

    get().setTimeline({ tracks: newTracks });
  },

  // Sauvegarde découplée — à appeler explicitement (ex: bouton Sauvegarder, onBlur, etc.)
  saveTimeline: async (projectId) => {
    const { timeline } = get();
    set({ error: null });
    try {
      const { error } = await supabase
        .from('projects')
        .update({ timeline_data: timeline })
        .eq('id', projectId);

      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      console.error('Erreur saveTimeline:', err);
      set({ error: message });
    }
  },
}));