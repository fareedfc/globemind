import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TopBar } from '../../components/layout/TopBar';
import { Pill } from '../../components/ui/Pill';
import { PathSVG } from '../../components/path/PathSVG';
import { LevelNode } from '../../components/path/LevelNode';
import { LEVELS, POS, type Level } from '../../data/levels';
import { Colors } from '../../constants/colors';
import { PATH_HEIGHT } from '../../constants/config';
import { usePlayerStore, FREE_DAILY_LEVELS } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';
import { useLives } from '../../hooks/useLives';

// Themed decorations per world zone (absolute positions as % of PATH_HEIGHT)
const WORLD_ZONES = [
  {
    label: 'World 1 · Forest',
    gradColors: ['#F0FDF4', '#DCFCE7'] as [string, string],
    startFrac: 0.00,
    endFrac: 0.185,
    deco: [
      { emoji: '🌲', left: '8%',  top: '1.5%'  },
      { emoji: '🌿', left: '85%', top: '2.5%'  },
      { emoji: '🌳', left: '5%',  top: '8%'    },
      { emoji: '🍃', left: '90%', top: '12%'   },
      { emoji: '🌸', left: '10%', top: '15%'   },
    ],
  },
  {
    label: 'World 2 · Ocean',
    gradColors: ['#F0F9FF', '#BAE6FD'] as [string, string],
    startFrac: 0.185,
    endFrac: 0.360,
    deco: [
      { emoji: '🌊', left: '7%',  top: '20%'   },
      { emoji: '🐚', left: '88%', top: '22%'   },
      { emoji: '🐠', left: '6%',  top: '27%'   },
      { emoji: '🦀', left: '88%', top: '31%'   },
      { emoji: '⛵', left: '12%', top: '34%'   },
    ],
  },
  {
    label: 'World 3 · Desert',
    gradColors: ['#FFFBEB', '#FDE68A'] as [string, string],
    startFrac: 0.360,
    endFrac: 0.535,
    deco: [
      { emoji: '🌵', left: '8%',  top: '38.5%' },
      { emoji: '☀️', left: '86%', top: '40%'   },
      { emoji: '🏜️', left: '6%',  top: '45%'   },
      { emoji: '⭐', left: '87%', top: '49%'   },
      { emoji: '🦎', left: '10%', top: '52%'   },
    ],
  },
  {
    label: 'World 4 · Mountain',
    gradColors: ['#F5F3FF', '#DDD6FE'] as [string, string],
    startFrac: 0.535,
    endFrac: 0.708,
    deco: [
      { emoji: '⛰️', left: '7%',  top: '56%'   },
      { emoji: '❄️', left: '87%', top: '57.5%' },
      { emoji: '🏔️', left: '6%',  top: '63%'   },
      { emoji: '🦅', left: '87%', top: '66%'   },
      { emoji: '🌨️', left: '10%', top: '69%'   },
    ],
  },
  {
    label: 'World 5 · Space',
    gradColors: ['#EEF2FF', '#C7D2FE'] as [string, string],
    startFrac: 0.708,
    endFrac: 1.00,
    deco: [
      { emoji: '🌙', left: '8%',  top: '72.5%' },
      { emoji: '🪐', left: '86%', top: '74%'   },
      { emoji: '✨', left: '7%',  top: '80%'   },
      { emoji: '🌟', left: '87%', top: '83%'   },
      { emoji: '🚀', left: '10%', top: '87%'   },
    ],
  },
];

const DOMAIN_COLORS: Record<string, string> = {
  memory: Colors.gold,
  word: Colors.purple,
  speed: Colors.coral,
  pattern: Colors.teal,
};

export default function JourneyScreen() {
  const { score, useLive, isPremium, getDailyLevelsToday, incrementDailyLevels } = usePlayerStore();
  const { currentLevelId, completions } = useProgressStore();
  const { lives, timeUntilNext } = useLives();
  const [pathWidth, setPathWidth] = useState(Dimensions.get('window').width - 40);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const modalAnim = useRef(new Animated.Value(400)).current;

  // Derive live levels from static data + persisted progress
  const liveLevels: Level[] = LEVELS.map(l => {
    const starsEarned = completions[l.id];
    const done = starsEarned !== undefined;
    const curr = l.id === currentLevelId;
    return { ...l, done, curr, stars: starsEarned ?? 0 };
  });

  const currentLevel = liveLevels.find(l => l.curr);

  const openModal = (level: Level) => {
    setSelectedLevel(level);
    setModalVisible(true);
    modalAnim.setValue(400);
    Animated.spring(modalAnim, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedLevel(null);
    });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <TopBar
        right={
          <>
            <Pill variant="gold" label={`⭐ ${score.toLocaleString()}`} />
            {isPremium
              ? <Pill variant="gold" label="👑 Premium" />
              : <Pill variant="red" label={`❤️ ${lives}${timeUntilNext ? ` · ${timeUntilNext}` : ''}`} />
            }
          </>
        }
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vibe Banner */}
        <LinearGradient
          colors={['#FFF0E0', '#FFE0C0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.vibeBanner}
        >
          <View>
            <Text style={s.vibeLabel}>Your journey</Text>
            <Text style={s.vibeTitle}>Level {currentLevelId} of {LEVELS.length} 🌍</Text>
          </View>
        </LinearGradient>

        {/* Path Container */}
        <View
          style={[s.pathContainer, { height: PATH_HEIGHT }]}
          onLayout={e => setPathWidth(e.nativeEvent.layout.width)}
        >
          {/* World zone background bands */}
          {WORLD_ZONES.map((zone, zi) => (
            <LinearGradient
              key={zi}
              colors={zone.gradColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                s.worldBand,
                {
                  top: zone.startFrac * PATH_HEIGHT,
                  height: (zone.endFrac - zone.startFrac) * PATH_HEIGHT,
                },
              ]}
              pointerEvents="none"
            />
          ))}

          {/* World border lines + labels */}
          {WORLD_ZONES.slice(1).map((zone, zi) => (
            <View
              key={`wl-${zi}`}
              style={[s.worldBorder, { top: zone.startFrac * PATH_HEIGHT }]}
              pointerEvents="none"
            >
              <View style={s.worldBorderLine} />
              <Text style={s.worldLabel}>{zone.label}</Text>
            </View>
          ))}

          {/* World 1 label at top */}
          <View style={[s.worldBorder, { top: 0 }]} pointerEvents="none">
            <Text style={[s.worldLabel, { marginTop: 8 }]}>{WORLD_ZONES[0].label}</Text>
          </View>

          <PathSVG width={pathWidth} />

          {/* Themed decorations per world */}
          {WORLD_ZONES.map((zone) =>
            zone.deco.map((d, di) => (
              <View
                key={`${zone.label}-${di}`}
                style={[s.decoWrap, { left: d.left, top: d.top }]}
                pointerEvents="none"
              >
                <Text style={s.deco}>{d.emoji}</Text>
              </View>
            ))
          )}

          {/* Level nodes */}
          {liveLevels.map((level, i) => {
            const pos = POS[i];
            if (!pos) return null;
            return (
              <LevelNode
                key={level.id}
                level={level}
                x={pos.x * pathWidth}
                y={pos.y * PATH_HEIGHT}
                onPress={openModal}
              />
            );
          })}
        </View>

        {/* Milestone banner */}
        <View style={s.milestone}>
          <Text style={{ fontSize: 16 }}>🌅</Text>
          <Text style={s.milestoneText}>Keep going — new challenges ahead</Text>
        </View>

        {/* Locked hint */}
        <View style={s.lockedHint}>
          <Text style={{ fontSize: 22, opacity: 0.25 }}>🔒</Text>
          <Text style={s.lockedHintText}>More adventures unlocking soon</Text>
        </View>
      </ScrollView>

      {/* Level Modal (bottom sheet) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={closeModal}>
          <Animated.View
            style={[s.modal, { transform: [{ translateY: modalAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={s.dragHandle} />
              <View style={s.modalRow}>
                <Text style={s.modalIco}>{selectedLevel?.e}</Text>
                <Text style={s.modalTitle}>Level {selectedLevel?.id}</Text>
              </View>
              <Text style={[s.modalDomain, { color: DOMAIN_COLORS[selectedLevel?.type ?? ''] ?? Colors.text }]}>
                🧠 {selectedLevel?.domain}
              </Text>
              <Text style={s.modalDesc}>{selectedLevel?.desc}</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  closeModal();
                  if (!isPremium && getDailyLevelsToday() >= FREE_DAILY_LEVELS) {
                    router.push('/paywall?reason=daily');
                  } else if (!isPremium && lives === 0) {
                    router.push('/paywall?reason=lives');
                  } else {
                    useLive();
                    incrementDailyLevels();
                    router.push(`/game/${selectedLevel?.type}?levelId=${selectedLevel?.id}`);
                  }
                }}
              >
                <LinearGradient
                  colors={['#FFAA00', '#FF8C00']}
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
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Vibe banner
  vibeBanner: {
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 20,
    height: 80,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  vibeLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  vibeTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    marginTop: 2,
  },

  // Path
  pathContainer: {
    position: 'relative',
  },

  // World zone bands
  worldBand: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  worldBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  worldBorderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  worldLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(0,0,0,0.25)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  decoWrap: {
    position: 'absolute',
  },
  deco: {
    fontSize: 22,
    opacity: 0.22,
  },

  // Milestone
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 0,
    paddingVertical: 11,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderStyle: 'dashed',
  },
  milestoneText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
  },

  // Locked hint
  lockedHint: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    gap: 6,
  },
  lockedHintText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    opacity: 0.25,
  },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.85)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.bg2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 34,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  modalIco: {
    fontSize: 38,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
  },
  modalDomain: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 18,
  },
  playBtn: {
    width: '100%',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 0,
  },
  playBtnText: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
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
  skipBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
