import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '@/contexts/auth-provider';

export default function TeamStack() {
  const { user } = useAuth();

  if (!user?.activeCompanyId) {
    return <Redirect href={"/" as any} />;
  }

  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: true }}>

      <Stack.Screen name="account/my-informations" options={{ headerTitle: 'Minhas Informações' }} />
      <Stack.Screen name="account/change-company" options={{ headerTitle: 'Meu Lava Jato' }} />
      <Stack.Screen name="account/change-name" options={{ headerTitle: 'Alterar Nome' }} />
      <Stack.Screen name="account/change-email" options={{ headerTitle: 'Alterar E-mail' }} />
      <Stack.Screen name="account/change-password" options={{ headerTitle: 'Alterar Senha' }} />
      <Stack.Screen name="account/change-phone" options={{ headerTitle: 'Alterar Telefone' }} />
      <Stack.Screen name="account/help" options={{ headerTitle: 'Ajuda' }} />
      <Stack.Screen name="account/avatar" options={{ headerTitle: 'Foto de Perfil' }} />

      <Stack.Screen name="bookings/[id]" options={{ headerTitle: 'Detalhes do Agendamento' }} />
    </Stack>
  );
}
