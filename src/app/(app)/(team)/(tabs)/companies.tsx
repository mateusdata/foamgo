import { ThemedScrollView } from '@/components/themed-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { api } from '@/config/api';
import NotificationScreen from '@/components/notification/notification';

type DashboardStats = {
    todayBookings: number;
    monthlyRevenue: number;
};

const TeamCompanies = () => {
    const { user, refreshUser } = useAuth();
    const colorScheme = useColorScheme() || 'light';
    const [refreshing, setRefreshing] = React.useState(false);
    const [stats, setStats] = useState({
        todayBookings: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    const isDark = colorScheme === 'dark';

    const fetchStats = async () => {
        if (!user?.activeCompanyId || !user?.memberships) return;

        try {
            const startOfDay = dayjs().startOf('day').toISOString();
            const endOfDay = dayjs().endOf('day').toISOString();
            const startOfMonth = dayjs().startOf('month').toISOString();
            const endOfMonth = dayjs().endOf('month').toISOString();

            const membership = user.memberships.find(m => m.team?.companyId === user.activeCompanyId);
            const teamId = membership?.teamId;

            const params: any = {
                companyId: user.activeCompanyId,
                startDate: startOfDay,
                endDate: endOfDay
            };

            if (teamId) {
                params.teamId = teamId;
            }

            const todayResponse = await api.get(`/bookings`, {
                params: params
            });

            const monthParams: any = {
                companyId: user.activeCompanyId,
                startDate: startOfMonth,
                endDate: endOfMonth,
                status: 'COMPLETED'
            };

            if (teamId) {
                monthParams.teamId = teamId;
            }

            const monthResponse = await api.get(`/bookings`, {
                params: monthParams
            });

            const monthCompletedBookings = monthResponse.data || [];
            const monthlyRevenue = Array.isArray(monthCompletedBookings)
                ? monthCompletedBookings.reduce((total: number, booking: any) => {
                    const price = parseFloat(booking.carService?.price || '0');
                    return total + price;
                }, 0)
                : 0;

            const todayBookings = todayResponse.data || [];

            setStats({
                todayBookings: Array.isArray(todayBookings) ? todayBookings.length : 0,
                monthlyRevenue: monthlyRevenue
            });
        } catch (error: any) {
            console.log('Error fetching stats:', error);
            setStats({ todayBookings: 0, monthlyRevenue: 0 });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshUser();
        await fetchStats();
        setRefreshing(false);
    }, [user?.activeCompanyId]);

    useEffect(() => {
        fetchStats();
    }, [user?.activeCompanyId]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const activeMembership = user?.memberships?.find(m => m.team?.companyId === user?.activeCompanyId);
    const companyName = activeMembership?.team?.company?.name || user?.company?.name || 'Lava Jato';
    const teamName = activeMembership?.team?.name;

    return (
        <ThemedScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <ThemedView style={styles.header}>
                <ThemedView>
                    <ThemedText style={styles.greeting}>
                        Olá, {user?.name?.split(' ')[0] || 'Membro'}
                    </ThemedText>
                    <ThemedText style={styles.companyName}>
                        {companyName}
                    </ThemedText>
                    {teamName && (
                        <ThemedText style={styles.teamName}>
                            {teamName}
                        </ThemedText>
                    )}
                </ThemedView>
                <NotificationScreen />
            </ThemedView>

            <ThemedView
                darkColor='#1C1C1E'
                lightColor='#FFFFFF'
                style={styles.mainStatsCard}
            >
                <ThemedView style={styles.statsRow}>
                    <ThemedView style={styles.statItem}>
                        <ThemedView style={[styles.statIconContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Ionicons name="calendar-outline" size={28} color="#007AFF" />
                        </ThemedView>
                        <ThemedText style={styles.statNumber}>{stats.todayBookings}</ThemedText>
                        <ThemedText style={styles.statLabel}>Agendamentos Hoje</ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.divider} />

                    <ThemedView style={styles.statItem}>
                        <ThemedView style={[styles.statIconContainer, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Ionicons name="trending-up-outline" size={28} color="#007AFF" />
                        </ThemedView>
                        <ThemedText style={styles.statNumber}>
                            {formatCurrency(stats.monthlyRevenue)}
                        </ThemedText>
                        <ThemedText style={styles.statLabel}>Receita do Mês</ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Acesso Rápido</ThemedText>

                <TouchableOpacity
                    style={[
                        styles.actionCard,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
                    ]}
                    onPress={() => router.push('/(app)/(team)/(tabs)/bookings')}
                    activeOpacity={0.7}
                >
                    <ThemedView style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                        <Ionicons name="calendar-outline" size={28} color="#007AFF" />
                    </ThemedView>
                    <View style={styles.actionContent}>
                        <ThemedText style={styles.actionTitle}>Ver Agendamentos</ThemedText>
                        <ThemedText style={styles.actionSubtitle}>
                            Consultar todos os agendamentos
                        </ThemedText>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isDark ? '#8E8E93' : '#C7C7CC'}
                    />
                </TouchableOpacity>
            </ThemedView>

            <ThemedView style={{ height: 40 }} />
        </ThemedScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16
    },
    header: {
        paddingTop: 12,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    greeting: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 2
    },
    companyName: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5
    },
    teamName: {
        fontSize: 13,
        color: '#007AFF',
        marginTop: 2,
        fontWeight: '600'
    },
    mainStatsCard: {
        borderRadius: 16,
        margin: 16,
        top: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statItem: {
        flex: 1,
        alignItems: 'center'
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
        letterSpacing: -0.5
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        textAlign: 'center'
    },
    divider: {
        width: 1,
        height: 50,
        backgroundColor: '#E5E5EA',
        marginHorizontal: 12
    },
    section: {
        marginBottom: 24,
        top: 22
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.3
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2
    },
    actionIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    actionContent: {
        flex: 1
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#8E8E93'
    }
});

export default TeamCompanies;