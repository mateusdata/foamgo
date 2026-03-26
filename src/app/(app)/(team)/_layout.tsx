import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '@/contexts/auth-provider';

export default function TeamStack() {
  const { user } = useAuth();

  if (!user?.activeCompanyId) {
    return <Redirect href={"/" as any} />;
  }

  return (
    <Stack initialRouteName="(tabs)" screenOptions={{headerShown: true, headerTitle: 'Team'}} />
  );
}
