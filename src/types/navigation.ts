import { NativeStackScreenProps } from '@react-navigation/native-stack';

// 1. Liste des écrans et leurs paramètres pour le flux d'authentification
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// 2. Liste des écrans et leurs paramètres pour le flux principal
export type HomeStackParamList = {
  DashboardProjects: undefined;
  VideoEditor: { projectId?: string }; // Permet de passer optionnellement un ID de projet
  Profile: undefined;
};

// 3. Types d'aide pour typer le hook 'useNavigation' dans tes composants
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type HomeScreenProps<T extends keyof HomeStackParamList> = 
  NativeStackScreenProps<HomeStackParamList, T>;
