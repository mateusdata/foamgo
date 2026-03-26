import { Stack } from 'expo-router'
import React from 'react'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="(team)" />
      <Stack.Screen name="(partner)" />
    </Stack>
  )
}
