import { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TopBar } from '../../components/layout/TopBar';
import { Pill } from '../../components/ui/Pill';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';
import { useBrainStore, type GameType } from '../../stores/brainStore';

const DOMAIN_META: Array<{
  key: GameType | 'focus';
  icon: string;
  label: string;
  color: string;
}> = [
  { key: 'memory',  icon: '🧩', label: 'Memory',  color: Colors.gold },
  { key: 'speed',   icon: '⚡', label: 'Speed',   color: Colors.coral },
  { key: 'logic',   icon: '🔤', label: 'Logic',   color: Colors.teal },
  { key: 'pattern', icon: '🔮', label: 'Pattern', color: Colors.purple },
  { key: 'focus',   icon: '🎯', label: 'Focus',   color: Colors.blue },
];

const COACH_TIPS: Record<GameType, string> = {
  memory:  'Memory is your biggest growth area. Aim for zero wrong flips on Memory levels.',
  speed:   'Speed is your opportunity this week. Stack combos on Speed Match to accelerate gains.',
  logic:   'Logic is your growth zone this week. Take your time and think it through.',
  pattern: 'Pattern is where you grow fastest. Focus on Pattern Pulse levels to build this skill.',
};

export default function BrainScreen() {
  const { miles, streak } = usePlayerStore();
  const { domains, weeklyBaseline, snapshotWeekIfNeeded } = useBrainStore();

  useEffect(() => {
    snapshotWeekIfNeeded(miles);
  }, []);

  const weeklyDelta = miles - weeklyBaseline;

  // Weakest of the 4 playable domains
  const weakestKey = (['memory', 'speed', 'logic', 'pattern'] as GameType[])
    .sort((a, b) => domains[a] - domains[b])[0];

  const coachTip = COACH_TIPS[weakestKey];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <TopBar right={<Pill variant="gold" label={`✈️ ${miles.toLocaleString()}`} />} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Miles Hero */}
        <LinearGradient
          colors={['#1a3a5c', '#0d2137']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.scoreHero}
        >
          <Text style={s.scoreNum}>{miles.toLocaleString()}</Text>
          <View>
            <Text style={s.scoreLbl}>Miles Traveled ✈️</Text>
            <Text style={s.scoreWeek}>
              {weeklyDelta >= 0 ? `↑ +${weeklyDelta}` : `↓ ${weeklyDelta}`} miles this week
            </Text>
          </View>
        </LinearGradient>

        {/* Brain Training Areas */}
        <Text style={s.sectionLbl}>Brain Training Areas</Text>
        <View style={s.domainList}>
          {DOMAIN_META.map(d => {
            const pct = d.key === 'focus' ? 0 : domains[d.key as GameType];
            const isLocked = d.key === 'focus';
            return (
              <View key={d.label} style={s.drow}>
                <Text style={[s.dico, isLocked && { opacity: 0.35 }]}>{d.icon}</Text>
                <Text style={[s.dlbl, isLocked && { opacity: 0.35 }]}>{d.label}</Text>
                <View style={s.dtrack}>
                  {isLocked ? (
                    <View style={s.dlockedOverlay}>
                      <Text style={s.dlockedTxt}>Coming soon</Text>
                    </View>
                  ) : (
                    <View
                      style={[s.dfill, {
                        width: `${pct}%` as DimensionValue,
                        backgroundColor: d.color,
                      }]}
                    />
                  )}
                </View>
                <Text style={[s.dpct, isLocked && { opacity: 0.35 }]}>
                  {isLocked ? '—' : `${pct}%`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Coach Tip */}
        <View style={s.tipCard}>
          <Text style={s.tipLbl}>🧠 Coach Tip</Text>
          <Text style={s.tipTxt}>{coachTip}</Text>
        </View>

        {/* Streak Card */}
        <LinearGradient
          colors={['rgba(239,71,111,0.15)', 'rgba(155,93,229,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.streakCard}
        >
          <Text style={s.streakIco}>🔥</Text>
          <View>
            <Text style={s.streakLbl}>Day Streak</Text>
            <Text style={s.streakNum}>{streak} days</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  scoreHero: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreNum: {
    fontSize: 52,
    fontFamily: 'Nunito_900Black',
    color: Colors.gold,
    lineHeight: 56,
  },
  scoreLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.muted,
    marginBottom: 2,
  },
  scoreRank: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.teal,
  },
  scoreWeek: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
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
  domainList: {
    gap: 13,
    marginBottom: 20,
  },
  drow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  dico: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  dlbl: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
    width: 130,
  },
  dtrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dfill: {
    height: '100%',
    borderRadius: 4,
  },
  dlockedOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dlockedTxt: {
    fontSize: 9,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
  },
  dpct: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.gold,
    width: 36,
    textAlign: 'right',
  },

  tipCard: {
    backgroundColor: 'rgba(255,209,102,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.2)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  tipLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tipTxt: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.white,
    lineHeight: 20,
  },

  streakCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,71,111,0.2)',
  },
  streakIco: { fontSize: 32 },
  streakLbl: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
  },
  streakNum: {
    fontSize: 26,
    fontFamily: 'Nunito_900Black',
    color: Colors.coral,
  },
});
