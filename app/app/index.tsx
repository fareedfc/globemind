import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

export default function Index() {
  const [target, setTarget] = useState<'/(tabs)/journey' | '/onboarding' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('hasOnboarded').then((val) => {
      setTarget(val ? '/(tabs)/journey' : '/onboarding');
    });
  }, []);

  if (!target) return <View style={{ flex: 1, backgroundColor: Colors.bg }} />;

  return <Redirect href={target} />;
}
