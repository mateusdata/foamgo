import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-provider';

export default function AppIndex() {
  const { user, activeRole } = useAuth();
  
  if (!user) return null;

  const isPartner = user?.role === 'PARTNER';
  const isTeamMember = !!user?.activeCompanyId;

  console.log('DISPATCHER DEBUG', {
    activeRole,
    userRole: user?.role,
    isPartner,
    isTeamMember,
    activeCompanyId: user?.activeCompanyId,
  });

  // If user explicitly switched to a role in the app menu:
  if (activeRole === 'CLIENT' || activeRole === 'USER') {
    return <Redirect href={"/(app)/(client)" as any} />;
  }
  
  if (activeRole === 'PARTNER') {
    if (isPartner) return <Redirect href={"/(app)/(partner)" as any} />;
    if (isTeamMember) return <Redirect href={"/(app)/(team)" as any} />;
    return <Redirect href={"/(app)/(client)" as any} />;
  }

  // Default routing based on highest privilege:
  if (isPartner) return <Redirect href={"/(app)/(partner)" as any} />;
  if (isTeamMember) return <Redirect href={"/(app)/(team)" as any} />;
  
  // Default to client
  return <Redirect href={"/(app)/(client)" as any} />;
}
