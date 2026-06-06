import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

import DashboardProjectsScreen from '../screens/project/DashboardProjectsScreen'; 
import ProfileScreen from '../screens/profile/ProfileScreen';

// Écran temporaire pour le 3ème onglet des projets stockés en ligne/cloud
import { View } from 'react-native';
import { Text } from 'react-native-paper';
function ProjetsStockesScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 }}>
      <Text variant="titleMedium" style={{ color: colors.text, fontWeight: 'bold' }}>Projets Stockés (Cloud)</Text>
      <Text variant="bodyMedium" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
        Vos sauvegardes cloud synchronisées avec PostgreSQL s'afficheront ici.
      </Text>
    </View>
  );
}

export type TabParamList = {
  DashboardTab: undefined;   // Onglet 1 : Projets locaux courants
  CloudTab: undefined;       // Onglet 2 : NOUVEAU - Projets sauvegardés/stockés
  ProfileTab: undefined;     // Onglet 3 : Profil utilisateur
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function HomeNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.card, 
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          elevation: 0, 
          shadowOpacity: 0, 
        },
        tabBarActiveTintColor: colors.primary,      
        tabBarInactiveTintColor: colors.inactive,   
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11, marginBottom: 4 }
      }}
    >
      {/* Onglet 1 : Vos Projets Locaux / Éditeur */}
      <Tab.Screen
        name="DashboardTab"
        component={DashboardProjectsScreen}
        options={{
          tabBarLabel: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <IconButton 
              icon={focused ? 'video-film' : 'video-outline'} 
              iconColor={color} 
              size={24} 
              style={{ margin: 0 }}
            />
          ),
        }}
      />

      {/* Onglet 2 : NOUVEAU - Projets Stockés en Base de Données */}
      <Tab.Screen
        name="CloudTab"
        component={ProjetsStockesScreen}
        options={{
          tabBarLabel: 'Stockés',
          tabBarIcon: ({ color, focused }) => (
            <IconButton 
              icon={focused ? 'cloud-check' : 'cloud-outline'} 
              iconColor={color} 
              size={24} 
              style={{ margin: 0 }}
            />
          ),
        }}
      />

      {/* Onglet 3 : Profil */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <IconButton 
              icon={focused ? 'account' : 'account-outline'} 
              iconColor={color} 
              size={24} 
              style={{ margin: 0 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
