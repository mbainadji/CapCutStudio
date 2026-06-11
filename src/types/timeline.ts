export type TrackType = 'video' | 'audio' | 'text' | 'effect';

export type EffectCategory = 'standard' | 'ai';

export interface StandardEffectConfig {
  // Filtres & Étalonnage
  brightness?: number;
  contrast?: number;
  saturation?: number;
  lut?: string; // ID de la LUT sélectionnée
  
  // Transformations
  opacity?: number;
  scale?: number;
  position?: { x: number; y: number };
  
  // Temps
  speed?: number;
  isReversed?: boolean;
  isFrozen?: boolean;
}

export interface AIEffectConfig {
  type: 'subtitles' | 'remove_bg' | 'tts' | 'gen_video' | 'gen_image'; // Ajout de 'gen_image'
  status: 'idle' | 'processing' | 'completed' | 'failed';
  resultUri?: string; // URI du fichier généré (mask, mp3, mp4)
  prompt?: string;    // Pour TTS et Générateur
}

export interface Keyframe {
  time: number;  // Temps relatif au début du clip (en secondes)
  value: number; // Valeur de la propriété à cet instant
}

export interface TimelineClip {
  id: string;
  sourceUri: string;
  name: string;
  
  // Temps global sur la timeline (en secondes)
  startTime: number;
  duration: number;
  
  // Fenêtre de lecture du fichier source (en secondes)
  sourceIn: number;   // Début de la coupe dans le fichier d'origine
  sourceOut: number;  // Fin de la coupe dans le fichier d'origine

  // Propriétés de rendu
  opacity?: number;
  scale?: number;     // 1.0 par défaut
  speed?: number;     // 1.0 par défaut (0.5x, 2.0x, etc.)
  
  // Architecture Modulaire des Effets
  standardEffects?: StandardEffectConfig;
  aiEffects?: AIEffectConfig[];

    // Images clés pour l'animation
    keyframes?: {
      brightness?: Keyframe[];
      contrast?: Keyframe[];
      saturation?: Keyframe[];
    };

  // Configuration des transitions (appliquées sur les bords du clip)
  transition?: {
    type: 'crossfade' | 'zoom';
    duration: number; // secondes
  };
  volume?: number;
  style?: any;        // Pour le texte ou les filtres
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  clips: TimelineClip[];
}

export interface ProjectTimeline {
  tracks: TimelineTrack[];
}