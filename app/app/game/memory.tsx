import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ScrollView, ImageBackground } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { MEMORY_SETS } from '../../data/memoryEmojis';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { FailScreen } from '../../components/games/FailScreen';
import { calcMemoryStars, calcActualPoints } from '../../utils/scoring';
import { useProgressStore } from '../../stores/progressStore';
import { pickInsight } from '../../data/brainInsights';

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

interface Card {
  id: number;
  emoji: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

function MemCard({ card, onFlip }: { card: Card; onFlip: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wasVisible = useRef(false);
  const wasMatched = useRef(false);
  const isVisible = card.flipped || card.matched;

  useEffect(() => {
    if (isVisible && !wasVisible.current) {
      scaleAnim.setValue(0.82);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 160,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
    wasVisible.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (card.matched && !wasMatched.current) {
      wasMatched.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.18, tension: 300, friction: 5, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [card.matched]);

  return (
    <TouchableOpacity
      onPress={onFlip}
      disabled={isVisible}
      activeOpacity={0.8}
      style={s.cardTouch}
    >
      <Animated.View
        style={[
          s.card,
          isVisible ? s.cardUp : s.cardDown,
          card.matched && s.cardMatched,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={isVisible ? s.emojiUp : s.emojiDown}>
          {isVisible ? card.emoji : '?'}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function calcPairs(levelId: number): number {
  if (levelId <= 5)  return 3;
  if (levelId <= 15) return 4;
  if (levelId <= 25) return 5;
  if (levelId <= 35) return 6;
  if (levelId <= 50) return 7;
  if (levelId <= 65) return 8;
  if (levelId <= 80) return 9;
  if (levelId <= 92) return 10;
  return 12;
}

function calcTimeLimit(pairs: number, levelId: number): number {
  if (levelId > 65) return pairs * 6;
  if (levelId > 35) return pairs * 8;
  return pairs * 10;
}

function buildDeck(levelId: number): Card[] {
  const setIdx = (levelId - 1) % MEMORY_SETS.length;
  const pairCount = calcPairs(levelId);
  const pairs = MEMORY_SETS[setIdx].slice(0, pairCount);
  return [
    ...pairs.map((e, i) => ({ id: -1, emoji: e, pairId: i, flipped: false, matched: false })),
    ...pairs.map((e, i) => ({ id: -1, emoji: e, pairId: i, flipped: false, matched: false })),
  ]
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i }));
}

export default function MemoryGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '1');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[0];

  const totalPairs = calcPairs(levelId);
  const timeLimit = calcTimeLimit(totalPairs, levelId);

  const [deck, setDeck] = useState<Card[]>(() => buildDeck(levelId));
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlips, setWrongFlips] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameKey, setGameKey] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerAnim  = useRef(new Animated.Value(1)).current;
  const startTimeRef = useRef<number>(Date.now());

  const warningTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset game state every time the screen comes into focus (expo-router keeps screens alive)
  useFocusEffect(useCallback(() => {
    timerAnim.stopAnimation();

    if (timerRef.current) clearInterval(timerRef.current);
    timerAnim.setValue(1);

    setDeck(buildDeck(levelId));
    setFlippedIdx([]);
    setMatchedCount(0);
    setWrongFlips(0);
    setLocked(false);
    setWon(false);
    setFailed(false);
    setTimeLeft(timeLimit);
    // Haptic burst for cards being dealt — fires once on focus, not in the timer effect
    const burstCount = Math.min(calcPairs(levelId), 8);
    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => Haptics.selectionAsync(), i * 80);
    }
    setGameKey(k => k + 1);
  }, [levelId, timeLimit]));

  // Countdown timer — interval for seconds text, Animated for smooth bar
  useEffect(() => {
    if (won || failed) return;
    startTimeRef.current = Date.now();
    timerAnim.setValue(1);

    const durationMs = timeLimit * 1000;
    Animated.timing(timerAnim, { toValue: 0, duration: durationMs, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setFailed(true);
    });
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 500);
    warningTimersRef.current = ([
      durationMs > 3000 ? setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),  durationMs - 3000) : null,
      durationMs > 2000 ? setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), durationMs - 2000) : null,
      durationMs > 1000 ? setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),  durationMs - 1000) : null,
    ] as (ReturnType<typeof setTimeout> | null)[]).filter(Boolean) as ReturnType<typeof setTimeout>[];
    return () => {
      timerAnim.stopAnimation();
  
      if (timerRef.current) clearInterval(timerRef.current);
      warningTimersRef.current.forEach(clearTimeout);
      warningTimersRef.current = [];
    };
  }, [won, failed, gameKey]);

  // Handle two flipped cards
  useEffect(() => {
    if (flippedIdx.length !== 2) return;
    const [a, b] = flippedIdx;
    setLocked(true);

    if (deck[a]?.pairId === deck[b]?.pairId) {
      const t = setTimeout(() => {
        setDeck(prev => prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
        setMatchedCount(p => p + 1);
        setFlippedIdx([]);
        setLocked(false);
      }, 350);
      return () => clearTimeout(t);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setWrongFlips(p => p + 1);
      const t = setTimeout(() => {
        setDeck(prev => prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
        setFlippedIdx([]);
        setLocked(false);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [flippedIdx]);

  // Win check
  useEffect(() => {
    if (matchedCount > 0 && matchedCount === totalPairs) {
      const t = setTimeout(() => setWon(true), 500);
      return () => clearTimeout(t);
    }
  }, [matchedCount]);

  const flipCard = useCallback((idx: number) => {
    if (locked || flippedIdx.length >= 2) return;
    setDeck(prev => {
      if (prev[idx]?.flipped || prev[idx]?.matched) return prev;
      return prev.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    });
    setFlippedIdx(prev => {
      if (prev.length >= 2) return prev;
      return [...prev, idx];
    });
  }, [locked, flippedIdx.length]);

  const resetGame = () => {
    timerAnim.stopAnimation();
    if (timerRef.current) clearInterval(timerRef.current);
    timerAnim.setValue(1);
    setDeck(buildDeck(levelId));
    setFlippedIdx([]);
    setMatchedCount(0);
    setWrongFlips(0);
    setLocked(false);
    setWon(false);
    setFailed(false);
    setTimeLeft(timeLimit);
  };

  const numCols = totalPairs <= 3 ? 3 : 4;
  const numRows = Math.ceil(deck.length / numCols);

  const stars = calcMemoryStars(wrongFlips, totalPairs);
  const isFirstClear = useProgressStore.getState().completions[levelId] === undefined;
  const lastPlayedAt = useProgressStore.getState().lastPlayedAt?.[levelId];
  const previewPts = calcActualPoints(stars, levelId, isFirstClear, lastPlayedAt);
  const winData: WinData = {
    type: 'memory',
    emoji: stars === 5 ? '🎴' : stars === 4 ? '🌟' : stars === 3 ? '✨' : stars === 2 ? '👍' : '🌱',
    title: stars === 5 ? 'Flawless Memory!' : stars === 4 ? 'Excellent!' : stars === 3 ? 'Memory Sharp!' : stars === 2 ? 'Good Effort!' : 'Keep Practicing!',
    sub: 'Your working memory is firing on all cylinders.',
    stats: [
      { num: totalPairs, lbl: 'Pairs found' },
      { num: wrongFlips, lbl: 'Wrong flips' },
      { num: `+${previewPts}`, lbl: 'Points' },
    ],
    insight: pickInsight('memory'),
    stars,
  };

  if (won) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <WinScreen data={winData} levelId={levelId} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  if (failed) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <FailScreen type="memory" levelId={levelId} onTryAgain={resetGame} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];

  return (
    <ImageBackground source={worldBg} style={s.container} resizeMode="cover">
    <SafeAreaView style={s.safeArea} edges={['top']}>

      {/* Top section — all content */}
      <View style={s.topSection}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => { Haptics.selectionAsync(); router.back(); }}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>Level {level.id} · {level.domain}</Text>
          <View style={[s.scorePill, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
            <Text style={[s.scoreTxt, { color: Colors.gold }]}>{matchedCount}/{totalPairs}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[s.domainTag, { color: Colors.gold }]}>Memory</Text>

        <View style={s.instr}>
          <Text style={s.instrTxt}>{level.desc}</Text>
        </View>

        {/* Countdown timer bar */}
        <View style={s.timerWrap}>
          <View style={s.timerTrack} onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}>
            <Animated.View
              style={[
                s.timerFill,
                {
                  width: trackWidth,
                  backgroundColor: Colors.teal,
                  transform: [{ translateX: timerAnim.interpolate({ inputRange: [0, 1], outputRange: [-trackWidth, 0] }) }],
                },
              ]}
            />
          </View>
          <Text style={s.timerLbl}>{timeLeft}s</Text>
        </View>
        {/* Card grid */}
        <View style={s.grid}>
          {Array.from({ length: numRows }, (_, row) => {
            const rowCards = deck.slice(row * numCols, (row + 1) * numCols);
            const empties = numCols - rowCards.length;
            return (
              <View key={row} style={s.row}>
                {rowCards.map(card => (
                  <MemCard key={card.id} card={card} onFlip={() => flipCard(card.id)} />
                ))}
                {Array.from({ length: empties }, (_, i) => (
                  <View key={`e${i}`} style={s.cardTouch} />
                ))}
              </View>
            );
          })}
        </View>

        {/* Pair pips */}
        <View style={s.pips}>
          {Array.from({ length: totalPairs }, (_, i) => (
            <View key={i} style={[s.pip, i < matchedCount && s.pipLit]} />
          ))}
        </View>
        </ScrollView>
      </View>

      {/* Bottom strip — world art shows through */}
      <View style={s.bottomSection} />

    </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topSection: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  backTxt: { fontSize: 17, color: Colors.text, fontFamily: 'Nunito_700Bold' },
  headerTitle: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, lineHeight: 18 },
  scorePill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  scoreTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  body: { padding: 10, paddingBottom: 16 },
  domainTag: { fontSize: 16, fontFamily: 'Nunito_900Black', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, textAlign: 'center' },
  instr: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 11, padding: 8, marginBottom: 8 },
  instrTxt: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#1A1A1A', lineHeight: 26 },

  timerWrap: { marginBottom: 6 },
  timerTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3 },
  timerLbl: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, textAlign: 'right', marginTop: 3 },

  grid: { gap: 6, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cardTouch: { flex: 1, aspectRatio: 1 },
  card: { flex: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', minHeight: 64 },
  cardDown: { backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1.5, borderColor: Colors.border },
  cardUp: { backgroundColor: 'rgba(6,214,160,0.15)', borderWidth: 2, borderColor: Colors.teal },
  cardMatched: { opacity: 0.55 },
  emojiDown: { fontSize: 24, color: 'rgba(31,41,55,0.3)', fontFamily: 'Nunito_900Black' },
  emojiUp: { fontSize: 32 },

  pips: { flexDirection: 'row', justifyContent: 'center', gap: 7, paddingVertical: 8 },
  pip: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.1)' },
  pipLit: { backgroundColor: Colors.teal },
});
