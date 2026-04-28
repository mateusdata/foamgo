import { api } from '@/config/api';
import { useAuth } from '@/contexts/auth-provider';
import { Redirect, Stack, usePathname, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function ClientStack() {
  const { user, activeRole } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const [hasVehicle, setHasVehicle] = React.useState<boolean | null>(null);
  const [checkingVehicle, setCheckingVehicle] = React.useState(true);

  const currentSegments = segments as string[];
  const isAddVehicleRoute = currentSegments.includes('vehicles') && currentSegments.includes('add-vehicle');
  const isClientMode = activeRole === 'CLIENT' || activeRole === 'USER' || !activeRole;
  const shouldRequireVehicle =
    user?.role === 'USER' || (user?.role === 'PARTNER' && isClientMode);

  const checkUserVehicles = React.useCallback(async () => {
    if (!shouldRequireVehicle || !user?.id) {
      setHasVehicle(true);
      setCheckingVehicle(false);
      return;
    }

    try {
      setCheckingVehicle(true);
      const response = await api.get('/vehicles/me');
      const vehicles = Array.isArray(response.data) ? response.data : [];
      setHasVehicle(vehicles.length > 0);
    } catch (_) {
      setHasVehicle((user?.vehicles?.length ?? 0) > 0);
    } finally {
      setCheckingVehicle(false);
    }
  }, [shouldRequireVehicle, user?.id, user?.vehicles?.length]);

  React.useEffect(() => {
    checkUserVehicles();
  }, [checkUserVehicles, pathname]);

  if (shouldRequireVehicle && !checkingVehicle && hasVehicle === false && !isAddVehicleRoute) {
    return <Redirect href={"/(app)/(client)/vehicles/add-vehicle" as any} />;
  }

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

      <Stack.Screen name="vehicles/add-vehicle" options={{ headerShown: true, headerTitle: 'Adicionar Veículo' }} />
    </Stack>
   </>
  );
}
