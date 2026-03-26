import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, View, Alert, RefreshControl } from 'react-native'
import { useFocusEffect, router } from 'expo-router'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/auth-provider'
import { BookingCalendar, Booking } from '@/components/booking'

export default function Bookings() {
    const { user, refreshUser } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('CONFIRMED')

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

    return (
        <ThemedView style={styles.container}>
            
            <BookingCalendar
                bookings={bookings}
                onItemPress={onItemPress}
                filterStatus={selectedStatus}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
})