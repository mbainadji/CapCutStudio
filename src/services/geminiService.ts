import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from 'react-native-config'; // Importez Config pour accéder aux variables d'environnement

const API_KEY = Config.GEMINI_API_KEY; // Récupération de la clé depuis .env
const genAI = new GoogleGenerativeAI(API_KEY);

export const askGemini = async (
  prompt: string,
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const result = await model.generateContent(
      prompt,
    );

    return result.response.text();
  } catch (error) {
    console.log(error);

    return 'Erreur Gemini';
  }
};