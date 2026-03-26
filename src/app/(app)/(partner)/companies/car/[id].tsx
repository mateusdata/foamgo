import { PrimaryButton } from '@/components/buttons/primary-button'
import { ThemedPressable } from '@/components/themed-pressable'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/contexts/auth-provider'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, RefreshControl, StyleSheet, useColorScheme, View } from 'react-native'
import { id } from 'zod/v4/locales'

interface AvailableSlot {
  id: string
  dayOfWeek: number
  time: string
  maxSlots: number
  isActive: boolean
}

interface CarService {
  id: string
  name: string
  description: string
  price: string
  durationMinutes: number
}

interface company {
  id: string
  name: string
  phone: string
  email: string
  description: string
  rating: number
  reviews: number
  image: string
  availableSlots: AvailableSlot[]
  carService?: CarService[] // Mudança aqui: era carServices, mas no JSON é carService
}

export default function companyScreen() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>()
  const { user } = useAuth()
  const [company, setcompany] = useState<company | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<CarService | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true)

      const response = await api.get(`/companies/${companyId}`)
      setcompany(response.data)
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Erro ao carregar lava-jato.',
        [{ text: 'OK' }]
      )
    } finally {
      setLoading(false)
      if (isRefreshing) setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    return numPrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const getUniqueAvailableDays = () => {
    if (!company?.availableSlots) return []

    const uniqueDays = [...new Set(company.availableSlots.map(slot => slot.dayOfWeek))]
    return uniqueDays.sort((a, b) => a - b)
  }

  const getAvailableTimesForDay = (dayOfWeek: number) => {
    if (!company?.availableSlots) return []

    return company.availableSlots
      .filter(slot => slot.dayOfWeek === dayOfWeek && slot.isActive)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const getNextDateForDay = (targetDayOfWeek: number): Date => {
    const now = new Date()
    const currentDay = now.getDay()

    // Calcular quantos dias precisamos adicionar
    let daysToAdd = targetDayOfWeek - currentDay

    // Se o dia já passou esta semana, vai para a próxima semana
    if (daysToAdd < 0) {
      daysToAdd += 7
    } else if (daysToAdd === 0) {
      // Se é hoje, verifica se ainda há tempo disponível
      // Por segurança, vamos para o próximo mesmo dia da semana
      daysToAdd = 7
    }

    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + daysToAdd)

    return targetDate
  }

  const handleBooking = async () => {
    if (!selectedService || selectedDay === null || !selectedTime || !user || !company) {
      Alert.alert('Erro', 'Selecione um serviço, dia e horário')
      return
    }

    setBookingLoading(true)
    try {
      // Criar data do agendamento de forma mais precisa
      const bookingDate = getNextDateForDay(selectedDay)

      // Definir horário
      const [hours, minutes] = selectedTime.split(':').map(Number)
      bookingDate.setHours(hours, minutes, 0, 0)


      const bookingData = {
        userId: user.id,
        id: company.id,
        carServiceId: selectedService.id,
        scheduledAt: bookingDate.toISOString(),
        carName: 'Meu Carro', // TODO: Implementar input do usuário
        vehiclePlate: 'ABC-1234', // TODO: Implementar input do usuário
        notes: '',
        totalPrice: parseFloat(selectedService.price)
      }


      const response = await api.post('/bookings', bookingData)

      Alert.alert(
        'Sucesso!',
        'Agendamento realizado com sucesso!',
        [{
          text: 'OK',
          onPress: () => {
            setShowBookingModal(false)
            // Resetar seleções
            setSelectedDay(null)
            setSelectedTime(null)
            setSelectedService(null)
          }
        }]
      )

    } catch (error: any) {

      let errorMessage = 'Erro ao realizar agendamento.'

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }

      Alert.alert('Erro', errorMessage, [{ text: 'OK' }])
    } finally {
      setBookingLoading(false)
    }
  }

  const renderServiceItem = ({ item }: { item: CarService }) => (
    <ThemedPressable
      style={[
        styles.serviceCard,
        {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderColor: selectedService?.id === item.id
            ? Colors.primary
            : (isDark ? '#333333' : '#E8E8E8'),
          borderWidth: selectedService?.id === item.id ? 2 : 1,
        }
      ]}
      onPress={() => setSelectedService(item)}
    >
      <View style={styles.serviceHeader}>
        <ThemedText type="medium" style={styles.serviceName}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.servicePrice, { color: Colors.primary }]}>
          {formatPrice(item.price)}
        </ThemedText>
      </View>
      <ThemedText style={[styles.serviceDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
        {item.description}
      </ThemedText>
      <View style={styles.serviceDuration}>
        <Ionicons name="time-outline" size={14} color={Colors.primary} />
        <ThemedText style={[styles.durationText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
          {item.durationMinutes} min
        </ThemedText>
      </View>
    </ThemedPressable>
  )

  const renderDayButton = (day: number) => (
    <PrimaryButton
      key={day}
      variant="primary"
      name={dayNames[day]}
      onPress={() => {
        setSelectedDay(day)
        setSelectedTime(null) // Reset time when changing day
      }}
      buttonColor={selectedDay === day ? Colors.primary : '#FFFFFF'}
      labelStyle={{
        fontSize: 14,
        color: selectedDay === day ? '#FFFFFF' : '#2e2828ff',
      }}
      style={{ padding: 0, paddingVertical: 8, minWidth: 80 }}
    />
  )

  const renderTimeButton = (slot: AvailableSlot) => (
    <PrimaryButton
      key={slot.id}
      variant="primary"
      name={slot.time}
      onPress={() => setSelectedTime(slot.time)}
      buttonColor={selectedTime === slot.time ? Colors.primary : '#FFFFFF'}
      labelStyle={{
        fontSize: 14,
        color: selectedTime === slot.time ? '#FFFFFF' : '#2e2828ff',
      }}
      style={{ padding: 0, paddingVertical: 8, minWidth: 70 }}
    />
  )

  if (loading && !company) {
    return (
      <ThemedView style={styles.container} lightColor="#F8F8F8" darkColor="#000000">
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: isDark ? '#888888' : '#666666' }]}>
            Carregando...
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  if (!company) {
    return (
      <ThemedView style={styles.container} lightColor="#F8F8F8" darkColor="#000000">
        <View style={styles.emptyState}>
          <Ionicons name="car-outline" size={48} color={isDark ? '#666666' : '#CCCCCC'} />
          <ThemedText>Lava-jato não encontrado</ThemedText>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container} lightColor="#F8F8F8" darkColor="#000000">
      <ThemedScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header do Lava-jato */}
        <ThemedView
          style={[styles.headerCard, {
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            borderColor: isDark ? '#333333' : '#E8E8E8',
          }]}
        >
          <ThemedText type="title" style={styles.companyName}>
            {company.name}
          </ThemedText>
          <ThemedText style={[styles.companyDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            {company.description}
          </ThemedText>

          <View style={styles.infoRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <ThemedText style={[styles.infoText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              {company.rating} ({company.reviews} avaliações)
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
            <ThemedText style={[styles.infoText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              {company.phone}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Serviços Disponíveis */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Selecione o Serviço
        </ThemedText>

        {/* CORREÇÃO: Mudança de carServices para carService */}
        {company.carService && company.carService.length > 0 ? (
          <FlatList
            data={company.carService}
            keyExtractor={(item) => item.id}
            renderItem={renderServiceItem}
            scrollEnabled={false}
            contentContainerStyle={styles.servicesContainer}
          />
        ) : (
          <ThemedText style={[styles.noServicesText, { color: isDark ? '#888888' : '#666666' }]}>
            Nenhum serviço disponível
          </ThemedText>
        )}

        {/* Seleção de Dias */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Selecione o Dia
        </ThemedText>

        <ThemedScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {getUniqueAvailableDays().map(renderDayButton)}
        </ThemedScrollView>

        {/* Seleção de Horários */}
        {selectedDay !== null && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Selecione o Horário - {dayNames[selectedDay]}
            </ThemedText>

            <ThemedScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timesContainer}
            >
              {getAvailableTimesForDay(selectedDay).map(renderTimeButton)}
            </ThemedScrollView>
          </>
        )}

        {/* Botão de Agendar */}
        {selectedService && selectedDay !== null && selectedTime && (
          <View style={styles.bookingSection}>
            <ThemedView
              style={[styles.bookingSummary, {
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderColor: isDark ? '#333333' : '#E8E8E8',
              }]}
            >
              <ThemedText type="medium">Resumo do Agendamento</ThemedText>
              <ThemedText style={[styles.summaryText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Serviço: {selectedService.name}
              </ThemedText>
              <ThemedText style={[styles.summaryText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Dia: {dayNames[selectedDay]}
              </ThemedText>
              <ThemedText style={[styles.summaryText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Horário: {selectedTime}
              </ThemedText>
              <ThemedText style={[styles.summaryText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                Duração: {selectedService.durationMinutes} min
              </ThemedText>
              <ThemedText style={[styles.totalPrice, { color: Colors.primary }]}>
                Total: {formatPrice(selectedService.price)}
              </ThemedText>
            </ThemedView>

            <PrimaryButton
              variant="primary"
              name={bookingLoading ? "Agendando..." : "Confirmar Agendamento"}
              onPress={handleBooking}
              disabled={bookingLoading}
              style={styles.bookingButton}
            />
          </View>
        )}
      </ThemedScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  headerCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  companyDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  servicesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  noServicesText: {
    textAlign: 'center',
    marginHorizontal: 16,
    fontSize: 14,
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 8,
  },
  timesContainer: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  bookingSection: {
    margin: 16,
    gap: 16,
  },
  bookingSummary: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bookingButton: {
    paddingVertical: 16,
  },
})