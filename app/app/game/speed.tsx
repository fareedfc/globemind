import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ImageBackground } from 'react-native';

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
import { WinScreen, type WinData } from '../../components/games/WinScreen';
import { calcSpeedStars } from '../../utils/scoring';
import { pickInsight } from '../../data/brainInsights';

const GRID_GAP = 9;
const TOTAL_MS = 30_000;

// Themed emoji pools — one per world (10 worlds, need ≥9 emoji each for 3×3 grid)
const SPEED_POOLS: string[][] = [
  ['🌸', '🌊', '🏔️', '🌺', '⭐', '🎯', '🌍', '🎭', '🦋', '🌙', '🎪', '🍀'], // W1 Nature
  ['🐬', '🦈', '🐙', '🦀', '🐚', '🐠', '🦑', '🐡', '🦞', '🐟', '🐋', '🦭'], // W2 Ocean
  ['🦁', '🐯', '🦊', '🐺', '🦝', '🐻', '🦌', '🐘', '🦒', '🦓', '🦏', '🐆'], // W3 Animals
  ['🍕', '🍔', '🌮', '🍜', '🍣', '🍩', '🍦', '🎂', '🍇', '🥝', '🥐', '🍱'], // W4 Food
  ['🚀', '🪐', '☄️', '🌟', '🛸', '🔭', '🌌', '💫', '🌙', '🛰️', '👾', '🌠'], // W5 Space
  ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🍒', '🥭', '🍍', '🥥', '🍈'], // W6 Fruits
  ['☀️', '🌧️', '❄️', '🌈', '⚡', '🌪️', '🌤️', '🌫️', '🌊', '🌩️', '🌬️', '🌂'], // W7 Weather
  ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🏉', '🎱', '🏓', '🥊', '🏸', '🎿'], // W8 Sports
  ['🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵', '🇧🇷', '🇦🇺', '🇨🇦', '🇲🇽', '🇰🇷', '🇬🇧', '🇪🇸', '🇮🇳'], // W9 Flags
  ['♠️', '♥️', '♦️', '♣️', '🔴', '🟡', '🟢', '🔵', '🟣', '🟠', '⬛', '⬜'], // W10 Symbols
];

function getSpeedConfig(levelId: number): { pool: string[]; cols: number; rows: number } {
  const worldIdx = Math.min(Math.floor((levelId - 1) / 10), SPEED_POOLS.length - 1);
  const pool = SPEED_POOLS[worldIdx];
  if (levelId <= 20) return { pool, cols: 2, rows: 2 }; // 4 cells — easy
  if (levelId <= 60) return { pool, cols: 3, rows: 2 }; // 6 cells — medium
  return { pool, cols: 3, rows: 3 };                    // 9 cells — hard
}

type GameMode = 'find' | 'oddone' | 'donttap';
const MODES: GameMode[] = ['find', 'oddone', 'donttap'];

const MODE_LABEL: Record<GameMode, string> = {
  find:    'Find this →',
  oddone:  'Tap the odd one!',
  donttap: 'Don\'t tap this →',
};

function buildRound(pool: string[], count: number): { mode: GameMode; target: string; options: string[] } {
  const mode = MODES[Math.floor(Math.random() * MODES.length)];

  if (mode === 'oddone') {
    const decoy = pool[Math.floor(Math.random() * pool.length)];
    const rest  = pool.filter(e => e !== decoy);
    const odd   = rest[Math.floor(Math.random() * rest.length)];
    const options = [...Array(count - 1).fill(decoy), odd].sort(() => Math.random() - 0.5);
    return { mode, target: odd, options };
  }

  // 'find' and 'donttap': target shown at top, present in grid
  const target = pool[Math.floor(Math.random() * pool.length)];
  const others = pool.filter(e => e !== target).sort(() => Math.random() - 0.5).slice(0, count - 1);
  const options = [...others, target].sort(() => Math.random() - 0.5);
  return { mode, target, options };
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
  const { pool, cols, rows } = getSpeedConfig(levelId);
  const cellCount = cols * rows;

  const [round, setRound] = useState(() => buildRound(pool, cellCount));
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const [timerSecs, setTimerSecs] = useState(30);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [flash, setFlash] = useState<{ idx: number; correct: boolean } | null>(null);
  const [comboText, setComboText] = useState('');

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const comboRef = useRef(0);
  const warningTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopTimer = useCallback(() => {
    timerAnim.stopAnimation();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    runningRef.current = false;
    setRunning(false);
    warningTimersRef.current.forEach(clearTimeout);
    warningTimersRef.current = [];
  }, [timerAnim]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    runningRef.current = true;
    setRunning(true);
    // Smooth bar via Animated.timing
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: TOTAL_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        runningRef.current = false;
        setRunning(false);
        setWon(true);
      }
    });
    warningTimersRef.current = ([
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),  TOTAL_MS - 3000),
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), TOTAL_MS - 2000),
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),  TOTAL_MS - 1000),
    ]);
    // Seconds countdown for display only (1s interval)
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TOTAL_MS - elapsed);
      setTimerSecs(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 500);
  }, [timerAnim]);

  useEffect(() => () => {
    timerAnim.stopAnimation();
    if (timerRef.current) clearInterval(timerRef.current);
  }, [timerAnim]);

  const tapOption = useCallback((emoji: string, idx: number) => {
    if (!runningRef.current) return;

    const { mode, target } = round;
    // 'find' and 'oddone': correct = tapped the target
    // 'donttap': correct = tapped anything except the target
    const isCorrect = mode === 'donttap' ? emoji !== target : emoji === target;

    if (isCorrect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setFlash({ idx, correct: true });
      setCorrect(p => p + 1);
      const nextCombo = comboRef.current + 1;
      comboRef.current = nextCombo;
      if (nextCombo === 3 || nextCombo === 5 || nextCombo === 10) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setMaxCombo(m => Math.max(m, nextCombo));
      const pts = 10 + (nextCombo > 1 ? (nextCombo - 1) * 5 : 0);
      setScore(s => s + pts);
      setCombo(nextCombo);
      setComboText(nextCombo > 1 ? `🔥 x${nextCombo} +${pts}⭐` : `✓ +${pts}⭐`);
      setTimeout(() => {
        setFlash(null);
        Haptics.selectionAsync();
        setRound(buildRound(pool, cellCount));
        setComboText('');
      }, 180);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFlash({ idx, correct: false });
      setWrong(p => p + 1);
      comboRef.current = 0;
      setCombo(0);
      setComboText('❌ -5⭐');
      setScore(s => Math.max(0, s - 5));
      // 'donttap' always advances — any tap = decision made
      if (mode === 'donttap') {
        setTimeout(() => {
          setFlash(null);
          Haptics.selectionAsync();
          setRound(buildRound(pool, cellCount));
          setComboText('');
        }, 350);
      } else {
        setTimeout(() => { setFlash(null); setComboText(''); }, 400);
      }
    }
  }, [round]);

  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: [Colors.coral, Colors.coral, Colors.gold, Colors.teal],
  });

  const resetGame = () => {
    stopTimer();
    comboRef.current = 0;
    setRound(buildRound(pool, cellCount));
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrect(0);
    setWrong(0);
    timerAnim.setValue(1);
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
    emoji: stars === 5 ? '⚡' : stars === 4 ? '🌟' : stars === 3 ? '🎯' : stars === 2 ? '👍' : '🌱',
    title: stars === 5 ? 'Blazing Fast!' : stars === 4 ? 'Excellent!' : stars === 3 ? 'Sharp Reflexes!' : stars === 2 ? 'Good Warm-Up!' : 'Keep Practicing!',
    sub: 'Quick reflexes and sharp focus — you\'re on fire.',
    stats: [
      { num: `⭐ ${score}`, lbl: 'Total' },
      { num: `${acc}%`, lbl: 'Accuracy' },
      { num: `x${maxCombo}`, lbl: 'Best combo' },
    ],
    insight: pickInsight('speed'),
    stars,
  };

  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];

  if (won) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <WinScreen data={winData} levelId={levelId} onExit={() => router.replace('/(tabs)/journey')} />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground source={worldBg} style={s.container} resizeMode="cover">
    <SafeAreaView style={s.safeArea} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => { Haptics.selectionAsync(); router.back(); }}>
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
            <Animated.View style={[s.timerFill, { width: timerWidth, backgroundColor: timerColor }]} />
          </View>
          <Text style={s.timerLbl}>{timerSecs}s</Text>
        </View>

        {/* Target & grid */}
        <View style={s.prompt}>
          <Text style={[s.findLbl, round.mode === 'donttap' && { color: Colors.coral }]}>
            {MODE_LABEL[round.mode]}
          </Text>

          {round.mode !== 'oddone' && (
            <View style={s.targetWrap}>
              <Animated.Text style={s.target}>{round.target}</Animated.Text>
              {round.mode === 'donttap' && (
                <Text style={s.noSign}>🚫</Text>
              )}
            </View>
          )}

          <Text style={s.comboTxt}>{comboText}</Text>

          <View style={s.grid}>
            {Array.from({ length: rows }).map((_, row) => (
              <View key={row} style={s.gridRow}>
                {round.options.slice(row * cols, row * cols + cols).map((emoji, col) => {
                  const idx = row * cols + col;
                  const isCorrect = flash?.idx === idx && flash.correct;
                  const isWrong = flash?.idx === idx && !flash.correct;
                  return (
                    <SpeedOptionBtn
                      key={`${round.target}-${idx}`}
                      emoji={emoji}
                      style={[s.opt, isCorrect && s.optCorrect, isWrong && s.optWrong]}
                      onPress={() => tapOption(emoji, idx)}
                      disabled={!started || !running}
                      txtStyle={[s.optTxt, { fontSize: cols === 3 && rows === 3 ? 28 : 36 }]}
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
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)' },

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
  domainTag: { fontSize: 16, fontFamily: 'Nunito_900Black', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  instr: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 11, padding: 10, marginBottom: 14 },
  instrTxt: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#1A1A1A', lineHeight: 26 },

  timerWrap: { marginBottom: 12 },
  timerTrack: { height: 7, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 4 },
  timerLbl: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, textAlign: 'right', marginTop: 3 },

  prompt: { flex: 1, justifyContent: 'center', gap: 14 },
  findLbl: { fontSize: 16, fontFamily: 'Nunito_700Bold', textTransform: 'uppercase', letterSpacing: 1.5, color: Colors.text, alignSelf: 'center' },
  targetWrap: { alignSelf: 'center', alignItems: 'center' },
  target: { fontSize: 74, lineHeight: 84, alignSelf: 'center' },
  noSign: { fontSize: 28, position: 'absolute', bottom: -4, right: -24 },
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
  optTxt: { fontSize: 36 },

  startBtn: {
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 17,
    backgroundColor: '#8B3FD9',
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
});
