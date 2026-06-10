// src/navigation/HomeNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { HomeStackParamList, MainTabParamList } from '../types/navigation';

import DashboardProjectsScreen from '../screens/project/DashboardProjectsScreen'; 
import StudioScreen from '../screens/project/StudioScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import VideoEditorScreen from '../screens/editor/VideoEditorScreen'; // 👈 Assurez-vous d'importer l'éditeur

const Stack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 1. Vos Onglets de navigation
function TabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: colors.background, height: 60 } }}>
      <Tab.Screen 
        name="Studio" 
        component={StudioScreen} 
        options={{ tabBarLabel: 'Studio', tabBarIcon: ({ color }) => <IconButton icon="auto-fix" iconColor={color} size={22} /> }} 
      />
      <Tab.Screen 
        name="DashboardProjects" 
        component={DashboardProjectsScreen} 
        options={{ tabBarLabel: 'Stockage', tabBarIcon: ({ color }) => <IconButton icon="folder-video" iconColor={color} size={22} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
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
