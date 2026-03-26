import React, { useEffect, useState, useCallback } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  useColorScheme,
  RefreshControl,
  Image,
  Linking,
  FlatList,
  ScrollView,
} from 'react-native'

import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt-br';
import { router, useFocusEffect } from 'expo-router'
import { useAuth } from '@/contexts/auth-provider'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

dayjs.extend(localizedFormat);
dayjs.locale('pt-br');

type CarService = {
  name: string
  price: string
}

type CarWashAddress = {
  street: string
  city: string
}

type CarWash = {
  name: string
  avatar: string
  addresses?: CarWashAddress
  googleMapLink?: string
}

type Booking = {
  id: string
  scheduledAt: string
  status: BookingStatus
  carService?: CarService
  service?: CarService
  carWash?: CarWash
  company?: CarWash
  carName?: string
  notes?: string
  totalPrice?: number | string
  vehicle?: {
    model: string
    year: number
    plate?: string
  }
  team?: {
    name: string
    avatar?: string
  }
}

type BookingStatus = 'COMPLETED' | 'CANCELLED' | 'CONFIRMED'

// Status configuration for badges
const statusConfig: Record<string, { label: string; color: string; backgroundColor: string; icon: string }> = {
  CONFIRMED: { label: 'Confirmado', color: '#66BB6A', backgroundColor: 'rgba(102, 187, 106, 0.1)', icon: 'time-outline' },
  COMPLETED: { label: 'Concluído', color: '#42A5F5', backgroundColor: 'rgba(66, 165, 245, 0.1)', icon: 'checkmark-done-outline' },
  CANCELLED: { label: 'Cancelado', color: '#EF5350', backgroundColor: 'rgba(239, 83, 80, 0.1)', icon: 'close-circle-outline' },
}

const STATUS_FILTERS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'Confirmados', value: 'CONFIRMED' },
  { label: 'Concluídos', value: 'COMPLETED' },
  { label: 'Cancelados', value: 'CANCELLED' },
 // { label: 'Todos', value: 'ALL' },
]

export default function MyBookingsScreen() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | 'ALL'>('CONFIRMED')

  const fetchBookings = useCallback(async (initialLoad = false) => {
    if (!user?.id) return

    if (initialLoad || bookings.length === 0) {
      setLoading(true)
    }

    try {
      const params = new URLSearchParams({ userId: user.id });
      if (selectedStatus && selectedStatus !== 'ALL') {
        params.append('status', selectedStatus);
      }

      const response = await api.get(`/bookings?${params.toString()}`)
      setBookings(response.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [user?.id, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings(true);
    }, [selectedStatus])
  );

  const onRefresh = () => {
    setRefreshing(true)
    fetchBookings(false).finally(() => setRefreshing(false))
  }

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusInfo = statusConfig[item.status] || statusConfig['CONFIRMED'];
    const company = item.company || item.carWash;
    const serviceName = item.service?.name || item.carService?.name || 'Serviço';

    // Simplified view: Name, Service, Status

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFF', borderColor: isDark ? '#333' : '#E0E0E0' }]}
        activeOpacity={0.7}
        onPress={() => router.push(`/(client)/bookings/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          {company?.avatar ? (
            <Image source={{ uri: company.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="business" size={24} color="#FFF" />
            </View>
          )}
          <View style={styles.headerInfo}>
            <ThemedText style={styles.companyName}>{company?.name || 'Lava Jato'}</ThemedText>
            <ThemedText style={styles.serviceName}>{serviceName}</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
            <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
            <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ThemedView style={styles.container}>


      <FlatList
        data={bookings}
        contentInsetAdjustmentBehavior='automatic'
        renderItem={renderBookingItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollView}>
              {STATUS_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterButton,
                    selectedStatus === filter.value && styles.filterButtonActive,
                    { backgroundColor: selectedStatus === filter.value ? Colors.primary : (isDark ? '#2C2C2E' : '#f0f0f0') }
                  ]}
                  onPress={() => setSelectedStatus(filter.value)}
                  disabled={loading && bookings.length === 0}
                >
                  <ThemedText style={[styles.filterButtonText, selectedStatus === filter.value && styles.filterButtonTextActive]}>
                    {filter.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={isDark ? '#FFF' : Colors.primary}
          />
        }
        ListEmptyComponent={() => (
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={64} color={isDark ? '#555' : '#CCC'} />
              <ThemedText style={styles.emptyText}>
                {selectedStatus === 'ALL'
                  ? 'Você ainda não possui agendamentos.'
                  : `Nenhum agendamento ${STATUS_FILTERS.find(f => f.value === selectedStatus)?.label.toLowerCase().slice(0, -1) || 'encontrado'}.`}
              </ThemedText>
            </View>
          ) : null
        )}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100 },
  filtersContainer: { paddingVertical: 12, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  filtersScrollView: { paddingRight: 16, paddingBottom: 18 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  card: {
    borderRadius: 12,
    marginBottom: 12, // Reduced margin since items are smaller
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  }
})