import { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, DimensionValue, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TopBar } from '../../components/layout/TopBar';
import { Pill } from '../../components/ui/Pill';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';
import { useBrainStore, type GameType } from '../../stores/brainStore';
import { useAuthStore } from '../../stores/authStore';

const DOMAIN_META: Array<{
  key: GameType;
  icon: string;
  label: string;
  color: string;
}> = [
  { key: 'memory',  icon: '🧩', label: 'Memory',  color: Colors.gold },
  { key: 'speed',   icon: '⚡', label: 'Speed',   color: Colors.coral },
  { key: 'logic',   icon: '🔤', label: 'Logic',   color: Colors.teal },
  { key: 'pattern', icon: '🔮', label: 'Pattern', color: Colors.purple },
];

const COACH_TIPS: Record<GameType, string[]> = {
  memory: [
    "Every session you show up is a win. You're building something great.",
    "Progress isn't always visible — but it's always happening.",
    "Small steps every day add up to big leaps over time.",
    "You're doing better than you think. Keep going.",
    "The fact that you're here means you're already ahead.",
    "Consistency beats intensity every single time.",
    "Growth doesn't happen in a straight line — and that's perfectly fine.",
    "You showed up today. That's the hardest part done.",
  ],
  speed: [
    "Momentum builds slowly, then all at once. You're closer than you feel.",
    "Every rep counts — even the ones that feel tough.",
    "You're not competing with anyone but yesterday's you.",
    "Trust the process. Results follow effort, always.",
    "A little progress each day is all it takes.",
    "Some days feel slower — that's just your mind consolidating its gains.",
    "Showing up on hard days is where real growth happens.",
    "You've got more in you than you realise.",
  ],
  logic: [
    "Curiosity is a superpower. You've clearly got it.",
    "Every challenge you face makes the next one easier.",
    "You're sharpening a skill that will serve you for life.",
    "Thinking takes effort — and you're putting in the work.",
    "The toughest problems are the ones most worth solving.",
    "Keep going. Every question you wrestle with makes you stronger.",
    "You're not just playing — you're growing. There's a difference.",
    "Hard things get easier. You're living proof.",
  ],
  pattern: [
    "Your mind is more capable than you give it credit for.",
    "Patterns are everywhere — you're learning to see them all.",
    "Keep noticing, keep connecting. It's working.",
    "Every level you play is rewiring you for the better.",
    "You're building an eye for detail that most people never develop.",
    "The best insights come to prepared minds — and yours is getting there.",
    "Stay curious. That's what keeps the mind young.",
    "You're making connections your brain will thank you for later.",
  ],
};

// Pick a tip that rotates daily so it doesn't feel stale
function pickTip(tips: string[]): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return tips[dayIndex % tips.length];
}

export default function BrainScreen() {
  const { score, streak } = usePlayerStore();
  const { domains, weeklyBaseline, snapshotWeekIfNeeded } = useBrainStore();
  const { isLoggedIn, name, logout } = useAuthStore();

  useEffect(() => {
    snapshotWeekIfNeeded(score);
  }, []);

  const weeklyDelta = score - weeklyBaseline;

  // Weakest of the 4 playable domains
  const weakestKey = (['memory', 'speed', 'logic', 'pattern'] as GameType[])
    .sort((a, b) => domains[a] - domains[b])[0];

  const coachTip = pickTip(COACH_TIPS[weakestKey]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <TopBar right={<Pill variant="gold" label={`⭐ ${score.toLocaleString()}`} />} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Sign-in banner (guest users) */}
        {!isLoggedIn && (
          <TouchableOpacity onPress={() => router.push('/auth')} activeOpacity={0.88} style={s.signInBannerWrap}>
            <LinearGradient
              colors={['rgba(255,107,53,0.12)', 'rgba(212,0,106,0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.signInBanner}
            >
              <View style={s.signInLeft}>
                <Text style={s.signInEmoji}>🔒</Text>
                <View>
                  <Text style={s.signInTitle}>Save your progress</Text>
                  <Text style={s.signInSub}>Sign in to keep your score & stats across devices</Text>
                </View>
              </View>
              <Text style={s.signInCta}>Sign In →</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Logged-in account row */}
        {isLoggedIn && name && (
          <View style={s.accountRow}>
            <Text style={s.accountTxt}>Signed in as <Text style={{ color: Colors.teal }}>{name}</Text></Text>
            <TouchableOpacity onPress={logout} activeOpacity={0.7}>
              <Text style={s.logoutTxt}>Log out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Miles Hero */}
        <LinearGradient
          colors={['#FFF0E0', '#FFE0C0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.scoreHero}
        >
          <Text style={s.scoreNum}>{score.toLocaleString()}</Text>
          <View>
            <Text style={s.scoreLbl}>Total Score ⭐</Text>
            <Text style={s.scoreWeek}>
              {weeklyDelta >= 0 ? `↑ +${weeklyDelta}` : `↓ ${weeklyDelta}`} pts this week
            </Text>
          </View>
        </LinearGradient>

        <Text style={s.sectionLbl}>Your Strengths</Text>
        <View style={s.domainList}>
          {DOMAIN_META.map(d => {
            const pct = domains[d.key];
            return (
              <View key={d.label} style={s.drow}>
                <Text style={s.dico}>{d.icon}</Text>
                <Text style={s.dlbl}>{d.label}</Text>
                <View style={s.dtrack}>
                  <View
                    style={[s.dfill, {
                      width: `${pct}%` as DimensionValue,
                      backgroundColor: d.color,
                    }]}
                  />
                </View>
                <Text style={s.dpct}>{pct}%</Text>
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

  signInBannerWrap: { marginBottom: 14 },
  signInBanner: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  signInLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  signInEmoji: { fontSize: 22 },
  signInTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.text },
  signInSub: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: Colors.muted, marginTop: 1 },
  signInCta: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.coral },

  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  accountTxt: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.muted },
  logoutTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.coral },

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
    color: Colors.text,
    width: 130,
  },
  dtrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dfill: {
    height: '100%',
    borderRadius: 4,
  },
  dpct: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.gold,
    width: 36,
    textAlign: 'right',
  },

  tipCard: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
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
    color: Colors.text,
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
