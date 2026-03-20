import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Dimensions, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Image } from 'expo-image';
import Animated, { 
  FadeIn,
  FadeInDown, 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/gemini-theme';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');
const logoSource = require('../assets/logo/dawn_logo_nobg.png');

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startFacebookFlow } = useOAuth({ strategy: 'oauth_facebook' });

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const redirectUrl = Linking.createURL('/');
      const { createdSessionId, setActive } = await startGoogleFlow({ redirectUrl });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }, [startGoogleFlow]);

  const handleFacebookSignIn = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const redirectUrl = Linking.createURL('/');
      const { createdSessionId, setActive } = await startFacebookFlow({ redirectUrl });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }, [startFacebookFlow]);

  const handleAuth = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!signInLoaded || !signUpLoaded) return;

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const result = await signUp.create({ emailAddress: email, password });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        if (result.status === 'complete') {
          await setSignUpActive({ session: result.createdSessionId });
        }
      } else {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
        }
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          <Animated.View entering={FadeIn.duration(1000)} style={styles.logoWrapper}>
            <Image source={logoSource} style={styles.logo} contentFit="contain" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.header}>
            <Text style={styles.title}>Dawn AI</Text>
            <Text style={styles.subtitle}>Intelligence at your fingertips.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMid]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { setIsSignUp(!isSignUp); setError(''); }}
              style={styles.toggle}
            >
              <Text style={styles.toggleText}>
                {isSignUp ? 'Have an account? ' : "New here? "}
                <Text style={styles.toggleLink}>{isSignUp ? 'Sign in' : 'Create one'}</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>or</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <View style={styles.socialContent}>
                  <Ionicons name="logo-google" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.socialText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { marginTop: -12 }]}
              onPress={handleFacebookSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <View style={styles.socialContent}>
                  <Ionicons name="logo-facebook" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.socialText}>Continue with Facebook</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms and Privacy Policy.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 40 },

logoWrapper: { 
  marginTop: 0, 
  marginBottom: 24,
  transform: [{ translateY: 60 }],   // ← positive = move down
},
  logo: { width: 150, height: 150 },

  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: '600', color: COLORS.textPrimary, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 },

  form: { width: '100%', maxWidth: 340 },

  errorBox: { marginBottom: 20, padding: 12, backgroundColor: 'rgba(234,67,53,0.1)', borderRadius: RADIUS.md },
  errorText: { color: COLORS.error, fontSize: 13, textAlign: 'center', fontWeight: '500' },

  socialButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  socialContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  socialText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, opacity: 0.2 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.textMuted },
  or: { marginHorizontal: 16, color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },

  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  primaryButton: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8, marginBottom: 24 },
  gradient: { paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  toggle: { alignSelf: 'center' },
  toggleText: { color: COLORS.textSecondary, fontSize: 13 },
  toggleLink: { color: COLORS.textPrimary, fontWeight: '600' },

  footer: { marginTop: 64, paddingBottom: 24 },
  footerText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', opacity: 0.5 },
});
