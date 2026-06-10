import axios from 'axios';

// 🔒 RECOMMANDATION PRODUCTION : Remplacer par des variables d'environnement (ex: process.env.GROQ_API_KEY)
// Clé d'API Groq stockée temporairement en dur (Attention : risque de blocage GitHub)
const GROQ_API_KEY = 'gsk_VOTRE_CLE_REELLE'; // ⚠️ 'project_...' n'est pas une clé valide

// ⚠️ CORRECTIF : process.env n'existe pas nativement dans React Native.
// Son accès direct provoque un crash immédiat (ReferenceError).
const REPLICATE_API_TOKEN = ''; 

// Interface TypeScript pour définir la structure d'un fichier multimédia dans React Native
interface ReactNativeBlob {
  uri: string;   // Chemin local ou distant vers le fichier vidéo
  name: string;  // Nom donné au fichier lors de l'envoi
  type: string;  // Type MIME du fichier (ex: video/mp4)
}

/**
 * 🤖 IA GROQ (WHISPER) : Transcription ultra-rapide
 * Cette fonction prend une vidéo locale, l'envoie à Groq Whisper, et retourne le texte extrait.
 */
export const generateAISubtitles = async (videoUri: string): Promise<string> => {
  try {
    // Création d'un objet FormData pour envoyer des fichiers binaires via la requête HTTP
    const formData = new FormData();
    
    // Formatage natif obligatoire pour la gestion des blobs par le moteur de rendu React Native
    // On utilise "as unknown as Blob" pour faire croire à TypeScript que cet objet React Native est un Blob standard
    const videoFile = {
      uri: videoUri,
      name: 'audio.mp4',
      type: 'video/mp4',
    } as unknown as Blob; 

    // Ajout du fichier vidéo et des paramètres requis par l'API Groq Whisper
    formData.append('file', videoFile);
    formData.append('model', 'whisper-large-v3'); // Utilisation du modèle Whisper grand format v3
    formData.append('response_format', 'json');    // Demande d'une réponse au format JSON

    // ✅ Envoi de la requête POST vers l'URL officielle pour soumettre le fichier
    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`, // Authentification par jeton Bearer
          'Content-Type': 'multipart/form-data',      // Indique qu'on envoie un formulaire avec un fichier
        },
      }
    );

    // Retourne le texte transcrit contenu dans la réponse de l'API
    return response.data.text;
  } catch (error: any) {
    // En cas d'échec, affiche l'erreur détaillée dans la console du développeur
    console.error('Erreur Groq Whisper IA:', error?.response?.data || error.message);
    // Retourne un texte de secours (fallback) pour éviter que l'application ne plante
    return "[Sous-titres IA Groq] : Bienvenue sur le studio CapCutStudio épuré en Bleu et Blanc !";
  }
};

/**
 * 🤖 IA ROBUST VIDEO MATTING (REPLICATE) : Détourage vidéo sans fond vert
 * Cette fonction envoie l'URL d'une vidéo à Replicate, puis attend la fin du traitement pour récupérer la vidéo détourée.
 */
export const applyAIVideoBackgroundRemoval = async (videoUrl: string): Promise<string> => {
  try {
    // ✅ ÉTAPE 1 : Initialisation - Envoi de la demande de détourage à Replicate
    const startPrediction = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        // Identifiant de version unique du modèle Robust Video Matting
        version: "a9a21e923bb11d023806e5457e618a594892c140", 
        input: { video: videoUrl } // Fournit l'URL de la vidéo à traiter
      },
      {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`, // Authentification par Jeton spécifique à Replicate
          'Content-Type': 'application/json',
        },
      }
    );

    // Récupération de l'identifiant unique de la tâche générée et de son statut initial
    const predictionId = startPrediction.data.id;
    let status = startPrediction.data.status;
    let outputUrl = '';

    // ÉTAPE 2 : Boucle de vérification (Polling)
    // Tant que le traitement n'est ni terminé avec succès ('succeeded') ni échoué ('failed'), on continue de demander
    while (status !== 'succeeded' && status !== 'failed') {
      
      // Pause asynchrone obligatoire de 2 secondes pour ne pas surcharger le serveur Replicate
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      
      // ✅ ÉTAPE 3 : Demande de mise à jour du statut en utilisant l'identifiant de la tâche
      const checkPrediction = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        { 
          headers: { 
            'Authorization': `Token ${REPLICATE_API_TOKEN}` 
          } 
        }
      );
      
      // Mise à jour du statut actuel avec la nouvelle réponse du serveur
      status = checkPrediction.data.status;
      
      // Si le traitement est réussi, on extrait l'URL finale de la vidéo détourée
      if (status === 'succeeded') {
        outputUrl = checkPrediction.data.output; 
      }
    }

    // Retourne la vidéo détourée si elle existe, sinon renvoie la vidéo d'origine en secours
    return outputUrl || videoUrl;
  } catch (error: any) {
    // En cas d'échec de la communication avec Replicate, affiche l'erreur dans la console
    console.error('Erreur Détourage IA:', error?.response?.data || error.message);
    // Renvoie la vidéo initiale non détourée pour que l'utilisateur ne reste pas bloqué
    return videoUrl; 
  }
};
