import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  right?: React.ReactNode;
}

export function TopBar({ right }: Props) {
  return (
    <View style={s.bar}>
      <Text style={s.logo}>
        Think<Text style={s.logoCoral}>Pop</Text>
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
    color: Colors.text,
    letterSpacing: -0.5,
  },
  logoCoral: {
    color: Colors.coral,
    fontFamily: 'Nunito_900Black',
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
});
