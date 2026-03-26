import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Alert,
    RefreshControl,
    useColorScheme,
    Dimensions
} from 'react-native'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams, useRouter } from 'expo-router'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface CarService {
    id: string
    name: string
    description: string
    price: string | number
    durationMinutes: number
    categoryId?: string
}

interface Category {
    id: string
    name: string
}

export default function BookingServicesScreen() {
    const { companyId } = useLocalSearchParams<{ companyId: string }>()
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [services, setServices] = useState<CarService[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

    const fetchData = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true)
        try {
            const [servicesRes, categoriesRes] = await Promise.all([
                api.get(`/services?companyId=${companyId}`),
                api.get(`/categories?companyId=${companyId}`)
            ])
            setServices(servicesRes.data)
            setCategories(categoriesRes.data)
        } catch (error) {
            console.error('Fetch error:', error)
            Alert.alert('Erro', 'Erro ao carregar serviços.')
        } finally {
            setLoading(false)
            if (isRefreshing) setRefreshing(false)
        }
    }

    useEffect(() => {
        if (companyId) fetchData()
    }, [companyId])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchData(true)
    }, [])

    const filteredServices = useMemo(() => {
        if (selectedCategory === 'ALL') return services
        return services.filter(s => s.categoryId === selectedCategory)
    }, [services, selectedCategory])

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        if (!numPrice || numPrice === 0) return 'A consultar'
        return numPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const handleSelectService = (service: CarService) => {
        router.push({
            pathname: '/(app)/(client)/companies/[companyId]/booking/team',
            params: { companyId, serviceId: service.id }
        })
    }

    const renderCategoryItem = (item: Category | { id: string, name: string }) => {
        const isSelected = selectedCategory === item.id
        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.categoryChip,
                    isSelected ? { backgroundColor: Colors.primary } : { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }
                ]}
                onPress={() => setSelectedCategory(item.id)}
            >
                <ThemedText
                    style={[styles.categoryText, isSelected && { color: '#FFF' }]}
                    numberOfLines={1}
                >
                    {item.name}
                </ThemedText>
            </TouchableOpacity>
        )
    }

    const renderServiceItem = ({ item }: { item: CarService }) => (
        <TouchableOpacity
            style={[
                styles.serviceCard,
                {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFF',
                    borderColor: isDark ? '#333' : '#E0E0E0'
                }
            ]}
            onPress={() => handleSelectService(item)}
            activeOpacity={0.7}
        >
            <View style={styles.serviceContent}>
                <View style={styles.serviceInfo}>
                    <ThemedText
                        style={styles.serviceName}
                        numberOfLines={2}
                    >
                        {item.name}
                    </ThemedText>

                    {item.description && (
                        <ThemedText
                            style={styles.serviceDescription}
                            numberOfLines={2}
                        >
                            {item.description}
                        </ThemedText>
                    )}

                    <View style={styles.metaContainer}>
                        <Ionicons
                            name="time-outline"
                            size={16}
                            color={isDark ? '#AAA' : '#666'}
                        />
                        <ThemedText style={styles.durationText}>
                            {item.durationMinutes} min
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.priceContainer}>
                    <ThemedText
                        style={styles.priceText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {formatPrice(item.price)}
                    </ThemedText>
                    <Ionicons
                        name="chevron-forward"
                        size={22}
                        color={isDark ? '#666' : '#CCC'}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )

    if (loading) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ThemedView>
        )
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.filterContainer}>
                <ThemedText style={styles.title}>Escolha uma opção</ThemedText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                >
                    {renderCategoryItem({ id: 'ALL', name: 'Todos' })}
                    {categories.map(cat => renderCategoryItem(cat))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredServices}
                keyExtractor={item => item.id}
                renderItem={renderServiceItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <ThemedView style={styles.center}>
                        <ThemedText style={{ opacity: 0.6 }}>
                            Nenhum serviço encontrado.
                        </ThemedText>
                    </ThemedView>
                }
            />
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    filterContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    categoriesScroll: {
        paddingRight: 16,
        gap: 8
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        minWidth: 70,
        alignItems: 'center'
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600'
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 40
    },
    serviceCard: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2
    },
    serviceContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12
    },
    serviceInfo: {
        flex: 1,
        minWidth: 0
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        flexWrap: 'wrap'
    },
    serviceDescription: {
        fontSize: 13,
        opacity: 0.6,
        marginBottom: 8,
        lineHeight: 18,
        flexWrap: 'wrap'
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4
    },
    durationText: {
        fontSize: 13,
        opacity: 0.6
    },
    priceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        gap: 8,
        minWidth: 100,
        maxWidth: 140
    },
    priceText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.primary,
        flexShrink: 1
    }
})