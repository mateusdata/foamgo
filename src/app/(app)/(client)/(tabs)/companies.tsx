import { StyleSheet, TouchableOpacity, RefreshControl, useColorScheme, View, Image } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { Colors } from '@/constants/theme'
import { api } from '@/config/api'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NotificationScreen from '@/components/notification/notification'
import { set } from 'zod'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { useAuth } from '@/contexts/auth-provider'
import Loading from '@/components/loading'
import { ThemedScrollView } from '@/components/themed-scroll-view'

const VISITED_CARWASHES_KEY = '@visited_carwashes'

interface Address {
  id: string
  street: string
  city: string
  state: string
  zipCode: string
}

interface CarWash {
  id: string
  name: string
  description: string
  avatar: string
  isActive: boolean
  open: boolean
  rating: number
  reviews: number
  phone?: string
  addresses?: Address
}

const saveVisitedCarWash = async (companyId: string) => {
  try {
    const visited = await AsyncStorage.getItem(VISITED_CARWASHES_KEY)
    const visitedIds: string[] = visited ? JSON.parse(visited) : []

    if (!visitedIds.includes(companyId)) {
      visitedIds.push(companyId)
      await AsyncStorage.setItem(VISITED_CARWASHES_KEY, JSON.stringify(visitedIds))
    }
  } catch (error) {

  }
}

const getVisitedCarWashes = async (): Promise<string[]> => {
  try {
    const visited = await AsyncStorage.getItem(VISITED_CARWASHES_KEY)
    return visited ? JSON.parse(visited) : []
  } catch (error) {

    return []
  }
}

const FeaturedCard = ({ item }: { item: CarWash }) => {
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'

  const handlePress = async () => {
    await saveVisitedCarWash(item.id)
    router.push({ pathname: "/(app)/(client)/companies/[companyId]/booking", params: { companyId: item.id } })
  }

  return (
    <TouchableOpacity
      style={[styles.featuredCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
      onPress={handlePress}
    >
      <Image source={{ uri: item.avatar }} style={styles.featuredImage} />
      <ThemedView style={styles.featuredInfo}>
        <ThemedText style={styles.featuredName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedView style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
          <ThemedText style={styles.reviewsText}>({item.reviews} avaliações)</ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )
}

const CarWashListItem = ({ item }: { item: CarWash }) => {
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'

  const handlePress = async () => {
    await saveVisitedCarWash(item.id)
    router.push({ pathname: "/(app)/(client)/companies/[companyId]/booking", params: { companyId: item.id } })
  }

  return (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
      onPress={handlePress}
    >
      <Image source={{ uri: item.avatar }} style={styles.listItemImage} />
      <View style={styles.listItemInfo}>
        <ThemedText style={styles.listItemName}>{item.name}</ThemedText>
        {item.addresses ? (
          <ThemedText style={styles.listItemLocation} numberOfLines={1}>
            {item.addresses.street}, {item.addresses.city} - {item.addresses.state}
          </ThemedText>
        ) : (
          <ThemedText style={styles.listItemLocation} numberOfLines={1}>
            Endereço indisponível
          </ThemedText>
        )}

        <View style={styles.listItemFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.open ? '#22c55e' : '#ef4444' }]} />
            <ThemedText style={[styles.statusText, { color: item.open ? '#22c55e' : '#ef4444' }]}>
              {item.open ? 'Aberto' : 'Fechado'}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const EmptyState = () => {
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="car-outline"
        size={64}
        color={isDark ? '#666666' : '#CCCCCC'}
      />
      <ThemedText style={styles.emptyStateTitle}>
        Nenhum lava-jato encontrado
      </ThemedText>
      <ThemedText style={styles.emptyStateDescription}>
        Não há lava-jatos disponíveis na sua região no momento
      </ThemedText>
    </View>
  )
}

export default function HomeScreen() {
  const [carWashes, setCarWashes] = useState<CarWash[]>([])
  const [recommendedCarWashes, setRecommendedCarWashes] = useState<CarWash[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, refreshUser, isLoading } = useAuth()
  const colorScheme = useColorScheme() || 'light'



  if (isLoading) return null;


  const fetchCarWashes = useCallback(async () => {
    try {
      const response = await api.get('/companies')
      const allCarWashes: CarWash[] = response.data
      const visitedIds = await getVisitedCarWashes()


      const validIds = allCarWashes.map(cw => cw.id)


      const validVisitedIds = visitedIds.filter(id => validIds.includes(id))


      if (validVisitedIds.length !== visitedIds.length) {
        await AsyncStorage.setItem(VISITED_CARWASHES_KEY, JSON.stringify(validVisitedIds))
      }


      const visited = allCarWashes.filter(cw => validVisitedIds.includes(cw.id))
      const notVisited = allCarWashes.filter(cw => !validVisitedIds.includes(cw.id))


      const recommended = visited.length > 0
        ? [...visited, ...notVisited.slice(0, 3 - visited.length)]
        : allCarWashes.slice(0, 3)


      const recommendedIds = recommended.map(cw => cw.id)
      const exploreMore = allCarWashes.filter(cw => !recommendedIds.includes(cw.id))

      setRecommendedCarWashes(recommended)
      setCarWashes(exploreMore)
      await refreshUser()
    } catch (error: any) {

    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCarWashes()
  }, [fetchCarWashes])

  const onRefresh = () => {
    setRefreshing(true)
    fetchCarWashes()
  }

  if (loading) {
    return <Loading />;
  }

  if (carWashes.length === 0 && recommendedCarWashes.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior='automatic'
        >
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.greetingText}>Olá, {user?.name?.split(' ')[0]}</ThemedText>
              <ThemedText style={styles.subGreetingText}>Encontre o melhor serviço para seu carro</ThemedText>
            </View>
          </View>

          <EmptyState />

          <View style={{ height: 40 }} />
        </ThemedScrollView>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior='automatic'
        lightColor="#F8F8F8"
        darkColor="#121212"
      >

        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greetingText}>Olá, {user?.name?.split(' ')[0]}</ThemedText>
            <ThemedText style={styles.subGreetingText}>Encontre o melhor serviço para seu carro</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recomendados para você</ThemedText>
          <ThemedScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalList}>
              {recommendedCarWashes.map((carWash) => (
                <FeaturedCard key={`featured-${carWash.id}`} item={carWash} />
              ))}
            </View>
          </ThemedScrollView>
        </View>

        {carWashes.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Explore mais</ThemedText>
            <View style={styles.verticalList}>
              {carWashes.map((carWash) => (
                <CarWashListItem key={`item-${carWash.id}`} item={carWash} />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ThemedScrollView>
      <NotificationScreen />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  greetingText: { fontSize: 26, fontWeight: 'bold' },

  subGreetingText: { fontSize: 16, opacity: 0.6, marginTop: 4 },

  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(128, 128, 128, 0.2)', justifyContent: 'center', alignItems: 'center' },

  section: { marginBottom: 10 },

  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16, paddingHorizontal: 20 },

  horizontalList: { flexDirection: 'row', gap: 16, paddingHorizontal: 20 },

  featuredCard: { width: 280, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },

  featuredImage: { width: '100%', height: 140 },

  featuredInfo: { padding: 14 },

  featuredName: { fontSize: 16, fontWeight: '600', marginBottom: 8 },

  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  ratingText: { fontSize: 14, fontWeight: '500' },

  reviewsText: { fontSize: 13, opacity: 0.6 },

  verticalList: { paddingHorizontal: 20, gap: 12 },

  listItem: { flexDirection: 'row', padding: 12, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },

  listItemImage: { width: 80, height: 80, borderRadius: 12, marginRight: 16 },

  listItemInfo: { flex: 1, justifyContent: 'space-between', height: 80, paddingVertical: 2 },

  listItemName: { fontSize: 17, fontWeight: '600', marginBottom: 6 },

  listItemLocation: { fontSize: 14, opacity: 0.6, marginBottom: 8 },

  listItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  statusDot: { width: 8, height: 8, borderRadius: 4 },

  statusText: { fontSize: 13, fontWeight: '500' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 60, marginTop: 40 },

  emptyStateTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8, textAlign: 'center' },

  emptyStateDescription: { fontSize: 16, opacity: 0.6, textAlign: 'center', lineHeight: 22 },
})
