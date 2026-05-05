import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing, ImageBackground, Image, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const WORLD_BGS = [
  require('../assets/worlds/w1-forest.png'),
  require('../assets/worlds/w2-ocean.png'),
  require('../assets/worlds/w3-desert.png'),
  require('../assets/worlds/w4-mountain.png'),
  require('../assets/worlds/w5-space.png'),
  require('../assets/worlds/w6-deep-ocean.png'),
  require('../assets/worlds/w7-volcanic.png'),
  require('../assets/worlds/w8-arctic.png'),
  require('../assets/worlds/w9-ruins.png'),
  require('../assets/worlds/w10-cosmic.png'),
];
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
const AnimatedSvgPath = Animated.createAnimatedComponent(Path);
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { LEVELS, POS } from '../data/levels';
import { NODE_SIZE } from '../constants/config';
import { useBrainStore, type GameType } from '../stores/brainStore';
import { getPermissionStatus, requestAndSchedule } from '../lib/notifications';
import { usePlayerStore } from '../stores/playerStore';

const DOMAIN_COLORS: Record<GameType, string> = {
  memory:  Colors.gold,
  speed:   Colors.coral,
  logic:   Colors.teal,
  pattern: Colors.purple,
};

const DOMAIN_LABELS: Record<GameType, string> = {
  memory:  'Memory',
  speed:   'Speed',
  logic:   'Logic',
  pattern: 'Pattern',
};

// Horizontal scene: two nodes side by side, star travels left → right
const SCENE_W = 260;
const SCENE_H = NODE_SIZE + 60;
const HALF    = NODE_SIZE / 2;
const X1      = 44;
const X2      = SCENE_W - 44;
const CY      = SCENE_H / 2;

export default function LevelTransitionScreen() {
  const { levelId: rawId, domain: rawDomain, oldPct: rawOldPct, insight: rawInsight } = useLocalSearchParams<{ levelId: string; domain: string; oldPct: string; insight: string }>();
  const levelId  = parseInt(rawId ?? '1');
  const nextId   = levelId + 1;
  const domain   = (rawDomain ?? null) as GameType | null;
  const oldPct   = parseInt(rawOldPct ?? '0');
  const insight  = rawInsight ? decodeURIComponent(rawInsight) : null;
  const newPct   = domain ? useBrainStore.getState().domains[domain] : 0;
  const domainColor = domain ? DOMAIN_COLORS[domain] : Colors.gold;

  const current = LEVELS.find(l => l.id === levelId);
  const next    = LEVELS.find(l => l.id === nextId);

  // Animated values
  const progress      = useRef(new Animated.Value(0)).current;
  const unlockScale   = useRef(new Animated.Value(0)).current;
  const unlockOpacity = useRef(new Animated.Value(0)).current;
  const labelAnim     = useRef(new Animated.Value(0)).current;
  const btnAnim       = useRef(new Animated.Value(0)).current;
  const barAnim       = useRef(new Animated.Value(oldPct)).current;
  const glowPulse     = useRef(new Animated.Value(0)).current;
  const flowAnim      = useRef(new Animated.Value(0)).current;

  // Star travels left → right (horizontal)
  const markerTX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, X2 - X1] });
  const markerTY = new Animated.Value(0); // stays on same vertical line

  // Glow pulse around unlocked node
  const glowScale  = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.65] });
  const glowOp     = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  useEffect(() => {
    if (!current || !next) {
      router.replace('/(tabs)/journey');
      return;
    }

    // Flowing dash animation — starts immediately
    Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: -20,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // 450ms pause → marker travels → node pops → label → button
    setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Node pop-in
        Animated.timing(unlockOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
        Animated.sequence([
          Animated.spring(unlockScale, { toValue: 1.3, tension: 220, friction: 5, useNativeDriver: true }),
          Animated.spring(unlockScale, { toValue: 1,   tension: 200, friction: 8, useNativeDriver: true }),
        ]).start();

        // Continuous glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowPulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(glowPulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        ).start();

        // Label then bar then button
        setTimeout(() => {
          Animated.spring(labelAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();
        }, 300);
        setTimeout(() => {
          Animated.timing(barAnim, { toValue: newPct, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
        }, 700);
        setTimeout(() => {
          Animated.spring(btnAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();
        }, 900);
      });
    }, 450);
  }, []);

  // Notification nudge — show once after first level completion
  useEffect(() => {
    if (levelId !== 1) return;
    const timer = setTimeout(async () => {
      const alreadyShown = await AsyncStorage.getItem('notifNudgeShown');
      if (alreadyShown) return;
      const status = await getPermissionStatus();
      if (status === 'granted') return;
      await AsyncStorage.setItem('notifNudgeShown', 'true');
      Alert.alert(
        '🔔 Stay Sharp Every Day',
        'Get a daily reminder so your brain workout becomes a habit.',
        [
          { text: 'No thanks', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              const { streak } = usePlayerStore.getState();
              requestAndSchedule(streak);
            },
          },
        ]
      );
    }, 1800);
    return () => clearTimeout(timer);
  }, [levelId]);

  if (!current || !next) return null;

  const worldBg = WORLD_BGS[Math.min(Math.floor((levelId - 1) / 10), 9)];

  // Horizontal dashed path between the two node centres
  const pathD = `M${X1} ${CY} C${(X1 + X2) / 2} ${CY},${(X1 + X2) / 2} ${CY},${X2} ${CY}`;

  return (
    <ImageBackground source={worldBg} style={s.container} resizeMode="cover">
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* Float zone — title + scene against world art */}
        <View style={s.floatZone}>
          <View style={s.titleCard}>
            <Text style={s.header}>Level {levelId} Complete!</Text>
            <Text style={s.subHeader}>You're on a roll 🔥</Text>
          </View>

          {/* ── Mini path scene (horizontal) ── */}
          <View style={s.sceneCard}>
          <View style={[s.scene, { width: SCENE_W, height: SCENE_H }]}>
            <Svg style={StyleSheet.absoluteFill} width={SCENE_W} height={SCENE_H}>
              {/* Flowing animated dashes */}
              <AnimatedSvgPath
                d={pathD}
                fill="none"
                stroke={domainColor}
                strokeWidth={3.5}
                strokeDasharray="12 8"
                strokeDashoffset={flowAnim}
                strokeLinecap="round"
              />
              {/* Arrowhead at destination */}
              <Path
                d={`M${X2 - 13} ${CY - 8} L${X2 + 1} ${CY} L${X2 - 13} ${CY + 8}`}
                fill="none"
                stroke={domainColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>

            <View style={[s.node, s.nodeDone, { left: X1 - HALF, top: CY - HALF }]}>
              <Text style={s.nodeEmoji}>{current.e}</Text>
            </View>
            <Text style={[s.nodeTag, { left: X1 - 28, top: CY + HALF + 5 }]}>
              L{levelId} ✅
            </Text>

            <Animated.View style={[s.glow, {
              left: X2 - HALF - 14, top: CY - HALF - 14,
              opacity: glowOp, transform: [{ scale: glowScale }],
            }]} />

            <Animated.View style={[s.node, s.nodeNext, {
              left: X2 - HALF, top: CY - HALF,
              opacity: unlockOpacity, transform: [{ scale: unlockScale }],
            }]}>
              <Text style={s.nodeEmoji}>{next.e}</Text>
            </Animated.View>
            <Animated.Text style={[s.nodeTag, {
              left: X2 - 28, top: CY + HALF + 5,
              color: Colors.teal, opacity: unlockOpacity,
            }]}>
              L{nextId} 🔓
            </Animated.Text>

            <Animated.View style={[s.marker, {
              left: X1 - 14, top: CY - HALF - 20,
              transform: [{ translateX: markerTX }, { translateY: markerTY }],
            }]}>
              <Image source={require('../assets/icons/icon-star.png')} style={s.markerImg} />
            </Animated.View>
          </View>
          </View>
        </View>

        {/* Content section — high opacity */}
        <View style={s.topSection}>
          {/* ── Unlock label ── */}
          <Animated.View style={[s.unlockWrap, {
            opacity: labelAnim,
            transform: [{ translateY: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          }]}>
            <Text style={s.unlockTitle}>Level {nextId} Unlocked!</Text>
            <Text style={s.unlockDomain}>{next.domain}</Text>
            <Text style={s.unlockDesc} numberOfLines={2}>{next.desc}</Text>
          </Animated.View>

          {/* ── Strength bar ── */}
          {domain && (
            <Animated.View style={[s.strengthWrap, {
              opacity: labelAnim,
              transform: [{ translateY: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            }]}>
              <View style={s.strengthHeader}>
                <Text style={[s.strengthLabel, { color: '#8B3FD9' }]}>
                  {DOMAIN_LABELS[domain]} Strength
                </Text>
                <Text style={[s.strengthPcts, { color: '#8B3FD9' }]}>
                  {oldPct}% → {newPct}%
                </Text>
              </View>
              <View style={s.strengthTrack}>
                <Animated.View style={[s.strengthFill, {
                  backgroundColor: '#8B3FD9',
                  width: barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                }]} />
              </View>
            </Animated.View>
          )}

          {/* ── Insight ── */}
          {insight && (
            <Animated.View style={[s.insight, {
              opacity: labelAnim,
              transform: [{ translateY: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
            }]}>
              <Text style={s.insightLbl}>💡 Today's Insight</Text>
              <Text style={s.insightTxt}>{insight}</Text>
            </Animated.View>
          )}

          {/* ── Continue button ── */}
          <Animated.View style={[s.btnWrap, {
            opacity: btnAnim,
            transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
          }]}>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace('/(tabs)/journey'); }} activeOpacity={0.85}>
              <LinearGradient
                colors={['#8B3FD9', '#8B3FD9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btn}
              >
                <Text style={s.btnTxt}>Continue to Journey →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={s.bottomSection} />
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  floatZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 28,
    paddingBottom: 12,
  },

  topSection: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 20,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bottomSection: {
    height: 0,
  },

  titleCard: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
  },
  header: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textAlign: 'center',
  },

  // ── Scene ──────────────────────────────────────────────────────────────────
  sceneCard: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scene: { position: 'relative' },

  node: {
    position: 'absolute',
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  nodeDone: { backgroundColor: Colors.gold },
  nodeNext: { backgroundColor: Colors.teal },
  nodeEmoji: { fontSize: 26 },

  nodeTag: {
    position: 'absolute',
    width: 56,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#000000',
  },

  glow: {
    position: 'absolute',
    width: NODE_SIZE + 28,
    height: NODE_SIZE + 28,
    borderRadius: (NODE_SIZE + 28) / 2,
    backgroundColor: Colors.teal,
  },

  marker: {
    position: 'absolute',
    zIndex: 10,
  },
  markerImg: {
    width: 28,
    height: 28,
  },

  // ── Unlock label ───────────────────────────────────────────────────────────
  unlockWrap: { alignItems: 'center', gap: 4 },
  unlockTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    textAlign: 'center',
  },
  unlockDomain: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  unlockDesc: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // ── Strength bar ───────────────────────────────────────────────────────────
  strengthWrap: { width: '100%', gap: 8 },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  strengthPcts: {
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
  },
  strengthTrack: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(255,107,53,0.14)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 8,
  },

  // ── Insight ────────────────────────────────────────────────────────────────
  insight: {
    width: '100%',
    backgroundColor: 'rgba(139,63,217,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(139,63,217,0.18)',
    borderRadius: 13,
    padding: 13,
  },
  insightLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: '#8B3FD9',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  insightTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: '#333',
    lineHeight: 20,
  },

  // ── Button ─────────────────────────────────────────────────────────────────
  btnWrap: { width: '100%' },
  btn: {
    paddingVertical: 19,
    borderRadius: 17,
    alignItems: 'center',
    shadowColor: '#8B3FD9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  btnTxt: {
    fontSize: 17,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
});
