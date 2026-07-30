import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-provider';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions?.({
  duration: 1000,
  fade: true,
});

export function SplashScreenController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}