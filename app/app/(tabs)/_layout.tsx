import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { useUIStore } from '../../stores/uiStore';

const WORLD_TAB_COLORS = [
  '#D9EDD4', '#C8DFF5', '#F5E8C8', '#E8D5C0', '#C8C5E8',
  '#C0DDE8', '#F5CFC8', '#C8E8F0', '#F0E0C0', '#DCC8F0',
];

function TabIcon({ source, focused }: { source: any; focused: boolean }) {
  return (
    <Image
      source={source}
      style={{ width: 28, height: 28, opacity: focused ? 1 : 0.45 }}
      resizeMode="contain"
    />
  );
}

export default function TabLayout() {
  const worldIdx = useUIStore((s) => s.worldIdx);
  const bgColor  = WORLD_TAB_COLORS[worldIdx] ?? WORLD_TAB_COLORS[0];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: 'rgba(0,0,0,0.08)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: 'rgba(0,0,0,0.35)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Nunito_700Bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require('../../assets/icons/icon-explore.png')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="brain"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require('../../assets/icons/icon-chart.png')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require('../../assets/icons/icon-settings.png')} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
