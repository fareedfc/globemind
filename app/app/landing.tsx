import { useCallback, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Dimensions, Image, ImageBackground,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';

const GAME_ICONS = {
  memory:  require('../assets/icons/icon-memory.png'),
  speed:   require('../assets/icons/icon-speed.png'),
  pattern: require('../assets/icons/icon-pattern.png'),
  logic:   require('../assets/icons/icon-logic.png'),
};
const LANDING_BACKGROUND = require('../assets/landing-background.png');

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
      <Image
        source={require('../assets/icons/logo-thinkpop.png')}
        style={logo.img}
        resizeMode="contain"
      />
    </View>
  );
}

const logo = StyleSheet.create({
  wrap: { alignItems: 'center' },
  img:  { width: '100%', height: 200 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LandingScreen() {
  const { isLoggedIn } = useAuthStore();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const boardAnim  = useRef(new Animated.Value(0)).current;
  const ctaAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const rotAnim    = useRef(new Animated.Value(0)).current;
  const logoScale  = useRef(new Animated.Value(0.72)).current;
  const logoTilt   = useRef(new Animated.Value(-8)).current;

  const runEntrance = useCallback(() => {
    headerAnim.setValue(0);
    boardAnim.setValue(0);
    ctaAnim.setValue(0);
    logoScale.setValue(0.72);
    logoTilt.setValue(-8);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(logoScale, {
          toValue: 1.08,
          tension: 150,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 110,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(logoTilt, {
          toValue: 2,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoTilt, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(130, [
        Animated.spring(headerAnim, { toValue: 1, tension: 72, friction: 8, useNativeDriver: true }),
        Animated.spring(boardAnim,  { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.spring(ctaAnim,    { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [boardAnim, ctaAnim, headerAnim, logoScale, logoTilt]);

  useEffect(() => {
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
  }, [glowAnim, rotAnim]);

  useFocusEffect(
    useCallback(() => {
      runEntrance();
    }, [runEntrance])
  );

  const entry = (anim: Animated.Value, dist = 24) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const glowScale   = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.55] });
  const boardRotate = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const cardCounter = rotAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const headerOpacity = headerAnim;
  const headerTranslateX = headerAnim.interpolate({
    inputRange: [0, 0.62, 0.82, 1],
    outputRange: [-90, 12, -6, 0],
  });
  const headerTranslate = headerAnim.interpolate({
    inputRange: [0, 0.62, 0.82, 1],
    outputRange: [-96, 20, -10, 0],
  });
  const headerRotate = logoTilt.interpolate({
    inputRange: [-8, 0, 2],
    outputRange: ['-8deg', '0deg', '2deg'],
  });

  return (
    <View style={s.container}>
      <ImageBackground source={LANDING_BACKGROUND} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={s.bgScrim} />
      </ImageBackground>

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.inner}>

          {/* Logo */}
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [
                { translateX: headerTranslateX },
                { translateY: headerTranslate },
                { scale: logoScale },
                { rotate: headerRotate },
              ],
            }}
          >
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
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.replace('/(tabs)/journey'); }}
              activeOpacity={0.88}
              style={s.btnWrap}
            >
              <LinearGradient
                colors={['#9333EA', '#6B21A8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btnPlay}
              >
                <Text style={s.btnPlayTxt}>Play Now</Text>
                <Text style={s.btnPlayArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.replace('/(tabs)/brain'); }}
              activeOpacity={0.82}
              style={s.btnTrack}
            >
              <Text style={s.btnTrackTxt}>Track Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.push('/auth'); }}
              activeOpacity={0.6}
              style={s.btnSignIn}
            >
              <Text style={s.btnSignInTxt}>Sign In</Text>
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
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },

  // Board
  boardSection: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  board:        { position: 'relative', alignItems: 'center', justifyContent: 'center' },

  glow: {
    position: 'absolute',
    width: BOARD_SIZE * 0.5,
    height: BOARD_SIZE * 0.5,
    borderRadius: 999,
    backgroundColor: 'rgba(139,63,217,0.18)',
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
    shadowColor: '#6B21A8',
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
  btnSignIn: { alignItems: 'center', paddingVertical: 6 },
  btnSignInTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },
});
