import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { MEMORY_SETS } from '../../data/memoryEmojis';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcMemoryStars, MILES_PER_STAR } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

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

function buildDeck(levelId: number): Card[] {
  const setIdx = (levelId - 1) % MEMORY_SETS.length;
  const pairCount = Math.min(3 + Math.floor(levelId / 2.5), 6);
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

  const [deck, setDeck] = useState<Card[]>(() => buildDeck(levelId));
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlips, setWrongFlips] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const totalPairs = Math.min(3 + Math.floor(levelId / 2.5), 6);

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
    setDeck(buildDeck(levelId));
    setFlippedIdx([]);
    setMatchedCount(0);
    setWrongFlips(0);
    setLocked(false);
    setWon(false);
  };

  const numCols = deck.length <= 6 ? 3 : 4;
  const numRows = Math.ceil(deck.length / numCols);

  const stars = calcMemoryStars(wrongFlips, totalPairs);
  const winData: WinData = {
    type: 'memory',
    emoji: stars === 3 ? '🎴' : stars === 2 ? '🧠' : '🌱',
    title: stars === 3 ? 'Flawless Memory!' : stars === 2 ? 'Memory Sharp!' : 'Good Effort!',
    sub: 'Your working memory is firing on all cylinders.',
    stats: [
      { num: totalPairs, lbl: 'Pairs found' },
      { num: wrongFlips, lbl: 'Wrong flips' },
      { num: `+${MILES_PER_STAR[stars]}`, lbl: 'Miles' },
    ],
    insight: pickInsight('memory'),
    stars,
  };

  if (won) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <WinScreen data={winData} levelId={levelId} onPlayAgain={resetGame} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Level {level.id} · {level.domain}</Text>
        <View style={[s.scorePill, { backgroundColor: 'rgba(255,209,102,0.2)' }]}>
          <Text style={[s.scoreTxt, { color: Colors.gold }]}>{matchedCount}/{totalPairs}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[s.domainTag, { color: Colors.gold }]}>Memory</Text>

        <View style={s.instr}>
          <Text style={s.instrTxt}>{level.desc}</Text>
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTxt: { fontSize: 17, color: Colors.white, fontFamily: 'Nunito_700Bold' },
  headerTitle: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, lineHeight: 18 },
  scorePill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  scoreTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  body: { padding: 16, paddingBottom: 40 },
  domainTag: { fontSize: 11, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  instr: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 11, padding: 10, marginBottom: 14 },
  instrTxt: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.muted, lineHeight: 20 },

  grid: { gap: 8, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  cardTouch: { flex: 1, aspectRatio: 1 },
  card: { flex: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center', minHeight: 64 },
  cardDown: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  cardUp: { backgroundColor: 'rgba(6,214,160,0.15)', borderWidth: 2, borderColor: Colors.teal },
  cardMatched: { opacity: 0.55 },
  emojiDown: { fontSize: 20, color: 'rgba(255,255,255,0.25)', fontFamily: 'Nunito_900Black' },
  emojiUp: { fontSize: 26 },

  pips: { flexDirection: 'row', justifyContent: 'center', gap: 7, paddingVertical: 8 },
  pip: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.12)' },
  pipLit: { backgroundColor: Colors.teal },
});
