/// <reference lib="dom" />

import { Keyframe, TimelineClip } from './timeline';

/**
 * WebGL Effects Processor for CapCutStudio
 * Gère le rendu GPU pour la luminosité, le contraste et la saturation.
 */

// 1. VERTEX SHADER : Gère la géométrie (Rectangle plein écran)
export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    // Passe les coordonnées de texture au Fragment Shader
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

// 2. FRAGMENT SHADER : Calcul mathématique par pixel
export const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform float u_brightness; // -1.0 à 1.0
  uniform float u_contrast;   // 0.0 à 2.0 (1.0 = normal)
  uniform float u_saturation; // 0.0 à 2.0 (1.0 = normal)
  varying vec2 v_texCoord;

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 rgb = color.rgb;

    // --- AJUSTEMENT LUMINOSITÉ ---
    // On ajoute simplement l'offset à chaque composante
    rgb += u_brightness;

    // --- AJUSTEMENT CONTRASTE ---
    // On scale les couleurs autour du gris moyen (0.5)
    rgb = (rgb - 0.5) * u_contrast + 0.5;

    // --- AJUSTEMENT SATURATION ---
    // Calcul de la luminance selon la norme Rec. 709
    float luminance = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 grayscale = vec3(luminance);
    // Interpolation entre le gris et la couleur originale
    rgb = mix(grayscale, rgb, u_saturation);

    // Sécurité pour garder les valeurs entre 0 et 1
    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
  }
`;

export interface VideoEffectParams {
  brightness: number;
  contrast: number;
  saturation: number;
}

/**
 * Calcule la valeur interpolée d'une propriété à un instant donné
 * @param keyframes Liste des images clés
 * @param time Temps relatif au clip (en secondes)
 * @param defaultValue Valeur de secours si pas de keyframes
 */
export function getInterpolatedValue(keyframes: Keyframe[] | undefined, time: number, defaultValue: number): number {
  if (!keyframes || keyframes.length === 0) return defaultValue;

  // 1. Trier par sécurité (bien que l'UI doive s'en charger)
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  // 2. Cas aux limites (Avant le premier ou après le dernier)
  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  // 3. Recherche des deux keyframes entourant 'time'
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];

    if (time >= k1.time && time <= k2.time) {
      // --- CALCUL MATHÉMATIQUE LERP ---
      // Calcul de la progression (0.0 à 1.0) entre k1 et k2
      const range = k2.time - k1.time;
      const progress = (time - k1.time) / range;

      // Formule : Valeur = Début + (Fin - Début) * Progrès
      return k1.value + (k2.value - k1.value) * progress;
    }
  }

  return defaultValue;
}

export class VideoEffectRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.program = this.createProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    this.initUniforms();
  }

  /**
   * Initialise les emplacements des variables uniforms pour gagner en performance
   */
  private initUniforms() {
    const names = ['u_brightness', 'u_contrast', 'u_saturation', 'u_image'];
    names.forEach(name => {
      this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
    });
  }

  /**
   * Applique les paramètres et dessine la frame
   */
  public render(params: VideoEffectParams, texture: WebGLTexture) {
    const gl = this.gl;
    gl.useProgram(this.program);

    // Mise à jour des variables dans le GPU
    gl.uniform1f(this.uniforms['u_brightness'], params.brightness);
    gl.uniform1f(this.uniforms['u_contrast'], params.contrast);
    gl.uniform1f(this.uniforms['u_saturation'], params.saturation);

    // Liaison de la texture vidéo
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.uniforms['u_image'], 0);

    // Exécution du rendu (Draw call)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Utilitaire pour compiler les shaders et créer le programme WebGL
   */
  private createProgram(vSource: string, fSource: string): WebGLProgram {
    const gl = this.gl;
    const vs = this.compileShader(vSource, gl.VERTEX_SHADER);
    const fs = this.compileShader(fSource, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Erreur Link Program: ' + gl.getProgramInfoLog(program));
    }
    return program;
  }

  private compileShader(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error('Erreur compilation Shader: ' + this.gl.getShaderInfoLog(shader));
    }
    return shader;
  }
}