import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';

const GAME_ICONS = {
  memory:  require('../assets/icons/icon-memory.png'),
  speed:   require('../assets/icons/icon-speed.png'),
  pattern: require('../assets/icons/icon-pattern.png'),
  logic:   require('../assets/icons/icon-logic.png'),
};

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 80, 316);

const GAMES = [
  {
    icon: 'memory',
    label: 'Memory',
    color: '#E07B00',
    tint: '#FFE9C4',
    pos: 'topLeft',
  },
  {
    icon: 'speed',
    label: 'Speed',
    color: '#E8460A',
    tint: '#FFD9CC',
    pos: 'topRight',
  },
  {
    icon: 'pattern',
    label: 'Pattern',
    color: '#8B3FD9',
    tint: '#EEE0FF',
    pos: 'bottomLeft',
  },
  {
    icon: 'logic',
    label: 'Logic',
    color: '#D4006A',
    tint: '#FFD6ED',
    pos: 'bottomRight',
  },
] as const;

const CARD_POSITIONS = {
  topLeft:     { top: 12,    left: 10  },
  topRight:    { top: 28,    right: 10 },
  bottomLeft:  { bottom: 20, left: 16  },
  bottomRight: { bottom: 8,  right: 12 },
} as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────
function ThinkPopLogo() {
  return (
    <View style={logo.wrap}>
      <Text style={logo.base}>
        Think<Text style={logo.pop}>Pop</Text>
      </Text>
    </View>
  );
}

const logo = StyleSheet.create({
  wrap: { paddingTop: 4, alignItems: 'center' },
  base: {
    fontSize: 58,
    textAlign: 'center',
    fontFamily: 'Nunito_900Black',
    letterSpacing: -1.6,
    color: '#3D1A00',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pop: {
    color: Colors.coral,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const { isLoggedIn } = useAuthStore();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const boardAnim  = useRef(new Animated.Value(0)).current;
  const ctaAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const rotAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.spring(headerAnim, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.spring(boardAnim,  { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(ctaAnim,    { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    // Gentle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Very slow drift rotation
    Animated.loop(
      Animated.timing(rotAnim, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const entry = (anim: Animated.Value, dist = 24) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.55] });
  const boardRotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const cardCounter = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#FFF6EE', '#FFF0E4', '#FFE6D2']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Blobs */}
      <View style={[s.blob, s.blobTop]}  />
      <View style={[s.blob, s.blobSide]} />
      <View style={[s.blob, s.blobBtm]} />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.inner}>

          {/* Logo */}
          <Animated.View style={entry(headerAnim)}>
            <ThinkPopLogo />
          </Animated.View>

          {/* Card board */}
          <Animated.View style={[s.boardSection, entry(boardAnim, 30)]}>
            <View style={[s.board, { width: BOARD_SIZE, height: BOARD_SIZE + 20 }]}>
              {/* Glow orb */}
              <Animated.View style={[s.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

              {/* Slowly drifting card layer */}
              <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: boardRotate }] }]}>
                {GAMES.map((game) => (
                  <Animated.View
                    key={game.label}
                    style={[
                      s.card,
                      CARD_POSITIONS[game.pos],
                      { backgroundColor: game.tint, transform: [{ rotate: cardCounter }] },
                    ]}
                  >
                    <View style={s.cardIcon}>
                      <Image source={GAME_ICONS[game.icon]} style={{ width: 56, height: 56 }} resizeMode="contain" />
                    </View>
                    <Text style={[s.cardLabel, { color: game.color }]}>{game.label}</Text>
                  </Animated.View>
                ))}
              </Animated.View>
            </View>
          </Animated.View>

          {/* CTAs */}
          <Animated.View style={[s.ctas, entry(ctaAnim, 32)]}>
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
                <Text style={s.btnPlayTxt}>Play Now</Text>
                <Text style={s.btnPlayArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/brain')}
              activeOpacity={0.82}
              style={s.btnTrack}
            >
              <Text style={s.btnTrackTxt}>Track Progress</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe:      { flex: 1 },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },

  // Blobs
  blob: { position: 'absolute', borderRadius: 999 },
  blobTop:  { width: 280, height: 280, top: -90,   right: -70, backgroundColor: 'rgba(255,107,53,0.10)'  },
  blobSide: { width: 240, height: 240, left: -80,  top: '33%', backgroundColor: 'rgba(212,0,106,0.07)'  },
  blobBtm:  { width: 300, height: 300, bottom: -110, left: 20, backgroundColor: 'rgba(255,180,0,0.09)'  },

  // Board
  boardSection: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  board:        { position: 'relative', alignItems: 'center', justifyContent: 'center' },

  glow: {
    position: 'absolute',
    width: BOARD_SIZE * 0.5,
    height: BOARD_SIZE * 0.5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,107,53,0.14)',
  },

  card: {
    position: 'absolute',
    width: BOARD_SIZE * 0.44,
    minHeight: 100,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  cardIcon:  { marginBottom: 10, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 19, fontFamily: 'Nunito_900Black' },

  // CTAs
  ctas:   { gap: 14 },
  btnWrap: { width: '100%' },
  btnPlay: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 18,
    elevation: 8,
  },
  btnPlayTxt:   { fontSize: 20, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
  btnPlayArrow: { fontSize: 22, color: '#FFFFFF', marginTop: -1 },
  btnTrack: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(61,26,0,0.10)',
  },
  btnTrackTxt: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#3D1A00' },
});
