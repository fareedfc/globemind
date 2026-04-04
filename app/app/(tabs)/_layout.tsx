import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Colors } from '../../constants/colors';

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
          title: 'Explore',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={require('../../assets/icons/icon-map.png')} focused={focused} />
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
    </Tabs>
  );
}
