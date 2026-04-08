import { useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  DimensionValue, Image, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { usePlayerStore } from '../../stores/playerStore';
import { useBrainStore, type GameType } from '../../stores/brainStore';


const DOMAIN_META: Array<{
  key: GameType;
  icon: any;
  label: string;
  color: string;
  gradStart: string;
  gradEnd: string;
  tint: string;
}> = [
  {
    key: 'memory',  icon: require('../../assets/icons/icon-memory.png'),
    label: 'Memory',  color: '#FF8A00',
    gradStart: '#FF8A00', gradEnd: '#FFC857',
    tint: 'rgba(255,138,0,0.10)',
  },
  {
    key: 'speed',   icon: require('../../assets/icons/icon-speed.png'),
    label: 'Speed',   color: '#E8460A',
    gradStart: '#FFC857', gradEnd: '#FFE47A',
    tint: 'rgba(255,200,87,0.14)',
  },
  {
    key: 'logic',   icon: require('../../assets/icons/icon-logic.png'),
    label: 'Logic',   color: '#2EC4B6',
    gradStart: '#2EC4B6', gradEnd: '#7EEEE6',
    tint: 'rgba(46,196,182,0.12)',
  },
  {
    key: 'pattern', icon: require('../../assets/icons/icon-pattern.png'),
    label: 'Pattern', color: '#7A5CFF',
    gradStart: '#7A5CFF', gradEnd: '#B19EFF',
    tint: 'rgba(122,92,255,0.10)',
  },
];

const SCREEN_BACKGROUND = require('../../assets/landing-background.png');

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
    "Every level you play is making you sharper.",
    "You're building an eye for detail that most people never develop.",
    "The best insights come to prepared minds — and yours is getting there.",
    "Stay curious. That's what keeps the mind young.",
    "You're making connections that will pay off in everyday life.",
  ],
};

function pickTip(tips: string[]): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return tips[dayIndex % tips.length];
}


export default function BrainScreen() {
  const { score, streak } = usePlayerStore();
  const { domains, weeklyBaseline, snapshotWeekIfNeeded } = useBrainStore();


  useEffect(() => {
    snapshotWeekIfNeeded(score);
  }, []);

  const weeklyDelta = score - weeklyBaseline;

  const weakestKey = (['memory', 'speed', 'logic', 'pattern'] as GameType[])
    .sort((a, b) => domains[a] - domains[b])[0];

  const coachTip = pickTip(COACH_TIPS[weakestKey]);

  return (
    <ImageBackground source={SCREEN_BACKGROUND} style={s.screen} resizeMode="cover">
      <View style={s.bgScrim} />
    <SafeAreaView style={s.safe} edges={['top']}>
      <Image
        source={require('../../assets/icons/logo-thinkpop.png')}
        style={s.logo}
        resizeMode="contain"
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Score hero card ────────────────────────────────────────────── */}
        <View style={[s.card, s.heroCard]}>
          <LinearGradient
            colors={['#4A0E8F', '#8B3FD9', '#C76FE8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.heroGradient}
          >
            <View>
              <Text style={s.heroLabel}>TOTAL SCORE</Text>
              <Text style={s.heroScore}>{score.toLocaleString()}</Text>
            </View>
            <View style={s.heroRight}>
              <View style={s.weekBadge}>
                <Text style={s.weekBadgeTxt}>
                  {weeklyDelta >= 0 ? `↑ +${weeklyDelta}` : `↓ ${Math.abs(weeklyDelta)}`}
                </Text>
              </View>
              <Text style={s.heroWeekLbl}>this week</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Streak card ────────────────────────────────────────────────── */}
        <View style={[s.card, { overflow: 'hidden' }]}>
          <LinearGradient
            colors={['#FF8A00', '#FF5DA2']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.streakGradient}
          >
            <View style={s.streakIcoBubble}>
              <Image source={require('../../assets/icons/icon-flame.png')} style={s.streakIco} resizeMode="contain" />
            </View>
            <View>
              <Text style={s.streakLbl}>Day Streak</Text>
              <Text style={s.streakNum}>{streak} days</Text>
            </View>
            <Text style={s.streakFlair}>🔥</Text>
          </LinearGradient>
        </View>

        {/* ── Strengths card ─────────────────────────────────────────────── */}
        <Text style={s.sectionLbl}>Your Strengths</Text>
        <View style={s.card}>
          {DOMAIN_META.map((d, i) => {
            const pct = domains[d.key];
            return (
              <View key={d.key} style={[s.drow, i < DOMAIN_META.length - 1 && s.drowBorder]}>
                <View style={[s.iconBubble, { backgroundColor: d.tint }]}>
                  <Image source={d.icon} style={s.dico} resizeMode="contain" />
                </View>
                <View style={s.dInfo}>
                  <View style={s.dTopRow}>
                    <Text style={s.dlbl}>{d.label}</Text>
                    <Text style={[s.dpct, { color: d.color }]}>{pct}%</Text>
                  </View>
                  <View style={s.dtrack}>
                    <View style={{ width: `${pct}%` as DimensionValue, height: '100%', backgroundColor: d.color, borderRadius: 6 }} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Coach tip card ─────────────────────────────────────────────── */}
        <Text style={s.sectionLbl}>Coach Tip</Text>
        <View style={[s.card, s.tipCard]}>
          <View style={s.tipAccent} />
          <View style={s.tipInner}>
            <View style={s.tipHeader}>
              <Image source={require('../../assets/icons/icon-hint.png')} style={s.tipIco} resizeMode="contain" />
              <Text style={s.tipLbl}>Today's insight</Text>
            </View>
            <Text style={s.tipTxt}>{coachTip}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
    </ImageBackground>
  );
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  logo: {
    width: 190,
    height: 76,
    alignSelf: 'center',
  },
  bgScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.50)' },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },

  // ── Sign-in banner ───────────────────────────────────────────────────────
  signInInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(122,92,255,0.18)',
    borderRadius: 20,
  },
  signInIco: { width: 24, height: 24 },
  signInTitle: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#1A1A2E' },
  signInSub: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: '#888', marginTop: 1 },
  signInCta: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: '#7A5CFF' },

  // ── Account row ──────────────────────────────────────────────────────────
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  accountTxt: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: '#888' },
  logoutTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#E8460A' },

  // ── Card base ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },

  // ── Icon bubble (used in domain rows) ────────────────────────────────────
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Score hero ───────────────────────────────────────────────────────────
  heroCard: { marginTop: 4 },
  heroGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255,255,255,0.80)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroScore: {
    fontSize: 48,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
    lineHeight: 52,
  },
  heroRight: { alignItems: 'flex-end', gap: 6 },
  weekBadge: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  weekBadgeTxt: {
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
  heroWeekLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
  },

  // ── Section label ────────────────────────────────────────────────────────
  sectionLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#555555',
    marginLeft: 4,
    marginBottom: -4,
  },

  // ── Domain rows ──────────────────────────────────────────────────────────
  drow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  drowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dico: { width: 26, height: 26 },
  dInfo: { flex: 1, gap: 7 },
  dTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dlbl: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#1A1A2E',
  },
  dpct: {
    fontSize: 15,
    fontFamily: 'Nunito_900Black',
  },
  dtrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 6,
    overflow: 'hidden',
  },

  // ── Coach tip ────────────────────────────────────────────────────────────
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    ...CARD_SHADOW,
  },
  tipAccent: {
    width: 4,
    backgroundColor: '#FFC857',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  tipInner: { flex: 1, padding: 14 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipIco: { width: 28, height: 28 },
  tipLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#9A6F00',
  },
  tipTxt: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: '#3D2800',
    lineHeight: 23,
  },

  // ── Badges ───────────────────────────────────────────────────────────────
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeCard: {
    width: '18%',
    flexGrow: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  badgeEarned: {
    backgroundColor: 'rgba(139,63,217,0.12)',
    borderWidth: 1.5,
    borderColor: '#8B3FD9',
  },
  badgeLocked: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  badgeEmoji: {
    fontSize: 26,
    marginBottom: 2,
  },
  badgeEmojiLocked: {
    opacity: 0.25,
  },
  badgeName: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: '#8B3FD9',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
    textAlign: 'center',
  },
  badgeTextLocked: {
    color: 'rgba(0,0,0,0.25)',
  },

  // ── Streak ───────────────────────────────────────────────────────────────
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  streakIcoBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIco: { width: 30, height: 30 },
  streakLbl: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255,255,255,0.80)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  streakNum: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: '#FFFFFF',
  },
  streakFlair: {
    marginLeft: 'auto',
    fontSize: 36,
  },
});
