import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      shake();
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      shake();
      return;
    }
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (result.error) { setError(result.error); shake(); return; }
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.doneBody}>
          <Text style={s.doneEmoji}>✅</Text>
          <Text style={s.doneTitle}>Password updated!</Text>
          <Text style={s.doneSub}>You can now log in with your new password.</Text>
          <TouchableOpacity
            onPress={() => router.replace('/auth')}
            activeOpacity={0.85}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={['#FFAA00', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btn}
            >
              <Text style={s.btnTxt}>Log In →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.body}>
          <Text style={s.emoji}>🔑</Text>
          <Text style={s.title}>Set a new password</Text>
          <Text style={s.sub}>Choose something you'll remember.</Text>

          <Animated.View style={[s.form, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={s.field}>
              <Text style={s.label}>New Password</Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, s.passwordInput]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
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

            <View style={s.field}>
              <Text style={s.label}>Confirm Password</Text>
              <TextInput
                style={s.input}
                placeholder="Same password again"
                placeholderTextColor={Colors.muted}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorTxt}>⚠️  {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.88} disabled={loading}>
              <LinearGradient
                colors={['#FFAA00', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btn}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={s.btnTxt}>Update Password →</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  body: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 8,
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 24,
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
  },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeTxt: { fontSize: 18 },

  errorBox: {
    backgroundColor: 'rgba(255,78,139,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,78,139,0.3)',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.coral },

  btn: { paddingVertical: 17, borderRadius: 15, alignItems: 'center', marginTop: 4 },
  btnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },

  // Done state
  doneBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 26, fontFamily: 'Nunito_900Black', color: Colors.text },
  doneSub: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
});
