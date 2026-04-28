import { StyleSheet, TouchableOpacity, RefreshControl, useColorScheme, View, Image } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { Colors } from '@/constants/theme'
import { api } from '@/config/api'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NotificationScreen from '@/components/notification/notification'
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

const FeaturedCard = ({ item, onPress }: { item: CarWash, onPress: (id: string) => void }) => {
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'

  return (
    <TouchableOpacity
      style={[
        styles.featuredCard,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDark ? '#2C2C2E' : '#E5E7EB'
        }
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.avatar }} style={styles.featuredImage} />
      <View style={styles.featuredInfo}>
        <ThemedText style={styles.featuredName} numberOfLines={1}>{item.name}</ThemedText>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
          <ThemedText style={styles.reviewsText}>({item.reviews})</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const CarWashListItem = ({ item, onPress }: { item: CarWash, onPress: (id: string) => void }) => {
  const colorScheme = useColorScheme() || 'light'
  const isDark = colorScheme === 'dark'

  return (
    <TouchableOpacity
      style={[
        styles.listItem,
        { 
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDark ? '#2C2C2E' : '#E5E7EB'
        }
      ]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar }} style={styles.listItemImage} />
      <View style={styles.listItemInfo}>
        <View>
          <ThemedText style={styles.listItemName} numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText style={styles.listItemLocation} numberOfLines={1}>
            {item.addresses ? `${item.addresses.street}, ${item.addresses.city}` : 'Endereço indisponível'}
          </ThemedText>
        </View>

        <View style={styles.listItemFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.open ? '#34C759' : '#FF3B30' }]} />
            <ThemedText style={[styles.statusText, { color: item.open ? '#34C759' : '#FF3B30' }]}>
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
      <View style={[styles.emptyStateIconContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <Ionicons name="car-sport-outline" size={48} color={isDark ? '#8E8E93' : '#C7C7CC'} />
      </View>
      <ThemedText style={styles.emptyStateTitle}>Nenhum lava-jato encontrado</ThemedText>
      <ThemedText style={styles.emptyStateDescription}>
        Não há lava-jatos disponíveis na sua região no momento.
      </ThemedText>
    </View>
  )
}

export default function HomeScreen() {
  const [allWashes, setAllWashes] = useState<CarWash[]>([])
  const [carWashes, setCarWashes] = useState<CarWash[]>([])
  const [recommendedCarWashes, setRecommendedCarWashes] = useState<CarWash[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, refreshUser, isLoading } = useAuth()

  const updateListsLocally = (all: CarWash[], visitedIds: string[]) => {
    const visited = visitedIds
      .map(id => all.find(cw => cw.id === id))
      .filter(Boolean) as CarWash[]
    
    const notVisited = all.filter(cw => !visitedIds.includes(cw.id))
    
    const recommended = visited.length > 0
      ? [...visited, ...notVisited].slice(0, 3)
      : all.slice(0, 3)

    const recommendedIds = recommended.map(cw => cw.id)
    const exploreMore = all.filter(cw => !recommendedIds.includes(cw.id))

    setRecommendedCarWashes(recommended)
    setCarWashes(exploreMore)
  }

  const fetchCarWashes = useCallback(async () => {
    try {
      const response = await api.get('/companies')
      const all: CarWash[] = response.data
      setAllWashes(all)

      const visitedStr = await AsyncStorage.getItem(VISITED_CARWASHES_KEY)
      const visitedIds: string[] = visitedStr ? JSON.parse(visitedStr) : []
      
      const validIds = all.map(cw => cw.id)
      const validVisitedIds = visitedIds.filter(id => validIds.includes(id))

      if (validVisitedIds.length !== visitedIds.length) {
        await AsyncStorage.setItem(VISITED_CARWASHES_KEY, JSON.stringify(validVisitedIds))
      }

      updateListsLocally(all, validVisitedIds)
      await refreshUser()
    } catch (error) {
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      fetchCarWashes()
    }
  }, [fetchCarWashes, isLoading])

  const handleCarWashPress = async (companyId: string) => {
    router.push({ pathname: "/(app)/(client)/companies/[companyId]/booking", params: { companyId } })

    try {
      const visitedStr = await AsyncStorage.getItem(VISITED_CARWASHES_KEY)
      let visitedIds: string[] = visitedStr ? JSON.parse(visitedStr) : []
      
      visitedIds = visitedIds.filter(id => id !== companyId)
      visitedIds.unshift(companyId)
      
      await AsyncStorage.setItem(VISITED_CARWASHES_KEY, JSON.stringify(visitedIds))
      
      updateListsLocally(allWashes, visitedIds)
    } catch (error) {
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchCarWashes()
  }

  if (isLoading || loading) return <Loading />

  if (carWashes.length === 0 && recommendedCarWashes.length === 0) {
    return (
      <ThemedView style={styles.container} lightColor="#F4F5F7" darkColor="#121212">
        <ThemedScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior='automatic'
        >
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.greetingText}>Olá, {user?.name?.split(' ')[0]}</ThemedText>
              <ThemedText style={styles.subGreetingText}>Encontre o melhor serviço</ThemedText>
            </View>
            <NotificationScreen />
          </View>
          <EmptyState />
        </ThemedScrollView>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container} lightColor="#F4F5F7" darkColor="#121212">
      <ThemedScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior='automatic'
        lightColor="#F4F5F7"
        darkColor="#121212"
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greetingText}>Olá, {user?.name?.split(' ')[0]}</ThemedText>
            <ThemedText style={styles.subGreetingText}>Encontre o melhor serviço</ThemedText>
          </View>
          <NotificationScreen />
        </View>

        {recommendedCarWashes.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recomendados para você</ThemedText>
            <ThemedScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {recommendedCarWashes.map((carWash) => (
                <FeaturedCard key={`featured-${carWash.id}`} item={carWash} onPress={handleCarWashPress} />
              ))}
            </ThemedScrollView>
          </View>
        )}

        {carWashes.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Explore mais</ThemedText>
            <View style={styles.verticalList}>
              {carWashes.map((carWash) => (
                <CarWashListItem key={`item-${carWash.id}`} item={carWash} onPress={handleCarWashPress} />
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ThemedScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greetingText: { 
    fontSize: 24, 
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subGreetingText: { 
    fontSize: 15, 
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500'
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 16, 
    paddingHorizontal: 20,
    letterSpacing: -0.3
  },
  horizontalList: { 
    paddingHorizontal: 20,
    gap: 12 
  },
  featuredCard: { 
    width: 240, 
    borderRadius: 20, 
    overflow: 'hidden',
    borderWidth: 1,
  },
  featuredImage: { 
    width: '100%', 
    height: 120 
  },
  featuredInfo: { 
    padding: 12 
  },
  featuredName: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 6,
    letterSpacing: -0.2
  },
  ratingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  ratingText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  reviewsText: { 
    fontSize: 12, 
    color: '#8E8E93' 
  },
  verticalList: { 
    paddingHorizontal: 20, 
    gap: 12 
  },
  listItem: { 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 1,
  },
  listItemImage: { 
    width: 68, 
    height: 68, 
    borderRadius: 14, 
    marginRight: 14 
  },
  listItemInfo: { 
    flex: 1, 
    justifyContent: 'space-between', 
    height: 68, 
    paddingVertical: 2 
  },
  listItemName: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 2,
    letterSpacing: -0.2
  },
  listItemLocation: { 
    fontSize: 13, 
    color: '#8E8E93', 
    marginBottom: 8 
  },
  listItemFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  statusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 32, 
    paddingVertical: 60, 
    marginTop: 40 
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  emptyStateTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptyStateDescription: { 
    fontSize: 14, 
    color: '#8E8E93', 
    textAlign: 'center', 
    lineHeight: 20 
  },
})