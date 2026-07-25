import {
    StyleSheet,
    View,
    Alert,
    TouchableOpacity,
    useColorScheme,
    ScrollView
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth } from '@/contexts/auth-provider'
import { PrimaryButton } from '@/components/buttons/primary-button'
import { api } from '@/config/api'

export default function BookingVehicleScreen() {
    const { companyId, serviceId } = useLocalSearchParams<{ companyId: string, serviceId: string }>()
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'
    const { user, refreshUser } = useAuth()

    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
    const [sortedVehicles, setSortedVehicles] = useState<any[]>([])

    useEffect(() => {
        if (user?.vehicles && user.vehicles.length > 0) {
            const sorted = [...user.vehicles].sort((a, b) => {
                if (a.isDefault && !b.isDefault) return -1
                if (!a.isDefault && b.isDefault) return 1
                return 0
            })
            setSortedVehicles(sorted)
            
            const def = sorted.find(v => v.isDefault) || sorted[0]
            if (def && def.id !== selectedVehicleId) {
                setSelectedVehicleId(def.id)
            }
        }
    }, [user?.vehicles])

    const handleSelectVehicle = async (vehicleId: string) => {
        setSelectedVehicleId(vehicleId)
        try {
            await api.patch(`/vehicles/${vehicleId}`, { isDefault: true })
            await refreshUser()
        } catch (error) {
            console.log(error)
        }
    }

    const handleNext = () => {
        if (!selectedVehicleId) {
            Alert.alert('Atenção', 'Selecione um veículo para continuar.')
            return
        }

        router.push({
            pathname: '/(app)/(client)/companies/[companyId]/booking/team',
            params: {
                companyId,
                serviceId,
                vehicleId: selectedVehicleId
            }
        })
    }

    const renderVehicleCard = (vehicle: any) => {
        const isSelected = selectedVehicleId === vehicle.id

        return (
            <TouchableOpacity
                key={vehicle.id}
                style={[
                    styles.vehicleCard,
                    { 
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isSelected ? Colors.primary : (isDark ? '#2C2C2E' : '#E5E7EB')
                    }
                ]}
                onPress={() => handleSelectVehicle(vehicle.id)}
                activeOpacity={0.7}
            >
                <View style={styles.vehicleIconWrapper}>
                    <Ionicons name="car-outline" size={24} color={isSelected ? Colors.primary : (isDark ? '#8E8E93' : '#6B7280')} />
                </View>
                <View style={styles.vehicleInfo}>
                    <ThemedText style={styles.vehicleName}>
                        {vehicle.make} {vehicle.model}
                    </ThemedText>
                    <ThemedText style={styles.vehicleDetails}>
                        {vehicle.year} • {vehicle.plate}
                    </ThemedText>
                </View>
                <View style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                    { borderColor: isSelected ? Colors.primary : (isDark ? '#48484A' : '#D1D5DB') }
                ]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.title}>Qual veículo?</ThemedText>
                <ThemedText style={styles.subtitle}>Escolha o carro para o serviço</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {sortedVehicles.map(renderVehicleCard)}

                <TouchableOpacity
                    style={[
                        styles.addVehicleCard,
                        { 
                            backgroundColor: isDark ? '#1C1C1E' : '#F9FAFB',
                            borderColor: isDark ? '#2C2C2E' : '#E5E7EB'
                        }
                    ]}
                    onPress={() => router.push('/(app)/(client)/vehicles/add-vehicle')}
                    activeOpacity={0.7}
                >
                    <View style={styles.addIconWrapper}>
                        <Ionicons name="add" size={24} color={Colors.primary} />
                    </View>
                    <ThemedText style={styles.addVehicleText}>Adicionar Novo Veículo</ThemedText>
                </TouchableOpacity>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: isDark ? '#2C2C2E' : '#E5E7EB', backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
                <PrimaryButton 
                    name="Próximo" 
                    onPress={handleNext} 
                />
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 12,
    },
    vehicleIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    vehicleDetails: {
        fontSize: 14,
        color: '#6B7280',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    addVehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    addVehicleText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    }
})
