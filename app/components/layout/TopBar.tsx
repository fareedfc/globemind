import { View, Image, StyleSheet } from 'react-native';

interface Props {
  right?: React.ReactNode;
  compact?: boolean;
}

export function TopBar({ right, compact }: Props) {
  const centered = !right;
  return (
    <View style={[s.bar, centered && s.barCentered]}>
      <Image
        source={require('../../assets/icons/logo-thinkpop.png')}
        style={[s.logo, centered && s.logoCentered, compact && s.logoCompact]}
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
    paddingTop: 0,
    paddingBottom: 0,
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
  logoCompact: {
    width: 130,
    height: 48,
    alignSelf: 'center',
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
});
