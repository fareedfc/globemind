import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ImageBackground, Image } from 'react-native';

const BALLOON = require('../../assets/icons/balloon.png');
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';
import { useBrainStore, type GameType } from '../../stores/brainStore';

const WORLD_BGS = [
  require('../../assets/worlds/w1-forest.png'),
  require('../../assets/worlds/w2-ocean.png'),
  require('../../assets/worlds/w3-desert.png'),
  require('../../assets/worlds/w4-mountain.png'),
  require('../../assets/worlds/w5-space.png'),
  require('../../assets/worlds/w6-deep-ocean.png'),
  require('../../assets/worlds/w7-volcanic.png'),
  require('../../assets/worlds/w8-arctic.png'),
  require('../../assets/worlds/w9-ruins.png'),
  require('../../assets/worlds/w10-cosmic.png'),
];

interface Props {
  type: GameType;
  levelId: number;
  onTryAgain: () => void;
  onExit: () => void;
}

export function FailScreen({ type, levelId, onTryAgain, onExit }: Props) {
  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];
  const { useLive } = usePlayerStore();
  const { recordFail } = useBrainStore();
  const bubbleScale   = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const bubbleRotate  = useRef(new Animated.Value(0)).current;
  const wobble        = useRef(new Animated.Value(0)).current;

  // Content below
  const contentOpacity   = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useLive();
    recordFail(type);

    Animated.sequence([
      // 1. Balloon inflates quickly — about to pop
      Animated.spring(bubbleScale, { toValue: 1.25, tension: 200, friction: 4, useNativeDriver: true }),
      // 2. Tremble — suspense moment
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1,    duration: 55, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1,   duration: 55, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0.7,  duration: 55, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -0.7, duration: 55, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0.4,  duration: 55, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0,    duration: 45, useNativeDriver: true }),
      ]),
      // 3. Brief hold at peak
      Animated.delay(100),
      // 4. Slowly deflate + droop
      Animated.parallel([
        Animated.timing(bubbleScale,   { toValue: 0.38, duration: 700, useNativeDriver: true }),
        Animated.timing(bubbleRotate,  { toValue: 1,    duration: 700, useNativeDriver: true }),
        Animated.timing(bubbleOpacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();

    // Content slides up after deflation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(contentTranslate, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
      ]).start();
    }, 1000);
  }, []);

  const droop = bubbleRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-18deg'] });
  const shake = wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-10deg', '0deg', '10deg'] });

  return (
    <ImageBackground source={worldBg} style={s.container} resizeMode="cover">
      {/* World art fills the float zone */}
      <View style={s.floatZone} />

      {/* Content section — high opacity */}
      <Animated.View
        style={[
          s.topSection,
          { opacity: contentOpacity, transform: [{ translateY: contentTranslate }] },
        ]}
      >
        {/* Balloon sits above "So close!" inside the white section */}
        <Animated.Image
          source={BALLOON}
          style={[s.balloon, {
            transform: [{ scale: bubbleScale }, { rotate: droop }, { rotate: shake }],
            opacity: bubbleOpacity,
          }]}
          resizeMode="contain"
        />
        <Text style={s.title}>So close!</Text>
        <Text style={s.sub}>
          You were warming up.{'\n'}Give it another pop.
        </Text>

        <TouchableOpacity style={s.btnPrimary} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onTryAgain(); }} activeOpacity={0.85}>
          <Text style={s.btnPrimaryTxt}>Try Again ↺</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => { Haptics.selectionAsync(); onExit(); }} activeOpacity={0.7}>
          <Text style={s.btnSecondaryTxt}>Back to Journey</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={s.bottomSection} />
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  floatZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  balloon: {
    width: 120,
    height: 140,
    marginBottom: 12,
  },

  topSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 20,
  },
  bottomSection: {
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 32,
  },

  btnPrimary: {
    width: '100%',
    paddingVertical: 17,
    backgroundColor: '#8B3FD9',
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryTxt: {
    fontSize: 16,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 13,
    alignItems: 'center',
  },
  btnSecondaryTxt: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
