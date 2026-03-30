import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { WORD_SETS } from '../../data/wordSets';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcWordStars } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

const WIN_WORDS = 5;

export default function WordGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '1');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[1];

  const pool = WORD_SETS[(levelId - 1) % WORD_SETS.length];

  const [selected, setSelected] = useState<Array<{ idx: number; letter: string }>>([]);
  const [usedIdx, setUsedIdx] = useState<number[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wordState, setWordState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [won, setWon] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentWord = selected.map(s => s.letter).join('');

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -7, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const clearWord = useCallback(() => {
    setSelected([]);
    setUsedIdx([]);
    setWordState('idle');
  }, []);

  const tapLetter = (idx: number) => {
    if (usedIdx.includes(idx)) return;
    const newSelected = [...selected, { idx, letter: pool.letters[idx] }];
    const newUsed = [...usedIdx, idx];
    setSelected(newSelected);
    setUsedIdx(newUsed);
    setWordState('idle');
  };

  const submitWord = useCallback(() => {
    const word = selected.map(s => s.letter).join('');
    if (word.length < 3) {
      shake();
      setWordState('invalid');
      setTimeout(clearWord, 400);
      return;
    }
    if (foundWords.includes(word)) {
      clearWord();
      return;
    }
    if (pool.words.includes(word)) {
      const pts = word.length * 15;
      const newFound = [...foundWords, word];
      const newScore = score + pts;
      setWordState('valid');
      setFoundWords(newFound);
      setScore(newScore);
      setTimeout(() => {
        clearWord();
        if (newFound.length >= WIN_WORDS) {
          setTimeout(() => setWon(true), 200);
        }
      }, 500);
    } else {
      shake();
      setWordState('invalid');
      setTimeout(clearWord, 400);
    }
  }, [selected, foundWords, score, clearWord, shake, pool]);

  const resetGame = () => {
    setSelected([]);
    setUsedIdx([]);
    setFoundWords([]);
    setScore(0);
    setWordState('idle');
    setWon(false);
  };

  const dispBorderColor =
    wordState === 'valid' ? Colors.teal :
    wordState === 'invalid' ? Colors.coral :
    currentWord.length > 0 ? 'rgba(255,209,102,0.4)' :
    'rgba(255,255,255,0.15)';

  const dispTextColor =
    wordState === 'valid' ? Colors.teal :
    wordState === 'invalid' ? Colors.coral :
    currentWord.length > 0 ? Colors.gold :
    Colors.muted;

  const stars = calcWordStars(score);
  const winData: WinData = {
    type: 'word',
    emoji: stars === 3 ? '🏆' : stars === 2 ? '🔤' : '🌱',
    title: stars === 3 ? 'Wordsmith!' : stars === 2 ? 'Well Said!' : 'Good Start!',
    sub: 'Your verbal fluency is impressive.',
    stats: [
      { num: foundWords.length, lbl: 'Words found' },
      { num: score, lbl: 'Score' },
      { num: `+${score}`, lbl: 'Brain pts' },
    ],
    insight: pickInsight('word'),
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
        <View style={[s.scorePill, { backgroundColor: 'rgba(155,93,229,0.2)' }]}>
          <Text style={[s.scoreTxt, { color: Colors.purple }]}>{score}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={[s.domainTag, { color: Colors.purple }]}>Logic</Text>

        <View style={s.instr}>
          <Text style={s.instrTxt}>{level.desc}</Text>
        </View>

        {/* Word display */}
        <Animated.View
          style={[s.wordDisp, { borderColor: dispBorderColor }, { transform: [{ translateX: shakeAnim }] }]}
        >
          <Text style={[s.wordTxt, { color: dispTextColor }]}>
            {currentWord.length > 0 ? currentWord : '_ _ _'}
          </Text>
        </Animated.View>

        {/* Letter tiles */}
        <View style={s.tiles}>
          {pool.letters.map((letter, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.tile, usedIdx.includes(idx) && s.tileUsed]}
              onPress={() => tapLetter(idx)}
              disabled={usedIdx.includes(idx)}
              activeOpacity={0.7}
            >
              <Text style={s.tileTxt}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <View style={s.btns}>
          <TouchableOpacity style={s.btnClear} onPress={clearWord} activeOpacity={0.7}>
            <Text style={s.btnClearTxt}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSubmit} onPress={submitWord} activeOpacity={0.85}>
            <Text style={s.btnSubmitTxt}>Submit ✓</Text>
          </TouchableOpacity>
        </View>

        {/* Found words */}
        <Text style={s.foundLabel}>
          Found ({foundWords.length}/{WIN_WORDS} to win):
        </Text>
        <View style={s.chips}>
          {foundWords.map((word, i) => (
            <View key={i} style={s.chip}>
              <Text style={s.chipTxt}>{word} +{word.length * 15}</Text>
            </View>
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
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 17, color: Colors.white, fontFamily: 'Nunito_700Bold' },
  headerTitle: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, lineHeight: 18 },
  scorePill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  scoreTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  body: { padding: 16, paddingBottom: 40 },
  domainTag: { fontSize: 11, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  instr: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 11, padding: 10, marginBottom: 14 },
  instrTxt: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.muted, lineHeight: 20 },

  wordDisp: {
    minHeight: 64,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  wordTxt: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    letterSpacing: 7,
  },

  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    marginBottom: 12,
  },
  tile: {
    width: 44,
    height: 48,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileUsed: { opacity: 0.2 },
  tileTxt: { fontSize: 18, fontFamily: 'Nunito_900Black', color: Colors.white },

  btns: { flexDirection: 'row', gap: 9, marginBottom: 12 },
  btnClear: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  btnClearTxt: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.white },
  btnSubmit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: Colors.teal,
    alignItems: 'center',
  },
  btnSubmitTxt: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: '#0a1a15' },

  foundLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 7,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: {
    backgroundColor: 'rgba(6,214,160,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,214,160,0.3)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 11,
  },
  chipTxt: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.teal },
});
