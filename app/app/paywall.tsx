import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useLives } from '../hooks/useLives';
import { MAX_LIVES } from '../stores/playerStore';

export default function PaywallScreen() {
  const { lives, timeUntilNext } = useLives();

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Back */}
      <TouchableOpacity style={s.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={s.backTxt}>← Back</Text>
      </TouchableOpacity>

      <View style={s.body}>
        {/* Hearts */}
        <View style={s.heartsRow}>
          {Array.from({ length: MAX_LIVES }, (_, i) => (
            <Text key={i} style={[s.heart, i < lives && s.heartFull]}>
              {i < lives ? '❤️' : '🖤'}
            </Text>
          ))}
        </View>

        <Text style={s.title}>You're out of lives</Text>
        <Text style={s.sub}>
          Lives refill automatically — one every 30 minutes. Go premium for unlimited play.
        </Text>

        {/* Countdown card */}
        {timeUntilNext ? (
          <View style={s.timerCard}>
            <Text style={s.timerLbl}>Next free life in</Text>
            <Text style={s.timerNum}>{timeUntilNext}</Text>
          </View>
        ) : lives > 0 ? (
          <View style={s.timerCard}>
            <Text style={s.timerLbl}>You have {lives} live{lives !== 1 ? 's' : ''}!</Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={[s.timerNum, { color: Colors.teal, fontSize: 18, marginTop: 4 }]}>
                Go play →
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Divider */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>or go premium</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Premium CTA */}
        <LinearGradient
          colors={['#FFD166', '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.premiumBtn}
        >
          <TouchableOpacity
            style={s.premiumBtnInner}
            activeOpacity={0.85}
            onPress={() => {
              // TODO: RevenueCat purchase flow
            }}
          >
            <Text style={s.premiumBtnTxt}>✈️  Get Premium — $6.99/mo</Text>
            <Text style={s.premiumBtnSub}>Unlimited play · No wait · Full Brain reports</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={s.finePrint}>Cancel any time. Billed monthly.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backTxt: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 32,
  },

  heartsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  heart: { fontSize: 32, opacity: 0.2 },
  heartFull: { opacity: 1 },

  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  timerCard: {
    width: '100%',
    backgroundColor: 'rgba(239,71,111,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,71,111,0.25)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.coral,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  timerNum: {
    fontSize: 36,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerTxt: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  premiumBtn: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 10,
  },
  premiumBtnInner: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  premiumBtnTxt: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  premiumBtnSub: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(26,26,46,0.65)',
  },

  finePrint: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    opacity: 0.5,
  },
});
