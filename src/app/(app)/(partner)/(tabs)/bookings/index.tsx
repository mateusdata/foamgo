import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Booking, BookingCalendar } from '@/components/booking'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/auth-provider'
import { useTheme } from '@/hooks/use-theme'

export default function Bookings() {
    const { user, refreshUser } = useAuth()
    const theme = useTheme()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('CONFIRMED')
    const insets = useSafeAreaInsets()

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [selectedStatus])
    );

    const fetchBookings = useCallback(async () => {
        const companyId = user?.activeCompanyId || user?.company?.id;
        if (!companyId) return;

        try {
            if (bookings.length === 0) {
                setLoading(true)
            }
            const params = new URLSearchParams({ companyId });

            if (user?.memberships) {
                const membership = user.memberships.find(m => m.team?.companyId === companyId);
                if (membership?.teamId) {
                    params.append('teamId', membership.teamId);
                }
            }

            if (selectedStatus && selectedStatus !== 'ALL') {
                params.append('status', selectedStatus);
            }
            
            const response = await api.get(`/bookings?${params.toString()}`)
            setBookings([...response.data])
        } catch (error) {
            console.log('Erro ao buscar agendamentos:', error)
        } finally {
            setLoading(false)
        }
    }, [user?.activeCompanyId, user?.company?.id, user?.memberships, selectedStatus]);

    const onRefresh = async () => {
        setRefreshing(true)
        await refreshUser()
        await fetchBookings()
        setRefreshing(false)
    }

    const onItemPress = (id: string) => {
        router.push(`/(app)/(partner)/bookings/${id}`);
    }

    const handleNewBooking = () => {
        router.push('/(app)/(partner)/contacts');
    }

    return (
        <ThemedView style={[styles.container, { paddingTop: Platform.OS === 'ios' ? insets.top + 80 : 0 }]}>
            <BookingCalendar
                bookings={bookings}
                onItemPress={onItemPress}
                filterStatus={selectedStatus}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint, bottom: insets.bottom + 20 }]}
                activeOpacity={0.85}
                onPress={handleNewBooking}
            >
                <Ionicons name="add" size={24} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.fabText}>Novo Agendamento</Text>
            </TouchableOpacity>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fab: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
})