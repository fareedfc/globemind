import { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  StatusBar,
  ImageBackground,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TopBar } from '../../components/layout/TopBar';
import { Pill } from '../../components/ui/Pill';
import { LEVELS, POS, type Level } from '../../data/levels';
import { Colors } from '../../constants/colors';
import { MAP_HEIGHT, MAP_WIDTH } from '../../constants/config';
import { PathSVG } from '../../components/path/PathSVG';
import { LevelNode } from '../../components/path/LevelNode';
import { usePlayerStore } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';
import { useLives } from '../../hooks/useLives';

const { width: SCREEN_W } = Dimensions.get('window');

const DOMAIN_COLORS: Record<string, string> = {
  memory:  Colors.gold,
  word:    Colors.purple,
  speed:   Colors.coral,
  pattern: Colors.teal,
};

const DOMAIN_ICONS: Record<string, ReturnType<typeof require>> = {
  memory:  require('../../assets/icons/icon-memory.png'),
  speed:   require('../../assets/icons/icon-speed.png'),
  logic:   require('../../assets/icons/icon-logic.png'),
  pattern: require('../../assets/icons/icon-pattern.png'),
};

const SCREEN_BACKGROUND = require('../../assets/landing-background.png');

// One background image per world, tiled side-by-side across the horizontal canvas
const WORLD_BACKGROUNDS = [
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

// Horizontal map dimensions
const MAP_VIEW_WIDTH  = MAP_WIDTH;  // 16000 — full horizontal canvas
const MAP_VIEW_HEIGHT = MAP_HEIGHT; // 600   — fixed display height
const WORLD_WIDTH = MAP_VIEW_WIDTH / 10; // each world gets equal share

const WORLD_MARKERS = [
  { label: 'World 1',  subtitle: 'Warm-up trail',    start: 1  },
  { label: 'World 2',  subtitle: 'Momentum coast',   start: 11 },
  { label: 'World 3',  subtitle: 'Focus dunes',      start: 21 },
  { label: 'World 4',  subtitle: 'Clarity ridge',    start: 31 },
  { label: 'World 5',  subtitle: 'Space ascent',     start: 41 },
  { label: 'World 6',  subtitle: 'Deep ocean',       start: 51 },
  { label: 'World 7',  subtitle: 'Volcanic peaks',   start: 61 },
  { label: 'World 8',  subtitle: 'Arctic tundra',    start: 71 },
  { label: 'World 9',  subtitle: 'Ancient ruins',    start: 81 },
  { label: 'World 10', subtitle: 'Cosmic finale',    start: 91 },
];

export default function JourneyScreen() {
  const { score, useLive, isPremium } = usePlayerStore();
  const { currentLevelId, completions } = useProgressStore();
  const { lives, timeUntilNext } = useLives();

  const [mapH, setMapH] = useState(MAP_VIEW_HEIGHT);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [modalVisible, setModalVisible]   = useState(false);
  const modalAnim = useRef(new Animated.Value(400)).current;
  const scrollRef = useRef<ScrollView>(null);
  const hasAutoScrolled = useRef(false);

  // Build live levels with current completion state
  const liveLevels: Level[] = LEVELS.map(l => ({
    ...l,
    done:  completions[l.id] !== undefined,
    curr:  l.id === currentLevelId,
    stars: completions[l.id] ?? 0,
  }));

  // ── Modal ─────────────────────────────────────────────────────────────────
  const openModal = (level: Level) => {
    setSelectedLevel(level);
    setModalVisible(true);
    modalAnim.setValue(400);
    Animated.spring(modalAnim, {
      toValue: 0, tension: 80, friction: 10, useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 400, duration: 200, useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedLevel(null);
    });
  };

  // Auto-scroll to current level (horizontal)
  const scrollToCurrent = () => {
    if (hasAutoScrolled.current) return;
    const currentPos = POS[Math.max(0, currentLevelId - 1)];
    if (!currentPos) return;
    const targetX = Math.max(0, currentPos.x * MAP_VIEW_WIDTH - SCREEN_W / 2);
    // Small delay so the layout is fully painted before animating
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: targetX, y: 0, animated: true });
    }, 400);
    hasAutoScrolled.current = true;
  };

  return (
    <ImageBackground source={SCREEN_BACKGROUND} style={s.container} resizeMode="cover">
      <View style={s.bgScrim} />
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <TopBar
          right={
            <>
              <Pill
                variant="warm"
                icon={require('../../assets/icons/icon-star.png')}
                label={score.toLocaleString()}
              />
              {isPremium
                ? <Pill variant="warm" icon={require('../../assets/icons/icon-crown.png')} label="Premium" />
                : <Pill variant="warm" icon={require('../../assets/icons/icon-heart.png')} label={`${lives}${timeUntilNext ? ` · ${timeUntilNext}` : ''}`} />
              }
            </>
          }
        />

        <LinearGradient
          colors={['#f8ece0', '#FFE0C0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.banner}
        >
          <Text style={s.bannerLabel}>Your journey</Text>
          <Text style={s.bannerTitle}>Level {currentLevelId} of {LEVELS.length} 🌍</Text>
        </LinearGradient>

        {/* Horizontal map */}
        <ScrollView
          ref={scrollRef}
          horizontal
          style={s.mapScroll}
          contentContainerStyle={{ width: MAP_VIEW_WIDTH, height: mapH }}
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={scrollToCurrent}
          onLayout={(e) => setMapH(e.nativeEvent.layout.height)}
        >
          {/* 10 world background images tiled side by side */}
          {WORLD_BACKGROUNDS.map((src, i) => (
            <Image
              key={i}
              source={src}
              style={{
                position: 'absolute',
                left: i * WORLD_WIDTH,
                top: 0,
                width: WORLD_WIDTH,
                height: mapH,
              }}
              resizeMode="cover"
            />
          ))}

          <PathSVG width={MAP_VIEW_WIDTH} height={mapH} />

          {/* World markers pinned near top of each world zone */}
          {WORLD_MARKERS.map((world) => {
            const pos = POS[world.start - 1];
            if (!pos) return null;
            return (
              <View
                key={world.label}
                style={[
                  s.worldMarker,
                  {
                    left: pos.x * MAP_VIEW_WIDTH - 56,
                    bottom: 8,
                  },
                ]}
              >
                <Text style={s.worldLabel}>{world.label}</Text>
                <Text style={s.worldSub}>{world.subtitle}</Text>
              </View>
            );
          })}

          {liveLevels.map((level, index) => {
            const pos = POS[index];
            return (
              <LevelNode
                key={level.id}
                level={level}
                x={pos.x * MAP_VIEW_WIDTH}
                y={pos.y * mapH}
                onPress={openModal}
              />
            );
          })}
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={closeModal}
          statusBarTranslucent
        >
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeModal}>
            <Animated.View style={[s.modal, { transform: [{ translateY: modalAnim }] }]}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={s.dragHandle} />

                <View style={s.modalRow}>
                  <Text style={s.modalIco}>{selectedLevel?.e}</Text>
                  <Text style={s.modalTitle}>Level {selectedLevel?.id}</Text>
                </View>

                <View style={s.modalDomainRow}>
                  {DOMAIN_ICONS[selectedLevel?.type ?? ''] && (
                    <Image
                      source={DOMAIN_ICONS[selectedLevel?.type ?? '']}
                      style={s.modalDomainIcon}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={[s.modalDomain, { color: DOMAIN_COLORS[selectedLevel?.type ?? ''] ?? Colors.text }]}>
                    {selectedLevel?.domain}
                  </Text>
                </View>
                <Text style={s.modalDesc}>{selectedLevel?.desc}</Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    closeModal();
                    // TODO: restore lives gate before shipping
                    useLive();
                    router.push(`/game/${selectedLevel?.type}?levelId=${selectedLevel?.id}`);
                  }}
                >
                  <LinearGradient
                    colors={['#8B3FD9', '#8B3FD9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.playBtn}
                  >
                    <Text style={s.playBtnText}>▶  Play Now</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {timeUntilNext && (
                  <Text style={s.livesTimer}>❤️ Next life in {timeUntilNext}</Text>
                )}

                <TouchableOpacity style={s.skipBtn} onPress={closeModal} activeOpacity={0.7}>
                  <Text style={s.skipBtnText}>Maybe later</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.50)',
  },

  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  bannerLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    marginTop: 1,
  },

  mapScroll: {
    flex: 1,
  },

  worldMarker: {
    position: 'absolute',
    width: 112,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(61,26,0,0.08)',
    alignItems: 'center',
  },
  worldLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  worldSub: {
    marginTop: 1,
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(19,78,74,0.58)',
    textAlign: 'center',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.85)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#f9e3cb',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 34,
  },
  dragHandle: {
    width: 40, height: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  modalIco:   { fontSize: 38 },
  modalTitle: { fontSize: 22, fontFamily: 'Nunito_900Black', color: Colors.text },
  modalDomainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalDomainIcon: {
    width: 28,
    height: 28,
  },
  modalDomain: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',

    lineHeight: 22,
    marginBottom: 18,
  },
  playBtn: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
  },
  playBtnText:  { fontSize: 17, fontFamily: 'Nunito_900Black', color: '#FFFFFF' },
  livesTimer: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.coral,
    marginTop: 8,
    marginBottom: 2,
  },
  skipBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    marginTop: 10,
  },
  skipBtnText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.text },
});
