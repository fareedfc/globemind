import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ImageBackground } from 'react-native';
import { useFocusEffect } from 'expo-router';

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
import { PATTERN_SETS, type PatternRound } from '../../data/patternSets';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { FailScreen } from '../../components/games/FailScreen';
import { calcPatternStars, calcActualPoints } from '../../utils/scoring';
import { useProgressStore } from '../../stores/progressStore';
import { pickInsight } from '../../data/brainInsights';

const TOTAL_ROUNDS = 7;
const FAIL_THRESHOLD = 4;

type Phase = 'watching' | 'answering' | 'feedback';
type PipState = 'none' | 'ok' | 'err';
type PatternMode = 'next' | 'missing' | 'flash' | 'break_it';

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ── Active round type ─────────────────────────────────────────────────────────
interface ActiveRound {
  base: PatternRound;
  mode: PatternMode;
  displaySeq: string[];   // shown in sequence area (may contain ❓ or a planted wrong item)
  answer: string;         // correct answer for this mode
  choices: string[];      // 4 shuffled choices
  specialIdx?: number;    // position of ❓ or broken item (missing / break_it)
  wrongItem?: string;     // break_it: the planted wrong emoji
}

// ── Mode + round generation ───────────────────────────────────────────────────
function pickPatternMode(levelId: number): PatternMode {
  if (levelId <= 20) return 'next';
  if (levelId <= 40) return Math.random() < 0.5 ? 'next' : 'missing';
  if (levelId <= 70) {
    const r = Math.random();
    if (r < 0.35) return 'next';
    if (r < 0.65) return 'missing';
    return 'flash';
  }
  const modes: PatternMode[] = ['next', 'missing', 'flash', 'break_it'];
  return modes[Math.floor(Math.random() * modes.length)];
}

function buildPatternRounds(sets: PatternRound[], count: number, levelId: number): ActiveRound[] {
  const shuffled = [...sets].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  const allEmojis = sets.flatMap(s => [...s.seq, s.ans]);

  // Shorter sequences for early levels (show 4 of 5 items → next = seq[4])
  const seqLen = levelId <= 20 ? 4 : 5;

  return selected.map(base => {
    const mode = pickPatternMode(levelId);

    // ── next / flash ────────────────────────────────────────────────────────
    if (mode === 'next' || mode === 'flash') {
      if (seqLen < base.seq.length) {
        const answer = base.seq[seqLen];
        const wrongs = allEmojis
          .filter(e => e !== answer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        return {
          base, mode,
          displaySeq: base.seq.slice(0, seqLen),
          answer,
          choices: [...wrongs, answer].sort(() => Math.random() - 0.5),
        };
      }
      return {
        base, mode,
        displaySeq: base.seq,
        answer: base.ans,
        choices: base.ch,
      };
    }

    // ── missing: replace a middle position with ❓ ─────────────────────────
    if (mode === 'missing') {
      const idx = 1 + Math.floor(Math.random() * (base.seq.length - 2));
      const answer = base.seq[idx];
      const wrongs = allEmojis
        .filter(e => e !== answer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const displaySeq = [...base.seq];
      displaySeq[idx] = '❓';
      return {
        base, mode,
        displaySeq,
        answer,
        choices: [...wrongs, answer].sort(() => Math.random() - 0.5),
        specialIdx: idx,
      };
    }

    // ── break_it: plant a wrong emoji at a middle position ─────────────────
    const idx = 1 + Math.floor(Math.random() * (base.seq.length - 2));
    const correctItem = base.seq[idx];
    const wrongPool = allEmojis.filter(e => e !== correctItem && !base.seq.includes(e));
    const wrongItem = wrongPool.length > 0
      ? wrongPool[Math.floor(Math.random() * wrongPool.length)]
      : allEmojis.filter(e => e !== correctItem)[0];
    const displaySeq = [...base.seq];
    displaySeq[idx] = wrongItem;
    const wrongs = allEmojis
      .filter(e => e !== correctItem)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return {
      base, mode,
      displaySeq,
      answer: correctItem,
      choices: [...wrongs, correctItem].sort(() => Math.random() - 0.5),
      specialIdx: idx,
      wrongItem,
    };
  });
}

// ── Choice button ─────────────────────────────────────────────────────────────
function PatternChoiceBtn({ choice, style, onPress, disabled, txtStyle, isCorrect }: {
  choice: string; style: any; onPress: () => void; disabled: boolean; txtStyle: any; isCorrect?: boolean;
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
    scale.setValue(0.85);
    Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }).start();
    onPress();
  };
  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={1} style={s.choiceWrap}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        <Text style={txtStyle}>{choice}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function PatternGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '5');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[4];

  // Difficulty scaling across 101 levels
  const totalRounds = levelId >= 81 ? 9 : levelId >= 51 ? 8 : 7;
  const answerMs = levelId >= 61 ? 5000 : levelId >= 31 ? 6500 : 8000;
  const flashItemMs = levelId >= 71 ? 320 : levelId >= 41 ? 430 : 550;

  const rounds = useRef<ActiveRound[]>(buildPatternRounds(PATTERN_SETS, totalRounds, levelId));

  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('watching');
  const [litIndex, setLitIndex] = useState(-1);
  const [seqHidden, setSeqHidden] = useState(false);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [score, setScore] = useState(0);
  const [pips, setPips] = useState<PipState[]>(Array(totalRounds).fill('none'));
  const [feedbackAnswer, setFeedbackAnswer] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [failed, setFailed] = useState(false);

  const cancelRef = useRef(false);
  const wrongCountRef = useRef(0);
  const currentRoundRef = useRef(0);
  const scoreRef = useRef(0);

  // Reset game state every time the screen comes into focus (expo-router keeps screens alive)
  useFocusEffect(useCallback(() => {
    cancelRef.current = false;
    wrongCountRef.current = 0;
    currentRoundRef.current = 0;
    scoreRef.current = 0;
    rounds.current = buildPatternRounds(PATTERN_SETS, totalRounds, levelId);
    setCurrentRound(0);
    setPhase('watching');
    setLitIndex(-1);
    setSeqHidden(false);
    timerAnim.setValue(1);
    setScore(0);
    setPips(Array(totalRounds).fill('none'));
    setFeedbackAnswer(null);
    setWon(false);
    setFailed(false);
  }, [levelId, totalRounds]));

  currentRoundRef.current = currentRound;
  scoreRef.current = score;

  const warningTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopAnswerTimer = useCallback(() => {
    timerAnim.stopAnimation();
    warningTimersRef.current.forEach(clearTimeout);
    warningTimersRef.current = [];
  }, [timerAnim]);

  const handleAnswer = useCallback((ans: string | null) => {
    stopAnswerTimer();
    cancelRef.current = true;

    const activeRound = rounds.current[currentRoundRef.current];
    if (!activeRound) return;
    const correct = ans === activeRound.answer;

    if (correct) {
      scoreRef.current += 1;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (ans !== null) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      wrongCountRef.current += 1;
    } else {
      wrongCountRef.current += 1;
    }
    setScore(scoreRef.current);
    setFeedbackAnswer(ans);
    setPhase('feedback');
    setPips(prev => {
      const next = [...prev];
      next[currentRoundRef.current] = correct ? 'ok' : 'err';
      return next;
    });

    const willFail = !correct && wrongCountRef.current >= FAIL_THRESHOLD;
    setTimeout(() => {
      if (willFail) { setFailed(true); return; }
      const nextRound = currentRoundRef.current + 1;
      if (nextRound >= totalRounds) {
        setWon(true);
      } else {
        setCurrentRound(nextRound);
      }
    }, 1000);
  }, [stopAnswerTimer]);

  const startAnswerTimer = useCallback(() => {
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

  const playSequence = useCallback(async (activeRound: ActiveRound) => {
    cancelRef.current = false;
    setPhase('watching');
    setLitIndex(-1);
    setFeedbackAnswer(null);
    timerAnim.setValue(1);
    setSeqHidden(false);

    for (let i = 0; i < activeRound.displaySeq.length; i++) {
      if (cancelRef.current) return;
      Haptics.selectionAsync();
      setLitIndex(i);
      await delay(flashItemMs);
      if (cancelRef.current) return;
      setLitIndex(-1);
      await delay(Math.round(flashItemMs * 0.27));
    }

    if (cancelRef.current) return;

    if (activeRound.mode === 'flash') {
      // Sequence vanishes before answering
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSeqHidden(true);
      await delay(200);
    } else {
      await delay(400);
    }

    if (cancelRef.current) return;
    setPhase('answering');
    startAnswerTimer();
  }, [startAnswerTimer, flashItemMs]);

  useEffect(() => {
    if (won) return;
    const activeRound = rounds.current[currentRound];
    if (!activeRound) return;
    playSequence(activeRound);
    return () => {
      cancelRef.current = true;
      stopAnswerTimer();
    };
  }, [currentRound, won]);

  useEffect(() => () => {
    cancelRef.current = true;
    stopAnswerTimer();
  }, []);

  const resetGame = () => {
    cancelRef.current = true;
    stopAnswerTimer();
    rounds.current = buildPatternRounds(PATTERN_SETS, totalRounds, levelId);
    setCurrentRound(0);
    setPhase('watching');
    setLitIndex(-1);
    setSeqHidden(false);
    timerAnim.setValue(1);
    setScore(0);
    scoreRef.current = 0;
    wrongCountRef.current = 0;
    setPips(Array(totalRounds).fill('none'));
    setFeedbackAnswer(null);
    setWon(false);
    setFailed(false);
  };

  const activeRound = rounds.current[currentRound];
  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: [Colors.coral, Colors.coral, Colors.gold, Colors.teal],
  });

  const winPct = Math.round((score / totalRounds) * 100);
  const stars = calcPatternStars(score);
  const isFirstClear = useProgressStore.getState().completions[levelId] === undefined;
  const lastPlayedAt = useProgressStore.getState().lastPlayedAt?.[levelId];
  const previewPts = calcActualPoints(stars, levelId, isFirstClear, lastPlayedAt);
  const winData: WinData = {
    type: 'pattern',
    emoji: stars === 5 ? '🔮' : stars === 4 ? '🌟' : stars === 3 ? '✨' : stars === 2 ? '🧩' : '🌱',
    title: stars === 5 ? 'Pattern Master!' : stars === 4 ? 'Excellent!' : stars === 3 ? 'Sharp Eye!' : stars === 2 ? 'Good Effort!' : 'Keep Practicing!',
    sub: 'Pattern recognition sharpens how fast you read situations and make decisions.',
    stats: [
      { num: `${score}/${totalRounds}`, lbl: 'Correct' },
      { num: `${winPct}%`, lbl: 'Accuracy' },
      { num: `+${previewPts}`, lbl: 'Points' },
    ],
    insight: pickInsight('pattern'),
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
        <FailScreen type="pattern" levelId={levelId} onTryAgain={resetGame} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  if (!activeRound) return null;

  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];

  const mode = activeRound.mode;
  const isFeedbackOk = phase === 'feedback' && feedbackAnswer === activeRound.answer;
  const isFeedbackErr = phase === 'feedback' && feedbackAnswer !== activeRound.answer;

  const phaseLabel =
    phase === 'watching' ? (
      mode === 'flash'    ? '⚡ Memorise it — it vanishes!' :
      mode === 'break_it' ? '🔍 Find the wrong item...' :
      mode === 'missing'  ? '🧩 Something is hiding...' :
                            '👀 Watch the sequence...'
    ) :
    phase === 'answering' ? (
      mode === 'flash'    ? '🧠 What comes next? (from memory)' :
      mode === 'break_it' ? '🔧 What should replace the wrong item?' :
      mode === 'missing'  ? '❓ What is the missing piece?' :
                            '🤔 What comes next?'
    ) :
    isFeedbackOk ? '✅ Correct!' : '❌ Not quite...';

  const questionText =
    phase === 'answering' ? (
      mode === 'break_it' ? 'Pick what should be there instead:' :
      mode === 'missing'  ? 'Choose the missing symbol:' :
                            'Choose the next symbol in the pattern:'
    ) :
    phase === 'feedback' && !isFeedbackOk
      ? `The answer was ${activeRound.answer}`
      : '';

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
        <Text style={[s.domainTag, { color: Colors.teal }]}>Pattern</Text>

        <View style={s.instr}>
          <Text style={s.instrTxt}>{level.desc}</Text>
        </View>

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
        <View style={[s.timerWrap, phase === 'watching' && { opacity: 0 }]}>
          <View style={s.timerTrack}>
            <Animated.View style={[s.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
          </View>
        </View>

        {/* Mode badge */}
        {mode !== 'next' && (
          <View style={s.modeBadge}>
            <Text style={s.modeBadgeTxt}>
              {mode === 'flash'    ? '⚡ Flash'   :
               mode === 'missing'  ? '🧩 Missing' :
                                     '🔧 Break It'}
            </Text>
          </View>
        )}

        {/* Phase label */}
        <Text style={[s.phaseLabel, phase === 'watching' ? s.phaseWatch : s.phaseRecall]}>
          {phaseLabel}
        </Text>

        {/* Sequence */}
        <View style={[s.seq, seqHidden && { opacity: 0 }]}>
          {activeRound.displaySeq.map((sym, i) => {
            const isLit = phase === 'watching' && litIndex === i;
            const isBroken = mode === 'break_it' && i === activeRound.specialIdx;
            const isMissing = sym === '❓';
            return (
              <View key={i} style={[
                s.sym,
                isLit && s.symLit,
                isBroken && phase !== 'feedback' && s.symBroken,
                isMissing && s.symMissing,
                isFeedbackOk && s.symOk,
                isFeedbackErr && s.symErr,
              ]}>
                <Text style={s.symTxt}>{sym}</Text>
              </View>
            );
          })}
          {/* ? end marker only for next / flash modes */}
          {(mode === 'next' || mode === 'flash') && (
            <View style={[s.sym, s.symQuestion]}>
              <Text style={s.symQuestionTxt}>?</Text>
            </View>
          )}
        </View>

        {/* Question prompt */}
        <Text style={s.question}>{questionText}</Text>

        {/* Choices — 2×2 grid */}
        <View style={s.choices}>
          {activeRound.choices.map((choice, i) => {
            const isSelected = feedbackAnswer === choice;
            const isCorrectAnswer = choice === activeRound.answer;
            const showCorrect = phase === 'feedback' && isCorrectAnswer;
            const showWrong = phase === 'feedback' && isSelected && !isCorrectAnswer;
            return (
              <PatternChoiceBtn
                key={i}
                choice={choice}
                style={[s.choice, showCorrect && s.choiceOk, showWrong && s.choiceErr]}
                onPress={() => phase === 'answering' && handleAnswer(choice)}
                disabled={phase !== 'answering'}
                txtStyle={s.choiceTxt}
                isCorrect={showCorrect}
              />
            );
          })}
        </View>
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
  topSection: { backgroundColor: 'rgba(255,255,255,1.0)' },
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

  body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  domainTag: { fontSize: 16, fontFamily: 'Nunito_900Black', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  instr: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 11, padding: 10, marginBottom: 14 },
  instrTxt: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#1A1A1A', lineHeight: 26 },

  pips: { flexDirection: 'row', gap: 5, justifyContent: 'center', marginBottom: 12 },
  pip: { width: 28, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.08)' },
  pipOk: { backgroundColor: Colors.teal },
  pipErr: { backgroundColor: Colors.coral },
  pipActive: { backgroundColor: 'rgba(0,0,0,0.2)' },

  timerWrap: { marginBottom: 10 },
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

  phaseLabel: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', textAlign: 'center', minHeight: 22, marginBottom: 12 },
  phaseWatch: { color: Colors.teal },
  phaseRecall: { color: Colors.gold },

  seq: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 14, flexWrap: 'wrap', minHeight: 52 },
  sym: {
    width: 42, height: 42,
    borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  symLit:      { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)', transform: [{ scale: 1.15 }] },
  symOk:       { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.2)' },
  symErr:      { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.2)' },
  symBroken:   { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.12)' },
  symMissing:  { borderColor: Colors.gold, backgroundColor: 'rgba(245,158,11,0.1)' },
  symTxt:      { fontSize: 24 },
  symQuestion: { borderColor: 'rgba(245,158,11,0.4)', backgroundColor: 'rgba(245,158,11,0.07)' },
  symQuestionTxt: { fontSize: 16, fontFamily: 'Nunito_900Black', color: Colors.gold },

  question: { textAlign: 'center', minHeight: 26, marginBottom: 12, fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choiceWrap: { width: '48%' },
  choice: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    height: 110,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  choiceOk:  { borderColor: Colors.teal,  backgroundColor: 'rgba(6,214,160,0.2)' },
  choiceErr: { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.15)' },
  choiceTxt: { fontSize: 48, color: Colors.text },
});
