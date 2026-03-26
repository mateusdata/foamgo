import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function ClientStack() {
  return (
   <>
   <StatusBar style='auto' />
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: true }}>

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen name="account/index" options={{ headerTitle: 'Conta' }} />
      <Stack.Screen name="account/my-informations" options={{ headerTitle: 'Minhas Informações' }} />
      <Stack.Screen name="account/change-name" options={{ headerTitle: 'Alterar Nome' }} />
      <Stack.Screen name="account/change-email" options={{ headerTitle: 'Alterar E-mail' }} />
      <Stack.Screen name="account/change-password" options={{ headerTitle: 'Alterar Senha' }} />
      <Stack.Screen name="account/change-phone" options={{ headerTitle: 'Alterar Telefone' }} />
      <Stack.Screen name="account/help" options={{ headerTitle: 'Ajuda' }} />

      <Stack.Screen name="bookings/[id]" options={{ headerTitle: 'Detalhes do Agendamento' }} />

      <Stack.Screen name="companies/[companyId]/booking/index" options={{ headerTitle: 'Novo Agendamento' }} />
      <Stack.Screen name="companies/[companyId]/booking/schedule" options={{ headerTitle: 'Escolher Horário' }} />
      <Stack.Screen name="companies/[companyId]/booking/team" options={{ headerTitle: 'Escolher Equipe' }} />
      <Stack.Screen name="companies/[companyId]/booking/success" options={{ headerTitle: 'Agendamento Confirmado' }} />

      <Stack.Screen name="vehicles/add-vehicle" options={{ headerShown: false }} />
    </Stack>
   </>
  );
}
