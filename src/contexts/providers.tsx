import React from 'react'
import { MD3DarkTheme, PaperProvider } from 'react-native-paper'
import AuthProvider from './auth-provider'
import SubscriptionProvider from './subscription-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PaperProvider >
                <SubscriptionProvider>
                    {children}
                </SubscriptionProvider>
            </PaperProvider>
        </AuthProvider>
    )
}