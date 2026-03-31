import { ScrollView, View, Text, StyleSheet, DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TopBar } from '../../components/layout/TopBar';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';

const STAMPS = [
  { icon: '🌸', label: 'Explorer', earned: true },
  { icon: '⭐', label: 'Wordsmith', earned: true },
  { icon: '🔒', label: 'Speedster', earned: false },
  { icon: '🔒', label: 'Pathfinder', earned: false },
  { icon: '🔒', label: 'Horizon', earned: false },
  { icon: '🔒', label: 'Luminary', earned: false },
  { icon: '🔒', label: 'Voyager', earned: false },
  { icon: '🔒', label: 'Legend', earned: false },
];

const MILES_TARGET = 5000;

export default function MilesScreen() {
  const { miles } = usePlayerStore();
  const pct = Math.min(Math.round((miles / MILES_TARGET) * 100), 100);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <TopBar />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Passport Cover */}
        <LinearGradient
          colors={['#8B1A1A', '#5C1010']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.passportCover}
        >
          <Text style={{ fontSize: 42 }}>📔</Text>
          <View>
            <Text style={s.ppTitle}>Your Passport</Text>
            <Text style={s.ppSub}>2 stamps earned · 6 to go</Text>
          </View>
        </LinearGradient>

        {/* Stamps */}
        <Text style={s.sectionLbl}>Stamps Collected</Text>
        <View style={s.stampsGrid}>
          {STAMPS.map(stamp => (
            <View
              key={stamp.label}
              style={[s.stamp, stamp.earned ? s.stampEarned : s.stampLocked]}
            >
              <Text style={s.stampIco}>{stamp.icon}</Text>
              <Text style={[s.stampLbl, stamp.earned && s.stampLblEarned]}>
                {stamp.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Miles Hero */}
        <View style={s.milesHero}>
          <View>
            <Text style={s.milesLblSmall}>Total Miles</Text>
            <Text style={s.milesNum}>{miles.toLocaleString()} ✈️</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.milesLblSmall}>Next reward</Text>
            <Text style={s.milesNext}>at {MILES_TARGET.toLocaleString()} mi</Text>
          </View>
        </View>

        {/* Progress to next stamp */}
        <View>
          <Text style={s.progressTitle}>Progress to next stamp</Text>
          <View style={s.ptnBar}>
            <LinearGradient
              colors={[Colors.gold, Colors.gold2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.ptnFill, { width: `${pct}%` as DimensionValue }]}
            />
          </View>
          <Text style={s.ptnLbl}>
            {miles.toLocaleString()} / {MILES_TARGET.toLocaleString()} miles · {pct}%
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  passportCover: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ppTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_900Black',
    color: Colors.white,
  },
  ppSub: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.white,
    opacity: 0.7,
    marginTop: 2,
  },

  sectionLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.muted,
    marginBottom: 12,
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  stamp: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    gap: 3,
  },
  stampEarned: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  stampLocked: {
    borderColor: Colors.border,
    backgroundColor: 'rgba(0,0,0,0.03)',
    opacity: 0.4,
  },
  stampIco: { fontSize: 22 },
  stampLbl: {
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: Colors.muted,
  },
  stampLblEarned: { color: Colors.gold },

  milesHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  milesLblSmall: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
  },
  milesNum: {
    fontSize: 34,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
  },
  milesNext: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
    marginTop: 2,
  },

  progressTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 6,
  },
  ptnBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ptnFill: {
    height: '100%',
    borderRadius: 4,
  },
  ptnLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    marginTop: 4,
  },
});
