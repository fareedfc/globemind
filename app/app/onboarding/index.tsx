import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '✈️',
    accent: Colors.gold,
    title: 'Explore the world.\nSharpen your mind.',
    body: 'GlobeMind is a beautiful journey game designed to keep your brain sharp — without it ever feeling like homework.',
  },
  {
    emoji: '🧩',
    accent: Colors.teal,
    title: '4 games.\n4 brain powers.',
    body: 'Memory Match, Word Builder, Speed Match, and Pattern Pulse — each level trains a key cognitive skill.',
    extras: ['🎴 Working Memory', '⚡ Processing Speed', '🔤 Verbal Fluency', '🔮 Pattern Recognition'],
  },
  {
    emoji: '🧠',
    accent: Colors.purple,
    title: 'Your Brain Score\ngrows with you.',
    body: 'Every session updates your Brain Score and domain breakdown. Watch yourself improve week by week.',
  },
];

function Slide({ item }: { item: typeof SLIDES[0] }) {
  return (
    <View style={[s.slide, { width: SCREEN_W }]}>
      <Text style={s.slideEmoji}>{item.emoji}</Text>
      <Text style={[s.slideTitle, { color: Colors.white }]}>{item.title}</Text>
      <Text style={s.slideBody}>{item.body}</Text>
      {item.extras && (
        <View style={s.extrasGrid}>
          {item.extras.map(e => (
            <View key={e} style={[s.extraChip, { borderColor: `${item.accent}40` }]}>
              <Text style={[s.extraTxt, { color: item.accent }]}>{e}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(0); // 0-2 = slides, 3 = baseline
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [baselineDone, setBaselineDone] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (step < SLIDES.length - 1) {
      const next = step + 1;
      setStep(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      // Move to baseline step
      setStep(3);
      animateBaseline();
    }
  };

  const animateBaseline = () => {
    const TARGET = 742;
    const steps = 40;
    let current = 0;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      current = Math.round((TARGET / steps) * i);
      setScoreDisplay(current);
      if (i >= steps) {
        setScoreDisplay(TARGET);
        clearInterval(interval);
        setBaselineDone(true);
      }
    }, 30);
  };

  const finish = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/(tabs)/journey');
  };

  if (step === 3) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.baselineBody}>
          <Text style={s.baselineLbl}>Calculating your baseline...</Text>
          <LinearGradient
            colors={['#1a3a5c', '#0d2137']}
            style={s.scoreCard}
          >
            <Text style={s.scoreCardLbl}>Brain Score</Text>
            <Text style={s.scoreCardNum}>{scoreDisplay}</Text>
            {baselineDone && (
              <Text style={s.scoreCardSub}>Sharper than 50% your age group — let's change that.</Text>
            )}
          </LinearGradient>

          {baselineDone && (
            <TouchableOpacity style={s.startBtn} onPress={finish} activeOpacity={0.85}>
              <Text style={s.startBtnTxt}>Start Your Journey →</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[s.dot, i === step && s.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={s.cta}>
        <TouchableOpacity style={s.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={s.nextBtnTxt}>
            {step < SLIDES.length - 1 ? 'Next →' : 'Set My Baseline'}
          </Text>
        </TouchableOpacity>
        {step === 0 && (
          <TouchableOpacity onPress={finish} activeOpacity={0.6} style={s.skipBtn}>
            <Text style={s.skipBtnTxt}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  slideEmoji: { fontSize: 72, marginBottom: 24 },
  slideTitle: {
    fontSize: 30,
    fontFamily: 'Nunito_900Black',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  slideBody: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
  },
  extraChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  extraTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold' },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: Colors.gold,
    width: 24,
  },

  cta: { paddingHorizontal: 24, paddingBottom: 20, gap: 10 },
  nextBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#1a1a2e' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipBtnTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  // Baseline step
  baselineBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 24,
  },
  baselineLbl: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreCard: {
    width: '100%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  scoreCardLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreCardNum: {
    fontSize: 72,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
    lineHeight: 80,
  },
  scoreCardSub: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
  },
  startBtn: {
    width: '100%',
    backgroundColor: Colors.gold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#1a1a2e' },
});
