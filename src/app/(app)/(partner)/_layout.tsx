import { useAuth } from '@/contexts/auth-provider'
import { Redirect, Stack, useSegments } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

export default function PartnerStack() {
  const { user, activeRole } = useAuth()
  const segments = useSegments()
  const currentSegments = segments as string[]
  const isCreateCompanyRoute = currentSegments.includes('companies') && currentSegments.includes('create')
  const allowPartnerOnboarding = activeRole === 'PARTNER' && isCreateCompanyRoute

  if (user?.role !== 'PARTNER' && !allowPartnerOnboarding) {
    return <Redirect href={'/' as any} />
  }

  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: true }}>

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="account/my-informations" options={{ headerTitle: 'Minhas Informações' }} />
      <Stack.Screen name="account/change-company" options={{ headerTitle: 'Dados da Empresa' }} />
      <Stack.Screen name="account/change-name" options={{ headerTitle: 'Alterar Nome' }} />
      <Stack.Screen name="account/change-email" options={{ headerTitle: 'Alterar E-mail' }} />
      <Stack.Screen name="account/change-password" options={{ headerTitle: 'Alterar Senha' }} />
      <Stack.Screen name="account/change-phone" options={{ headerTitle: 'Alterar Telefone' }} />
      <Stack.Screen name="account/help" options={{ headerTitle: 'Ajuda' }} />
      <Stack.Screen name="account/avatar" options={{ headerTitle: 'Foto de Perfil' }} />

      <Stack.Screen name="bookings/[id]" options={{ headerTitle: 'Detalhes do Agendamento' }} />

      <Stack.Screen name="companies/create" options={{ headerTitle: 'Criar Lava Jato' }} />
      <Stack.Screen name="companies/car/[id]" options={{ headerTitle: 'Detalhes do Veículo' }} />
      <Stack.Screen name="companies/[companyId]/address" options={{ headerTitle: 'Endereço' }} />
      <Stack.Screen name="companies/[companyId]/categories" options={{ headerTitle: 'Categorias' }} />
      <Stack.Screen name="companies/[companyId]/manager" options={{ headerTitle: 'Gerenciador' }} />
      <Stack.Screen name="companies/[companyId]/services" options={{ headerTitle: 'Serviços' }} />
      <Stack.Screen name="companies/[companyId]/slots" options={{ headerTitle: 'Horários de Atendimento' }} />
      <Stack.Screen name="companies/[companyId]/teams" options={{ headerTitle: 'Equipes' }} />
      <Stack.Screen name="companies/[companyId]/team-member" options={{ headerTitle: 'Membros da Equipe' }} />

      <Stack.Screen
        name="store/subscription"
        options={{
          headerTitle: 'Planos Premium',
          headerShown: Platform.OS === 'android' ? false : true,
          presentation: Platform.OS === 'android' ? 'card' : 'modal',
        }}
      />
    </Stack>
  )
}
