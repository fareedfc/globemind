import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { LEVELS } from '../../data/levels';
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcSpeedStars } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

const EMOJIS = ['🌸', '🌊', '🏔️', '🌺', '⭐', '🎯', '🌍', '✈️', '🎭', '🦋', '🌙', '🎪'];
const TOTAL_MS = 30_000;

function buildRound(pool: string[]): { target: string; options: string[] } {
  const target = pool[Math.floor(Math.random() * pool.length)];
  const others = pool.filter(e => e !== target).sort(() => Math.random() - 0.5).slice(0, 5);
  const options = [...others, target].sort(() => Math.random() - 0.5);
  return { target, options };
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
      setFlash({ idx, correct: true });
      setCorrect(p => p + 1);
      setCombo(p => {
        const next = p + 1;
        setMaxCombo(m => Math.max(m, next));
        const pts = 10 + (next > 1 ? (next - 1) * 5 : 0);
        setScore(s => s + pts);
        setComboText(next > 1 ? `🔥 x${next} +${pts}` : `✓ +${pts}`);
        return next;
      });
      setTimeout(() => {
        setFlash(null);
        setRound(buildRound(EMOJIS));
        setComboText('');
      }, 180);
    } else {
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
      { num: score, lbl: 'Score' },
      { num: `${acc}%`, lbl: 'Accuracy' },
      { num: `x${maxCombo}`, lbl: 'Best combo' },
    ],
    insight: pickInsight('speed'),
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
        <View style={[s.scorePill, { backgroundColor: 'rgba(239,71,111,0.2)' }]}>
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
            {round.options.map((emoji, idx) => {
              const isCorrect = flash?.idx === idx && flash.correct;
              const isWrong = flash?.idx === idx && !flash.correct;
              return (
                <TouchableOpacity
                  key={`${round.target}-${idx}`}
                  style={[s.opt, isCorrect && s.optCorrect, isWrong && s.optWrong]}
                  onPress={() => tapOption(emoji, idx)}
                  activeOpacity={0.75}
                  disabled={!started || !running}
                >
                  <Text style={s.optTxt}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
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

  timerWrap: { marginBottom: 12 },
  timerTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 4 },
  timerLbl: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, textAlign: 'right', marginTop: 3 },

  prompt: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  findLbl: { fontSize: 12, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.muted },
  target: { fontSize: 62, lineHeight: 72 },
  comboTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.gold, height: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    justifyContent: 'center',
    width: '100%',
  },
  opt: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
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
  startBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#1a1a2e' },
});
