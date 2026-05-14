import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, Alert, useColorScheme, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { api } from '@/config/api';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

type BookingStatus = 'COMPLETED' | 'CANCELLED' | 'CONFIRMED';

type Booking = {
    id: string
    scheduledAt: string
    status: BookingStatus
    carService?: { name: string; price: string | number }
    service?: { name: string; price: string | number }
    carWash?: { name: string; avatar: string; addresses?: { street: string; city: string } }
    company?: { name: string; avatar: string; addresses?: { street: string; city: string } }
    totalPrice?: number | string
    carName?: string
    vehicle?: { model?: string; make?: string; year?: number | string; plate?: string }
    team?: { name: string; avatar?: string }
    notes?: string
}

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme() || 'light';
    const isDark = colorScheme === 'dark';

    const fetchBooking = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/bookings/${id}`);
            setBooking(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchBooking();
    }, [fetchBooking]);

    const handleCancelBooking = () => {
        Alert.alert(
            'Cancelar Agendamento',
            'Tem certeza que deseja cancelar este agendamento?',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, Cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.patch(`/bookings/${id}`, { status: 'CANCELLED' });
                            // Alert.alert('Sucesso', 'Agendamento cancelado com sucesso.');
                            fetchBooking();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
                        }
                    }
                }
            ]
        );
    };

    const formatPrice = (priceStr: string | number | undefined) => {
        if (!priceStr || priceStr === '' || priceStr === '0') return 'A combinar';
        const val = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
        if (isNaN(val) || val === 0) return 'A combinar';
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ThemedView>
        );
    }

    if (!booking) return null;

    const statusConfig: Record<string, { label: string; color: string; backgroundColor: string; icon: string }> = {
        CONFIRMED: {
            label: 'Confirmado',
            color: isDark ? '#81C784' : '#2E7D32',
            backgroundColor: isDark ? 'rgba(102, 187, 106, 0.15)' : '#E8F5E8',
            icon: 'checkmark-circle'
        },
        COMPLETED: {
            label: 'Concluído',
            color: isDark ? '#64B5F6' : '#1565C0',
            backgroundColor: isDark ? 'rgba(66, 165, 245, 0.15)' : '#E3F2FD',
            icon: 'checkmark-done-circle'
        },
        CANCELLED: {
            label: 'Cancelado',
            color: isDark ? '#E57373' : '#C62828',
            backgroundColor: isDark ? 'rgba(239, 83, 80, 0.15)' : '#FFEBEE',
            icon: 'close-circle'
        },
    };

    const statusInfo = statusConfig[booking.status] || statusConfig['CONFIRMED'];
    const company = booking.company || booking.carWash;
    const hasAvatar = company?.avatar && company.avatar.length > 0;
    const serviceName = booking.service?.name || booking.carService?.name || 'Serviço';
    const price = booking.totalPrice || booking.service?.price || booking.carService?.price;
    const vehicleName = [booking.vehicle?.model, booking.vehicle?.make, booking.vehicle?.year?.toString()]
        .filter(Boolean)
        .join(' - ') || booking.carName;

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.content}
            >
                {/* Horizontal Header Section */}
                <View style={[styles.headerSection, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]}>
                        {hasAvatar ? (
                            <Image source={{ uri: company.avatar }} style={styles.avatar} />
                        ) : (
                            <ThemedText style={styles.avatarText}>
                                {getInitials(company?.name || 'Lava Jato')}
                            </ThemedText>
                        )}
                    </View>

                    <View style={styles.headerInfo}>
                        <ThemedText style={styles.companyName}>{company?.name || 'Lava Jato'}</ThemedText>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                                <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
                                <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
                                    {statusInfo.label}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Compact Details Section */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(51, 112, 255, 0.1)' }]}>
                            <Ionicons name="car-sport-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <ThemedText style={styles.detailLabel}>Serviço</ThemedText>
                            <ThemedText style={styles.detailValue}>{serviceName}</ThemedText>
                            {!!vehicleName && (
                                <ThemedText style={styles.detailSubtext}>
                                    {vehicleName}
                                </ThemedText>
                            )}
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(51, 112, 255, 0.1)' }]}>
                            <Ionicons name="person-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <ThemedText style={styles.detailLabel}>Profissional / Equipe</ThemedText>
                            <ThemedText style={styles.detailValue}>{booking.team?.name || 'Todos'}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(51, 112, 255, 0.1)' }]}>
                            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <ThemedText style={styles.detailLabel}>Data e Hora</ThemedText>
                            <ThemedText style={styles.detailValue}>
                                {dayjs(booking.scheduledAt).format('DD/MM/YYYY [às] HH:mm')}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={[styles.detailItem, { borderBottomWidth: 0 }]}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(51, 112, 255, 0.1)' }]}>
                            <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <ThemedText style={styles.detailLabel}>Valor</ThemedText>
                            <ThemedText style={[styles.detailValue, { color: Colors.primary, fontWeight: '700' }]}>
                                {formatPrice(price)}
                            </ThemedText>
                        </View>
                    </View>

                    {booking.notes && (
                        <View style={[styles.notesSection, { backgroundColor: isDark ? '#1C1C1E' : '#F8F8F8' }]}>
                            <ThemedText style={styles.notesLabel}>Observações</ThemedText>
                            <ThemedText style={styles.notesText}>{booking.notes}</ThemedText>
                        </View>
                    )}
                </View>

                {/* Action Button */}
                {booking.status === 'CONFIRMED' && (
                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelBooking}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={styles.cancelButtonText}>Cancelar Agendamento</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden'
    },
    avatar: { width: '100%', height: '100%' },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: '#666' },

    headerInfo: { flex: 1 },
    companyName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    statusText: { fontSize: 12, fontWeight: '600' },

    detailsContainer: { marginBottom: 24 },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: 12, opacity: 0.6, marginBottom: 2 },
    detailValue: { fontSize: 15, fontWeight: '500' },
    detailSubtext: { fontSize: 13, opacity: 0.5, marginTop: 2 },

    notesSection: {
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
    },
    notesLabel: { fontSize: 12, opacity: 0.6, marginBottom: 6 },
    notesText: { fontSize: 14, lineHeight: 20, opacity: 0.8 },

    footerActions: {
        marginTop: 8,
    },
    cancelButton: {
        backgroundColor: 'rgba(239, 83, 80, 0.1)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#EF5350',
        fontWeight: '600',
        fontSize: 15,
    },
});
