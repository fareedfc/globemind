import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';

const BACKGROUND = require('../assets/landing-background.png');

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const { login, signUp, resendConfirmation, resetPassword } = useAuthStore();

  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const result =
      mode === 'signup'
        ? await signUp(name, email, password)
        : await login(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      shake();
      return;
    }

    if ('needsConfirmation' in result && result.needsConfirmation) {
      setAwaitingConfirmation(true);
      return;
    }

    router.replace('/(tabs)/journey');
  };

  const handleResend = async () => {
    if (resendCooldown) return;
    setResendCooldown(true);
    await resendConfirmation(email);
    setTimeout(() => setResendCooldown(false), 30_000);
  };

  const isSignup = mode === 'signup';

  if (awaitingConfirmation) {
    return (
      <ImageBackground source={BACKGROUND} style={{ flex: 1 }} resizeMode="cover">
        <View style={s.bgScrim} />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={s.confirmBody}>
          <Text style={s.confirmEmoji}>📬</Text>
          <Text style={s.confirmTitle}>Check your inbox</Text>
          <Text style={s.confirmSub}>
            We sent a confirmation link to{'\n'}
            <Text style={s.confirmEmail}>{email}</Text>
          </Text>
          <Text style={s.confirmHint}>
            Tap the link in the email to activate your account, then come back and log in.
          </Text>

          <TouchableOpacity
            onPress={handleResend}
            activeOpacity={resendCooldown ? 1 : 0.7}
            style={s.resendBtn}
          >
            <Text style={[s.resendTxt, resendCooldown && s.resendTxtDim]}>
              {resendCooldown ? 'Email sent — check your inbox' : "Didn't get it? Resend email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setAwaitingConfirmation(false); switchMode('login'); }}
            activeOpacity={0.7}
            style={s.resendBtn}
          >
            <Text style={s.loginLinkTxt}>Already confirmed? Log in →</Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BACKGROUND} style={{ flex: 1 }} resizeMode="cover">
      <View style={s.bgScrim} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={s.backTxt}>←  Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerEmoji}>🧩</Text>
            <Text style={s.headerTitle}>Save Your Progress</Text>
            <Text style={s.headerSub}>
              {isSignup
                ? 'Create an account to save your scores, stars, and streak.'
                : 'Welcome back — log in to see your progress.'}
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={s.toggle}>
            <TouchableOpacity
              style={[s.toggleTab, mode === 'signup' && s.toggleTabActive]}
              onPress={() => switchMode('signup')}
              activeOpacity={0.8}
            >
              <Text style={[s.toggleTxt, mode === 'signup' && s.toggleTxtActive]}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleTab, mode === 'login' && s.toggleTabActive]}
              onPress={() => switchMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[s.toggleTxt, mode === 'login' && s.toggleTxtActive]}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <Animated.View style={[s.form, { transform: [{ translateX: shakeAnim }] }]}>
            {isSignup && (
              <View style={s.field}>
                <Text style={s.label}>Your Name</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. Alex"
                  placeholderTextColor={Colors.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}

            <View style={s.field}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, s.passwordInput]}
                  placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                  placeholderTextColor={Colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity
                  style={s.eyeBtn}
                  onPress={() => setShowPassword(v => !v)}
                  activeOpacity={0.7}
                >
                  <Text style={s.eyeTxt}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot password */}
            {!isSignup && (
              <TouchableOpacity
                onPress={async () => {
                  if (!email.includes('@')) {
                    setError('Enter your email above first.');
                    shake();
                    return;
                  }
                  setLoading(true);
                  const result = await resetPassword(email);
                  setLoading(false);
                  if (result.error) { setError(result.error); shake(); return; }
                  setResetSent(true);
                  setError('');
                }}
                activeOpacity={0.7}
                style={s.forgotBtn}
              >
                <Text style={s.forgotTxt}>
                  {resetSent ? '✓ Reset link sent — check your inbox' : 'Forgot password?'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Error */}
            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorTxt}>⚠️  {error}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.88} disabled={loading}>
              <LinearGradient
                colors={isSignup ? ['#9333EA', '#6B21A8'] : ['#FFAA00', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.submitBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.submitTxt}>
                    {isSignup ? 'Create Account →' : 'Log In →'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Guest option */}
          <TouchableOpacity
            style={s.guestBtn}
            onPress={() => router.replace('/(tabs)/journey')}
            activeOpacity={0.7}
          >
            <Text style={s.guestTxt}>Continue without an account</Text>
          </TouchableOpacity>

          <Text style={s.privacyNote}>
            Your data stays on your device. No spam, ever.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  backBtn: { paddingVertical: 12, alignSelf: 'flex-start' },
  backTxt: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  header: { alignItems: 'center', paddingTop: 8, paddingBottom: 28, gap: 8 },
  headerEmoji: { fontSize: 40 },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  toggleTabActive: {
    backgroundColor: Colors.bg2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleTxt: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
  },
  toggleTxtActive: {
    color: Colors.text,
  },

  form: { gap: 16 },
  field: { gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeTxt: { fontSize: 18 },

  errorBox: {
    backgroundColor: 'rgba(255,78,139,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,78,139,0.3)',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.coral,
  },

  submitBtn: {
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitTxt: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },

  guestBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  guestTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textDecorationLine: 'underline',
  },

  privacyNote: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    opacity: 0.6,
  },

  forgotBtn: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotTxt: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.teal },

  // Email confirmation screen
  confirmBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  confirmEmoji: { fontSize: 64, marginBottom: 4 },
  confirmTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
  },
  confirmSub: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmEmail: {
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  confirmHint: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 21,
    opacity: 0.8,
    marginTop: 4,
  },
  resendBtn: { paddingVertical: 8 },
  resendTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
    textDecorationLine: 'underline',
  },
  resendTxtDim: { color: Colors.muted, textDecorationLine: 'none' },
  loginLinkTxt: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.gold,
  },
});
