import { StyleSheet, View, useColorScheme, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'

import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams, Stack } from 'expo-router'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { PrimaryButton } from '@/components/buttons/primary-button'
import { api } from '@/config/api'
import dayjs from 'dayjs'
import { useTheme } from '@/hooks/use-theme'

export default function BookingSuccessScreen() {
    const { date, time, serviceName, companyId, teamName } = useLocalSearchParams<{ date: string, time: string, serviceName: string, companyId: string, teamName?: string }>()
    const [companyName, setCompanyName] = useState('')
    const theme = useTheme()
    const colorScheme = useColorScheme() || 'light'
    const isDark = colorScheme === 'dark'

    useEffect(() => {
        if (companyId) {
            api.get(`/companies/${companyId}`).then(res => {
                if (res.data && res.data.name) {
                    setCompanyName(res.data.name)
                }
            }).catch(() => {})
        }
    }, [companyId])

    useEffect(() => {
        const onBackPress = () => {
            handleFinish();
            return true;
        };
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [])

    const handleFinish = () => {
        // Router.replace garante que a tela de sucesso e agendamento não fiquem no histórico
        router.replace('/(app)/(client)/(tabs)/companies')
    }

    const formattedDate = date ? dayjs(date).format('DD/MM/YYYY') : ''

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
            
            <View style={styles.content}>
                <Ionicons name="checkmark-circle" size={100} color="#28a745" style={styles.icon} />
                <ThemedText style={styles.title}>Seu agendamento foi confirmado</ThemedText>
                
                <View style={[styles.detailsCard, { 
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderColor: isDark ? '#2C2C2E' : '#E5E7EB'
                }]}>
                    {companyName ? (
                        <ThemedText style={styles.companyName}>{companyName}</ThemedText>
                    ) : null}
                    
                    <View style={styles.row}>
                        <Ionicons name="car-sport-outline" size={20} color={theme.tint} style={styles.rowIcon} />
                        <ThemedText style={styles.detailText}>{serviceName}</ThemedText>
                    </View>
                    
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={20} color={theme.tint} style={styles.rowIcon} />
                        <ThemedText style={styles.detailText}>{formattedDate}</ThemedText>
                    </View>
                    
                    <View style={styles.row}>
                        <Ionicons name="time-outline" size={20} color={theme.tint} style={styles.rowIcon} />
                        <ThemedText style={styles.detailText}>{time}</ThemedText>
                    </View>

                    {teamName ? (
                        <View style={styles.row}>
                            <Ionicons name="people-outline" size={20} color={theme.tint} style={styles.rowIcon} />
                            <ThemedText style={styles.detailText}>{teamName}</ThemedText>
                        </View>
                    ) : null}
                </View>
            </View>

            <View style={styles.footer}>
                <PrimaryButton
                    name="Concluir"
                    variant="primary"
                    onPress={handleFinish}
                    textColor="#FFF"
                />
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    icon: { marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    detailsCard: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        gap: 16,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        marginRight: 12,
    },
    detailText: {
        fontSize: 16,
        fontWeight: '500',
    },
    footer: { paddingBottom: 20 },
})
