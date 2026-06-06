// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    // Tentative de connexion sur votre projet Supabase
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        <Surface style={[s.form, { backgroundColor: colors.background }]} elevation={0}>
          <Text variant="headlineMedium" style={[s.title, { color: colors.primary }]}>Connexion</Text>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginBottom: 24 }}>
            Connectez-vous à votre studio de montage intelligent.
          </Text>

          {/* Affichage dynamique de l'erreur en bicolore */}
          {!!error && <Text style={[s.error, { color: colors.danger, borderColor: colors.danger }]}>⚠️ {error}</Text>}

          <TextInput
            label="Adresse e-mail"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            textColor={colors.text}
            activeOutlineColor={colors.primary}
            outlineColor={colors.border}
            style={s.input}
            theme={{ colors: { onSurfaceVariant: colors.textSecondary } }}
          />

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            textColor={colors.text}
            activeOutlineColor={colors.primary}
            outlineColor={colors.border}
            style={s.input}
            theme={{ colors: { onSurfaceVariant: colors.textSecondary } }}
            right={
              <TextInput.Icon 
                icon={showPassword ? 'eye-off' : 'eye'} 
                color={colors.primary} 
                onPress={() => setShowPassword(!showPassword)} 
              />
            }
          />

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={isLoading} 
            disabled={isLoading} 
            style={s.btn} 
            buttonColor={colors.primary} 
            textColor={colors.white}
            labelStyle={s.btnLabel}
          >
            Se connecter
          </Button>

          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Register')} 
            textColor={colors.primary} 
            style={s.link}
          >
            Nouveau sur l'application ? Créer un compte
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  form: { padding: 8 },
  title: { fontWeight: 'bold', marginBottom: 4 },
  error: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 16, fontWeight: '500', backgroundColor: '#FFFFFF' },
  input: { marginBottom: 16, backgroundColor: '#FFFFFF' },
  btn: { borderRadius: 12, paddingVertical: 6, marginTop: 8 },
  btnLabel: { fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 16 }
});
