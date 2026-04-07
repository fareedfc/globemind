import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Alert, Linking, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';

const SCREEN_BACKGROUND = require('../../assets/landing-background.png');

// Placeholder URLs — replace with real ones before App Store submission
const PRIVACY_URL = 'https://www.iubenda.com/privacy-policy/thinkpop';
const TERMS_URL   = 'https://www.termsfeed.com/terms-conditions/thinkpop';
const APP_STORE_URL = 'https://apps.apple.com/app/thinkpop'; // replace with real ID


function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function Row({
  label, right, onPress, disabled,
}: {
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const inner = (
    <View style={[s.row, disabled && s.rowDisabled]}>
      <Text style={[s.rowLabel, disabled && s.rowLabelDisabled]}>{label}</Text>
      <View style={s.rowRight}>{right}</View>
    </View>
  );
  if (!onPress || disabled) return inner;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      {inner}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { isLoggedIn, name, email, logout } = useAuthStore();
  const { hapticsEnabled, toggleHaptics, isPremium } = usePlayerStore();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ImageBackground source={SCREEN_BACKGROUND} style={s.container} resizeMode="cover">
      <View style={s.bgScrim} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <View style={s.header}>
            <Text style={s.title}>Settings</Text>
            <Image
              source={require('../../assets/icons/logo-thinkpop.png')}
              style={s.logo}
              resizeMode="contain"
            />
          </View>

          {/* ── Account ── */}
          <SectionHeader title="Account" />
          <View style={s.card}>
            {isLoggedIn ? (
              <>
                <View style={s.row}>
                  <View style={{ gap: 2 }}>
                    <Text style={s.rowLabel}>{name ?? 'Your account'}</Text>
                    <Text style={s.rowSub}>{email}</Text>
                  </View>
                </View>
                <View style={s.divider} />
                <Row label="Log out" onPress={handleLogout} right={<Text style={s.chevron}>›</Text>} />
              </>
            ) : (
              <Row
                label="Sign In / Create Account"
                onPress={() => router.push('/auth')}
                right={<Text style={s.chevron}>›</Text>}
              />
            )}
          </View>

          {/* ── App ── */}
          <SectionHeader title="App" />
          <View style={s.card}>
            <Row
              label="Haptic Feedback"
              right={
                <Switch
                  value={hapticsEnabled}
                  onValueChange={toggleHaptics}
                  trackColor={{ false: '#ddd', true: '#8B3FD9' }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={s.divider} />
            <Row
              label="Notifications"
              disabled
              right={<Text style={s.comingSoon}>Coming Soon</Text>}
            />
            <View style={s.divider} />
            <Row
              label="Language"
              disabled
              right={<Text style={s.comingSoon}>Coming Soon</Text>}
            />
            <View style={s.divider} />
            <Row
              label="Music"
              disabled
              right={<Text style={s.comingSoon}>Coming Soon</Text>}
            />
          </View>

          {/* ── Support ── */}
          <SectionHeader title="Support" />
          <View style={s.card}>
            {!isPremium && (
              <>
                <Row
                  label="Upgrade to Premium 👑"
                  onPress={() => router.push('/paywall')}
                  right={<Text style={s.chevron}>›</Text>}
                />
                <View style={s.divider} />
              </>
            )}
            <Row
              label="Rate ThinkPop ⭐"
              onPress={() => Linking.openURL(APP_STORE_URL)}
              right={<Text style={s.chevron}>›</Text>}
            />
            <View style={s.divider} />
            <Row
              label="Privacy Policy"
              onPress={() => Linking.openURL(PRIVACY_URL)}
              right={<Text style={s.chevron}>›</Text>}
            />
            <View style={s.divider} />
            <Row
              label="Terms & Conditions"
              onPress={() => Linking.openURL(TERMS_URL)}
              right={<Text style={s.chevron}>›</Text>}
            />
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  bgScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  logo: {
    width: 190,
    height: 76,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_900Black',
    color: Colors.text,
  },

  sectionHeader: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  rowLabelDisabled: {
    color: Colors.muted,
  },
  rowSub: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.muted,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 22,
    color: Colors.muted,
    lineHeight: 26,
  },
  comingSoon: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#8B3FD9',
    backgroundColor: 'rgba(139,63,217,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
