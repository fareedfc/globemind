import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';

const { width: SW } = Dimensions.get('window');

const GAME_CHIPS = [
  { icon: '🧩', label: 'Memory',  color: Colors.gold },
  { icon: '⚡', label: 'Speed',   color: Colors.coral },
  { icon: '🔤', label: 'Logic',   color: Colors.teal },
  { icon: '🔮', label: 'Pattern', color: Colors.purple },
];

export default function LandingScreen() {
  const { isLoggedIn, name } = useAuthStore();
  const { miles, streak } = usePlayerStore();

  // Entrance anims
  const headerAnim  = useRef(new Animated.Value(0)).current;
  const globeAnim   = useRef(new Animated.Value(0)).current;
  const chipsAnim   = useRef(new Animated.Value(0)).current;
  const ctaAnim     = useRef(new Animated.Value(0)).current;

  // Globe bob
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.spring(globeAnim,  { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(chipsAnim,  { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(ctaAnim,    { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    // Globe continuous bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const entryStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  });

  const bobStyle = {
    transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
  };

  return (
    <View style={s.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#061220', '#0B1D3A', '#0d2545']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Color blobs */}
      <View style={[s.blob, s.blobBlue]} />
      <View style={[s.blob, s.blobGold]} />
      <View style={[s.blob, s.blobTeal]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={s.inner}>

          {/* Header */}
          <Animated.View style={[s.header, entryStyle(headerAnim)]}>
            {isLoggedIn && name ? (
              <View style={s.welcomePill}>
                <Text style={s.welcomeTxt}>👋 Welcome back, {name}</Text>
                <Text style={s.welcomeStats}>✈️ {miles.toLocaleString()} miles · 🔥 {streak} streak</Text>
              </View>
            ) : (
              <View style={s.logoRow}>
                <Text style={s.logoEmoji}>✈️</Text>
                <Text style={s.logoName}>ThinkPop</Text>
              </View>
            )}
          </Animated.View>

          {/* Globe hero */}
          <Animated.View style={[s.globeWrap, entryStyle(globeAnim)]}>
            {/* Outer ring */}
            <View style={s.ring3} />
            <View style={s.ring2} />
            <View style={s.ring1} />
            {/* Floating globe */}
            <Animated.Text style={[s.globe, bobStyle]}>🌍</Animated.Text>
            {/* Headline overlaid below globe */}
          </Animated.View>

          {/* Headline */}
          <Animated.View style={[s.headline, entryStyle(globeAnim)]}>
            <Text style={s.headLine1}>Train your brain.</Text>
            <Text style={s.headLine2}>Travel the world.</Text>
          </Animated.View>

          {/* Game chips */}
          <Animated.View style={[s.chips, entryStyle(chipsAnim)]}>
            {GAME_CHIPS.map(c => (
              <View key={c.label} style={[s.chip, { borderColor: `${c.color}50` }]}>
                <Text style={s.chipIcon}>{c.icon}</Text>
                <Text style={[s.chipTxt, { color: c.color }]}>{c.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* CTAs */}
          <Animated.View style={[s.ctas, entryStyle(ctaAnim)]}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/journey')}
              activeOpacity={0.88}
              style={s.btnWrap}
            >
              <LinearGradient
                colors={['#FFAA00', '#FF6500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btnPlay}
              >
                <Text style={s.btnPlayEmoji}>▶</Text>
                <Text style={s.btnPlayTxt}>Play Now</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => isLoggedIn ? router.replace('/(tabs)/brain') : router.push('/auth')}
              activeOpacity={0.82}
              style={s.btnTrack}
            >
              <Text style={s.btnTrackTxt}>
                {isLoggedIn ? '📊 View My Progress' : '📊 Track Progress'}
              </Text>
            </TouchableOpacity>

            <Text style={s.footer}>
              {isLoggedIn ? '✓ Progress is saved' : 'Free to play · No account needed'}
            </Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const BLOB = 280;

const s = StyleSheet.create({
  container: { flex: 1 },

  blob: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
    borderRadius: BLOB / 2,
  },
  blobBlue: {
    backgroundColor: 'rgba(0,200,255,0.08)',
    top: -80,
    left: -60,
  },
  blobGold: {
    backgroundColor: 'rgba(255,140,0,0.07)',
    bottom: 40,
    right: -80,
  },
  blobTeal: {
    backgroundColor: 'rgba(0,229,160,0.06)',
    bottom: -60,
    left: -40,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Header
  header: { alignItems: 'center', width: '100%' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoEmoji: { fontSize: 28 },
  logoName: {
    fontSize: 30,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  welcomePill: {
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,160,0.25)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 2,
  },
  welcomeTxt: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.teal },
  welcomeStats: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.muted },

  // Globe
  globeWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(255,170,0,0.15)',
  },
  ring2: {
    position: 'absolute',
    width: 195,
    height: 195,
    borderRadius: 98,
    borderWidth: 1,
    borderColor: 'rgba(0,200,255,0.1)',
  },
  ring3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  globe: { fontSize: 110 },

  // Headline
  headline: { alignItems: 'center', gap: 2, marginTop: -8 },
  headLine1: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  headLine2: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
    letterSpacing: -0.3,
  },

  // Chips
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipIcon: { fontSize: 14 },
  chipTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold' },

  // CTAs
  ctas: { width: '100%', gap: 10, alignItems: 'center' },
  btnWrap: { width: '100%' },
  btnPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    paddingVertical: 20,
    shadowColor: '#FFAA00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  btnPlayEmoji: { fontSize: 18, color: '#1a1a2e' },
  btnPlayTxt: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    color: '#1a1a2e',
  },
  btnTrack: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  btnTrackTxt: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
  },

  footer: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(248,249,250,0.3)',
  },
});
