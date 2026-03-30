import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';
import { useBrainStore, type GameType } from '../../stores/brainStore';

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
  onPlayAgain: () => void;
  onExit: () => void;
}

export function WinScreen({ data, levelId, onPlayAgain, onExit }: Props) {
  const { addScore, addMiles, recordPlay } = usePlayerStore();
  const { completeLevel } = useProgressStore();
  const { recordGame } = useBrainStore();

  // Score delta is fixed for the session
  const scoreDelta = useRef(Math.floor(Math.random() * 20 + 10)).current;
  const rewarded = useRef(false);

  // Animated values
  const burstAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Score counter display
  const [displayScore, setDisplayScore] = useState(usePlayerStore.getState().score);

  useEffect(() => {
    if (!rewarded.current) {
      rewarded.current = true;
      const oldScore = usePlayerStore.getState().score;

      addScore(scoreDelta);
      addMiles(120);
      completeLevel(levelId, data.stars);
      recordGame(data.type, data.stars);
      recordPlay();

      // Animate score counter: old → old + delta over 1.2s
      const steps = 24;
      const stepSize = scoreDelta / steps;
      let current = oldScore;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        current += stepSize;
        if (step >= steps) {
          setDisplayScore(oldScore + scoreDelta);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.round(current));
        }
      }, 1200 / steps);
    }

    // Emoji burst
    Animated.spring(burstAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Stars pop in one by one
    starAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }, 350 + i * 180);
    });
  }, []);

  return (
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
              }}
            >
              <Text style={[s.star, filled ? s.starFilled : s.starEmpty]}>
                {filled ? '⭐' : '☆'}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Emoji */}
      <Animated.View style={{ transform: [{ scale: burstAnim }] }}>
        <Text style={s.emoji}>{data.emoji}</Text>
      </Animated.View>

      <Text style={s.title}>{data.title}</Text>

      {/* Brain Score delta */}
      <View style={s.scoreDelta}>
        <Text style={s.scoreDeltaNum}>{displayScore}</Text>
        <View style={s.scoreDeltaBadge}>
          <Text style={s.scoreDeltaBadgeTxt}>+{scoreDelta} Brain Score</Text>
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

      {/* +120 miles badge */}
      <View style={s.milesBadge}>
        <Text style={s.milesTxt}>✈️  +120 air miles earned</Text>
      </View>

      <TouchableOpacity style={s.btnPrimary} onPress={onPlayAgain} activeOpacity={0.85}>
        <Text style={s.btnPrimaryTxt}>Play Again ↺</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnSecondary} onPress={onExit} activeOpacity={0.7}>
        <Text style={s.btnSecondaryTxt}>Back to Journey</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
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
  star: { fontSize: 42 },
  starFilled: {},
  starEmpty: { opacity: 0.2 },

  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
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
    backgroundColor: 'rgba(255,209,102,0.15)',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
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
    color: Colors.white,
    lineHeight: 20,
  },

  milesBadge: {
    backgroundColor: 'rgba(6,214,160,0.08)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  milesTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
  },

  btnPrimary: {
    width: '100%',
    paddingVertical: 17,
    backgroundColor: Colors.gold,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 9,
  },
  btnPrimaryTxt: {
    fontSize: 16,
    fontFamily: 'Nunito_900Black',
    color: '#1a1a2e',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 13,
    alignItems: 'center',
  },
  btnSecondaryTxt: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
  },
});
