import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-provider';
import React from 'react';
import { Alert } from 'react-native';

export default function AppIndex() {
  const { user, activeRole, logOut } = useAuth();
  const [upgradeDecision, setUpgradeDecision] = React.useState<'idle' | 'accepted' | 'declined'>('idle');
  const hasShownUpgradePrompt = React.useRef(false);

  if (!user) return null;

  const isPartner = user?.role === 'PARTNER';
  const isTeamMember = !!user?.activeCompanyId;
  const shouldOfferPartnerUpgrade =
    activeRole === 'PARTNER' &&
    user?.role === 'USER' &&
    !isPartner &&
    !isTeamMember;

  React.useEffect(() => {
    if (!shouldOfferPartnerUpgrade || hasShownUpgradePrompt.current) return;

    hasShownUpgradePrompt.current = true;

    Alert.alert(
      'Conta de Cliente',
      'Sua conta atual é de cliente. Deseja criar seu Lava Jato agora para ativar o modo parceiro?',
      [
        {
          text: 'Agora não',
          style: 'cancel',
          onPress: async () => {
            await logOut();
            setUpgradeDecision('declined');
            hasShownUpgradePrompt.current = false;
          },
        },
        {
          text: 'Sim, criar',
          onPress: () => {
            setUpgradeDecision('accepted');
          },
        },
      ],
      { cancelable: false }
    );
  }, [logOut, shouldOfferPartnerUpgrade]);

  console.log('DISPATCHER DEBUG', {
    activeRole,
    userRole: user?.role,
    isPartner,
    isTeamMember,
    activeCompanyId: user?.activeCompanyId,
  });

  if (upgradeDecision === 'accepted') {
    return <Redirect href={"/(app)/(partner)/companies/create" as any} />;
  }

  if (shouldOfferPartnerUpgrade) return null;

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
