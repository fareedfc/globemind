import { useState, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TopBar } from '../../components/layout/TopBar';
import { Pill } from '../../components/ui/Pill';
import { LEVELS, POS, type Level } from '../../data/levels';
import { Colors } from '../../constants/colors';
import { MAP_HEIGHT, MAP_WIDTH } from '../../constants/config';
import { PathSVG } from '../../components/path/PathSVG';
import { LevelNode } from '../../components/path/LevelNode';
import { usePlayerStore, FREE_DAILY_LEVELS } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';
import { useLives } from '../../hooks/useLives';
import { useUIStore } from '../../stores/uiStore';

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

// Soft tinted background per world for the tab bar
const WORLD_TAB_COLORS = [
  '#D9EDD4', // W1  Forest    — soft green
  '#C8DFF5', // W2  Ocean     — soft blue
  '#F5E8C8', // W3  Desert    — sandy
  '#E8D5C0', // W4  Mountain  — earthy
  '#C8C5E8', // W5  Space     — soft indigo
  '#C0DDE8', // W6  Deep Ocean— deep teal
  '#F5CFC8', // W7  Volcanic  — warm coral
  '#C8E8F0', // W8  Arctic    — icy blue
  '#F0E0C0', // W9  Ruins     — warm amber
  '#DCC8F0', // W10 Cosmic    — soft purple
];

const WORLD_MARKERS = [
  { label: 'World 1',  subtitle: 'Into the Woods',    start: 1  },
  { label: 'World 2',  subtitle: 'Momentum Coast',   start: 11 },
  { label: 'World 3',  subtitle: 'Focus Dunes',      start: 21 },
  { label: 'World 4',  subtitle: 'Clarity Ridge',    start: 31 },
  { label: 'World 5',  subtitle: 'Space Ascent',     start: 41 },
  { label: 'World 6',  subtitle: 'Deep Ocean',       start: 51 },
  { label: 'World 7',  subtitle: 'Volcanic Peaks',   start: 61 },
  { label: 'World 8',  subtitle: 'Arctic Tundra',    start: 71 },
  { label: 'World 9',  subtitle: 'Ancient Ruins',    start: 81 },
  { label: 'World 10', subtitle: 'Cosmic Finale',    start: 91 },
];

export default function JourneyScreen() {
  const { score, useLive, isPremium, getDailyLevelsToday, incrementDailyLevels } = usePlayerStore();
  const insets = useSafeAreaInsets();
  const setWorldIdx = useUIStore((s) => s.setWorldIdx);
  const { currentLevelId, completions } = useProgressStore();
  const { lives, timeUntilNext } = useLives();

  const [mapH, setMapH] = useState(MAP_VIEW_HEIGHT);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [modalVisible, setModalVisible]   = useState(false);
  const [scrollX, setScrollX] = useState(0);
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
    Haptics.selectionAsync();
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

  const worldIdx = WORLD_WIDTH > 0
    ? Math.max(0, Math.min(Math.floor(scrollX / WORLD_WIDTH), WORLD_MARKERS.length - 1))
    : 0;

  useEffect(() => {
    setWorldIdx(worldIdx);
  }, [worldIdx]);

  return (
    <ImageBackground source={SCREEN_BACKGROUND} style={s.container} resizeMode="cover">
      <View style={s.bgScrim} />
      <SafeAreaView style={s.safe} edges={[]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Horizontal map */}
        <View style={s.mapContainer}>

          {/* Floating header — transparent, overlaid on map */}
          <View style={[s.headerOverlay, { paddingTop: insets.top }]} pointerEvents="box-none">
            <TopBar
              right={
                <>
                  <Pill
                    variant="warm"
                    icon={require('../../assets/icons/icon-score_3.png')}
                    label={score.toLocaleString()}
                    bg={WORLD_TAB_COLORS[worldIdx]}
                  />
                  {isPremium
                    ? <Pill variant="warm" icon={require('../../assets/icons/icon-crown.png')} label="Unlimited" bg={WORLD_TAB_COLORS[worldIdx]} />
                    : <Pill variant="warm" icon={require('../../assets/icons/icon-heart.png')} label={`${lives}${timeUntilNext ? ` · ${timeUntilNext}` : ''}`} bg={WORLD_TAB_COLORS[worldIdx]} />
                  }
                </>
              }
            />
          </View>
        <ScrollView
          ref={scrollRef}
          horizontal
          style={s.mapScroll}
          contentContainerStyle={{ width: MAP_VIEW_WIDTH + 220, height: mapH }}
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={scrollToCurrent}
          onLayout={(e) => setMapH(e.nativeEvent.layout.height)}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={100}
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
                opacity: 0.9,
              }}
              resizeMode="cover"
            />
          ))}

          <PathSVG width={MAP_VIEW_WIDTH} height={mapH} />


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

          {/* World 2 coming soon teaser node */}
          <View style={[s.teaserNode, {
            left: MAP_VIEW_WIDTH + 60,
            top: mapH * 0.5 - 50,
          }]}>
            <Text style={s.teaserEmoji}>🌌</Text>
            <Text style={s.teaserWorld}>Universe 2</Text>
            <Text style={s.teaserSoon}>Coming Soon</Text>
          </View>

        </ScrollView>

          {/* Level label overlaid on map — does not scroll */}
          <View style={[s.levelOverlay, { backgroundColor: WORLD_TAB_COLORS[worldIdx] }]} pointerEvents="none">
            <Text style={s.bannerLabel}>YOUR JOURNEY</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 }}>
              <Text style={s.bannerTitle}>Level {currentLevelId} of {LEVELS.length}</Text>
              <Image source={require('../../assets/icons/icon-globe.png')} style={{ width: 19.2, height: 19.2 }} resizeMode="contain" />
            </View>
          </View>

          {/* World banner overlaid on map — updates as user scrolls */}
          {(() => {
            const world = WORLD_MARKERS[worldIdx];
            if (!world) return null;
            return (
              <View style={[s.worldOverlay, { backgroundColor: WORLD_TAB_COLORS[worldIdx] }]} pointerEvents="none">
                <Text style={s.bannerLabel}>{world.label.toUpperCase()}</Text>
                <Text style={s.bannerTitle}>{world.subtitle}</Text>
              </View>
            );
          })()}
        </View>

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

                {selectedLevel?.done && (
                  <View style={s.modalStarsRow}>
                    <View style={s.modalStars}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Image
                          key={i}
                          source={require('../../assets/icons/icon-star.png')}
                          style={[s.modalStar, i >= (selectedLevel.stars ?? 0) && s.modalStarEmpty]}
                          resizeMode="contain"
                        />
                      ))}
                    </View>
                    {(selectedLevel.stars ?? 0) < 5 && (
                      <Text style={s.beatScoreTxt}>
                        {(selectedLevel.stars ?? 0) >= 4
                          ? 'So close! One more push for 5 stars 🎯'
                          : 'Beat your score — can you hit 5 stars? 🎯'}
                      </Text>
                    )}
                    {(selectedLevel.stars ?? 0) === 5 && (
                      <Text style={s.perfectTxt}>Perfect score! 🌟</Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (false && !isPremium && lives <= 0) {
                      closeModal();
                      router.push('/paywall?reason=lives');
                      return;
                    }
                    if (!isPremium && getDailyLevelsToday() >= FREE_DAILY_LEVELS) {
                      closeModal();
                      router.push('/paywall?reason=daily');
                      return;
                    }
                    closeModal();
                    if (!isPremium) {
                      useLive();
                      incrementDailyLevels();
                    }
                    router.push(`/game/${selectedLevel?.type}?levelId=${selectedLevel?.id}`);
                  }}
                >
                  <LinearGradient
                    colors={['#8B3FD9', '#8B3FD9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.playBtn}
                  >
                    <Text style={s.playBtnText}>
                      {selectedLevel?.done && (selectedLevel.stars ?? 0) < 5
                        ? '▶  Beat your score'
                        : '▶  Play Now'}
                    </Text>
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

  mapContainer: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  mapScroll: {
    flex: 1,
  },
  levelOverlay: {
    position: 'absolute',
    top: 128,
    left: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  worldOverlay: {
    position: 'absolute',
    top: 128,
    right: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'flex-end',
  },
  bannerLabel: {
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  bannerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    marginTop: 1,
  },

  teaserNode: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(6,182,212,0.4)',
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 2,
  },
  teaserEmoji: { fontSize: 28 },
  teaserWorld: {
    fontSize: 12,
    fontFamily: 'Nunito_900Black',
    color: '#0891B2',
    textAlign: 'center',
  },
  teaserSoon: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(8,145,178,0.7)',
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
  modalStarsRow: {
    marginBottom: 14,
    gap: 6,
  },
  modalStars: {
    flexDirection: 'row',
    gap: 4,
  },
  modalStar: {
    width: 20,
    height: 20,
  },
  modalStarEmpty: {
    opacity: 0.2,
  },
  beatScoreTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#8B3FD9',
  },
  perfectTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#FF8A00',
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
