import { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Level } from '../../data/levels';

interface Props {
  level: Level;
  x: number; // center x in pixels
  y: number; // center y in pixels
  onPress: (level: Level) => void;
}

function Bubble({ level }: { level: Level }) {
  const isLocked = !level.done && !level.curr && !level.boss;

  if (isLocked) {
    return (
      <View style={[s.bubble, s.bubbleLocked]}>
        <Text style={{ fontSize: 34 }}>{level.e}</Text>
      </View>
    );
  }

  const colors: [string, string] = level.done
    ? ['#FFD166', '#FF9500']
    : level.curr
    ? ['#06D6A0', '#118AB2']
    : ['#EF476F', '#9B5DE5']; // boss

  const borderColor = level.done
    ? Colors.gold
    : level.curr
    ? Colors.teal
    : Colors.coral;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.bubble, { borderColor }]}
    >
      <Text style={{ fontSize: 34 }}>{level.e}</Text>
    </LinearGradient>
  );
}

export function LevelNode({ level, x, y, onPress }: Props) {
  const isCurr = !!level.curr;
  const isLocked = !level.done && !isCurr && !level.boss;
  const isInteractive = level.done || isCurr;

  const bob = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCurr) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [isCurr]);

  const bobStyle = {
    transform: [
      { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
      { scale: bob.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
    ],
  };

  const ringStyle = {
    opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }),
    transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) }],
  };

  const stars = level.done
    ? `${'⭐'.repeat(level.stars ?? 3)}${'☆'.repeat(3 - (level.stars ?? 3))}`
    : '☆☆☆';

  return (
    <TouchableOpacity
      style={[s.node, { left: x - 40, top: y - 40 }]}
      onPress={() => isInteractive && onPress(level)}
      activeOpacity={isInteractive ? 0.8 : 1}
      disabled={!isInteractive}
    >
      {isCurr && (
        <Animated.View style={[s.ring, ringStyle]} />
      )}
      <Animated.View style={[isLocked && s.dimmed, isCurr && bobStyle]}>
        <Bubble level={level} />
      </Animated.View>
      <View style={s.stars}>
        {stars.split('').map((star, i) => (
          <Text key={i} style={s.star}>{star}</Text>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  node: {
    position: 'absolute',
    alignItems: 'center',
  },
  bubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  bubbleLocked: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dimmed: {
    opacity: 0.45,
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(6,214,160,0.35)',
    top: -10,
    left: -10,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  star: {
    fontSize: 11,
  },
});
