import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

type Variant = 'gold' | 'red' | 'teal' | 'warm';

const VARIANTS: Record<Variant, { bg: string; color: string }> = {
  gold: { bg: 'rgba(245,158,11,0.15)', color: Colors.gold },
  red:  { bg: 'rgba(255,92,53,0.15)',  color: Colors.coral },
  teal: { bg: 'rgba(0,201,167,0.15)',  color: Colors.teal },
  warm: { bg: '#FFE0C0',               color: '#C25E00' },
};

export function Pill({ variant, label, icon }: { variant: Variant; label: string; icon?: any }) {
  const vs = VARIANTS[variant];
  return (
    <View style={[s.pill, { backgroundColor: vs.bg }]}>
      {icon && <Image source={icon} style={s.icon} resizeMode="contain" />}
      <Text style={[s.text, { color: vs.color }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    borderRadius: 23,
    paddingVertical: 7,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: { width: 22, height: 22 },
  text: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
});
