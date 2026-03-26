import {
    StyleSheet,
    View,
    Text,
    Alert,
    ActivityIndicator,
    FlatList,
    Image,
    TouchableOpacity,
    useColorScheme,
    RefreshControl
} from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'

import { useLocalSearchParams, useRouter } from 'expo-router'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

interface Team {
    id: string
    name: string
    avatar?: string
}

export default function BookingTeamScreen() {
    const { companyId, serviceId } = useLocalSearchParams<{ companyId: string, serviceId: string }>()
    const router = useRouter()
    const colorScheme = useColorScheme()
    const isDark = colorScheme === 'dark'

    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [teams, setTeams] = useState<Team[]>([])

    const fetchTeams = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true)
        try {
            const response = await api.get(`/teams?companyId=${companyId}`)
            setTeams(response.data)
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os profissionais.')
        } finally {
            setLoading(false)
            if (isRefreshing) setRefreshing(false)
        }
    }

    useEffect(() => {
        if (companyId) fetchTeams()
    }, [companyId])

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        fetchTeams(true)
    }, [])

    const handleSelectTeam = (teamId: string) => {
        router.push({
            pathname: '/(client)/companies/[companyId]/booking/schedule',
            params: {
                companyId,
                serviceId,
                teamId
            }
        })
    }

    const renderTeamItem = ({ item }: { item: Team }) => (
        <TouchableOpacity
            style={[styles.teamCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF', borderColor: isDark ? '#333' : '#E0E0E0' }]}
            onPress={() => handleSelectTeam(item.id)}
            activeOpacity={0.7}
        >
            <View style={styles.teamContent}>
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}>
                        <ThemedText style={[styles.avatarInitials, { color: isDark ? '#FFF' : '#333' }]}>
                            {item.name.substring(0, 2).toUpperCase()}
                        </ThemedText>
                    </View>
                )}
                <ThemedText style={styles.teamName} numberOfLines={1}>{item.name}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#CCC'} style={styles.chevronIcon} />
        </TouchableOpacity>
    )

    if (loading) {
        return <ThemedView style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></ThemedView>
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Escolha um Time</ThemedText>
            </View>

            <FlatList
                data={teams}
                keyExtractor={item => item.id}
                renderItem={renderTeamItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={
                    <ThemedView style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={isDark ? '#666' : '#CCC'} />
                        <ThemedText style={styles.emptyText}>Nenhum profissional disponível</ThemedText>
                    </ThemedView>
                }
            />
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2
    },
    teamContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        minWidth: 0
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        flexShrink: 0
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0
    },
    avatarInitials: {
        fontWeight: 'bold',
        fontSize: 16
    },
    teamName: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        flexShrink: 1
    },
    chevronIcon: {
        flexShrink: 0
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyText: {
        opacity: 0.6,
        marginTop: 12,
        fontSize: 14
    }
})