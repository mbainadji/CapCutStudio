import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// 1. Liste des écrans et leurs paramètres pour le flux d'authentification
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// 2. Liste des écrans pour les Onglets (Tabs)
export type MainTabParamList = {
  Studio: undefined;
  DashboardProjects: undefined;
  Profile: undefined;
};

// 3. Liste des écrans pour le Stack principal (inclut les Tabs)
export type HomeStackParamList = {
  Tabs: undefined; // Contient le TabNavigator
  VideoEditor: { projectId?: string; effectType?: string }; 
};

// 4. Types d'aide pour les écrans
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type HomeScreenProps<T extends keyof HomeStackParamList> = 
  NativeStackScreenProps<HomeStackParamList, T>;

export type HomeTabScreenProps<T extends keyof MainTabParamList> = 
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<HomeStackParamList>
  >;
