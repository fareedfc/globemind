import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type Variant = 'gold' | 'red' | 'teal';

const VARIANTS: Record<Variant, { bg: string; color: string }> = {
  gold: { bg: 'rgba(245,158,11,0.15)', color: Colors.gold },
  red: { bg: 'rgba(255,92,53,0.15)', color: Colors.coral },
  teal: { bg: 'rgba(0,201,167,0.15)', color: Colors.teal },
};

export function Pill({ variant, label }: { variant: Variant; label: string }) {
  const vs = VARIANTS[variant];
  return (
    <View style={[s.pill, { backgroundColor: vs.bg }]}>
      <Text style={[s.text, { color: vs.color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
});
