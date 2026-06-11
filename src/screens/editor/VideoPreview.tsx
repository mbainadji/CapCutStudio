import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoEffectRenderer, getInterpolatedValue } from '../../types/webglEffects';
import { ProjectTimeline, TimelineClip } from '../../types/timeline';
import { useTimelineStore, TimelineState } from './useTimelineStore';

interface VideoPreviewProps {
  videoUri: string;
  timeline: ProjectTimeline;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  videoUri, 
  timeline, 
  currentTime, 
  onTimeUpdate,
  isPlaying 
}) => {
  const canvasRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rendererRef = useRef<VideoEffectRenderer | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const requestRef = useRef<number | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const setStoreTime = useTimelineStore((state: TimelineState) => state.setCurrentTime);

  // 1. Initialisation de la source vidéo (cachée)
  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUri;
    video.crossOrigin = "anonymous";
    video.style.display = 'none';
    video.muted = true; // Important pour l'auto-play
    videoRef.current = video;

    return () => {
      video.pause();
      video.src = "";
      video.load();
      if (canvasRef.current) {
        const gl = canvasRef.current.getContext('webgl');
        if (gl && textureRef.current) gl.deleteTexture(textureRef.current);
      }
    };
  }, [videoUri]);

  // 2. Gestion de la lecture
  useEffect(() => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.play() : videoRef.current.pause();
    }
  }, [isPlaying]);

  // 3. Boucle de Rendu (60 FPS)
  const renderLoop = (time: number) => {
    const video = videoRef.current;
    
    // Optimization: Cache the WebGL context instead of requesting it every frame
    if (!glRef.current && canvasRef.current) {
      glRef.current = canvasRef.current.getContext('webgl', { 
        preserveDrawingBuffer: true 
      }) as WebGLRenderingContext | null;
    }
    const gl = glRef.current;

    if (video && gl && !video.paused && !video.ended) {
      // Synchronisation du temps : On met à jour la timeline via la vidéo
      setStoreTime(video.currentTime);

      if (gl && !rendererRef.current) {
        rendererRef.current = new VideoEffectRenderer(gl);
      }

      // Récupération du clip actif sur la piste vidéo principale à l'instant T
      const videoTrack = timeline.tracks.find(t => t.type === 'video');
      const activeClip = videoTrack?.clips.find(c => 
        video.currentTime >= c.startTime && 
        video.currentTime <= (c.startTime + c.duration)
      );

      if (activeClip) {
        const relativeTime = video.currentTime - activeClip.startTime;

        // Calcul des effets interpolés (Keyframes)
        const params = {
          brightness: getInterpolatedValue(
            activeClip.keyframes?.brightness, // Les keyframes sont directement sur le clip
            relativeTime, 
            activeClip.standardEffects?.brightness ?? 0 // Valeur statique par défaut si pas de keyframes
          ),
          contrast: getInterpolatedValue(
            activeClip.keyframes?.contrast, // Les keyframes sont directement sur le clip
            relativeTime, 
            activeClip.standardEffects?.contrast ?? 1 // Valeur statique par défaut si pas de keyframes
          ),
          saturation: getInterpolatedValue(
            activeClip.keyframes?.saturation, // Les keyframes sont directement sur le clip
            relativeTime, 
            activeClip.standardEffects?.saturation ?? 1 // Valeur statique par défaut si pas de keyframes
          ),
        };

        // ✅ OPTIMISATION : Réutilisation de la texture existante
        if (!textureRef.current) {
          textureRef.current = gl.createTexture();
        }
        
        gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
        // On injecte la frame actuelle de l'élément <video>
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        
        // Paramètres de texture standards
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Rendu final via les Shaders
        if (rendererRef.current && textureRef.current) {
          rendererRef.current.render(params, textureRef.current);
        }
      }
    }
    requestRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [timeline]); // On relance si la structure des effets change

  return (
    <View style={s.container}>
      {/* Le Canvas WebGL visible à l'utilisateur */}
      <canvas ref={canvasRef} style={s.canvas} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
  canvas: { width: '100%', height: '100%', objectFit: 'contain' }
});