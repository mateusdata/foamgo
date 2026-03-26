import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-provider';

export default function AppIndex() {
  const { user, activeRole } = useAuth();
  
  if (!user) return null;

  const currentMode = activeRole?.toUpperCase() || user?.role?.toUpperCase();

  if (currentMode === 'CLIENT' || currentMode === 'USER') return <Redirect href={"/(client)" as any} />;
  if (currentMode === 'PARTNER') return <Redirect href={"/(partner)" as any} />;
  if (currentMode === 'WORKER' || currentMode === 'TEAM') return <Redirect href={"/(team)" as any} />;

  return <Redirect href={"/(client)" as any} />;
}
