import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

export const colors = {
  primary: '#0052CC',       // Bleu Royal unique
  background: '#FFFFFF',    // Blanc pur (Fonds d'écrans)
  surface: '#FFFFFF',       // Blanc (Cartes)
  card: '#F0F6FF',          // Bleu ultra clair (Champs de texte)
  text: '#001E50',          // Bleu Marine très foncé (Lisibilité)
  textSecondary: '#6699FF', // Bleu ciel moyen (Sous-titres)
  border: '#0052CC',        // Bordures
  danger: '#FF3B30',        // Alertes
  white: '#FFFFFF',
};

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.card,
    onPrimary: colors.white,
    onBackground: colors.text,
    onSurface: colors.text,
    outline: colors.primary,
    error: colors.danger,
  },
};

interface ThemeContextType {
  colors: typeof colors;
  dimensions: { width: number; height: number };
}

const ThemeContext = createContext<ThemeContextType>({
  colors,
  dimensions: Dimensions.get('window'),
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDimensions(window));
    return () => sub?.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ colors, dimensions }}>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
