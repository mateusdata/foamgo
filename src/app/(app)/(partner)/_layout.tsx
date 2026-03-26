import { useAuth } from '@/contexts/auth-provider'
import { Redirect, Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

export default function PartnerStack() {
  const { user } = useAuth()

  if (user?.role !== 'PARTNER') {
    return <Redirect href={'/' as any} />
  }

  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{ headerShown: true, headerTitle: 'Partner' }}
    >
      <Stack.Screen
        name="store/subscription"
        options={{
          headerShown: Platform.OS === 'android' ? false : true,
          presentation: Platform.OS === 'android' ? 'card' : 'modal',
        }}
      />
    </Stack>
  )
}
