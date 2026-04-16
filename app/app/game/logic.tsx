import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ImageBackground } from 'react-native';
import { useFocusEffect } from 'expo-router';

const CELL_GAP = 14;

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
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { ODD_ONE_SETS, type OddOneSet } from '../../data/oddOneSets';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { FailScreen } from '../../components/games/FailScreen';
import { calcPatternStars, calcActualPoints } from '../../utils/scoring';
import { useProgressStore } from '../../stores/progressStore';
import { pickInsight } from '../../data/brainInsights';

const TOTAL_ROUNDS = 7;
const FAIL_THRESHOLD = 4;

// ── Mode system ───────────────────────────────────────────────────────────────
type LogicMode = 'find_odd' | 'find_belongs' | 'find_all';
type Phase = 'answering' | 'feedback';
type PipState = 'none' | 'ok' | 'err';

interface LogicRoundData {
  mode: LogicMode;
  items: string[];
  targets: string[];   // correct items to tap
  prompt: string;
  hint: string;
  cols: number;
  rows: number;
}

function getAnswerMs(levelId: number): number {
  if (levelId > 60) return 5000;
  if (levelId > 30) return 6000;
  return 8000;
}

function pickLogicMode(levelId: number): LogicMode {
  if (levelId <= 20) return 'find_odd';
  if (levelId <= 40) return Math.random() < 0.5 ? 'find_odd' : 'find_belongs';
  const r = Math.random();
  return r < 0.4 ? 'find_odd' : r < 0.7 ? 'find_belongs' : 'find_all';
}

function parseCategory(hint: string): string {
  return hint.replace(/^Not an? /i, '').toUpperCase();
}

function buildLogicRounds(sets: OddOneSet[], count: number, levelId: number): LogicRoundData[] {
  const shuffled = [...sets].sort(() => Math.random() - 0.5);
  const result: LogicRoundData[] = [];
  let i = 0;

  while (result.length < count && i < shuffled.length) {
    const mode = pickLogicMode(levelId);

    if (mode === 'find_odd') {
      const set = shuffled[i++];
      result.push({
        mode,
        items: [...set.items].sort(() => Math.random() - 0.5),
        targets: [set.odd],
        prompt: "🤔 Which one doesn't belong?",
        hint: set.hint,
        cols: 2, rows: 2,
      });

    } else if (mode === 'find_belongs') {
      const set = shuffled[i++];
      const category = parseCategory(set.hint);
      const correctItems = set.items.filter(x => x !== set.odd);
      const answer = correctItems[Math.floor(Math.random() * correctItems.length)];
      // Decoys: odd items from other sets (things that don't belong to this category)
      const decoys = shuffled
        .filter((_, j) => j !== i - 1)
        .map(s => s.odd)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      result.push({
        mode,
        items: [...decoys, answer].sort(() => Math.random() - 0.5),
        targets: [answer],
        prompt: `🔍 Find the ${category}`,
        hint: `The ${category.toLowerCase()} was ${answer}`,
        cols: 2, rows: 2,
      });

    } else {
      // find_all — needs 2 sets, 2×3 grid, 2 odd ones to find
      if (i + 1 >= shuffled.length) { i++; continue; }
      const setA = shuffled[i++];
      const setB = shuffled[i++];
      const correctA = setA.items.filter(x => x !== setA.odd).slice(0, 2);
      const correctB = setB.items.filter(x => x !== setB.odd).slice(0, 2);
      result.push({
        mode,
        items: [...correctA, setA.odd, ...correctB, setB.odd].sort(() => Math.random() - 0.5),
        targets: [setA.odd, setB.odd],
        prompt: '🎯 Find ALL the odd ones! (2)',
        hint: `${setA.hint} · ${setB.hint}`,
        cols: 3, rows: 2,
      });
    }
  }
  return result;
}

// ── CellButton ────────────────────────────────────────────────────────────────
function CellButton({ item, style, onPress, disabled, emojiStyle, isCorrect }: {
  item: string;
  style: any;
  onPress: () => void;
  disabled: boolean;
  emojiStyle: any;
  isCorrect?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCorrect) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.2, tension: 300, friction: 5, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [isCorrect]);

  const handlePress = () => {
    if (disabled) return;
    scale.setValue(0.88);
    Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={1} style={style}>
      <Animated.View style={[s.cellInner, { transform: [{ scale }] }]}>
        <Text style={emojiStyle}>{item}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function LogicGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '2');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[1];
  const answerMs = getAnswerMs(levelId);

  const rounds = useRef<LogicRoundData[]>(buildLogicRounds(ODD_ONE_SETS, TOTAL_ROUNDS, levelId));

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [score, setScore] = useState(0);
  const [pips, setPips] = useState<PipState[]>(Array(TOTAL_ROUNDS).fill('none'));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [foundTargets, setFoundTargets] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);

  const wrongCountRef = useRef(0);
  const currentRoundRef = useRef(0);
  const scoreRef = useRef(0);
  const foundTargetsRef = useRef<string[]>([]);

  currentRoundRef.current = currentRound;
  scoreRef.current = score;

  // Reset game state every time the screen comes into focus (expo-router keeps screens alive)
  useFocusEffect(useCallback(() => {
    rounds.current = buildLogicRounds(ODD_ONE_SETS, TOTAL_ROUNDS, levelId);
    setCurrentRound(0);
    setPhase('answering');
    timerAnim.setValue(1);
    setScore(0);
    scoreRef.current = 0;
    wrongCountRef.current = 0;
    currentRoundRef.current = 0;
    setPips(Array(TOTAL_ROUNDS).fill('none'));
    setSelectedAnswer(null);
    foundTargetsRef.current = [];
    setFoundTargets([]);
    setWon(false);
    setFailed(false);
  }, [levelId]));

  const warningTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopTimer = useCallback(() => {
    timerAnim.stopAnimation();
    warningTimersRef.current.forEach(clearTimeout);
    warningTimersRef.current = [];
  }, [timerAnim]);

  const advanceRound = useCallback((correct: boolean) => {
    const willFail = !correct && wrongCountRef.current >= FAIL_THRESHOLD;
    setTimeout(() => {
      if (willFail) { setFailed(true); return; }
      const nextRound = currentRoundRef.current + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setWon(true);
      } else {
        setCurrentRound(nextRound);
        setPhase('answering');
        setSelectedAnswer(null);
        foundTargetsRef.current = [];
        setFoundTargets([]);
      }
    }, 1200);
  }, []);

  const handleAnswer = useCallback((ans: string | null) => {
    const round = rounds.current[currentRoundRef.current];
    if (!round) return;

    // ── find_all: accumulate taps until all targets found ──────────────────
    if (round.mode === 'find_all') {
      if (
        ans !== null &&
        round.targets.includes(ans) &&
        !foundTargetsRef.current.includes(ans)
      ) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newFound = [...foundTargetsRef.current, ans];
        foundTargetsRef.current = newFound;
        setFoundTargets([...newFound]);

        if (newFound.length === round.targets.length) {
          stopTimer();
          scoreRef.current += 1;
          setScore(scoreRef.current);
          setPhase('feedback');
          setSelectedAnswer('__all__');
          setPips(prev => { const n = [...prev]; n[currentRoundRef.current] = 'ok'; return n; });
          advanceRound(true);
        }
        return; // don't advance yet — wait for more taps
      }

      if (ans !== null && !round.targets.includes(ans)) {
        // Wrong tap in find_all
        stopTimer();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        wrongCountRef.current += 1;
        setSelectedAnswer(ans);
        setPhase('feedback');
        setPips(prev => { const n = [...prev]; n[currentRoundRef.current] = 'err'; return n; });
        advanceRound(false);
        return;
      }

      // Timeout
      stopTimer();
      wrongCountRef.current += 1;
      setPhase('feedback');
      setSelectedAnswer(null);
      setPips(prev => { const n = [...prev]; n[currentRoundRef.current] = 'err'; return n; });
      advanceRound(false);
      return;
    }

    // ── find_odd / find_belongs: single correct answer ─────────────────────
    stopTimer();
    const correct = ans !== null && round.targets.includes(ans);
    if (correct) {
      scoreRef.current += 1;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      wrongCountRef.current += 1;
    }
    setScore(scoreRef.current);
    setSelectedAnswer(ans);
    setPhase('feedback');
    setPips(prev => { const n = [...prev]; n[currentRoundRef.current] = correct ? 'ok' : 'err'; return n; });
    advanceRound(correct);
  }, [stopTimer, advanceRound]);

  const startTimer = useCallback(() => {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: answerMs,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) handleAnswer(null);
    });
    warningTimersRef.current = ([
      answerMs > 3000 ? setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),  answerMs - 3000) : null,
      answerMs > 2000 ? setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), answerMs - 2000) : null,
      answerMs > 1000 ? setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),  answerMs - 1000) : null,
    ] as (ReturnType<typeof setTimeout> | null)[]).filter(Boolean) as ReturnType<typeof setTimeout>[];
  }, [timerAnim, handleAnswer, answerMs]);

  useEffect(() => {
    if (won) return;
    startTimer();
    return stopTimer;
  }, [currentRound, won]);

  useEffect(() => () => stopTimer(), []);

  const resetGame = () => {
    stopTimer();
    rounds.current = buildLogicRounds(ODD_ONE_SETS, TOTAL_ROUNDS, levelId);
    setCurrentRound(0);
    setPhase('answering');
    timerAnim.setValue(1);
    setScore(0);
    scoreRef.current = 0;
    wrongCountRef.current = 0;
    setPips(Array(TOTAL_ROUNDS).fill('none'));
    setSelectedAnswer(null);
    foundTargetsRef.current = [];
    setFoundTargets([]);
    setWon(false);
    setFailed(false);
  };

  const round = rounds.current[currentRound];
  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: [Colors.coral, Colors.coral, Colors.gold, Colors.teal],
  });
  const stars = calcPatternStars(score);

  const isFirstClear = useProgressStore.getState().completions[levelId] === undefined;
  const lastPlayedAt = useProgressStore.getState().lastPlayedAt?.[levelId];
  const previewPts = calcActualPoints(stars, levelId, isFirstClear, lastPlayedAt);
  const winData: WinData = {
    type: 'logic',
    emoji: stars === 5 ? '🏆' : stars === 4 ? '🌟' : stars === 3 ? '💡' : stars === 2 ? '👍' : '🌱',
    title: stars === 5 ? 'Sharp Thinker!' : stars === 4 ? 'Excellent!' : stars === 3 ? 'Good Reasoning!' : stars === 2 ? 'Good Effort!' : 'Keep Going!',
    sub: "Spotting what doesn't belong sharpens your focus and decision-making every day.",
    stats: [
      { num: `${score}/${TOTAL_ROUNDS}`, lbl: 'Correct' },
      { num: `${Math.round((score / TOTAL_ROUNDS) * 100)}%`, lbl: 'Accuracy' },
      { num: `+${previewPts}`, lbl: 'Points' },
    ],
    insight: pickInsight('logic'),
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
        <FailScreen type="logic" levelId={levelId} onTryAgain={resetGame} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  if (!round) return null;

  const isAllFound = phase === 'feedback' && selectedAnswer === '__all__';
  const emojiSize = round.cols === 3 ? 40 : 60;
  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];

  const getPromptText = () => {
    if (phase === 'answering') return round.prompt;
    if (round.mode === 'find_all') {
      return isAllFound
        ? `✅ Both found! · ${round.hint}`
        : `❌ Not quite · ${round.hint}`;
    }
    const isCorrect = selectedAnswer !== null && round.targets.includes(selectedAnswer);
    return isCorrect ? `✅ Correct! · ${round.hint}` : `❌ Not quite · ${round.hint}`;
  };

  return (
    <ImageBackground source={worldBg} style={s.container} resizeMode="cover">
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.topSection}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => { Haptics.selectionAsync(); router.back(); }}>
            <Text style={s.backTxt}>←</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>Level {level.id} · {level.domain}</Text>
          <View style={[s.scorePill, { backgroundColor: 'rgba(0,201,167,0.15)' }]}>
            <Text style={[s.scoreTxt, { color: Colors.teal }]}>{score}/{TOTAL_ROUNDS}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={[s.domainTag, { color: Colors.teal }]}>Logic</Text>

          {/* Round pips */}
          <View style={s.pips}>
            {pips.map((pip, i) => (
              <View key={i} style={[
                s.pip,
                pip === 'ok' && s.pipOk,
                pip === 'err' && s.pipErr,
                i === currentRound && pip === 'none' && s.pipActive,
              ]} />
            ))}
          </View>

          {/* Timer bar */}
          <View style={s.timerWrap}>
            <View style={s.timerTrack}>
              <Animated.View style={[s.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
            </View>
          </View>

          {/* Mode badge */}
          {round.mode !== 'find_odd' && (
            <View style={s.modeBadge}>
              <Text style={s.modeBadgeTxt}>
                {round.mode === 'find_belongs' ? '🔍 Find It' : '🎯 Find All'}
              </Text>
            </View>
          )}

          {/* Prompt */}
          <View style={s.promptWrap}>
            <Text style={s.promptTxt}>{getPromptText()}</Text>
          </View>

          {/* find_all progress */}
          {round.mode === 'find_all' && phase === 'answering' && (
            <Text style={s.progressLbl}>{foundTargets.length} / {round.targets.length} found</Text>
          )}

          {/* Dynamic grid */}
          <View style={s.grid}>
            {Array.from({ length: round.rows }).map((_, row) => (
              <View key={row} style={s.gridRow}>
                {round.items.slice(row * round.cols, row * round.cols + round.cols).map((item, col) => {
                  const isTarget = round.targets.includes(item);
                  const isFoundSoFar = foundTargets.includes(item);

                  const showCorrect = phase === 'feedback' && isTarget;
                  const showWrong = phase === 'feedback' && selectedAnswer === item && !isTarget;
                  const showDim = phase === 'feedback' && !showCorrect && !showWrong;
                  const showPartial = round.mode === 'find_all' && phase === 'answering' && isFoundSoFar;

                  return (
                    <CellButton
                      key={`${currentRound}-${row}-${col}`}
                      item={item}
                      style={[
                        s.cell,
                        showCorrect && s.cellOk,
                        showWrong && s.cellErr,
                        showDim && s.cellDim,
                        showPartial && s.cellPartial,
                      ]}
                      onPress={() => {
                        if (phase !== 'answering') return;
                        if (round.mode === 'find_all' && isFoundSoFar) return;
                        handleAnswer(item);
                      }}
                      disabled={phase !== 'answering'}
                      emojiStyle={[s.cellEmoji, { fontSize: emojiSize }]}
                      isCorrect={showCorrect}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={s.roundLbl}>Round {currentRound + 1} of {TOTAL_ROUNDS}</Text>
        </View>
      </View>

      <View style={s.bottomSection} />
    </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topSection: { backgroundColor: 'rgba(255,255,255,0.95)' },
  bottomSection: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

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
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  backTxt: { fontSize: 17, color: Colors.text, fontFamily: 'Nunito_700Bold' },
  headerTitle: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, lineHeight: 18 },
  scorePill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  scoreTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  domainTag: { fontSize: 16, fontFamily: 'Nunito_900Black', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, alignSelf: 'center' },

  pips: { flexDirection: 'row', gap: 5, marginBottom: 14, alignSelf: 'center' },
  pip: { width: 28, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.08)' },
  pipOk: { backgroundColor: Colors.teal },
  pipErr: { backgroundColor: Colors.coral },
  pipActive: { backgroundColor: 'rgba(0,0,0,0.2)' },

  timerWrap: { marginBottom: 16 },
  timerTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3 },

  modeBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,201,167,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  modeBadgeTxt: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.teal },

  promptWrap: { marginBottom: 12, minHeight: 28 },
  promptTxt: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#1A1A1A', textAlign: 'center' },

  progressLbl: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
    marginBottom: 8,
  },

  grid: { gap: CELL_GAP },
  gridRow: { flexDirection: 'row', gap: CELL_GAP },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cellInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cellOk: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)' },
  cellErr: { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.15)' },
  cellDim: { opacity: 0.35 },
  cellPartial: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.08)' },
  cellEmoji: { fontSize: 60 },

  roundLbl: { marginTop: 28, fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.muted, alignSelf: 'center' },
});
