import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../stores/authStore';

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_W - 80, 316);

const GAMES = [
  {
    icon: 'memory',
    label: 'Memory',
    color: '#F59E0B',
    tint: '#FFE7A8',
    pos: 'topLeft',
  },
  {
    icon: 'speed',
    label: 'Speed',
    color: '#F97316',
    tint: '#FFD1B3',
    pos: 'topRight',
  },
  {
    icon: 'pattern',
    label: 'Pattern',
    color: '#0EA5A4',
    tint: '#B9F3EA',
    pos: 'bottomLeft',
  },
  {
    icon: 'logic',
    label: 'Logic',
    color: '#2563EB',
    tint: '#C9D9FF',
    pos: 'bottomRight',
  },
] as const;

const CARD_POSITIONS = {
  topLeft: { top: 16, left: 14 },
  topRight: { top: 28, right: 14 },
  bottomLeft: { bottom: 26, left: 20 },
  bottomRight: { bottom: 12, right: 16 },
} as const;

function ThinkPopLogo() {
  return (
    <View style={logo.wrap}>
      <Text style={logo.base}>
        Think
        <Text style={logo.pop}>Pop</Text>
      </Text>
    </View>
  );
}

function CategoryIcon({
  type,
  color,
}: {
  type: (typeof GAMES)[number]['icon'];
  color: string;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 2.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={42} height={42} viewBox="0 0 30 30" fill="none">
      {type === 'memory' ? (
        <>
          <Rect x="5" y="8" width="10" height="10" rx="3" {...stroke} />
          <Rect x="15" y="12" width="10" height="10" rx="3" {...stroke} opacity="0.95" />
        </>
      ) : null}

      {type === 'speed' ? (
        <>
          <Path d="M7 18L13 11H17L13.8 16H19.5L12.5 23H9.4L12.6 18H7Z" fill={color} />
          <Path d="M20.5 9.5L23 7" {...stroke} opacity="0.75" />
          <Path d="M21.5 14L25 14" {...stroke} opacity="0.75" />
        </>
      ) : null}

      {type === 'pattern' ? (
        <>
          <Circle cx="9" cy="9" r="2.3" fill={color} />
          <Circle cx="21" cy="9" r="2.3" fill={color} opacity="0.45" />
          <Circle cx="15" cy="15" r="2.3" fill={color} />
          <Circle cx="9" cy="21" r="2.3" fill={color} opacity="0.45" />
          <Circle cx="21" cy="21" r="2.3" fill={color} />
          <Path d="M11 10.5L13.5 13" {...stroke} opacity="0.55" />
          <Path d="M16.5 17L19 19.5" {...stroke} opacity="0.55" />
          <Path d="M19 10.5L16.5 13" {...stroke} opacity="0.55" />
          <Path d="M13.5 17L11 19.5" {...stroke} opacity="0.55" />
        </>
      ) : null}

      {type === 'logic' ? (
        <>
          <Circle cx="8" cy="8" r="2.5" fill={color} />
          <Circle cx="22" cy="10" r="2.5" fill={color} />
          <Circle cx="15" cy="22" r="2.5" fill={color} />
          <Path d="M10.3 8.7L19.6 9.4" {...stroke} />
          <Path d="M9.8 10.2L13.2 19.5" {...stroke} />
          <Path d="M20.5 12L16.4 19.8" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}

const logo = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  base: {
    fontSize: 60,
    fontFamily: 'Nunito_900Black',
    letterSpacing: -1.8,
    color: '#0F3D3A',
    textShadowColor: 'rgba(255,255,255,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  pop: {
    color: Colors.coral,
  },
});

export default function LandingScreen() {
  const { isLoggedIn } = useAuthStore();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const boardAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(130, [
      Animated.spring(headerAnim, { toValue: 1, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.spring(boardAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(ctaAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const entry = (anim: Animated.Value, distance = 24) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.05],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const boardRotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const cardCounterRotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <View style={s.container}>
      <LinearGradient
        colors={['#F8FFF8', '#EAFBF6', '#D8F6EE']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[s.blob, s.blobTop]} />
      <View style={[s.blob, s.blobSide]} />
      <View style={[s.blob, s.blobBottom]} />

      <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
        <View style={s.inner}>
          <Animated.View style={[s.header, entry(headerAnim)]}>
            <ThinkPopLogo />
          </Animated.View>

          <Animated.View style={[s.boardSection, entry(boardAnim, 30)]}>
            <View style={[s.board, { width: BOARD_SIZE, height: BOARD_SIZE + 28 }]}>
              <Animated.View style={[s.orbitLayer, { transform: [{ rotate: boardRotate }] }]}>
                {GAMES.map((game) => (
                  <Animated.View
                    key={game.label}
                    style={[
                      s.gameCard,
                      CARD_POSITIONS[game.pos],
                      { backgroundColor: game.tint, transform: [{ rotate: cardCounterRotate }] },
                    ]}
                  >
                    <View style={s.gameIcon}>
                      <CategoryIcon type={game.icon} color={game.color} />
                    </View>
                    <Text style={[s.gameLabel, { color: game.color }]}>{game.label}</Text>
                  </Animated.View>
                ))}
              </Animated.View>

              <Animated.View
                style={[
                  s.glow,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />
            </View>
          </Animated.View>

          <Animated.View style={[s.ctaSection, entry(ctaAnim, 34)]}>
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
              onPress={() => (isLoggedIn ? router.replace('/(tabs)/brain') : router.push('/auth'))}
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 280,
    height: 280,
    top: -90,
    right: -70,
    backgroundColor: 'rgba(249,115,22,0.09)',
  },
  blobSide: {
    width: 240,
    height: 240,
    left: -80,
    top: '35%',
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  blobBottom: {
    width: 300,
    height: 300,
    bottom: -110,
    left: 30,
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  boardSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  board: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  gameCard: {
    position: 'absolute',
    width: BOARD_SIZE * 0.36,
    minHeight: 86,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  gameIcon: {
    width: 46,
    height: 46,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameLabel: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
  },
  glow: {
    position: 'absolute',
    width: BOARD_SIZE * 0.52,
    height: BOARD_SIZE * 0.52,
    borderRadius: 999,
    backgroundColor: 'rgba(251,146,60,0.14)',
  },
  ctaSection: {
    gap: 14,
  },
  btnWrap: {
    width: '100%',
  },
  btnPlay: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  btnPlayTxt: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
  btnPlayArrow: {
    fontSize: 22,
    lineHeight: 22,
    color: '#FFFFFF',
    marginTop: -1,
  },
  btnTrack: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(15,61,58,0.08)',
  },
  btnTrackTxt: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#124B46',
  },
});
