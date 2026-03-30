import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { PATTERN_SETS, type PatternRound } from '../../data/patternSets';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcPatternStars, MILES_PER_STAR } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

const TOTAL_ROUNDS = 7;
const ANSWER_MS = 8_000;

type Phase = 'watching' | 'answering' | 'feedback';
type PipState = 'none' | 'ok' | 'err';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export default function PatternGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '5');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[4];

  const rounds = useRef<PatternRound[]>(
    [...PATTERN_SETS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS)
  );

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('watching');
  const [litIndex, setLitIndex] = useState(-1);
  const [timerPct, setTimerPct] = useState(100);
  const [score, setScore] = useState(0);
  const [pips, setPips] = useState<PipState[]>(Array(TOTAL_ROUNDS).fill('none'));
  const [feedbackAnswer, setFeedbackAnswer] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const cancelRef = useRef(false);
  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerStartRef = useRef(0);
  const currentRoundRef = useRef(0);
  const scoreRef = useRef(0);

  currentRoundRef.current = currentRound;
  scoreRef.current = score;

  const stopAnswerTimer = useCallback(() => {
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  }, []);

  const handleAnswer = useCallback((ans: string | null) => {
    stopAnswerTimer();
    cancelRef.current = true;

    const round = rounds.current[currentRoundRef.current];
    if (!round) return;
    const correct = ans === round.ans;

    if (correct) scoreRef.current += 1;
    const newScore = scoreRef.current;
    setScore(newScore);
    setFeedbackAnswer(ans);
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
      }
    }, 1000);
  }, [stopAnswerTimer]);

  const startAnswerTimer = useCallback(() => {
    answerStartRef.current = Date.now();
    answerTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - answerStartRef.current;
      const remaining = Math.max(0, ANSWER_MS - elapsed);
      setTimerPct((remaining / ANSWER_MS) * 100);
      if (remaining <= 0) {
        stopAnswerTimer();
        handleAnswer(null);
      }
    }, 80);
  }, [stopAnswerTimer, handleAnswer]);

  const playSequence = useCallback(async (round: PatternRound) => {
    cancelRef.current = false;
    setPhase('watching');
    setLitIndex(-1);
    setFeedbackAnswer(null);
    setTimerPct(100);

    for (let i = 0; i < round.seq.length; i++) {
      if (cancelRef.current) return;
      setLitIndex(i);
      await delay(550);
      if (cancelRef.current) return;
      setLitIndex(-1);
      await delay(150);
    }

    if (cancelRef.current) return;
    await delay(400);
    if (cancelRef.current) return;

    setPhase('answering');
    startAnswerTimer();
  }, [startAnswerTimer]);

  // Start sequence when round changes
  useEffect(() => {
    if (won) return;
    const round = rounds.current[currentRound];
    if (!round) return;
    playSequence(round);
    return () => {
      cancelRef.current = true;
      stopAnswerTimer();
    };
  }, [currentRound, won]);

  // Cleanup on unmount
  useEffect(() => () => {
    cancelRef.current = true;
    stopAnswerTimer();
  }, []);

  const resetGame = () => {
    cancelRef.current = true;
    stopAnswerTimer();
    rounds.current = [...PATTERN_SETS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    setCurrentRound(0);
    setPhase('watching');
    setLitIndex(-1);
    setTimerPct(100);
    setScore(0);
    scoreRef.current = 0;
    setPips(Array(TOTAL_ROUNDS).fill('none'));
    setFeedbackAnswer(null);
    setWon(false);
  };

  const round = rounds.current[currentRound];
  const timerColor = timerPct > 50 ? Colors.teal : timerPct > 25 ? Colors.gold : Colors.coral;

  const winPct = Math.round((score / TOTAL_ROUNDS) * 100);
  const stars = calcPatternStars(score);
  const winData: WinData = {
    type: 'pattern',
    emoji: stars === 3 ? '🔮' : stars === 2 ? '🧩' : '🌱',
    title: stars === 3 ? 'Pattern Master!' : stars === 2 ? 'Sharp Eye!' : 'Keep Practicing!',
    sub: 'Pattern recognition sharpens how fast you read situations and make decisions.',
    stats: [
      { num: `${score}/${TOTAL_ROUNDS}`, lbl: 'Correct' },
      { num: `${winPct}%`, lbl: 'Accuracy' },
      { num: `+${MILES_PER_STAR[stars]}`, lbl: 'Miles' },
    ],
    insight: pickInsight('pattern'),
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

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>Level {level.id} · {level.domain}</Text>
        <View style={[s.scorePill, { backgroundColor: 'rgba(6,214,160,0.2)' }]}>
          <Text style={[s.scoreTxt, { color: Colors.teal }]}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={[s.domainTag, { color: Colors.teal }]}>Pattern</Text>

        <View style={s.instr}>
          <Text style={s.instrTxt}>{level.desc}</Text>
        </View>

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

        {/* Timer bar (shown during answering & feedback) */}
        <View style={[s.timerWrap, phase === 'watching' && { opacity: 0 }]}>
          <View style={s.timerTrack}>
            <View style={[s.timerFill, { width: `${timerPct}%` as any, backgroundColor: timerColor }]} />
          </View>
        </View>

        {/* Phase label */}
        <Text style={[s.phaseLabel, phase === 'watching' ? s.phaseWatch : s.phaseRecall]}>
          {phase === 'watching' ? '👀 Watch the sequence...' :
           phase === 'answering' ? '🤔 What comes next?' :
           feedbackAnswer === round.ans ? '✅ Correct!' : '❌ Not quite...'}
        </Text>

        {/* Sequence symbols */}
        <View style={s.seq}>
          {round.seq.map((sym, i) => {
            const isLit = phase === 'watching' && litIndex === i;
            const isDim = phase !== 'watching' && phase !== 'feedback';
            const isFeedbackOk = phase === 'feedback' && feedbackAnswer === round.ans;
            const isFeedbackErr = phase === 'feedback' && feedbackAnswer !== round.ans;
            return (
              <View
                key={i}
                style={[
                  s.sym,
                  isLit && s.symLit,
                  isDim && s.symDim,
                  isFeedbackOk && s.symOk,
                  isFeedbackErr && s.symErr,
                ]}
              >
                <Text style={s.symTxt}>{sym}</Text>
              </View>
            );
          })}
          {/* Question mark symbol */}
          <View style={[s.sym, s.symQuestion]}>
            <Text style={s.symQuestionTxt}>?</Text>
          </View>
        </View>

        {/* Question prompt */}
        <Text style={s.question}>
          {phase === 'answering' ? 'Choose the next symbol in the pattern:' :
           phase === 'feedback' && feedbackAnswer !== round.ans ? `The answer was ${round.ans}` : ''}
        </Text>

        {/* Choices */}
        <View style={s.choices}>
          {round.ch.map((choice, i) => {
            const isSelected = feedbackAnswer === choice;
            const isCorrectAnswer = choice === round.ans;
            const showCorrect = phase === 'feedback' && isCorrectAnswer;
            const showWrong = phase === 'feedback' && isSelected && !isCorrectAnswer;
            return (
              <TouchableOpacity
                key={i}
                style={[s.choice, showCorrect && s.choiceOk, showWrong && s.choiceErr]}
                onPress={() => phase === 'answering' && handleAnswer(choice)}
                disabled={phase !== 'answering'}
                activeOpacity={0.75}
              >
                <Text style={s.choiceTxt}>{choice}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 17, color: Colors.white, fontFamily: 'Nunito_700Bold' },
  headerTitle: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.white, lineHeight: 18 },
  scorePill: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20 },
  scoreTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  domainTag: { fontSize: 11, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  instr: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 11, padding: 10, marginBottom: 14 },
  instrTxt: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.muted, lineHeight: 20 },

  pips: { flexDirection: 'row', gap: 5, justifyContent: 'center', marginBottom: 12 },
  pip: { width: 28, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  pipOk: { backgroundColor: Colors.teal },
  pipErr: { backgroundColor: Colors.coral },
  pipActive: { backgroundColor: 'rgba(255,255,255,0.3)' },

  timerWrap: { marginBottom: 10 },
  timerTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3 },

  phaseLabel: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', textAlign: 'center', minHeight: 22, marginBottom: 12 },
  phaseWatch: { color: Colors.teal },
  phaseRecall: { color: Colors.gold },

  seq: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 14, flexWrap: 'wrap', minHeight: 52 },
  sym: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)' },
  symLit: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)', transform: [{ scale: 1.15 }] },
  symDim: { opacity: 0.15 },
  symOk: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)' },
  symErr: { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.2)' },
  symTxt: { fontSize: 20 },
  symQuestion: { borderColor: 'rgba(255,209,102,0.4)', backgroundColor: 'rgba(255,209,102,0.07)' },
  symQuestionTxt: { fontSize: 16, fontFamily: 'Nunito_900Black', color: Colors.gold },

  question: { textAlign: 'center', minHeight: 26, marginBottom: 12, fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  choices: { flexDirection: 'row', gap: 7 },
  choice: { flex: 1, paddingVertical: 18, borderRadius: 13, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  choiceOk: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)' },
  choiceErr: { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.15)' },
  choiceTxt: { fontSize: 26 },
});
