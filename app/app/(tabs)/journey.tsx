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
  DimensionValue,
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
import { usePlayerStore } from '../../stores/playerStore';
import { useProgressStore } from '../../stores/progressStore';
import { useLives } from '../../hooks/useLives';

const DECO: Array<{ emoji: string; left: DimensionValue; top: DimensionValue }> = [
  { emoji: '✈️', left: '12%', top: '3%' },
  { emoji: '🗺️', left: '58%', top: '13%' },
  { emoji: '🌏', left: '73%', top: '23%' },
  { emoji: '⭐', left: '25%', top: '33%' },
  { emoji: '🌈', left: '62%', top: '43%' },
  { emoji: '🎒', left: '15%', top: '53%' },
  { emoji: '🧭', left: '78%', top: '63%' },
  { emoji: '🌸', left: '35%', top: '73%' },
  { emoji: '☁️', left: '55%', top: '83%' },
  { emoji: '🌟', left: '20%', top: '90%' },
];

const DOMAIN_COLORS: Record<string, string> = {
  memory: Colors.gold,
  word: Colors.purple,
  speed: Colors.coral,
  pattern: Colors.teal,
};

export default function JourneyScreen() {
  const { miles, streak, useLive } = usePlayerStore();
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
            <Pill variant="gold" label={`✈️ ${miles.toLocaleString()}`} />
            <Pill variant="red" label={`❤️ ${lives}${timeUntilNext ? ` · ${timeUntilNext}` : ''}`} />
            <Pill variant="teal" label={`🔥 ${streak}`} />
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
          colors={['#ECFDF5', '#D1FAE5']}
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
          <PathSVG width={pathWidth} />

          {/* Decorative scattered emoji */}
          {DECO.map((d, i) => (
            <View
              key={i}
              style={[s.decoWrap, { left: d.left, top: d.top }]}
              pointerEvents="none"
            >
              <Text style={s.deco}>{d.emoji}</Text>
            </View>
          ))}

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
                  if (lives === 0) {
                    router.push('/paywall');
                  } else {
                    useLive();
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
  decoWrap: {
    position: 'absolute',
  },
  deco: {
    fontSize: 18,
    opacity: 0.15,
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
