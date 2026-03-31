import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
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
    body: 'ThinkPop is a beautiful journey game designed to keep your brain sharp — without it ever feeling like homework.',
  },
  {
    emoji: '🧩',
    accent: Colors.teal,
    title: '4 games.\n4 brain powers.',
    body: 'Memory, Logic, Speed, Pattern — each level is designed to give your brain a great workout.',
    extras: ['🧩 Memory', '⚡ Speed', '🔮 Pattern', '🔤 Logic'],
  },
  {
    emoji: '✈️',
    accent: Colors.teal,
    title: 'Earn miles.\nTrack your journey.',
    body: 'Every game earns you miles. The more you play — and the better you do — the further you travel.',
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
  const [step, setStep] = useState(0); // 0-2 = slides, 3 = ready screen
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (step < SLIDES.length - 1) {
      const next = step + 1;
      setStep(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      setStep(3);
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/landing');
  };

  if (step === 3) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.baselineBody}>
          <Text style={s.readyEmoji}>✈️</Text>
          <LinearGradient
            colors={['#1a3a5c', '#0d2137']}
            style={s.scoreCard}
          >
            <Text style={s.scoreCardLbl}>Miles Traveled</Text>
            <Text style={s.scoreCardNum}>0</Text>
            <Text style={s.scoreCardSub}>Play your first game to earn miles and start your journey.</Text>
          </LinearGradient>
          <TouchableOpacity onPress={finish} activeOpacity={0.85} style={{ width: '100%' }}>
            <LinearGradient colors={['#FFAA00', '#FF8C00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.startBtn}>
              <Text style={s.startBtnTxt}>Start Your Journey →</Text>
            </LinearGradient>
          </TouchableOpacity>
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
        <TouchableOpacity onPress={goNext} activeOpacity={0.85}>
          <LinearGradient colors={['#FFAA00', '#FF8C00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextBtn}>
            <Text style={s.nextBtnTxt}>
              {step < SLIDES.length - 1 ? 'Next →' : 'Set My Baseline'}
            </Text>
          </LinearGradient>
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
  readyEmoji: {
    fontSize: 64,
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
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#1a1a2e' },
});
