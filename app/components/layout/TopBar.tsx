import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  right?: React.ReactNode;
}

export function TopBar({ right }: Props) {
  return (
    <View style={s.bar}>
      <Text style={s.logo}>
        Globe<Text style={s.logoGold}>Mind</Text>
      </Text>
      {right ? <View style={s.right}>{right}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  logoGold: {
    color: Colors.gold,
    fontFamily: 'Nunito_900Black',
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
});
