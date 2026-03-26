import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-provider';

export default function AppIndex() {
  const { user, activeRole } = useAuth();
  
  if (!user) return null;

  const selectedMode = activeRole?.toUpperCase() || user?.role?.toUpperCase();
  const isPartner = user?.role === 'PARTNER';
  const isTeamMember = !!user?.activeCompanyId;

  console.log('DISPATCHER DEBUG', {
    activeRole,
    selectedMode,
    userRole: user?.role,
    isPartner,
    isTeamMember,
    activeCompanyId: user?.activeCompanyId,
    memberships: user?.memberships,
  });

  if (selectedMode === 'CLIENT' || selectedMode === 'USER') {
    return <Redirect href={"/(client)" as any} />;
  }

  if (selectedMode === 'PARTNER') {
    if (isPartner) return <Redirect href={"/(partner)" as any} />;
    if (isTeamMember) return <Redirect href={"/(team)" as any} />;
    return <Redirect href={"/(client)" as any} />;
  }

  if (isPartner) return <Redirect href={"/(partner)" as any} />;
  if (isTeamMember) return <Redirect href={"/(team)" as any} />;
  return <Redirect href={"/(client)" as any} />;
}
