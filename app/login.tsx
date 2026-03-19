import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Dimensions, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../theme';

const { width, height } = Dimensions.get('window');

const GeminiLogo = () => (
  <View style={styles.logoContainer}>
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.logoGradient}
    >
      <Text style={styles.logoIcon}>✦</Text>
    </LinearGradient>
  </View>
);

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const { error: authError } = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (authError) setError(authError.message);
      else if (isSignUp) setSuccess('Account created! Check your email to confirm.');
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Background glow */}
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.content}>
          <GeminiLogo />

          <Text style={styles.title}>Gemini</Text>
          <Text style={styles.subtitle}>
            Your AI assistant — powered by Google's{'\n'}most capable models
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMid]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', minHeight: height },
  content: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xxl },

  glowTop: {
    position: 'absolute', top: -100, left: width / 2 - 150,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(79, 142, 247, 0.08)',
  },
  glowBottom: {
    position: 'absolute', bottom: -80, right: -50,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(155, 89, 245, 0.07)',
  },

  logoContainer: { marginBottom: SPACING.md },
  logoGradient: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: { fontSize: 32, color: '#fff' },

  title: {
    fontSize: 36, fontWeight: '700',
    color: COLORS.textPrimary, letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 20,
    marginBottom: SPACING.xl,
  },

  card: {
    width: '100%', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 20, fontWeight: '600',
    color: COLORS.textPrimary, marginBottom: SPACING.lg,
  },

  errorBox: {
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    borderRadius: RADIUS.md, padding: SPACING.sm,
    marginBottom: SPACING.md, borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.3)',
  },
  errorText: { color: COLORS.error, fontSize: 13 },
  successBox: {
    backgroundColor: 'rgba(52, 168, 83, 0.12)',
    borderRadius: RADIUS.md, padding: SPACING.sm,
    marginBottom: SPACING.md, borderWidth: 1,
    borderColor: 'rgba(52, 168, 83, 0.3)',
  },
  successText: { color: COLORS.success, fontSize: 13 },

  inputWrapper: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: '500' },
  input: {
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md,
    padding: SPACING.md, color: COLORS.textPrimary, fontSize: 15,
    borderWidth: 1, borderColor: COLORS.border,
  },

  primaryButton: { marginTop: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md },
  primaryButtonGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  switchText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 13 },
  switchLink: { color: COLORS.accent, fontWeight: '600' },

  footer: {
    color: COLORS.textMuted, fontSize: 11,
    textAlign: 'center', lineHeight: 16,
    paddingHorizontal: SPACING.md,
  },
});
