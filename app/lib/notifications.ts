import { Linking, Platform } from 'react-native';

const DAILY_ID  = 'thinkpop-daily-9am';
const STREAK_ID = 'thinkpop-streak-7pm';

// expo-notifications requires a native build — unavailable in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // silently unavailable in Expo Go
}

export async function getPermissionStatus(): Promise<string> {
  try {
    if (!Notifications) return 'unavailable';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return 'unavailable';
  }
}

export async function requestAndSchedule(streak: number): Promise<boolean> {
  try {
    if (!Notifications) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await scheduleNotifications(streak);
    return true;
  } catch {
    return false;
  }
}

export function openSystemSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

export async function scheduleNotifications(streak: number): Promise<void> {
  try {
    if (!Notifications) return;
    await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: 'Time for ThinkPop! ⚡',
        body: 'Your daily dose of ThinkPop awaits.',
        sound: true,
      },
      trigger: { hour: 9, minute: 0, repeats: true } as any,
    });

    const hasStreak = streak > 0;
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_ID,
      content: {
        title: hasStreak ? "Don't break your streak! 🔥" : 'Start a streak today! 🔥',
        body: hasStreak
          ? `You're on a ${streak}-day streak. Keep it going!`
          : 'Play one level today and start your streak.',
        sound: true,
      },
      trigger: { hour: 19, minute: 0, repeats: true } as any,
    });
  } catch {
    // silently unavailable in Expo Go
  }
}

export async function cancelAll(): Promise<void> {
  try {
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
