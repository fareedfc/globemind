import { useRef, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  ImageBackground,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';

const BG      = require('../../assets/landing-background.png');
const LOGO    = require('../../assets/icons/logo-thinkpop.png');
const STAR    = require('../../assets/icons/icon-star.png');

const DOMAIN_CARDS = [
  { icon: require('../../assets/icons/icon-memory.png'),  label: 'Memory',  tint: '#FFE9C4', color: '#E07B00' },
  { icon: require('../../assets/icons/icon-speed.png'),   label: 'Speed',   tint: '#FFD9CC', color: '#E8460A' },
  { icon: require('../../assets/icons/icon-pattern.png'), label: 'Pattern', tint: '#EEE0FF', color: '#8B3FD9' },
  { icon: require('../../assets/icons/icon-logic.png'),   label: 'Logic',   tint: '#FFD6ED', color: '#D4006A' },
];

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    title: '4 games.\n4 skills to master.',
    body: 'Memory, Logic, Speed, Pattern — each level is designed to keep you sharp.',
    extras: true,
  },
  {
    title: 'The better you play,\nthe more you earn.',
    body: 'Earn up to 5 stars per level. Replay for perfection and watch your score climb.',
    stars: true,
  },
];

function DomainsGrid() {
  const [active, setActive] = useState(0);
  const scales = useRef(DOMAIN_CARDS.map(() => new Animated.Value(1))).current;
  const opacities = useRef(DOMAIN_CARDS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0.45))).current;

  useEffect(() => {
    let idx = 0;
    const cycle = () => {
      const next = (idx + 1) % DOMAIN_CARDS.length;

      Animated.parallel([
        // Shrink current
        Animated.spring(scales[idx], { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(opacities[idx], { toValue: 0.45, duration: 300, useNativeDriver: true }),
        // Pop next
        Animated.spring(scales[next], { toValue: 1.08, useNativeDriver: true, tension: 160, friction: 6 }),
        Animated.timing(opacities[next], { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      idx = next;
      setActive(next);
    };

    // Kick off first highlight immediately
    Animated.parallel([
      Animated.spring(scales[0], { toValue: 1.08, useNativeDriver: true, tension: 160, friction: 6 }),
      Animated.timing(opacities[0], { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    const timer = setInterval(cycle, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={s.extrasGrid}>
      {DOMAIN_CARDS.map((d, i) => (
        <Animated.View
          key={d.label}
          style={[
            s.extraChip,
            { backgroundColor: d.tint },
            { transform: [{ scale: scales[i] }], opacity: opacities[i] },
          ]}
        >
          <Image source={d.icon} style={s.extraIcon} resizeMode="contain" />
          <Text style={[s.extraTxt, { color: d.color }]}>{d.label}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

function StarsShowcase() {
  const opacities = useRef([0,1,2,3,4].map(() => new Animated.Value(0.15))).current;
  const scales    = useRef([0,1,2,3,4].map(() => new Animated.Value(1))).current;

  useEffect(() => {
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;

      // Reset all to dim
      opacities.forEach(a => a.setValue(0.15));
      scales.forEach(a => a.setValue(1));

      // Light up each star in sequence
      [0,1,2,3,4].forEach(i => {
        setTimeout(() => {
          if (cancelled) return;
          Animated.parallel([
            Animated.spring(scales[i], { toValue: 1.2, tension: 200, friction: 5, useNativeDriver: true }),
            Animated.timing(opacities[i], { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start(() => {
            Animated.spring(scales[i], { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }).start();
          });
        }, i * 600);
      });

      // Loop after all 5 are lit + short pause
      setTimeout(runCycle, 5 * 600 + 1200);
    };

    runCycle();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={s.starsWrap}>
      {[0,1,2,3,4].map(i => (
        <Animated.Image
          key={i}
          source={STAR}
          style={[s.starIcon, { opacity: opacities[i], transform: [{ scale: scales[i] }] }]}
          resizeMode="contain"
        />
      ))}
    </View>
  );
}

function Slide({ item }: { item: typeof SLIDES[0] }) {
  return (
    <View style={[s.slide, { width: SCREEN_W }]}>
      <Image source={LOGO} style={s.logo} resizeMode="contain" />
      <Text style={[s.slideTitle, { color: Colors.text }]}>{item.title}</Text>
      <Text style={s.slideBody}>{item.body}</Text>
      {item.extras && <DomainsGrid />}
      {item.stars && <StarsShowcase />}
    </View>
  );
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    Haptics.selectionAsync();
    if (step < SLIDES.length - 1) {
      const next = step + 1;
      setStep(next);
      flatRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      finish();
    }
  };

  const finish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/landing');
  };


  return (
    <ImageBackground source={BG} style={s.container} resizeMode="cover">
      <View style={s.bgScrim} />
      <SafeAreaView style={{ flex: 1, width: '100%' }} edges={['top', 'bottom']}>
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

        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === step && s.dotActive]} />
          ))}
        </View>

        <View style={s.cta}>
          <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={s.nextBtn}>
            <Text style={s.nextBtnTxt}>
              {step < SLIDES.length - 1 ? 'Next →' : 'Start Your Journey →'}
            </Text>
          </TouchableOpacity>
          {step === 0 && (
            <TouchableOpacity onPress={finish} activeOpacity={0.6} style={s.skipBtn}>
              <Text style={s.skipBtnTxt}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bgScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.10)' },

  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  logo: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 30,
    fontFamily: 'Nunito_900Black',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  slideBody: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },

  extrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 28,
  },
  extraChip: {
    width: 120,
    height: 96,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  extraIcon: { width: 44, height: 44 },
  extraTxt: { fontSize: 13, fontFamily: 'Nunito_900Black' },

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
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    backgroundColor: '#8B3FD9',
    width: 24,
  },

  cta: { paddingHorizontal: 24, paddingBottom: 20, gap: 10 },
  nextBtn: {
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#8B3FD9',
  },
  nextBtnTxt: { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipBtnTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  // Stars showcase
  starsWrap: { flexDirection: 'row', gap: 12, marginTop: 32, justifyContent: 'center' },
  starIcon: { width: 48, height: 48 },

});
