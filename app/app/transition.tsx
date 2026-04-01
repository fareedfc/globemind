import { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { LEVELS, POS } from '../data/levels';
import { NODE_SIZE } from '../constants/config';

const SCENE_W = 280;
const HALF = NODE_SIZE / 2;
const Y1 = 40;          // top of current node
const Y2 = 190;         // top of next node
const SCENE_H = Y2 + NODE_SIZE + 48;

export default function LevelTransitionScreen() {
  const { levelId: rawId } = useLocalSearchParams<{ levelId: string }>();
  const levelId = parseInt(rawId ?? '1');
  const nextId  = levelId + 1;

  const current = LEVELS.find(l => l.id === levelId);
  const next    = LEVELS.find(l => l.id === nextId);

  // Node centres (x)
  const cx1 = (POS[levelId - 1]?.x ?? 0.55) * SCENE_W;
  const cx2 = (POS[levelId]?.x    ?? 0.22) * SCENE_W;

  // Animated values
  const progress     = useRef(new Animated.Value(0)).current;
  const unlockScale  = useRef(new Animated.Value(0)).current;
  const unlockOpacity= useRef(new Animated.Value(0)).current;
  const labelAnim    = useRef(new Animated.Value(0)).current;
  const btnAnim      = useRef(new Animated.Value(0)).current;
  const glowPulse    = useRef(new Animated.Value(0)).current;

  // Marker travels from (cx1, Y1+HALF) to (cx2, Y2+HALF) via translation
  const markerTX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, cx2 - cx1] });
  const markerTY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Y2 - Y1] });

  // Glow pulse around unlocked node
  const glowScale  = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.65] });
  const glowOp     = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  useEffect(() => {
    if (!current || !next) {
      router.replace('/(tabs)/journey');
      return;
    }

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

        // Label then button
        setTimeout(() => {
          Animated.spring(labelAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();
        }, 300);
        setTimeout(() => {
          Animated.spring(btnAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();
        }, 560);
      });
    }, 450);
  }, []);

  if (!current || !next) return null;

  // Bezier path between the two node centres
  const bx  = (cx1 + cx2) / 2;
  const by1 = Y1 + HALF;
  const by2 = Y2 + HALF;
  const pathD = `M${cx1} ${by1} C${bx} ${by1},${bx} ${by2},${cx2} ${by2}`;

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#F0FDF9', '#E8FBF5', '#D4F5EB']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.inner}>
        <View style={s.titleWrap}>
          <Text style={s.header}>Level {levelId} Complete!</Text>
          <Text style={s.subHeader}>You're on a roll 🔥</Text>
        </View>

        {/* ── Mini path scene ── */}
        <View style={[s.scene, { width: SCENE_W, height: SCENE_H }]}>

          {/* Dashed connecting path */}
          <Svg style={StyleSheet.absoluteFill} width={SCENE_W} height={SCENE_H}>
            <Path
              d={pathD}
              fill="none"
              stroke="rgba(255,209,102,0.4)"
              strokeWidth={3.5}
              strokeDasharray="9 6"
              strokeLinecap="round"
            />
          </Svg>

          {/* Current level node — completed (gold) */}
          <View style={[s.node, s.nodeDone, { left: cx1 - HALF, top: Y1 }]}>
            <Text style={s.nodeEmoji}>{current.e}</Text>
          </View>
          <Text style={[s.nodeTag, { left: cx1 - 28, top: Y1 + NODE_SIZE + 5 }]}>
            L{levelId} ✅
          </Text>

          {/* Glow ring around next node */}
          <Animated.View style={[s.glow, {
            left:  cx2 - HALF - 14,
            top:   Y2 - 14,
            opacity: glowOp,
            transform: [{ scale: glowScale }],
          }]} />

          {/* Next level node — unlocking (teal) */}
          <Animated.View style={[s.node, s.nodeNext, {
            left:  cx2 - HALF,
            top:   Y2,
            opacity: unlockOpacity,
            transform: [{ scale: unlockScale }],
          }]}>
            <Text style={s.nodeEmoji}>{next.e}</Text>
          </Animated.View>
          <Animated.Text style={[s.nodeTag, {
            left:  cx2 - 28,
            top:   Y2 + NODE_SIZE + 5,
            color: Colors.teal,
            opacity: unlockOpacity,
          }]}>
            L{nextId} 🔓
          </Animated.Text>

          {/* Travelling star marker */}
          <Animated.Text style={[s.marker, {
            left: cx1 - 14,
            top:  Y1 + HALF - 14,
            transform: [{ translateX: markerTX }, { translateY: markerTY }],
          }]}>
            ⭐
          </Animated.Text>
        </View>

        {/* ── Unlock label ── */}
        <Animated.View style={[s.unlockWrap, {
          opacity: labelAnim,
          transform: [{ translateY: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        }]}>
          <Text style={s.unlockTitle}>Level {nextId} Unlocked!</Text>
          <Text style={s.unlockDomain}>{next.domain}</Text>
          <Text style={s.unlockDesc} numberOfLines={2}>{next.desc}</Text>
        </Animated.View>

        {/* ── Continue button ── */}
        <Animated.View style={[s.btnWrap, {
          opacity: btnAnim,
          transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        }]}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/journey')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FFAA00', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btn}
            >
              <Text style={s.btnTxt}>Continue to Journey →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 32,
  },

  titleWrap: { alignItems: 'center', gap: 4 },
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
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
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
    fontSize: 26,
    zIndex: 10,
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

  // ── Button ─────────────────────────────────────────────────────────────────
  btnWrap: { width: '100%' },
  btn: {
    paddingVertical: 19,
    borderRadius: 17,
    alignItems: 'center',
    shadowColor: '#F97316',
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
