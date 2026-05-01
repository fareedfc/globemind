import { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, ActivityIndicator, Alert, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { Colors } from '../constants/colors';
import { useLives } from '../hooks/useLives';
import { usePlayerStore, MAX_LIVES } from '../stores/playerStore';

// Product identifiers — must match exactly what you create in App Store Connect + Google Play
const PREMIUM_MONTHLY_ID = 'thinkpop_unlimited_monthly';
const PREMIUM_ANNUAL_ID  = 'thinkpop_unlimited_annual';

// Set to 7 once you configure a free trial in App Store Connect / Google Play Console
const FREE_TRIAL_DAYS = 7;

const FEATURES = [
  { label: 'Daily levels',     free: '3 per day',                   premium: 'Unlimited' },
  { label: 'Lives',            free: `${MAX_LIVES}, slow refill`,   premium: 'Unlimited ♾️' },
  { label: 'Strengths',        free: 'Basic summary',               premium: 'Trends + detail' },
  { label: 'Weekly Report',    free: 'Score only',                  premium: 'Full breakdown' },
];

export default function PaywallScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { lives, timeUntilNext } = useLives();
  const { isPremium, setPremium } = usePlayerStore();

  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const btnAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.spring(btnAnim,   { toValue: 1, tension: 65, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    const targetId = plan === 'annual' ? PREMIUM_ANNUAL_ID : PREMIUM_MONTHLY_ID;
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.product.identifier === targetId
      ) ?? (plan === 'annual' ? offerings.current?.annual : offerings.current?.monthly);

      if (!pkg) {
        Alert.alert('Not available', 'Purchase unavailable right now. Try again later.');
        setLoading(false);
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = typeof customerInfo.entitlements.active['ThinkPop Unlimited'] !== 'undefined';
      if (isActive) {
        setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPurchased(true);
      }
    } catch (e: any) {
      if (e?.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        Alert.alert('Purchase failed', e?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive = typeof customerInfo.entitlements.active['ThinkPop Unlimited'] !== 'undefined';
      if (isActive) {
        setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPurchased(true);
      } else {
        Alert.alert('No purchases found', `No active subscription found for this ${Platform.OS === 'android' ? 'Google account' : 'Apple ID'}.`);
      }
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (purchased || isPremium) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.successBody}>
          <Text style={s.successEmoji}>👑</Text>
          <Text style={s.successTitle}>You're Unlimited!</Text>
          <Text style={s.successSub}>Unlimited lives, unlimited levels, full stats breakdown. Enjoy!</Text>
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
          {reason === 'daily' ? (
            <>
              <Text style={s.headerEmoji}>🌟</Text>
              <Text style={s.headerTitle}>You're on a roll!</Text>
              <Text style={s.headerSub}>
                You've played your 3 free levels for today. Go Unlimited for unlimited daily play and a detailed weekly report.
              </Text>
            </>
          ) : reason === 'stats' ? (
            <>
              <Text style={s.headerEmoji}>📊</Text>
              <Text style={s.headerTitle}>Unlock your full picture</Text>
              <Text style={s.headerSub}>
                See your weekly report, domain trends, perfect levels by domain, and which levels to replay — all in one place.
              </Text>
            </>
          ) : reason === 'upgrade' ? (
            <>
              <Text style={s.headerEmoji}>👑</Text>
              <Text style={s.headerTitle}>Go Unlimited</Text>
              <Text style={s.headerSub}>
                Unlimited levels, no waiting for lives, and the full stats breakdown. Everything ThinkPop has to offer.
              </Text>
            </>
          ) : (
            <>
              <View style={s.heartsRow}>
                {Array.from({ length: MAX_LIVES }, (_, i) => (
                  <Text key={i} style={s.heart}>🖤</Text>
                ))}
              </View>
              <Text style={s.headerTitle}>Your brain needs a breather</Text>
              <Text style={s.headerSub}>
                You've used all your lives. They refill one by one — but that takes a while.
              </Text>

              {timeUntilNext && (
                <View style={s.timerCard}>
                  <Text style={s.timerLbl}>⏳ Next life refills in</Text>
                  <Text style={s.timerNum}>{timeUntilNext}</Text>
                  <Text style={s.timerSub}>Full refill takes up to {MAX_LIVES * 30} minutes</Text>
                </View>
              )}

              <View style={s.orRow}>
                <View style={s.orLine} />
                <Text style={s.orTxt}>OR</Text>
                <View style={s.orLine} />
              </View>

              <View style={s.unlimitedCallout}>
                <Text style={s.unlimitedCalloutTitle}>👑 Never wait again</Text>
                <Text style={s.unlimitedCalloutSub}>Unlimited users play as much as they want, any time — no lives, no daily caps, no waiting.</Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Feature table */}
        <View style={s.tableWrap}>
          <View style={s.tableHeader}>
            <Text style={[s.tableCol, s.tableColLabel]} />
            <Text style={[s.tableCol, s.tableColFree]}>Free</Text>
            <Text style={[s.tableCol, s.tableColPremium]}>Unlimited</Text>
          </View>
          {FEATURES.map((f, i) => (
            <View key={f.label} style={[s.tableRow, i % 2 === 0 && s.tableRowAlt]}>
              <Text style={[s.tableCol, s.tableColLabel, s.tableRowLbl]}>{f.label}</Text>
              <Text style={[s.tableCol, s.tableColFree,    s.tableRowVal, s.tableRowFreeVal]}>{f.free}</Text>
              <Text style={[s.tableCol, s.tableColPremium, s.tableRowVal, s.tableRowPremVal]}>{f.premium}</Text>
            </View>
          ))}
        </View>

        {/* Plan toggle */}
        <Animated.View style={[s.ctaWrap, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <View style={s.planToggle}>
            <TouchableOpacity
              style={[s.planOption, plan === 'monthly' && s.planOptionActive]}
              onPress={() => { setPlan('monthly'); Haptics.selectionAsync(); }}
              activeOpacity={0.8}
            >
              <Text style={[s.planPrice, plan === 'monthly' && s.planPriceActive]}>$3.99</Text>
              <Text style={[s.planPeriod, plan === 'monthly' && s.planPeriodActive]}>per month</Text>
              <Text style={[s.planPer, plan === 'monthly' && s.planPerActive]}>cancel any time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.planOption, plan === 'annual' && s.planOptionActive]}
              onPress={() => { setPlan('annual'); Haptics.selectionAsync(); }}
              activeOpacity={0.8}
            >
              <View style={s.planSaveBadge}><Text style={s.planSaveTxt}>SAVE 48%</Text></View>
              <Text style={[s.planPrice, plan === 'annual' && s.planPriceActive]}>$24.99</Text>
              <Text style={[s.planPeriod, plan === 'annual' && s.planPeriodActive]}>per year</Text>
              <Text style={[s.planPer, plan === 'annual' && s.planPerActive]}>~$2.08/mo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handlePurchase} activeOpacity={0.88} disabled={loading} style={{ width: '100%' }}>
            <LinearGradient
              colors={['#4A0E8F', '#8B3FD9', '#C76FE8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.premiumBtn}
            >
              {loading ? (
                <ActivityIndicator color="#1a1a2e" style={{ paddingVertical: 20 }} />
              ) : (
                <>
                  <Text style={s.premiumBtnTxt}>
                    {FREE_TRIAL_DAYS > 0 ? `Try Free for ${FREE_TRIAL_DAYS} Days` : 'Go Unlimited'}
                  </Text>
                  <Text style={s.premiumBtnSub}>
                    {FREE_TRIAL_DAYS > 0
                      ? plan === 'annual' ? 'Then $24.99/yr · No ads · Unlimited play' : 'Then $3.99/mo · Cancel any time'
                      : 'No ads · Unlimited levels · Full stats'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRestore} activeOpacity={0.6} disabled={loading} style={s.restoreBtn}>
            <Text style={s.restoreTxt}>Restore Purchase</Text>
          </TouchableOpacity>

          <Text style={s.finePrint}>Cancel any time. Subscriptions auto-renew.</Text>
          <View style={s.legalRow}>
            <TouchableOpacity onPress={() => Linking.openURL('https://fareedfc.github.io/thinkpop-legal/terms.html')} activeOpacity={0.7}>
              <Text style={s.legalLink}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={s.legalSep}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.iubenda.com/privacy-policy/14041250')} activeOpacity={0.7}>
              <Text style={s.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  timerLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.coral,
    letterSpacing: 0.5,
  },
  timerNum: {
    fontSize: 38,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
  },
  timerSub: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    opacity: 0.6,
    marginTop: 2,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 16,
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orTxt: {
    fontSize: 11,
    fontFamily: 'Nunito_900Black',
    color: Colors.muted,
    letterSpacing: 1.5,
  },
  unlimitedCallout: {
    width: '100%',
    backgroundColor: 'rgba(139,63,217,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,63,217,0.3)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 6,
    marginBottom: 8,
  },
  unlimitedCalloutTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: '#C084FC',
  },
  unlimitedCalloutSub: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    lineHeight: 20,
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

  // Plan toggle
  planToggle: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 4,
  },
  planOption: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
  },
  planOptionActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(255,209,102,0.08)',
  },
  planSaveBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.coral,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  planSaveTxt: {
    fontSize: 9,
    fontFamily: 'Nunito_900Black',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    color: Colors.muted,
    marginTop: 6,
  },
  planPriceActive: { color: Colors.gold },
  planPeriod: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    opacity: 0.7,
  },
  planPeriodActive: { color: Colors.text, opacity: 1 },
  planPer: {
    fontSize: 10,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    opacity: 0.5,
  },
  planPerActive: { opacity: 0.8, color: Colors.muted },

  // CTA section
  ctaWrap: { alignItems: 'center', gap: 14 },
  premiumBtn: { width: '100%', borderRadius: 18, marginBottom: 2 },
  premiumBtnTxt: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingTop: 18,
    marginBottom: 2,
  },
  premiumBtnSub: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255,255,255,0.70)',
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
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legalLink: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    opacity: 0.5,
    textDecorationLine: 'underline',
  },
  legalSep: {
    fontSize: 11,
    color: Colors.muted,
    opacity: 0.3,
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
