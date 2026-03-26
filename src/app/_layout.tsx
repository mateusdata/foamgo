import PushNotification from '@/components/notification'
import { useAuth } from '@/contexts/auth-provider'
import Providers from '@/contexts/providers'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style='light' />
        <Providers>
          <PushNotification />
          <RootNavigation />
        </Providers>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

function RootNavigation() {
  const { user } = useAuth()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={false}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      <Stack.Protected guard={true}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  )
}