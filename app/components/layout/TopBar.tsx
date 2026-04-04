import { View, Image, StyleSheet } from 'react-native';

interface Props {
  right?: React.ReactNode;
}

export function TopBar({ right }: Props) {
  return (
    <View style={[s.bar, !right && s.barCentered]}>
      <Image
        source={require('../../assets/icons/logo-thinkpop.png')}
        style={[s.logo, !right && s.logoCentered]}
        resizeMode="contain"
      />
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
  barCentered: {
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 64,
  },
  logoCentered: {
    width: 220,
    height: 96,
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
});
