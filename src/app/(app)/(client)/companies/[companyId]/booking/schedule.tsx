import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    useColorScheme,
    RefreshControl
} from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams, useRouter } from 'expo-router'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'

import { Ionicons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { useAuth } from '@/contexts/auth-provider';
import { PrimaryButton } from '@/components/buttons/primary-button';

dayjs.locale('pt-br')

interface AvailableSlot {
    id: string
    dayOfWeek: number
    time: string
    isActive: boolean
    teamId: string
}

interface Team {
    id: string
    name: string
}

interface CarService {
    id: string
    name: string
    price: string | number
}



export default function BookingScheduleScreen() {
    const { companyId, serviceId, teamId } = useLocalSearchParams<{ companyId: string, serviceId: string, teamId?: string }>()
    const { user } = useAuth()
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [availabilities, setAvailabilities] = useState<AvailableSlot[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [service, setService] = useState<CarService | null>(null)

    const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    const fetchData = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true)
        try {
            const params = new URLSearchParams();
            params.append('companyId', companyId);

            if (teamId) {
                params.append('teamId', teamId);
            }

            const [slotsRes, teamsRes, servicesRes] = await Promise.all([
                api.get(`/availabilities?${params.toString()}`),
                api.get(`/teams?companyId=${companyId}`),
                api.get(`/services?companyId=${companyId}`)
            ])

            setAvailabilities(slotsRes.data)
            setTeams(teamsRes.data)
            const foundService = servicesRes.data.find((s: any) => s.id === serviceId)
            setService(foundService || null)
        } catch (error) {
            Alert.alert('Erro', 'Erro ao carregar horários.')
        } finally {
            setLoading(false)
            if (isRefreshing) setRefreshing(false)
        }
    }

    useEffect(() => {
        if (companyId) fetchData()
    }, [companyId, serviceId, teamId])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchData(true)
    }, [])

    const slotsByDate = useMemo(() => {
        const grouped: { [dateKey: string]: AvailableSlot[] } = {}

        availabilities.forEach(slot => {
            const dateKey = (slot as any).scheduledDate
            if (!dateKey) return

            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }

            // Evita duplicatas: só adiciona se não existir slot com mesmo horário nessa data
            const alreadyExists = grouped[dateKey].some(existingSlot => existingSlot.time === slot.time)
            if (!alreadyExists) {
                grouped[dateKey].push(slot)
            }
        })

        Object.keys(grouped).forEach(dateKey => {
            grouped[dateKey].sort((a, b) => a.time.localeCompare(b.time))
        })

        return grouped
    }, [availabilities])

    const sortedDates = useMemo(() => {
        return Object.keys(slotsByDate).sort()
    }, [slotsByDate])

    const handleBooking = async () => {
        if (!selectedDateIso || !selectedTime || !user || !service) return

        setBookingLoading(true)

        const dateObj = dayjs(selectedDateIso)
        const [hours, mins] = selectedTime.split(':')
        const finalDate = dateObj.hour(parseInt(hours)).minute(parseInt(mins)).second(0).millisecond(0)
        const dayOfWeek = dateObj.day()

        const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price

        const baseBookingData: any = {
            userId: user.id,
            companyId,
            serviceId,
            scheduledAt: finalDate.toISOString(),
            time: selectedTime,
            totalPrice: price || 0,
        }

        if (user.vehicles && user.vehicles.length > 0) {
            const def = user.vehicles.find((v: any) => v.isDefault) || user.vehicles[0]
            baseBookingData.vehicleId = def.id
            baseBookingData.carName = `${def.model} - ${def.year}`
            baseBookingData.vehiclePlate = def.plate
        }

        let success = false
        let lastError: any = null

        let teamsToTry: Team[] = []

        const specificTeam = teamId ? teams.find(t => t.id === teamId) : null

        if (specificTeam) {
            teamsToTry = [specificTeam]
        } else {
            const availableTeamsIds = availabilities
                .filter(a =>
                    Number(a.dayOfWeek) === dayOfWeek &&
                    a.isActive &&
                    a.time.substring(0, 5) === selectedTime.substring(0, 5)
                )
                .map(a => a.teamId);

            teamsToTry = teams.filter(t => availableTeamsIds.includes(t.id));

            if (teamsToTry.length === 0) {
                teamsToTry = teams;
            }
        }

        try {
            if (teamsToTry.length === 0) {
                Alert.alert('Erro', 'Não há equipes disponíveis.')
                setBookingLoading(false)
                return
            }

            for (const team of teamsToTry) {
                try {
                    const payload = { ...baseBookingData, teamId: team.id }
                    await api.post('/bookings', payload)
                    success = true
                    break
                } catch (error: any) {
                    lastError = error
                }
            }

            if (success) {
                router.push('/(app)/(client)/companies/[companyId]/booking/success')
            } else {
                if (lastError?.response?.status === 409) {
                    const bookingsRes = await api.get(`/bookings?userId=${user.id}&companyId=${companyId}`)
                    const userBookings = bookingsRes.data

                    const conflictBooking = userBookings.find((b: any) => {
                        if (b.status !== 'CANCELLED') return false
                        if (b.time !== selectedTime) return false
                        return dayjs(b.scheduledAt).isSame(finalDate, 'day')
                    })

                    if (conflictBooking) {
                        const teamForRecovery = specificTeam || teams[0]
                        await api.patch(`/bookings/${conflictBooking.id}`, {
                            ...baseBookingData,
                            teamId: teamForRecovery?.id,
                            status: 'CONFIRMED'
                        })
                        router.push('/(app)/(client)/companies/[companyId]/booking/success')
                        return
                    }
                }
                throw lastError
            }
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível realizar o agendamento.')
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) {
        return <ThemedView style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></ThemedView>
    }

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        if (!numPrice || numPrice === 0) return 'Sob Consulta'
        return numPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const formattedPrice = service ? formatPrice(service.price) : ''

    const hasAvailableSlots = sortedDates.length > 0

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <ThemedText style={styles.title}>Escolha o Horário</ThemedText>
                    {service && (
                        <View style={styles.serviceInfo}>
                            <Ionicons name="man-outline" size={16} color={Colors.primary} />
                            <ThemedText style={styles.serviceText} numberOfLines={1}>
                                {service.name} • <ThemedText style={styles.price}>{formattedPrice}</ThemedText>
                            </ThemedText>
                        </View>
                    )}
                </View>

                {!hasAvailableSlots ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color={isDark ? '#666' : '#CCC'} />
                        <ThemedText style={styles.emptyText}>Nenhum horário disponível</ThemedText>
                        <ThemedText style={styles.emptySubtext}>Para o profissional selecionado</ThemedText>
                    </View>
                ) : (
                    sortedDates.map((dateKey) => {
                        const slots = slotsByDate[dateKey]
                        if (!slots || slots.length === 0) return null

                        const date = dayjs(dateKey)
                        const dateLabel = date.locale('pt-br').format('dddd, D [de] MMMM')
                        const formattedLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

                        return (
                            <View key={dateKey} style={styles.daySection}>
                                <View style={styles.dayHeader}>
                                    <Ionicons name="calendar" size={18} color={Colors.primary} />
                                    <ThemedText style={styles.dayTitle}>{formattedLabel}</ThemedText>
                                </View>
                                <View style={styles.grid}>
                                    {slots.map((slot: AvailableSlot) => {
                                        const isSelected = selectedDateIso === dateKey && selectedTime === slot.time
                                        return (
                                            <TouchableOpacity
                                                key={slot.time}
                                                style={[
                                                    styles.timeButton,
                                                    {
                                                        backgroundColor: isSelected ? Colors.primary : isDark ? '#1C1C1E' : '#FFF',
                                                        borderColor: isSelected ? Colors.primary : isDark ? '#333' : '#E0E0E0'
                                                    }
                                                ]}
                                                onPress={() => {
                                                    setSelectedDateIso(dateKey)
                                                    setSelectedTime(slot.time)
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.timeContent}>
                                                    <Ionicons
                                                        name="time-outline"
                                                        size={14}
                                                        color={isSelected ? '#FFF' : (isDark ? '#AAA' : '#666')}
                                                    />
                                                    <ThemedText style={[styles.timeText, isSelected && { color: '#FFF' }]}>
                                                        {slot.time}
                                                    </ThemedText>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        )
                    })
                )}
            </ScrollView>

            {selectedTime && (
                <View style={[styles.footer, {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFF',
                    borderTopColor: isDark ? '#333' : '#E0E0E0'
                }]}>
                    <View style={styles.footerInfo}>
                        <View style={styles.footerIconContainer}>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        </View>
                        <View style={styles.footerTextContainer}>
                            <ThemedText style={styles.footerLabel}>Horário Selecionado</ThemedText>
                            <ThemedText style={styles.footerValue} numberOfLines={1}>
                                {dayjs(selectedDateIso).format('DD/MM')} às {selectedTime}
                            </ThemedText>
                        </View>
                    </View>
                    <PrimaryButton
                        name={bookingLoading ? 'Agendando...' : 'Confirmar'}
                        variant="primary"
                        onPress={handleBooking}
                        disabled={bookingLoading}

                        textColor="#FFF"
                    />
                </View>
            )}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 120 },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 8
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap'
    },
    serviceText: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center'
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
        opacity: 1
    },
    daySection: {
        marginBottom: 24,
        paddingHorizontal: 16
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
    },
    dayTitle: {
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.9,
        flex: 1
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    timeButton: {
        width: '23%',
        minWidth: 70,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    timeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    timeText: {
        fontSize: 13,
        fontWeight: '500'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        minWidth: 0
    },
    footerIconContainer: {
        flexShrink: 0
    },
    footerTextContainer: {
        flex: 1,
        minWidth: 0
    },
    footerLabel: {
        fontSize: 11,
        opacity: 0.6,
        marginBottom: 2
    },
    footerValue: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32
    },
    emptyText: {
        opacity: 0.6,
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center'
    },
    emptySubtext: {
        opacity: 0.4,
        marginTop: 4,
        fontSize: 13,
        textAlign: 'center'
    }
})