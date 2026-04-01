import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';

interface Props {
  onTryAgain: () => void;
  onExit: () => void;
}

export function FailScreen({ onTryAgain, onExit }: Props) {
  const { useLive } = usePlayerStore();
  // The "almost pop" bubble
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const bubbleRotate = useRef(new Animated.Value(0)).current;

  // "Pop..." text that fades in then dims
  const textScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Content below
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useLive(); // deduct a life on failure

    // 1. Bubble springs up to 0.85 — almost there but not quite
    Animated.sequence([
      Animated.spring(bubbleScale, {
        toValue: 0.85,
        tension: 160,
        friction: 5,
        useNativeDriver: true,
      }),
      // 2. Hold briefly, then slowly deflate + droop
      Animated.delay(280),
      Animated.parallel([
        Animated.timing(bubbleScale, {
          toValue: 0.38,
          duration: 620,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleRotate, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleOpacity, {
          toValue: 0.45,
          duration: 620,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. "Pop..." text appears mid-deflate, stays faded
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(textScale, {
          toValue: 1,
          tension: 140,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.38,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
      textOpacity.setValue(0.38);
      Animated.spring(textScale, {
        toValue: 1,
        tension: 140,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 300);

    // 4. Content fades in after the deflation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslate, {
          toValue: 0,
          tension: 120,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 820);
  }, []);

  const rotate = bubbleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-12deg'],
  });

  return (
    <View style={s.container}>
      {/* Almost-pop bubble */}
      <Animated.Text
        style={[
          s.bubble,
          {
            transform: [{ scale: bubbleScale }, { rotate }],
            opacity: bubbleOpacity,
          },
        ]}
      >
        🫧
      </Animated.Text>

      {/* "Pop..." — starts to form, stays dim */}
      <Animated.Text
        style={[
          s.almostText,
          {
            transform: [{ scale: textScale }],
            opacity: textOpacity,
          },
        ]}
      >
        Pop...
      </Animated.Text>

      {/* Content */}
      <Animated.View
        style={[
          s.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslate }],
          },
        ]}
      >
        <Text style={s.title}>So close!</Text>
        <Text style={s.sub}>
          Your brain was warming up.{'\n'}Give it another pop.
        </Text>

        <TouchableOpacity style={s.btnPrimary} onPress={onTryAgain} activeOpacity={0.85}>
          <Text style={s.btnPrimaryTxt}>Try Again ↺</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={onExit} activeOpacity={0.7}>
          <Text style={s.btnSecondaryTxt}>Back to Journey</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: Colors.bg,
  },

  bubble: {
    fontSize: 96,
    marginBottom: 4,
  },

  almostText: {
    fontSize: 38,
    fontFamily: 'Nunito_900Black',
    color: Colors.muted,
    marginBottom: 32,
    letterSpacing: -0.5,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 32,
  },

  btnPrimary: {
    width: '100%',
    paddingVertical: 17,
    backgroundColor: Colors.coral,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryTxt: {
    fontSize: 16,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 13,
    alignItems: 'center',
  },
  btnSecondaryTxt: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
