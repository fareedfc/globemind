import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { ODD_ONE_SETS, type OddOneSet } from '../../data/oddOneSets';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcPatternStars, MILES_PER_STAR } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

const TOTAL_ROUNDS = 7;
const ANSWER_MS = 8_000;

function CellButton({ item, style, onPress, disabled, emojiStyle }: {
  item: string;
  style: any;
  onPress: () => void;
  disabled: boolean;
  emojiStyle: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    scale.setValue(0.88);
    Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={1}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        <Text style={emojiStyle}>{item}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

type Phase = 'answering' | 'feedback';
type PipState = 'none' | 'ok' | 'err';

export default function LogicGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '2');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[1];

  const rounds = useRef<OddOneSet[]>(
    [...ODD_ONE_SETS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS)
  );

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [timerPct, setTimerPct] = useState(100);
  const [score, setScore] = useState(0);
  const [pips, setPips] = useState<PipState[]>(Array(TOTAL_ROUNDS).fill('none'));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerStartRef = useRef(0);
  const currentRoundRef = useRef(0);
  const scoreRef = useRef(0);

  currentRoundRef.current = currentRound;
  scoreRef.current = score;

  const stopTimer = useCallback(() => {
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  }, []);

  const handleAnswer = useCallback((ans: string | null) => {
    stopTimer();
    const round = rounds.current[currentRoundRef.current];
    if (!round) return;
    const correct = ans === round.odd;

    if (correct) scoreRef.current += 1;
    setScore(scoreRef.current);
    setSelectedAnswer(ans);
    setPhase('feedback');
    setPips(prev => {
      const next = [...prev];
      next[currentRoundRef.current] = correct ? 'ok' : 'err';
      return next;
    });

    setTimeout(() => {
      const nextRound = currentRoundRef.current + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setWon(true);
      } else {
        setCurrentRound(nextRound);
        setPhase('answering');
        setSelectedAnswer(null);
        setTimerPct(100);
      }
    }, 1200);
  }, [stopTimer]);

  const startTimer = useCallback(() => {
    answerStartRef.current = Date.now();
    answerTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - answerStartRef.current;
      const remaining = Math.max(0, ANSWER_MS - elapsed);
      setTimerPct((remaining / ANSWER_MS) * 100);
      if (remaining <= 0) {
        stopTimer();
        handleAnswer(null);
      }
    }, 80);
  }, [stopTimer, handleAnswer]);

  useEffect(() => {
    if (won) return;
    startTimer();
    return stopTimer;
  }, [currentRound, won]);

  useEffect(() => () => stopTimer(), []);

  const resetGame = () => {
    stopTimer();
    rounds.current = [...ODD_ONE_SETS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    setCurrentRound(0);
    setPhase('answering');
    setTimerPct(100);
    setScore(0);
    scoreRef.current = 0;
    setPips(Array(TOTAL_ROUNDS).fill('none'));
    setSelectedAnswer(null);
    setWon(false);
  };

  const round = rounds.current[currentRound];
  const timerColor = timerPct > 50 ? Colors.teal : timerPct > 25 ? Colors.gold : Colors.coral;
  const stars = calcPatternStars(score);

  const winData: WinData = {
    type: 'logic',
    emoji: stars === 3 ? '🧠' : stars === 2 ? '💡' : '🌱',
    title: stars === 3 ? 'Sharp Thinker!' : stars === 2 ? 'Good Reasoning!' : 'Keep Going!',
    sub: 'Spotting what doesn\'t belong sharpens your judgement and decision-making every day.',
    stats: [
      { num: `${score}/${TOTAL_ROUNDS}`, lbl: 'Correct' },
      { num: `${Math.round((score / TOTAL_ROUNDS) * 100)}%`, lbl: 'Accuracy' },
      { num: `+${MILES_PER_STAR[stars]}`, lbl: 'Miles' },
    ],
    insight: pickInsight('logic'),
    stars,
  };

  if (won) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <WinScreen data={winData} levelId={levelId} onPlayAgain={resetGame} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  if (!round) return null;

  // Shuffle items once per round (stable via ref)
  const items = round.items;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
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
            <View
              key={i}
              style={[
                s.pip,
                pip === 'ok' && s.pipOk,
                pip === 'err' && s.pipErr,
                i === currentRound && pip === 'none' && s.pipActive,
              ]}
            />
          ))}
        </View>

        {/* Timer bar */}
        <View style={s.timerWrap}>
          <View style={s.timerTrack}>
            <View style={[s.timerFill, { width: `${timerPct}%` as any, backgroundColor: timerColor }]} />
          </View>
        </View>

        {/* Prompt */}
        <View style={s.promptWrap}>
          <Text style={s.promptTxt}>
            {phase === 'answering'
              ? '🤔 Which one doesn\'t belong?'
              : selectedAnswer === round.odd
                ? `✅ Correct! · ${round.hint}`
                : `❌ Not quite · ${round.hint}`}
          </Text>
        </View>

        {/* 2×2 grid */}
        <View style={s.grid}>
          {items.map((item, i) => {
            const isSelected = selectedAnswer === item;
            const isOdd = item === round.odd;
            const showCorrect = phase === 'feedback' && isOdd;
            const showWrong = phase === 'feedback' && isSelected && !isOdd;
            return (
              <CellButton
                key={`${currentRound}-${i}`}
                item={item}
                style={[
                  s.cell,
                  showCorrect && s.cellOk,
                  showWrong && s.cellErr,
                  phase === 'feedback' && !showCorrect && !showWrong && s.cellDim,
                ]}
                onPress={() => phase === 'answering' && handleAnswer(item)}
                disabled={phase !== 'answering'}
                emojiStyle={s.cellEmoji}
              />
            );
          })}
        </View>

        <Text style={s.roundLbl}>Round {currentRound + 1} of {TOTAL_ROUNDS}</Text>
      </View>
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

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' },
  domainTag: { fontSize: 11, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },

  pips: { flexDirection: 'row', gap: 5, marginBottom: 14 },
  pip: { width: 28, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.08)' },
  pipOk: { backgroundColor: Colors.teal },
  pipErr: { backgroundColor: Colors.coral },
  pipActive: { backgroundColor: 'rgba(0,0,0,0.2)' },

  timerWrap: { width: '100%', marginBottom: 20 },
  timerTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3 },

  promptWrap: { marginBottom: 32, minHeight: 28 },
  promptTxt: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: '100%' },
  cell: {
    width: '44%',
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
  cellOk: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)' },
  cellErr: { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.15)' },
  cellDim: { opacity: 0.35 },
  cellEmoji: { fontSize: 52 },

  roundLbl: { marginTop: 28, fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.muted },
});
