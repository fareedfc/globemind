import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';

// Catch-all for thinkpop://reset deep links.
// The actual handling (token exchange + navigate to /reset-password)
// is done in _layout.tsx via Linking.getInitialURL.
export default function ResetScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
      <ActivityIndicator color={Colors.purple} size="large" />
    </View>
  );
}
