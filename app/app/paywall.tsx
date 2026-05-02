import { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, ActivityIndicator, Alert, Platform, Linking,
  Image, ImageBackground, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { Colors } from '../constants/colors';
import { useLives } from '../hooks/useLives';
import { usePlayerStore, MAX_LIVES } from '../stores/playerStore';

const BACKGROUND = require('../assets/landing-background.png');
const { width: SW } = Dimensions.get('window');

const PREMIUM_MONTHLY_ID = 'thinkpop_unlimited_monthly';
const PREMIUM_ANNUAL_ID  = 'thinkpop_unlimited_annual';
const FREE_TRIAL_DAYS    = 7;

const PURPLE      = '#8B3FD9';
const PURPLE_DARK = '#4A0E8F';
const GOLD        = '#FFAA00';

const BENEFITS = [
  { icon: require('../assets/icons/icon-explore.png'), title: 'Play Unlimited Levels',  sub: 'Free players get 10 levels a day — go unlimited for more', tint: 'rgba(139,63,217,0.13)', top: true  },
  { icon: require('../assets/icons/icon-heart.png'),   title: 'Never Run Out of Lives',  sub: 'Free players get 10 lives — unlimited users never wait',   tint: 'rgba(255,170,0,0.13)',  top: true  },
  { icon: require('../assets/icons/icon-speed.png'),   title: 'Track Your Strengths',    sub: 'See where you shine and improve faster',      tint: 'rgba(139,63,217,0.08)', top: false },
  { icon: require('../assets/icons/icon-chart.png'),   title: 'Full Progress Insights',  sub: 'Detailed weekly performance breakdown',       tint: 'rgba(255,170,0,0.08)', top: false },
];

const SPARKLES = [
  { x: SW * 0.07, y: 70,  size: 5, color: GOLD,   delay: 0   },
  { x: SW * 0.88, y: 90,  size: 4, color: PURPLE,  delay: 500 },
  { x: SW * 0.82, y: 200, size: 5, color: GOLD,   delay: 900 },
];

function SparkleParticle({ x, y, size, color, delay }: typeof SPARKLES[0]) {
  const anim = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity: anim,
      }}
    />
  );
}

export default function PaywallScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { lives, timeUntilNext } = useLives();
  const { isPremium, setPremium } = usePlayerStore();

  const [plan, setPlan]           = useState<'monthly' | 'annual'>('annual');
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading]     = useState(false);

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const btnAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(1)).current;
  const ctaPulse   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(btnAnim,   { toValue: 1, tension: 55, friction: 10, useNativeDriver: true, delay: 200 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.5, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1,   duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, { toValue: 1.025, duration: 900, useNativeDriver: true }),
        Animated.timing(ctaPulse, { toValue: 1,     duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    const targetId = plan === 'annual' ? PREMIUM_ANNUAL_ID : PREMIUM_MONTHLY_ID;
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.product.identifier === targetId
      ) ?? (plan === 'annual' ? offerings.current?.annual : offerings.current?.monthly);
      if (!pkg) { Alert.alert('Not available', 'Purchase unavailable right now. Try again later.'); setLoading(false); return; }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = typeof customerInfo.entitlements.active['ThinkPop Unlimited'] !== 'undefined';
      if (isActive) { setPremium(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setPurchased(true); }
    } catch (e: any) {
      if (e?.code !== PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)
        Alert.alert('Purchase failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive = typeof customerInfo.entitlements.active['ThinkPop Unlimited'] !== 'undefined';
      if (isActive) { setPremium(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setPurchased(true); }
      else Alert.alert('No purchases found', `No active subscription found for this ${Platform.OS === 'android' ? 'Google account' : 'Apple ID'}.`);
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  if (purchased || isPremium) {
    return (
      <ImageBackground source={BACKGROUND} style={s.bg} resizeMode="cover">
        <View style={s.bgScrim} />
        <SafeAreaView style={s.container} edges={['top', 'bottom']}>
          <View style={s.successBody}>
            <Text style={s.successEmoji}>👑</Text>
            <Text style={s.successTitle}>You're Unlimited!</Text>
            <Text style={s.successSub}>Unlimited lives, unlimited levels, full stats breakdown. Enjoy!</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/journey')} activeOpacity={0.85} style={{ width: '100%' }}>
              <LinearGradient colors={['#FF8A00', '#FF5DA2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.continueBtn}>
                <Text style={s.continueBtnTxt}>Keep Playing →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const contextTrigger =
    reason === 'lives'   ? { emoji: '💔', text: "You're out of lives" } :
    reason === 'daily'   ? { emoji: '📅', text: 'Daily limit reached'  } :
    reason === 'stats'   ? { emoji: '📊', text: 'Unlock your full picture' } :
    null;

  return (
    <ImageBackground source={BACKGROUND} style={s.bg} resizeMode="cover">
      <View style={s.bgScrim} />
      {SPARKLES.map((sp, i) => <SparkleParticle key={i} {...sp} />)}

      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <TouchableOpacity style={s.back} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>

        {contextTrigger && (
          <View style={s.contextRow}>
            <Text style={s.contextTxt}>{contextTrigger.emoji} {contextTrigger.text}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero ──────────────────────────────────────────────────────── */}
          <Animated.View style={[s.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={s.crownWrap}>
              <Animated.View style={[s.crownGlowOuter, {
                transform: [{ scale: glowAnim }],
                opacity: glowAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.18, 0] }),
              }]} />
              <Animated.View style={[s.crownGlowInner, {
                transform: [{ scale: glowAnim.interpolate({ inputRange: [1, 1.5], outputRange: [1, 1.25] }) }],
                opacity: glowAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.45, 0.1] }),
              }]} />
              <Image source={require('../assets/icons/icon-crown-hero.png')} style={s.crownImg} resizeMode="contain" />
            </View>
            <Text style={s.heroTitle}>
              {reason === 'lives'  ? 'Keep Your Streak Alive'    :
               reason === 'daily'  ? "You're On a Roll!"          :
               reason === 'stats'  ? 'Unlock Your Full Picture'   :
               'Unlock Unlimited Play'}
            </Text>
            <View style={s.heroSubWrap}>
              <Text style={s.heroSub}>No waiting. No limits. Just keep playing.</Text>
            </View>

            {reason === 'lives' && timeUntilNext && (
              <View style={s.timerCard}>
                <View>
                  <Text style={s.timerLbl}>⏳ Next life refills in</Text>
                  <Text style={s.timerSub}>Go Unlimited and never wait</Text>
                </View>
                <Text style={s.timerNum}>{timeUntilNext}</Text>
              </View>
            )}
          </Animated.View>

          {/* ── Benefits ──────────────────────────────────────────────────── */}
          <Animated.View style={{ opacity: fadeAnim }}>
            {BENEFITS.map((b) => (
              <View key={b.title} style={[s.benefitRow, b.top && s.benefitRowTop]}>
                <View style={[s.benefitIcon, { backgroundColor: b.tint }, b.top && s.benefitIconTop]}>
                  <Image source={b.icon} style={[s.benefitIco, b.top && s.benefitIcoTop]} resizeMode="contain" />
                </View>
                <View style={s.benefitText}>
                  <Text style={[s.benefitTitle, b.top && s.benefitTitleTop]}>{b.title}</Text>
                  <Text style={s.benefitSub}>{b.sub}</Text>
                </View>
                <View style={s.benefitCheck}>
                  <Text style={s.checkmark}>✓</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* ── Urgency ───────────────────────────────────────────────────── */}
          <View style={s.urgencyRow}>
            <Text style={s.urgencyTxt}>Don't lose your streak 🔥</Text>
          </View>

          {/* ── Pricing ───────────────────────────────────────────────────── */}
          <Animated.View style={[s.pricingWrap, { opacity: btnAnim, transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <View style={s.planToggle}>
              {/* Monthly */}
              <TouchableOpacity
                style={[s.planCard, plan === 'monthly' && s.planCardActive]}
                onPress={() => { setPlan('monthly'); Haptics.selectionAsync(); }}
                activeOpacity={0.85}
              >
                {plan === 'monthly' && (
                  <LinearGradient colors={['#4A0E8F', '#8B3FD9', '#C76FE8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
                )}
                <Text style={[s.planPrice,  plan === 'monthly' && s.planPriceActive]}>$3.99</Text>
                <Text style={[s.planPeriod, plan === 'monthly' && s.planPeriodActive]}>per month</Text>
                <Text style={[s.planPer,    plan === 'monthly' && s.planPerActive]}>cancel any time</Text>
              </TouchableOpacity>

              {/* Annual — dominant */}
              <TouchableOpacity
                style={[s.planCard, s.planCardAnnual, plan === 'annual' && s.planCardActive]}
                onPress={() => { setPlan('annual'); Haptics.selectionAsync(); }}
                activeOpacity={0.85}
              >
                {plan === 'annual' && (
                  <LinearGradient colors={['#4A0E8F', '#8B3FD9', '#C76FE8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
                )}
                <View style={s.bestValueBadge}><Text style={s.bestValueTxt}>BEST VALUE</Text></View>
                <Text style={[s.planPrice,  plan === 'annual' && s.planPriceActive, s.planPriceAnnual]}>$24.99</Text>
                <Text style={[s.planPeriod, plan === 'annual' && s.planPeriodActive]}>per year</Text>
                <Text style={[s.planPer,    plan === 'annual' && s.planPerActive]}>~$2.08/mo</Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <Animated.View style={[s.ctaWrap, { transform: [{ scale: ctaPulse }] }]}>
              <TouchableOpacity onPress={handlePurchase} activeOpacity={0.88} disabled={loading} style={{ width: '100%' }}>
                <LinearGradient
                  colors={['#3A0870', '#7B2FBE', '#C76FE8']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.ctaGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" style={{ paddingVertical: 22 }} />
                  ) : (
                    <>
                      <Text style={s.ctaTxt}>
                        ⚡ {FREE_TRIAL_DAYS > 0 ? 'Start Free & Play Unlimited' : 'Go Unlimited'}
                      </Text>
                      <Text style={s.ctaSub}>
                        {FREE_TRIAL_DAYS > 0
                          ? `${FREE_TRIAL_DAYS}-day free trial • Cancel anytime`
                          : plan === 'annual' ? '$24.99/yr • Cancel anytime' : '$3.99/mo • Cancel anytime'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <TouchableOpacity onPress={handleRestore} activeOpacity={0.6} disabled={loading} style={s.restoreBtn}>
              <Text style={s.restoreTxt}>Restore Purchase</Text>
            </TouchableOpacity>
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
    </ImageBackground>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 3,
};

const s = StyleSheet.create({
  bg:      { flex: 1 },
  bgScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.62)' },
  container: { flex: 1 },

  back:    { paddingHorizontal: 20, paddingTop: 9, paddingBottom: 2 },
  backTxt: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  // ── Context trigger ──────────────────────────────────────────────────────
  contextRow: {
    alignSelf: 'center',
    backgroundColor: 'rgba(139,63,217,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(139,63,217,0.22)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 4,
  },
  contextTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#6B21D9' },

  scroll: { paddingHorizontal: 22, paddingBottom: 32 },

  // ── Hero ────────────────────────────────────────────────────────────────
  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 18 },
  crownWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  crownGlowOuter: {
    position: 'absolute',
    width: 108, height: 108, borderRadius: 54,
    backgroundColor: '#C76FE8',
  },
  crownGlowInner: {
    position: 'absolute',
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: GOLD,
  },
  crownImg: { width: 72, height: 72 },
  heroTitle: {
    fontSize: 26, fontFamily: 'Nunito_900Black', color: '#1A1A2E',
    textAlign: 'center', marginBottom: 9, lineHeight: 32,
  },
  heroSubWrap: {
    backgroundColor: 'rgba(139,63,217,0.10)',
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(139,63,217,0.20)',
  },
  heroSub: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#8B3FD9', textAlign: 'center' },

  timerCard: {
    marginTop: 12, width: '100%',
    backgroundColor: 'rgba(239,71,111,0.1)', borderWidth: 1,
    borderColor: 'rgba(239,71,111,0.25)', borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  timerLbl: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.coral, letterSpacing: 0.5 },
  timerNum: { fontSize: 26, fontFamily: 'Nunito_900Black', color: '#1A1A2E' },
  timerSub: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: Colors.muted },

  // ── Benefits ────────────────────────────────────────────────────────────
  benefitRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,250,244,0.88)',
    borderRadius: 16, padding: 12, marginBottom: 8, gap: 11,
    ...CARD_SHADOW,
  },
  benefitRowTop: {
    backgroundColor: 'rgba(255,250,244,0.97)',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  benefitIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  benefitIconTop: { width: 50, height: 50, borderRadius: 25 },
  benefitIco:    { width: 24, height: 24 },
  benefitIcoTop: { width: 28, height: 28 },
  benefitText: { flex: 1, gap: 2 },
  benefitTitle:    { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A2E' },
  benefitTitleTop: { fontSize: 16 },
  benefitSub:  { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.muted, lineHeight: 17 },
  benefitCheck: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(139,63,217,0.10)', alignItems: 'center', justifyContent: 'center' },
  checkmark:    { fontSize: 16, fontFamily: 'Nunito_900Black', color: PURPLE },

  // ── Urgency ─────────────────────────────────────────────────────────────
  urgencyRow: { alignItems: 'center', paddingVertical: 9 },
  urgencyTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#8B3FD9', textAlign: 'center' },

  // ── Pricing ─────────────────────────────────────────────────────────────
  pricingWrap: { gap: 12 },
  planToggle:  { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  planCard: {
    flex: 1, borderRadius: 16, borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingVertical: 14, paddingHorizontal: 10,
    alignItems: 'center', gap: 2,
    position: 'relative', overflow: 'hidden',
    ...CARD_SHADOW,
  },
  planCardAnnual: {},
  planCardActive: {
    borderColor: PURPLE,
    paddingVertical: 16,
    shadowColor: PURPLE,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  bestValueBadge: {
    position: 'absolute', top: -1,
    backgroundColor: GOLD,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  bestValueTxt:    { fontSize: 9, fontFamily: 'Nunito_900Black', color: '#fff', letterSpacing: 0.8 },
  planPrice:       { fontSize: 23, fontFamily: 'Nunito_900Black', color: Colors.muted, marginTop: 8 },
  planPriceAnnual: {},
  planPriceActive: { color: '#FFFFFF', fontSize: 25 },
  planPeriod:      { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, opacity: 0.7 },
  planPeriodActive:{ color: 'rgba(255,255,255,0.9)', opacity: 1 },
  planPer:         { fontSize: 10, fontFamily: 'Nunito_400Regular', color: Colors.muted, opacity: 0.5 },
  planPerActive:   { color: 'rgba(255,255,255,0.7)', opacity: 1 },

  // ── CTA ─────────────────────────────────────────────────────────────────
  ctaWrap: {
    width: '100%', borderRadius: 22,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 22,
    elevation: 10,
  },
  ctaGradient: { width: '100%', borderRadius: 22 },
  ctaTxt: {
    fontSize: 18, fontFamily: 'Nunito_900Black', color: '#FFFFFF',
    textAlign: 'center', paddingTop: 17, marginBottom: 2,
  },
  ctaSub: {
    fontSize: 12, fontFamily: 'Nunito_700Bold', color: 'rgba(255,255,255,0.80)',
    textAlign: 'center', paddingBottom: 17,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  restoreBtn: { alignItems: 'center', paddingVertical: 4 },
  restoreTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted, textDecorationLine: 'underline' },
  legalRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  legalLink:  { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, opacity: 0.5, textDecorationLine: 'underline' },
  legalSep:   { fontSize: 11, color: Colors.muted, opacity: 0.3 },

  // ── Success ─────────────────────────────────────────────────────────────
  successBody:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  successEmoji:   { fontSize: 72 },
  successTitle:   { fontSize: 30, fontFamily: 'Nunito_900Black', color: Colors.gold, textAlign: 'center' },
  successSub:     { fontSize: 15, fontFamily: 'Nunito_400Regular', color: Colors.muted, textAlign: 'center', lineHeight: 24, marginBottom: 8 },
  continueBtn:    { width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  continueBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
});
