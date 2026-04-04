import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcSpeedStars } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

const GRID_GAP = 9;

const EMOJIS = ['🌸', '🌊', '🏔️', '🌺', '⭐', '🎯', '🌍', '🎭', '🦋', '🌙', '🎪', '🍀'];
const TOTAL_MS = 30_000;

function buildRound(pool: string[]): { target: string; options: string[] } {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const others = pool.filter(e => e !== target).sort(() => Math.random() - 0.5).slice(0, 5);
  const options = [...others, target].sort(() => Math.random() - 0.5);
  return { target, options };
}

function SpeedOptionBtn({ emoji, style, onPress, disabled, txtStyle, isCorrect }: {
  emoji: string; style: any; onPress: () => void; disabled: boolean; txtStyle: any; isCorrect?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCorrect) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.22, tension: 300, friction: 5, useNativeDriver: true }),
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

  // TouchableOpacity is the direct flex child (flex: 1 from style).
  // Animated.View sits inside purely for the scale transform.
  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={1} style={style}>
      <Animated.View style={[s.optInner, { transform: [{ scale }] }]}>
        <Text style={txtStyle}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function SpeedGame() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '4');
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[3];

  const [round, setRound] = useState(() => buildRound(EMOJIS));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timerPct, setTimerPct] = useState(100);
  const [timerSecs, setTimerSecs] = useState(30);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [flash, setFlash] = useState<{ idx: number; correct: boolean } | null>(null);
  const [comboText, setComboText] = useState('');

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    runningRef.current = false;
    setRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    runningRef.current = true;
    setRunning(true);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TOTAL_MS - elapsed);
      const pct = (remaining / TOTAL_MS) * 100;
      setTimerPct(pct);
      setTimerSecs(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        runningRef.current = false;
        setRunning(false);
        setWon(true);
      }
    }, 100);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const tapOption = useCallback((emoji: string, idx: number) => {
    if (!runningRef.current) return;

    if (emoji === round.target) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFlash({ idx, correct: true });
      setCorrect(p => p + 1);
      setCombo(p => {
        const next = p + 1;
        setMaxCombo(m => Math.max(m, next));
        const pts = 10 + (next > 1 ? (next - 1) * 5 : 0);
        setScore(s => s + pts);
        setComboText(next > 1 ? `🔥 x${next} +${pts}⭐` : `✓ +${pts}⭐`);
        return next;
      });
      setTimeout(() => {
        setFlash(null);
        setRound(buildRound(EMOJIS));
        setComboText('');
      }, 180);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFlash({ idx, correct: false });
      setWrong(p => p + 1);
      setCombo(0);
      setComboText('');
      setTimeout(() => setFlash(null), 400);
    }
  }, [round.target]);

  const timerColor = timerPct > 50 ? Colors.teal : timerPct > 25 ? Colors.gold : Colors.coral;

  const resetGame = () => {
    stopTimer();
    setRound(buildRound(EMOJIS));
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrect(0);
    setWrong(0);
    setTimerPct(100);
    setTimerSecs(30);
    setRunning(false);
    setStarted(false);
    setWon(false);
    setFlash(null);
    setComboText('');
  };

  const handleStart = () => {
    setStarted(true);
    startTimer();
  };

  const acc = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

  const stars = calcSpeedStars(score);
  const winData: WinData = {
    type: 'speed',
    emoji: stars === 3 ? '⚡' : stars === 2 ? '🎯' : '🌱',
    title: stars === 3 ? 'Blazing Fast!' : stars === 2 ? 'Sharp Reflexes!' : 'Good Warm-Up!',
    sub: 'Processing speed is a core marker of brain health.',
    stats: [
      { num: `⭐ ${score}`, lbl: 'Total' },
      { num: `${acc}%`, lbl: 'Accuracy' },
      { num: `x${maxCombo}`, lbl: 'Best combo' },
    ],
    insight: pickInsight('speed'),
    stars,
  };

  if (won) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <WinScreen data={winData} levelId={levelId} onExit={() => router.replace('/(tabs)/journey')} />
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
        <View style={[s.scorePill, { backgroundColor: 'rgba(255,92,53,0.15)' }]}>
          <Text style={[s.scoreTxt, { color: Colors.coral }]}>{score}</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={[s.domainTag, { color: Colors.coral }]}>Speed</Text>

        <View style={s.instr}>
          <Text style={s.instrTxt}>{level.desc}</Text>
        </View>

        {/* Timer bar */}
        <View style={s.timerWrap}>
          <View style={s.timerTrack}>
            <View style={[s.timerFill, { width: `${timerPct}%` as any, backgroundColor: timerColor }]} />
          </View>
          <Text style={s.timerLbl}>{timerSecs}s</Text>
        </View>

        {/* Target & grid */}
        <View style={s.prompt}>
          <Text style={s.findLbl}>Find this →</Text>

          <Animated.Text style={s.target}>
            {round.target}
          </Animated.Text>

          <Text style={s.comboTxt}>{comboText}</Text>

          <View style={s.grid}>
            {[0, 1].map(row => (
              <View key={row} style={s.gridRow}>
                {round.options.slice(row * 3, row * 3 + 3).map((emoji, col) => {
                  const idx = row * 3 + col;
                  const isCorrect = flash?.idx === idx && flash.correct;
                  const isWrong = flash?.idx === idx && !flash.correct;
                  return (
                    <SpeedOptionBtn
                      key={`${round.target}-${idx}`}
                      emoji={emoji}
                      style={[s.opt, isCorrect && s.optCorrect, isWrong && s.optWrong]}
                      onPress={() => tapOption(emoji, idx)}
                      disabled={!started || !running}
                      txtStyle={s.optTxt}
                      isCorrect={isCorrect}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {!started && (
          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={s.startBtnTxt}>▶  Start Game</Text>
          </TouchableOpacity>
        )}
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

  body: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  domainTag: { fontSize: 11, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  instr: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 11, padding: 10, marginBottom: 14 },
  instrTxt: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.muted, lineHeight: 20 },

  timerWrap: { marginBottom: 12 },
  timerTrack: { height: 7, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 4 },
  timerLbl: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, textAlign: 'right', marginTop: 3 },

  prompt: { flex: 1, justifyContent: 'center', gap: 14 },
  findLbl: { fontSize: 12, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.muted, alignSelf: 'center' },
  target: { fontSize: 62, lineHeight: 72, alignSelf: 'center' },
  comboTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.gold, height: 20, alignSelf: 'center' },

  grid: {
    gap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  opt: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optInner: { alignItems: 'center', justifyContent: 'center' },
  optCorrect: { borderColor: Colors.teal, backgroundColor: 'rgba(6,214,160,0.15)' },
  optWrong: { borderColor: Colors.coral, backgroundColor: 'rgba(239,71,111,0.15)' },
  optTxt: { fontSize: 30 },

  startBtn: {
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 17,
    backgroundColor: Colors.gold,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
});
