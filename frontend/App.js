import { registerRootComponent } from 'expo';
import React, { useMemo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import RootNavigator from './src/navigation/RootNavigator';
import AuthProvider, { useAuth } from './src/context/AuthContext';

// >>> [ADDED] i18n 컨텍스트
import { I18nProvider } from './src/i18n/I18nContext'; // <<< NEW

function applyGlobalFont(fontFamily) {
  if (Text.__globalFontPatched) return;
  const oldRender = Text.render;
  Text.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [origin.props.style, { fontFamily }],
    });
  };
  Text.__globalFontPatched = true;
}

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function AppShell() {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer key={isAuthenticated ? 'nav-app' : 'nav-auth'}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DungGeunMo: require('./assets/fonts/DungGeunMo.otf'),
  });

  useMemo(() => {
    if (fontsLoaded) applyGlobalFont('DungGeunMo');
  }, [fontsLoaded]);

  if (!fontsLoaded) return <Loading />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#111827" />
      {/* >>> [ADDED] I18nProvider로 전체 감싸기 */}
      <I18nProvider> {/* <<< NEW */}
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </I18nProvider> {/* <<< NEW */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000',
  },
});

registerRootComponent(App);
