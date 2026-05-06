import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Alert, Linking, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';
import { getPermissionStatus, requestAndSchedule, openSystemSettings } from '../../lib/notifications';
import * as Notifications from 'expo-notifications';

const SCREEN_BACKGROUND = require('../../assets/landing-background.png');

const PRIVACY_URL   = 'https://www.iubenda.com/privacy-policy/14041250';
const TERMS_URL     = 'https://fareedfc.github.io/thinkpop-legal/terms.html';
const APP_STORE_URL = 'https://apps.apple.com/app/thinkpop';

function SectionHeader({ title }: { title: string }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function Row({
  label, icon, right, onPress, disabled, danger,
}: {
  label: string;
  icon?: any;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const inner = (
    <View style={[s.row, disabled && s.rowDisabled]}>
      <View style={s.rowLeft}>
        {icon && (
          <View style={s.iconBubble}>
            <Image source={icon} style={s.rowIcon} resizeMode="contain" />
          </View>
        )}
        <Text style={[s.rowLabel, disabled && s.rowLabelDisabled, danger && s.rowLabelDanger]}>{label}</Text>
      </View>
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
  const { isLoggedIn, name, email, logout, deleteAccount } = useAuthStore();
  const { hapticsEnabled, toggleHaptics, isPremium, streak } = usePlayerStore();
  const [notifStatus, setNotifStatus] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    getPermissionStatus().then(setNotifStatus);
  }, []);

  const handleNotifications = async () => {
    if (notifStatus === 'granted') {
      openSystemSettings();
    } else {
      const granted = await requestAndSchedule(streak);
      setNotifStatus(granted ? 'granted' : 'denied');
      if (!granted) {
        Alert.alert(
          'Notifications blocked',
          'Enable notifications in your device settings to get daily reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openSystemSettings },
          ]
        );
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert('Error', error);
            } else {
              router.replace('/onboarding');
            }
          },
        },
      ]
    );
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
                  <View style={s.rowLeft}>
                    <View style={s.iconBubble}>
                      <Image source={require('../../assets/icons/icon-hint.png')} style={s.rowIcon} resizeMode="contain" />
                    </View>
                    <View style={{ gap: 2 }}>
                      <Text style={s.rowLabel}>{name ?? 'Your account'}</Text>
                      <Text style={s.rowSub}>{email}</Text>
                    </View>
                  </View>
                  {isPremium && (
                    <View style={s.unlimitedBadge}>
                      <Image source={require('../../assets/icons/icon-crown.png')} style={s.badgeIcon} resizeMode="contain" />
                      <Text style={s.unlimitedBadgeTxt}>Unlimited</Text>
                    </View>
                  )}
                </View>
                <View style={s.divider} />
                <Row label="Log out" onPress={handleLogout} right={<Text style={s.chevron}>›</Text>} />
                <View style={s.divider} />
                <Row label="Delete Account" onPress={handleDeleteAccount} danger right={<Text style={[s.chevron, { color: '#EF4444' }]}>›</Text>} />
              </>
            ) : (
              <Row
                label="Sign In / Create Account"
                icon={require('../../assets/icons/icon-hint.png')}
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
              icon={require('../../assets/icons/icon-settings.png')}
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
              icon={require('../../assets/icons/icon-settings.png')}
              onPress={handleNotifications}
              right={
                <Text style={[s.comingSoon, notifStatus === 'granted' && s.notifEnabled]}>
                  {notifStatus === 'granted' ? 'Enabled' : 'Enable'}
                </Text>
              }
            />
            <View style={s.divider} />
            <Row label="Language"      disabled right={<Text style={s.comingSoon}>Coming Soon</Text>} />
            <View style={s.divider} />
            <Row label="Music"         disabled right={<Text style={s.comingSoon}>Coming Soon</Text>} />
          </View>

          {/* ── Support ── */}
          <SectionHeader title="Support" />
          <View style={s.card}>
            {!isPremium && (
              <>
                <Row
                  label="Upgrade to Unlimited"
                  icon={require('../../assets/icons/icon-crown.png')}
                  onPress={() => router.push('/paywall?reason=upgrade')}
                  right={<Text style={s.chevron}>›</Text>}
                />
                <View style={s.divider} />
              </>
            )}
            <Row
              label="Rate ThinkPop"
              icon={require('../../assets/icons/icon-star.png')}
              onPress={() => Linking.openURL(APP_STORE_URL)}
              right={<Text style={s.chevron}>›</Text>}
            />
            <View style={s.divider} />
            <Row
              label="Privacy Policy"
              icon={require('../../assets/icons/icon-lock.png')}
              onPress={() => Linking.openURL(PRIVACY_URL)}
              right={<Text style={s.chevron}>›</Text>}
            />
            <View style={s.divider} />
            <Row
              label="Terms & Conditions"
              icon={require('../../assets/icons/icon-check.png')}
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
  logo: { width: 190, height: 76 },
  title: { fontSize: 28, fontFamily: 'Nunito_900Black', color: Colors.text },

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
    paddingVertical: 13,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139,63,217,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: { width: 22, height: 22 },
  rowDisabled: { opacity: 0.5 },
  rowLabel: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text },
  rowLabelDanger: { color: '#EF4444' },
  rowLabelDisabled: { color: Colors.muted },
  rowSub: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.muted },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  chevron: { fontSize: 22, color: Colors.muted, lineHeight: 26 },
  unlimitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139,63,217,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(139,63,217,0.20)',
  },
  badgeIcon: { width: 14, height: 14 },
  unlimitedBadgeTxt: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#8B3FD9' },
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
  notifEnabled: {
    color: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
});
