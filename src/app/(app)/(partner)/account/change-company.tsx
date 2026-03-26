import { ThemedScrollView } from '@/components/themed-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { api } from '@/config/api';

const ChangeCompany = () => {
    const { user, refreshUser } = useAuth();
    const colorScheme = useColorScheme() || 'light';
    const [loading, setLoading] = useState(false);

    const activeCompanyId = user?.activeCompanyId;

    // Get all unique companies the user is a member of
    const memberships = user?.memberships || [];
    const companies = memberships.map(m => m.team?.company).filter((c, i, arr) =>
        c && arr.findIndex(t => t?.id === c.id) === i
    );

    // Also include own company if valid and not already in list
    if (user?.company && !companies.find(c => c?.id === user.company?.id)) {
        companies.push(user.company);
    }

    const handleSelectCompany = async (companyId: string) => {
        if (loading) return;
        if (companyId === activeCompanyId) return;

        setLoading(true);
        try {
            await api.patch('/users', { activeCompanyId: companyId });
            await refreshUser();
            Alert.alert('Sucesso', 'Lavajato padrão atualizado com sucesso!');
            router.back();
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Ocorreu um erro ao atualizar o lavajato padrão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.container}
            lightColor="#F8F8F8"
            darkColor="#121212"
        >
            <ThemedView style={styles.header}>
                <ThemedText style={styles.title}>Alterar Lavajato Padrão</ThemedText>
                <ThemedText style={styles.subtitle}>
                    Selecione o lavajato que você deseja ver ao abrir o aplicativo.
                </ThemedText>
            </ThemedView>

            <ThemedView style={styles.listContainer}>
                {companies.map((company) => {
                    if (!company) return null;
                    const isActive = company.id === activeCompanyId;

                    return (
                        <TouchableOpacity
                            key={company.id}
                            style={[
                                styles.companyCard,
                                {
                                    backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E',
                                    borderColor: isActive ? Colors.primary : 'transparent',
                                    borderWidth: isActive ? 2 : 0
                                }
                            ]}
                            onPress={() => handleSelectCompany(company.id)}
                            disabled={loading}
                        >
                            <ThemedView style={styles.cardContent}>
                                <ThemedView style={[styles.iconContainer,
                                { backgroundColor: isActive ? 'rgba(0,122,255,0.1)' : (colorScheme === 'light' ? '#F0F0F0' : '#2C2C2E') }
                                ]}>
                                    <Ionicons
                                        name="business"
                                        size={24}
                                        color={isActive ? Colors.primary : (colorScheme === 'light' ? '#8E8E93' : '#666666')}
                                    />
                                </ThemedView>

                                <ThemedView style={styles.companyInfo}>
                                    <ThemedText style={[styles.companyName, isActive && { color: Colors.primary }]}>
                                        {company.name}
                                    </ThemedText>
                                    <ThemedText style={styles.companyAddress} numberOfLines={1}>
                                        {company.email || 'Sem email de contato'}
                                    </ThemedText>
                                </ThemedView>

                                {isActive && (
                                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                                )}
                                {loading && isActive && (
                                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />
                                )}
                            </ThemedView>
                        </TouchableOpacity>
                    );
                })}

                {companies.length === 0 && (
                    <ThemedView style={styles.emptyState}>
                        <ThemedText style={styles.emptyText}>Você não participa de nenhum outro lavajato.</ThemedText>
                    </ThemedView>
                )}
            </ThemedView>
        </ThemedScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        paddingHorizontal: 4
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        lineHeight: 22,
    },
    listContainer: {
        gap: 16,
    },
    companyCard: {
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    companyAddress: {
        fontSize: 14,
        color: '#8E8E93',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
    }
});

export default ChangeCompany;
