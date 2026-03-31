import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';

const { width: SW } = Dimensions.get('window');

// Diamond positions: top, left, right, bottom
const CLUSTER = [
  { icon: '🧩', label: 'Memory',  color: Colors.gold,   border: '#F59E0B', bg: '#FFFBEB', pos: 'top'    },
  { icon: '⚡', label: 'Speed',   color: Colors.coral,  border: '#F97316', bg: '#FFF7ED', pos: 'left'   },
  { icon: '🔮', label: 'Pattern', color: Colors.purple, border: '#EC4899', bg: '#FDF2F8', pos: 'right'  },
  { icon: '🔤', label: 'Logic',   color: Colors.teal,   border: '#10B981', bg: '#ECFDF5', pos: 'bottom' },
];

// ─── ThinkPop Logo ───────────────────────────────────────────────────────────
function ThinkPopLogo() {
  const OUTLINE = '#FFFFFF';
  const THINK   = '#F97316';   // bright orange
  const POP     = '#EC4899';   // hot pink
  const OFFSETS = [-3, 3];

  return (
    <View style={logo.wrap}>
      {/* White outline layers — render text at slight offsets to fake a stroke */}
      {OFFSETS.map(dx =>
        OFFSETS.map(dy => (
          <Text
            key={`${dx}${dy}`}
            style={[logo.base, { position: 'absolute', color: OUTLINE, left: dx, top: dy }]}
          >
            {'Think'}
            <Text style={logo.popBase}>{'Pop'}</Text>
          </Text>
        ))
      )}
      {/* Coloured top layer */}
      <Text style={[logo.base, { color: THINK }]}>
        {'Think'}
        <Text style={[logo.popBase, { color: POP }]}>{'Pop'}</Text>
      </Text>
    </View>
  );
}

const logo = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 4,
  },
  base: {
    fontSize: 64,
    fontFamily: 'Nunito_900Black',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 6,
  },
  popBase: {
    fontSize: 74,          // Pop is bigger — punchy
    fontFamily: 'Nunito_900Black',
    letterSpacing: -1,
  },
  tag: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    marginTop: 6,
    textAlign: 'center',
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const { isLoggedIn, name } = useAuthStore();
  const { miles, streak }    = usePlayerStore();

  const headerAnim  = useRef(new Animated.Value(0)).current;
  const clusterAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim     = useRef(new Animated.Value(0)).current;

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance stagger
    Animated.stagger(120, [
      Animated.spring(headerAnim,  { toValue: 1, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.spring(clusterAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(ctaAnim,     { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    // Continuous circular orbit
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const entry = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
  });

  const containerRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const counterRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <View style={s.container}>
      {/* Warm gradient background */}
      <LinearGradient
        colors={['#F0FDF9', '#E6FEF4', '#CCFCE8']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative blobs */}
      <View style={[s.blob, s.blobTL]} />
      <View style={[s.blob, s.blobBR]} />
      <View style={[s.blob, s.blobBL]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={s.inner}>

          {/* Logo */}
          <Animated.View style={[{ alignItems: 'center' }, entry(headerAnim)]}>
            <ThinkPopLogo />
            {isLoggedIn && name && (
              <View style={s.welcomePill}>
                <Text style={s.welcomeTxt}>👋 Welcome back, {name}  ·  ✈️ {miles.toLocaleString()} miles  ·  🔥 {streak}</Text>
              </View>
            )}
          </Animated.View>

          {/* Game cluster — diamond layout orbiting */}
          <Animated.View style={[s.clusterWrap, entry(clusterAnim)]}>
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: containerRotate }] }]}>
              {CLUSTER.map((item) => (
                <Animated.View
                  key={item.label}
                  style={[s.bubbleWrap, s[`pos_${item.pos}` as keyof typeof s], { transform: [{ rotate: counterRotate }] }]}
                >
                  <View style={[s.bubble, { backgroundColor: item.bg, borderColor: item.border }]}>
                    <Text style={s.bubbleEmoji}>{item.icon}</Text>
                  </View>
                  <Text style={[s.bubbleLabel, { color: item.color }]}>{item.label}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          </Animated.View>

          {/* CTAs */}
          <Animated.View style={[s.ctas, entry(ctaAnim)]}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/journey')}
              activeOpacity={0.88}
              style={s.btnWrap}
            >
              <LinearGradient
                colors={['#FB923C', '#F97316']}
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

const BLOB = 260;

const s = StyleSheet.create({
  container: { flex: 1 },

  blob: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
    borderRadius: BLOB / 2,
  },
  blobTL: {
    backgroundColor: 'rgba(16,185,129,0.14)',
    top: -80, left: -60,
  },
  blobBR: {
    backgroundColor: 'rgba(236,72,153,0.1)',
    bottom: 60, right: -80,
  },
  blobBL: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    bottom: -40, left: -40,
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  welcomePill: {
    marginTop: 10,
    backgroundColor: 'rgba(0,201,167,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,201,167,0.25)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  welcomeTxt: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
    textAlign: 'center',
  },

  // Diamond cluster
  clusterWrap: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  bubbleWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  bubble: {
    width: 106,
    height: 106,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bubbleEmoji: { fontSize: 48 },
  bubbleLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    marginTop: 5,
    textAlign: 'center',
  },
  // Diamond positions (centered in 280x280 container, bubble is 106px wide)
  pos_top:    { top: 0,   left: 87 },   // center-top
  pos_left:   { top: 87,  left: 0  },   // left-mid
  pos_right:  { top: 87,  left: 174 },  // right-mid
  pos_bottom: { top: 174, left: 87 },   // center-bottom

  ctas: { width: '100%', gap: 10, alignItems: 'center' },
  btnWrap: { width: '100%' },
  btnPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    paddingVertical: 20,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  btnPlayEmoji: { fontSize: 18, color: '#FFFFFF' },
  btnPlayTxt: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
  btnTrack: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.25)',
    backgroundColor: 'rgba(59,130,246,0.07)',
    alignItems: 'center',
  },
  btnTrackTxt: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.blue,
  },
  footer: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
  },
});
