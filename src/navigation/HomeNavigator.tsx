// src/navigation/HomeNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

import DashboardProjectsScreen from '../screens/project/DashboardProjectsScreen'; 
import ProfileScreen from '../screens/profile/ProfileScreen';
import VideoEditorScreen from '../screens/editor/VideoEditorScreen'; // 👈 Assurez-vous d'importer l'éditeur

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Vos Onglets de navigation
function TabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: colors.background, height: 60 } }}>
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardProjectsScreen} 
        options={{ tabBarLabel: 'Studio', tabBarIcon: ({ color }) => <IconButton icon="video-film" iconColor={color} size={22} /> }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profil', tabBarIcon: ({ color }) => <IconButton icon="account" iconColor={color} size={22} /> }} 
      />
    </Tab.Navigator>
  );
}

// 2. Le Navigateur principal Home que charge votre AuthNavigator
export default function HomeNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      {/* ⚠️ ICI : Déclaration de VideoEditor au même niveau pour rendre la navigation fonctionnelle de partout */}
      <Stack.Screen name="VideoEditor" component={VideoEditorScreen} /> 
    </Stack.Navigator>
  );
}
