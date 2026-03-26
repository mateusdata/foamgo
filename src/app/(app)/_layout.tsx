import { Stack } from 'expo-router'
import React from 'react'

export default function AppLayout() {
  return (
    <Stack
      initialRouteName="(client)"
      screenOptions={{ headerShown: false }}
    >
    {/*usa redirect para evitar dor de cabeça */}
    
      <Stack.Screen redirect={false} name="(client)" />
      <Stack.Screen name="(team)" />
      <Stack.Screen name="(parter)" />
    </Stack>
  )
}
