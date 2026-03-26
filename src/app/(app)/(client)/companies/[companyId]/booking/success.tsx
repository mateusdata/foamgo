import { StyleSheet, View } from 'react-native'
import React from 'react'

import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { router } from 'expo-router'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { PrimaryButton } from '@/components/buttons/primary-button'

export default function BookingSuccessScreen() {


    const handleFinish = () => {
        router.push('/(client)/(tabs)/companies')
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="checkmark-circle" size={100} color="#28a745" style={styles.icon} />
                <ThemedText style={styles.title}>Sucesso!</ThemedText>
                <ThemedText style={styles.message}>Seu agendamento foi realizado.</ThemedText>
            </View>

            <View style={styles.footer}>
                <PrimaryButton
                    name="Voltar"
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
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
    message: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
    footer: { paddingBottom: 20 },
    button: { width: '100%', paddingVertical: 12 }
})
