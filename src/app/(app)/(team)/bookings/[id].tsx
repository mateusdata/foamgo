import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, Image, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { api } from '@/config/api';
import { Booking } from '@/components/booking';
import { ThemedScrollView } from '@/components/themed-scroll-view';
import dayjs from 'dayjs';

export default function BookingDetails() {
    const { id } = useLocalSearchParams();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme() || 'light';
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const response = await api.get(`/bookings/${id}`);
            setBooking(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes do agendamento.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: 'COMPLETED' | 'CANCELLED') => {
        try {
            await api.patch(`/bookings/${id}`, { status });
            //Alert.alert('Sucesso', `Agendamento ${status === 'COMPLETED' ? 'concluído' : 'cancelado'} com sucesso.`);
            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o status.');
        }
    };

    const confirmAction = (status: 'COMPLETED' | 'CANCELLED') => {
        Alert.alert(
            status === 'COMPLETED' ? 'Concluir Serviço' : 'Cancelar Agendamento',
            status === 'COMPLETED'
                ? 'Deseja confirmar a conclusão deste serviço?'
                : 'Tem certeza que deseja cancelar este agendamento?',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim',
                    style: status === 'CANCELLED' ? 'destructive' : 'default',
                    onPress: () => handleUpdateStatus(status)
                }
            ]
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </ThemedView>
        );
    }

    if (!booking) return null;

    const statusConfig: any = {
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

    const statusInfo = statusConfig[booking.status] || { label: booking.status, color: '#999', backgroundColor: '#EEE', icon: 'help-circle' };

    // Check if valid avatar URL exists (naive check, but sufficient for now)
    const hasAvatar = booking.user?.avatar && booking.user.avatar.length > 0;
    const avatarUrl = booking.user?.avatar;

    const customerName = booking.user?.name || booking.company?.name || 'Cliente';
    const serviceName = booking.carService?.name || booking.service?.name;
    const price = booking.carService?.price || booking.service?.price || '0,00';
    const vehicleName = [booking.vehicle?.model, booking.vehicle?.make, booking.vehicle?.year?.toString()]
        .filter(Boolean)
        .join(' - ') || booking.carName;
    const formattedPrice = !price || price === 0 || price === '0,00' || price === '0'
        ? 'A combinar'
        : typeof price === 'number'
            ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : `R$ ${price}${!String(price).includes(',') && !String(price).includes('.') ? ',00' : ''}`;

    return (
        <ThemedView style={styles.container}>
            <ThemedScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.content}
            >
                {/* Horizontal Header Section */}
                <View style={[styles.headerSection, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]}>
                        {hasAvatar ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <ThemedText style={styles.avatarText}>{getInitials(customerName)}</ThemedText>
                        )}
                    </View>

                    <View style={styles.headerInfo}>
                        <ThemedText style={styles.customerName}>{customerName}</ThemedText>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.backgroundColor }]}>
                                <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
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
                            <Ionicons name="people-outline" size={18} color={Colors.primary} />
                        </View>
                        <View style={styles.detailContent}>
                            <ThemedText style={styles.detailLabel}>Equipe</ThemedText>
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
                                {formattedPrice}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Actions Footer */}
                {(booking.status === 'CONFIRMED' || booking.status === 'Confirmed') && (
                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => confirmAction('CANCELLED')}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={[styles.actionButtonText, { color: '#EF5350' }]}>Cancelar</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => confirmAction('COMPLETED')}
                            activeOpacity={0.8}
                        >
                            <ThemedText style={[styles.actionButtonText, { color: '#FFF' }]}>Concluir</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

            </ThemedScrollView>
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
    customerName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
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

    detailsContainer: {
        marginBottom: 24,
    },
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

    footerActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: { backgroundColor: 'rgba(239, 83, 80, 0.1)' },
    completeButton: { backgroundColor: Colors.primary },
    actionButtonText: { fontWeight: '600', fontSize: 15 },
});
