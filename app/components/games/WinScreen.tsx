import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions, Image } from 'react-native';

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
import { MILES_PER_STAR } from '../../utils/scoring';
import * as Haptics from 'expo-haptics';

export interface WinData {
  type: GameType;
  emoji: string;
  title: string;
  sub: string;
  stats: Array<{ num: string | number; lbl: string }>;
  insight: string;
  stars: number; // 1–3
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

  const pointsEarned = useRef(MILES_PER_STAR[data.stars] ?? 150).current;
  const rewarded = useRef(false);
  const oldDomainPct = useRef(useBrainStore.getState().domains[data.type]).current;

  // POP! moment
  const [popGone, setPopGone] = useState(false);
  const popScale = useRef(new Animated.Value(0)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;

  // Animated values
  const burstAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Auto-continue progress bar (runs after POP! fades)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Score counter display
  const [displayScore, setDisplayScore] = useState(usePlayerStore.getState().score);

  const navigateNext = () => {
    const hasNext = LEVELS.some(l => l.id === levelId + 1);
    if (hasNext) {
      router.replace(`/transition?levelId=${levelId}&domain=${data.type}&oldPct=${oldDomainPct}` as any);
    } else {
      router.replace('/(tabs)/journey');
    }
  };

  useEffect(() => {
    // Win haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // POP! splash — runs first, content reveals after
    Animated.sequence([
      Animated.spring(popScale, { toValue: 1, tension: 180, friction: 7, useNativeDriver: true }),
      Animated.delay(380),
      Animated.timing(popOpacity, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(() => {
      setPopGone(true);
      // Start progress bar after a short pause so content has landed
      setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
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
      recordGame(data.type, data.stars);
      recordPlay();

      // Animate score counter: old → old + earned over 1.2s
      const steps = 24;
      const stepSize = pointsEarned / steps;
      let current = oldScore;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        current += stepSize;
        if (step >= steps) {
          setDisplayScore(oldScore + pointsEarned);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.round(current));
        }
      }, 1200 / steps);
    }

    // Emoji burst — slight delay so it lands after POP!
    setTimeout(() => {
      Animated.spring(burstAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Stars pop in one by one — after POP! fades
    starAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 140,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 600 + i * 200);
    });
  }, []);

  return (
    <>
    {/* POP! splash overlay */}
    {!popGone && (
      <Animated.View
        pointerEvents="none"
        style={[s.popOverlay, { opacity: popOpacity }]}
      >
        <Animated.Text style={[s.popText, { transform: [{ scale: popScale }] }]}>
          POP! 🎉
        </Animated.Text>
      </Animated.View>
    )}
    <Confetti />
    <ScrollView
      contentContainerStyle={s.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Stars */}
      <View style={s.starsRow}>
        {[0, 1, 2].map(i => {
          const filled = i < data.stars;
          return (
            <Animated.View
              key={i}
              style={{
                transform: [
                  { scale: starAnims[i] },
                  {
                    rotate: starAnims[i].interpolate({
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

      {/* Emoji */}
      <Animated.View style={{ transform: [{ scale: burstAnim }] }}>
        <Text style={s.emoji}>{data.emoji}</Text>
      </Animated.View>

      <Text style={s.title}>{data.title}</Text>

      {/* Score counter */}
      <View style={s.scoreDelta}>
        <Text style={s.scoreDeltaNum}>{displayScore.toLocaleString()}</Text>
        <View style={s.scoreDeltaBadge}>
          <Text style={s.scoreDeltaBadgeTxt}>+{pointsEarned} ⭐</Text>
        </View>
      </View>

      <Text style={s.sub}>{data.sub}</Text>

      {/* Stat cards */}
      <View style={s.statsRow}>
        {data.stats.map((stat, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statNum}>{stat.num}</Text>
            <Text style={s.statLbl}>{stat.lbl}</Text>
          </View>
        ))}
      </View>

      {/* Brain insight */}
      <View style={s.insight}>
        <Text style={s.insightLbl}>🧠 Brain insight</Text>
        <Text style={s.insightTxt}>{data.insight}</Text>
      </View>

      {/* Auto-continue bar */}
      <View style={s.progressWrap}>
        <Animated.View
          style={[
            s.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={s.progressLbl}>Continuing to Journey...</Text>
    </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  popOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  popText: {
    fontSize: 64,
    fontFamily: 'Nunito_900Black',
    color: '#EC4899',
    textShadowColor: 'rgba(249,115,22,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },

  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: Colors.bg,
  },

  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  star: { width: 48, height: 48 },

  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 12,
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
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 9,
    width: '100%',
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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

  insight: {
    width: '100%',
    backgroundColor: 'rgba(6,214,160,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(6,214,160,0.18)',
    borderRadius: 13,
    padding: 13,
    marginBottom: 12,
  },
  insightLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  insightTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },

  progressWrap: {
    width: '100%',
    height: 7,
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  progressLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 16,
  },
});
