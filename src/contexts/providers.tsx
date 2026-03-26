import React from 'react'
import { MD3DarkTheme, PaperProvider } from 'react-native-paper'
import AuthProvider from './auth-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PaperProvider theme={MD3DarkTheme}>
                {children}
            </PaperProvider>
        </AuthProvider>
    )
}