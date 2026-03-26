import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: Platform.OS === 'ios',
        headerLargeTitleShadowVisible: true,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'LavaJato' }} />
    </Stack>
  );
}
