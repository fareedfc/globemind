import { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { useLives } from '../hooks/useLives';
import { usePlayerStore, MAX_LIVES, FREE_DAILY_LEVELS } from '../stores/playerStore';

const FEATURES = [
  { label: 'Daily levels',     free: `${FREE_DAILY_LEVELS} per day`, premium: 'Unlimited' },
  { label: 'Lives',            free: `${MAX_LIVES}, slow refill`,   premium: 'Generous refill' },
  { label: 'Brain Score',      free: 'Basic summary',               premium: 'Full breakdown' },
  { label: 'Weekly Report',    free: 'Highlights only',             premium: 'Detailed analysis' },
  { label: 'All 4 game modes', free: '✓',                           premium: '✓ + future modes' },
];

export default function PaywallScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { lives, timeUntilNext } = useLives();
  const { isPremium, setPremium } = usePlayerStore();

  const [purchased, setPurchased] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.spring(btnAnim,   { toValue: 1, tension: 65, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePurchase = () => {
    // TODO: replace with RevenueCat purchase flow
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPremium(true);
    setPurchased(true);
  };

  const handleRestore = () => {
    // TODO: replace with RevenueCat restore flow
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (purchased || isPremium) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.successBody}>
          <Text style={s.successEmoji}>👑</Text>
          <Text style={s.successTitle}>You're Premium!</Text>
          <Text style={s.successSub}>Unlimited levels, more lives, full brain reports. Enjoy!</Text>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/journey')}
            activeOpacity={0.85}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={['#FFAA00', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.continueBtn}
            >
              <Text style={s.continueBtnTxt}>Keep Playing →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isDaily = reason === 'daily';

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <TouchableOpacity style={s.back} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={s.backTxt}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header block */}
        <Animated.View style={[s.header, { opacity: scaleAnim, transform: [{ scale: scaleAnim }] }]}>
          {isDaily ? (
            <>
              <Text style={s.headerEmoji}>📅</Text>
              <Text style={s.headerTitle}>Daily limit reached</Text>
              <Text style={s.headerSub}>
                Free players get {FREE_DAILY_LEVELS} levels a day. Come back tomorrow — or go unlimited right now.
              </Text>
            </>
          ) : (
            <>
              {/* Hearts row */}
              <View style={s.heartsRow}>
                {Array.from({ length: MAX_LIVES }, (_, i) => (
                  <Text key={i} style={[s.heart, i < lives && s.heartFull]}>
                    {i < lives ? '❤️' : '🖤'}
                  </Text>
                ))}
              </View>
              <Text style={s.headerTitle}>You're out of lives</Text>
              <Text style={s.headerSub}>
                Lives refill automatically — one every 30 minutes. Or go Premium for a generous refill and unlimited play.
              </Text>
              {timeUntilNext && (
                <View style={s.timerCard}>
                  <Text style={s.timerLbl}>Next free life in</Text>
                  <Text style={s.timerNum}>{timeUntilNext}</Text>
                </View>
              )}
            </>
          )}
        </Animated.View>

        {/* Feature table */}
        <View style={s.tableWrap}>
          <View style={s.tableHeader}>
            <Text style={[s.tableCol, s.tableColLabel]} />
            <Text style={[s.tableCol, s.tableColFree]}>Free</Text>
            <Text style={[s.tableCol, s.tableColPremium]}>Premium</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={f.label} style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}>
              <Text style={[s.tableCol, s.tableColLabel, s.tableRowLbl]}>{f.label}</Text>
              <Text style={[s.tableCol, s.tableColFree,    s.tableRowVal, s.tableRowFreeVal]}>{f.free}</Text>
              <Text style={[s.tableCol, s.tableColPremium, s.tableRowVal, s.tableRowPremVal]}>{f.premium}</Text>
            </View>
          ))}
        </View>

        {/* Purchase CTA */}
        <Animated.View style={[s.ctaWrap, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <TouchableOpacity onPress={handlePurchase} activeOpacity={0.88} style={{ width: '100%' }}>
            <LinearGradient
              colors={['#FFD166', '#FF9500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.premiumBtn}
            >
              <Text style={s.premiumBtnTxt}>Get Premium — $6.99/mo</Text>
              <Text style={s.premiumBtnSub}>Unlimited play · Full Brain reports</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore} activeOpacity={0.6} style={s.restoreBtn}>
            <Text style={s.restoreTxt}>Restore Purchase</Text>
          </TouchableOpacity>

          <Text style={s.finePrint}>Cancel any time. Billed monthly.</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  back: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backTxt: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Header
  header: { alignItems: 'center', paddingTop: 16, paddingBottom: 24 },
  headerEmoji: { fontSize: 56, marginBottom: 12 },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  heartsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  heart: { fontSize: 28, opacity: 0.2 },
  heartFull: { opacity: 1 },

  timerCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(239,71,111,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,71,111,0.25)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  timerLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.coral,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  timerNum: {
    fontSize: 32,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
  },

  // Feature table
  tableWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 28,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.025)' },
  tableCol: { flex: 1 },
  tableColLabel: { flex: 1.6 },
  tableColFree: { flex: 1, textAlign: 'center' },
  tableColPremium: { flex: 1.2, textAlign: 'center' },
  tableRowLbl: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
  },
  tableRowVal: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
  },
  tableRowFreeVal: { color: Colors.muted },
  tableRowPremVal: { color: Colors.gold },

  // CTA section
  ctaWrap: { alignItems: 'center', gap: 14 },
  premiumBtn: { width: '100%', borderRadius: 18, marginBottom: 2 },
  premiumBtnTxt: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: '#1a1a2e',
    textAlign: 'center',
    paddingTop: 18,
    marginBottom: 2,
  },
  premiumBtnSub: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(26,26,46,0.60)',
    textAlign: 'center',
    paddingBottom: 18,
  },

  restoreBtn: { paddingVertical: 4 },
  restoreTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textDecorationLine: 'underline',
  },
  finePrint: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    opacity: 0.5,
  },

  // Success state
  successBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  successEmoji: { fontSize: 72 },
  successTitle: {
    fontSize: 30,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
});
