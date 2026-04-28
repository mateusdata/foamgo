import { ThemedScrollView } from '@/components/themed-scroll-view';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, useColorScheme, View, Dimensions } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { api } from '@/config/api';
import NotificationScreen from '@/components/notification/notification';

const { width } = Dimensions.get('window');

type DashboardStats = {
    todayBookings: number;
    monthlyRevenue: number;
};

const PartnerCompanies = () => {
    const { user, refreshUser } = useAuth();
    const colorScheme = useColorScheme() || 'light';
    const [refreshing, setRefreshing] = React.useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        todayBookings: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    const isDark = colorScheme === 'dark';

    const fetchStats = async () => {
        if (!user?.company?.id) return;

        try {
            const startOfDay = dayjs().startOf('day').toISOString();
            const endOfDay = dayjs().endOf('day').toISOString();
            const startOfMonth = dayjs().startOf('month').toISOString();
            const endOfMonth = dayjs().endOf('month').toISOString();

            const todayResponse = await api.get(`/bookings`, {
                params: {
                    companyId: user.company.id,
                    startDate: startOfDay,
                    endDate: endOfDay
                }
            });

            const monthResponse = await api.get(`/bookings`, {
                params: {
                    companyId: user.company.id,
                    startDate: startOfMonth,
                    endDate: endOfMonth,
                    status: 'COMPLETED'
                }
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
    }, []);

    useEffect(() => {
        fetchStats();
    }, [user?.company?.id]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Cores dinâmicas para o Card Principal (Hero Card)
    const statsBgColor = isDark ? '#1C1C1E' : Colors.primary;
    const statsTextColor = '#FFFFFF';
    const statsSubTextColor = isDark ? '#8E8E93' : 'rgba(255,255,255,0.8)';
    const statsIconBg = isDark ? '#2C2C2E' : 'rgba(255,255,255,0.2)';
    const statsDivider = isDark ? '#38383A' : 'rgba(255,255,255,0.2)';

    return (
        <ThemedView style={styles.container} lightColor="#F4F5F7" darkColor="#121212">
            <ThemedScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                lightColor="#F4F5F7"
                darkColor="#121212"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* CABEÇALHO */}
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.greeting}>
                            Olá, {user?.name?.split(' ')[0] || 'Parceiro'}
                        </ThemedText>
                        <ThemedText style={styles.companyName}>
                            {user?.company?.name || 'Lava Jato'}
                        </ThemedText>
                    </View>
                    <View style={styles.headerActions}>
                        <PrimaryButton
                            style={styles.premiumButton}
                            textColor='white'
                            collapsable={true}
                            compact={true}
                            buttonColor={Colors.primary}
                            name="Premium"
                            onPress={() => router.push('/(app)/(partner)/store/subscription')}
                        />
                        <NotificationScreen />
                    </View>
                </View>

                {/* CARD PRINCIPAL (HERO CARD) */}
                <View style={[styles.mainStatsCard, { backgroundColor: statsBgColor }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: statsIconBg }]}>
                                <Ionicons name="calendar-outline" size={26} color={statsTextColor} />
                            </View>
                            <ThemedText style={[styles.statNumber, { color: statsTextColor }]}>
                                {stats.todayBookings}
                            </ThemedText>
                            <ThemedText style={[styles.statLabel, { color: statsSubTextColor }]}>
                                Agendamentos Hoje
                            </ThemedText>
                        </View>

                        <View style={[styles.divider, { backgroundColor: statsDivider }]} />

                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: statsIconBg }]}>
                                <Ionicons name="trending-up-outline" size={26} color={statsTextColor} />
                            </View>
                            <ThemedText style={[styles.statNumber, { color: statsTextColor }]}>
                                {formatCurrency(stats.monthlyRevenue)}
                            </ThemedText>
                            <ThemedText style={[styles.statLabel, { color: statsSubTextColor }]}>
                                Receita do Mês
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* ACESSO RÁPIDO */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Acesso Rápido</ThemedText>

                    {[
                        {
                            title: 'Gerenciar Times',
                            subtitle: 'Equipes e colaboradores',
                            icon: 'people-outline',
                            route: '/(app)/(partner)/companies/[companyId]/teams'
                        },
                        {
                            title: 'Serviços',
                            subtitle: 'Catálogo e preços',
                            icon: 'construct-outline',
                            route: '/(app)/(partner)/companies/[companyId]/services'
                        },
                        {
                            title: 'Lava Jato',
                            subtitle: 'Configurações do negócio',
                            icon: 'business-outline',
                            route: '/(app)/(partner)/companies/[companyId]/manager'
                        },
                        {
                            title: 'Disponibilidade',
                            subtitle: 'Horários de atendimento',
                            icon: 'time-outline',
                            route: '/(app)/(partner)/companies/[companyId]/slots'
                        }
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.actionCard,
                                { 
                                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                                    borderColor: isDark ? '#2C2C2E' : '#E5E7EB'
                                }
                            ]}
                            onPress={() => router.push({
                                pathname: item.route as any,
                                params: { companyId: user?.company?.id }
                            })}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
                                <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.actionContent}>
                                <ThemedText style={styles.actionTitle}>{item.title}</ThemedText>
                                <ThemedText style={styles.actionSubtitle}>{item.subtitle}</ThemedText>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={isDark ? '#8E8E93' : '#D1D5DB'}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

            </ThemedScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
    header: {
        paddingTop: 16,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    greeting: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 4
    },
    companyName: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    premiumButton: {
        padding: 0,
        marginRight: 16
    },
    mainStatsCard: {
        borderRadius: 24, // Bordas mais arredondadas (moderno)
        paddingVertical: 24,
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    statItem: {
        flex: 1,
        alignItems: 'center'
    },
    statIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: -0.5
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center'
    },
    divider: {
        width: 1,
        height: 60,
        marginHorizontal: 16,
        borderRadius: 1
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        letterSpacing: -0.3
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1, // Borda sutil em vez de sombras fortes
    },
    actionIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
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
        marginBottom: 4
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#8E8E93'
    }
});

export default PartnerCompanies;