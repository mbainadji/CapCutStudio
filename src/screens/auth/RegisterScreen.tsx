// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      setMsg('Veuillez remplir tous les champs.');
      setIsError(true);
      return;
    }
    setIsLoading(true);
    setMsg('');
    
    // Création du compte sur votre base PostgreSQL Supabase
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setMsg(error.message);
      setIsError(true);
    } else {
      setMsg('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setIsError(false);
    }
    setIsLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        <Surface style={[s.form, { backgroundColor: colors.background }]} elevation={0}>
          <Text variant="headlineMedium" style={[s.title, { color: colors.primary }]}>Créer un compte</Text>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginBottom: 24 }}>
            Rejoignez le studio de montage CapCutStudio.
          </Text>

          {/* Message d'état dynamique (Erreur ou Succès) */}
          {!!msg && (
            <Text style={[s.msg, { 
              color: isError ? colors.danger : colors.primary, 
              borderColor: isError ? colors.danger : colors.primary 
            }]}>
              {isError ? '⚠️ ' : '✅ '} {msg}
            </Text>
          )}

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
            secureTextEntry
            textColor={colors.text}
            activeOutlineColor={colors.primary}
            outlineColor={colors.border}
            style={s.input}
            theme={{ colors: { onSurfaceVariant: colors.textSecondary } }}
          />

          <Button 
            mode="contained" 
            onPress={handleRegister} 
            loading={isLoading} 
            disabled={isLoading} 
            style={s.btn} 
            buttonColor={colors.primary} 
            textColor={colors.white}
            labelStyle={s.btnLabel}
          >
            S'inscrire
          </Button>

          <Button mode="text" onPress={() => navigation.navigate('Login')} textColor={colors.primary} style={s.link}>
            Déjà inscrit ? Se connecter
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
  msg: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 16, fontWeight: '500', backgroundColor: '#FFFFFF' },
  input: { marginBottom: 16, backgroundColor: '#FFFFFF' },
  btn: { borderRadius: 12, paddingVertical: 6, marginTop: 8 },
  btnLabel: { fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 16 }
});
