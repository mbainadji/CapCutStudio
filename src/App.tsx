import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';
import Config from 'react-native-config'; // Importez Config pour s'assurer que les variables d'environnement sont chargées

export default function App() {
  // Vous pouvez vérifier qu'une variable est bien chargée (utile pour le débogage)
  // console.log("GROQ_API_KEY:", Config.GROQ_API_KEY ? "Chargée" : "Non chargée");
  return (
    <ThemeProvider>
      {/* SafeAreaView force le contenu à ne pas se glisser sous l'encoche du téléphone */}
      <SafeAreaView style={s.container}>
        {/* Force les icônes de la barre d'état (heure, batterie) à être sombres sur fond blanc */}
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <RootNavigator />
      </SafeAreaView>
    </ThemeProvider>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fond blanc de secours pour toute l'application
  },
});
