import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: 'rgba(255,255,255,0.07)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Nunito_700Bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: () => <TabIcon emoji="🗺️" />,
        }}
      />
      <Tabs.Screen
        name="brain"
        options={{
          title: 'Brain',
          tabBarIcon: () => <TabIcon emoji="🧠" />,
        }}
      />
    </Tabs>
  );
}
