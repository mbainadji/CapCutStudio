import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
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
