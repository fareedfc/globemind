import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image, ImageBackground, ImageSourcePropType } from 'react-native';

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

const GAME_ICONS: Record<string, ImageSourcePropType> = {
  memory:  require('../../assets/icons/icon-memory.png'),
  speed:   require('../../assets/icons/icon-speed.png'),
  logic:   require('../../assets/icons/icon-logic.png'),
  pattern: require('../../assets/icons/icon-pattern.png'),
};

const ICON_STAR = require('../../assets/icons/icon-star.png');

const { width: SW, height: SH } = Dimensions.get('window');
const PARTICLES = ['⭐', '🎉', '✨', '💫', '🌟', '🎊', '⭐', '✨', '💫', '🎉'];

function Confetti() {
  const anims = useRef(
    PARTICLES.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    anims.forEach((a, i) => {
      const angle = (i / PARTICLES.length) * 2 * Math.PI;
      const dist = 100 + Math.random() * 80;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 60;
      Animated.sequence([
        Animated.delay(i * 40),
        Animated.parallel([
          Animated.spring(a.scale, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
          Animated.timing(a.x, { toValue: tx, duration: 700, useNativeDriver: true }),
          Animated.timing(a.y, { toValue: ty, duration: 700, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(a.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLES.map((p, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            top: SH * 0.3,
            left: SW / 2 - 12,
            fontSize: 22,
            transform: [{ translateX: anims[i].x }, { translateY: anims[i].y }, { scale: anims[i].scale }],
            opacity: anims[i].opacity,
          }}
        >
          {p}
        </Animated.Text>
      ))}
    </View>
  );
}

import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { usePlayerStore } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';
import { useBrainStore, type GameType } from '../../stores/brainStore';
import { calcActualPoints } from '../../utils/scoring';
import * as Haptics from 'expo-haptics';

export interface WinData {
  type: GameType;
  emoji: string;
  title: string;
  sub: string;
  stats: Array<{ num: string | number; lbl: string }>;
  insight: string;
  stars: number;
}

interface Props {
  data: WinData;
  levelId: number;
  onExit: () => void;
}

export function WinScreen({ data, levelId, onExit }: Props) {
  const { addScore, recordPlay } = usePlayerStore();
  const { completeLevel } = useProgressStore();
  const { recordGame } = useBrainStore();

  const isFirstClear = useRef(useProgressStore.getState().completions[levelId] === undefined).current;
  const lastPlayedAt = useRef(useProgressStore.getState().lastPlayedAt[levelId]).current;
  const pointsEarned = useRef(calcActualPoints(data.stars, levelId, isFirstClear, lastPlayedAt)).current;
  const rewarded = useRef(false);
  const oldDomainPct = useRef(useBrainStore.getState().domains[data.type]).current;

  const [popGone, setPopGone] = useState(false);
  const popScale = useRef(new Animated.Value(0)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;

  const burstAnim = useRef(new Animated.Value(0)).current;
  const iconBreakoutAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const [displayScore, setDisplayScore] = useState(usePlayerStore.getState().score);

  const navigateNext = () => {
    const hasNext = LEVELS.some(l => l.id === levelId + 1);
    if (hasNext) {
      router.replace(`/transition?levelId=${levelId}&domain=${data.type}&oldPct=${oldDomainPct}&insight=${encodeURIComponent(data.insight)}` as any);
    } else {
      router.replace('/(tabs)/journey');
    }
  };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(popScale, { toValue: 1.15, tension: 260, friction: 5, useNativeDriver: true }),
      Animated.spring(popScale, { toValue: 1,    tension: 200, friction: 8, useNativeDriver: true }),
      Animated.delay(340),
      Animated.timing(popOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      setPopGone(true);
      // Icon breaks out from card bottom
      Animated.spring(iconBreakoutAnim, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) navigateNext();
        });
      }, 500);
    });

    if (!rewarded.current) {
      rewarded.current = true;
      const oldScore = usePlayerStore.getState().score;
      addScore(pointsEarned);
      completeLevel(levelId, data.stars);
      recordGame(data.type, data.stars, levelId, isFirstClear, lastPlayedAt);
      recordPlay();

      const steps = 24;
      const stepSize = pointsEarned / steps;
      let current = oldScore;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        current += stepSize;
        if (step % 4 === 0) Haptics.selectionAsync();
        if (step >= steps) {
          setDisplayScore(oldScore + pointsEarned);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.round(current));
        }
      }, 1200 / steps);
    }

    setTimeout(() => {
      Animated.spring(burstAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 500);

    starAnims.forEach((anim, i) => {
      setTimeout(() => {
        if (i < data.stars) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(anim, {
          toValue: 1,
          tension: 140,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 600 + i * 150);
    });
  }, []);

  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];

  return (
    <ImageBackground source={worldBg} style={s.root} resizeMode="cover">

      {/* POP! splash — brief full-screen icon burst */}
      {!popGone && (
        <Animated.View
          pointerEvents="none"
          style={[s.popOverlay, { opacity: popOpacity }]}
        >
          <Animated.Image
            source={GAME_ICONS[data.type]}
            style={[s.popIcon, { transform: [{ scale: popScale }] }]}
            resizeMode="contain"
          />
        </Animated.View>
      )}
      <Confetti />

      {/* Stars float above card against world bg */}
      <View style={s.starsWrap}>
        <View style={s.starsRow}>
          {[0, 1, 2, 3, 4].map(i => {
            const filled = i < data.stars;
            return (
              <Animated.View
                key={i}
                style={{
                  transform: [
                    { scale: starAnims[i] ?? new Animated.Value(filled ? 1 : 0) },
                    {
                      rotate: (starAnims[i] ?? new Animated.Value(1)).interpolate({
                        inputRange: [0, 0.6, 1],
                        outputRange: ['-20deg', '10deg', '0deg'],
                      }),
                    },
                  ],
                  opacity: filled ? 1 : 0.2,
                }}
              >
                <Image source={ICON_STAR} style={s.star} resizeMode="contain" />
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Card — title, score, sub only (no stats) */}
      <View style={s.card}>
        <Animated.View style={[s.emojiWrap, { transform: [{ scale: burstAnim }] }]}>
          <Text style={s.emoji}>{data.emoji}</Text>
        </Animated.View>

        <Text style={s.title}>{data.title}</Text>

        <View style={s.scoreDelta}>
          <Text style={s.scoreDeltaNum}>{displayScore.toLocaleString()}</Text>
          <View style={s.scoreDeltaBadge}>
            <Text style={s.scoreDeltaBadgeTxt}>+{pointsEarned} ⭐</Text>
          </View>
        </View>

        <Text style={s.sub}>{data.sub}</Text>

        {levelId === 101 && (
          <View style={s.worldTeaser}>
            <Text style={s.worldTeaserTitle}>🌌 Universe 2 is on its way!</Text>
            <Text style={s.worldTeaserSub}>You've conquered Universe 1. Stay tuned for the next challenge.</Text>
          </View>
        )}
      </View>

      {/* Game icon breaks out from card bottom edge */}
      <View style={s.iconBreakout}>
        <Animated.Image
          source={GAME_ICONS[data.type]}
          style={[s.breakoutIcon, { transform: [{ scale: iconBreakoutAnim }] }]}
          resizeMode="contain"
        />
      </View>

      {/* Stats — bare on world background */}
      <View style={s.statsRow}>
        {data.stats.map((stat, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statNum}>{stat.num}</Text>
            <Text style={s.statLbl}>{stat.lbl}</Text>
          </View>
        ))}
      </View>

      {/* Auto-continue bar — bare on world background */}
      <View style={s.progressWrap} onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            s.progressBar,
            {
              width: trackWidth,
              transform: [{ translateX: progressAnim.interpolate({ inputRange: [0, 1], outputRange: [-trackWidth, 0] }) }],
            },
          ]}
        />
      </View>
      <Text style={s.progressLbl}>Continuing to Journey...</Text>

    </ImageBackground>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  popOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  popIcon: {
    width: 140,
    height: 140,
  },

  starsWrap: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  star: { width: 36, height: 36 },

  // Card: title + score + sub only
  card: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderRadius: 24,
    marginHorizontal: 16,
  },

  emojiWrap: { marginBottom: 12 },
  emoji: {
    fontSize: 76,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreDelta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  scoreDeltaNum: {
    fontSize: 40,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
  },
  scoreDeltaBadge: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scoreDeltaBadgeTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.gold,
  },
  sub: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },

  worldTeaser: {
    width: '100%',
    backgroundColor: 'rgba(6,182,212,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  worldTeaserTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
    color: '#0891B2',
    textAlign: 'center',
  },
  worldTeaserSub: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(8,145,178,0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Icon pops out from card bottom edge
  iconBreakout: {
    alignItems: 'center',
    marginTop: -44,
    marginBottom: 4,
    zIndex: 10,
  },
  breakoutIcon: {
    width: 88,
    height: 88,
  },

  // Stats bare on world background
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginHorizontal: 16,
    marginTop: 56,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
  },
  statLbl: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
    textAlign: 'center',
  },

  // Progress bar bare on world background
  progressWrap: {
    marginHorizontal: 16,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#8B3FD9',
  },
  progressLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
