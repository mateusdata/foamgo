import { ThemedPressable } from '@/components/themed-pressable';
import { ThemedScrollView } from '@/components/themed-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-provider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, useColorScheme, Alert } from 'react-native';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { api } from '@/config/api';


const MyInformations = () => {
    const { user, logOut } = useAuth();
    const colorScheme = useColorScheme() || 'light';

    const deleteAccount = async () => {
        try {

            const response = await api.delete('/users');
            logOut();

        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro ao apagar a conta. Tente novamente mais tarde.');
        }
    }
    const handleDeleteAccount = () => {
        Alert.alert(
            'Apagar conta',
            'Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: deleteAccount,
                },
            ]
        );
    };

    return (
        <ThemedScrollView
            contentInsetAdjustmentBehavior="automatic"
            lightColor="#F8F8F8"
            darkColor="#121212"
            style={styles.container}
        >
            {/* Seção Informações Pessoais */}
            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Informações Pessoais</ThemedText>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="person-outline" size={24} color={Colors.primary} />}
                        label="Nome de usuário"
                        description={user?.name || "Definir nome de usuário"}
                        onPress={() => router.push("/(team)/account/change-name")}
                        showBorder={false}
                    />
                </View>

                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="mail-outline" size={24} color={Colors.primary} />}
                        label="Email"
                        description={user?.email || "Adicionar email"}
                        onPress={() => router.push("/(team)/account/change-email")}
                        showBorder={false}
                    />
                </View>


                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="call-outline" size={24} color={Colors.primary} />}
                        label="Telefone"
                        description={parsePhoneNumberFromString(user?.phone ?? '', 'BR')?.formatNational() ?? "Adicionar telefone"}
                        onPress={() => router.push("/(team)/account/change-phone")}
                        showBorder={false}
                    />
                </View>

                <View style={[styles.menuGroup, { marginTop: 12 }]}>
                    <MenuItem
                        icon={<Ionicons name="business-outline" size={24} color={Colors.primary} />}
                        label="Lavajato Padrão"
                        description="Alterar lavajato ativo"
                        onPress={() => router.push("/(team)/account/change-company")}
                        showBorder={false}
                    />
                </View>
            </View>

            {/* Seção Segurança */}
            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Segurança</ThemedText>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="lock-closed-outline" size={24} color={Colors.primary} />}
                        label="Senha"
                        description="Alterar senha de acesso"
                        onPress={() => router.push("/(team)/account/change-password")}
                        showBorder={false}
                    />
                </View>

                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="trash-outline" size={24} color="#FF4757" />}
                        label="Apagar conta"
                        description="Remover permanentemente sua conta"
                        onPress={handleDeleteAccount}
                        showBorder={false}
                        isDestructive={true}
                    />
                </View>
            </View>

            <View style={styles.bottomSpacer} />
        </ThemedScrollView>
    );
};

type MenuItemProps = {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onPress: () => void;
    showBorder?: boolean;
    isDestructive?: boolean;
};

const MenuItem = ({
    icon,
    label,
    description,
    onPress,
    showBorder = false,
    isDestructive = false
}: MenuItemProps) => {
    const colorScheme = useColorScheme() || 'light';

    return (
        <ThemedPressable
            style={[
                styles.menuItem,
                {
                    backgroundColor: colorScheme === 'light' ? '#FFFFFF' : '#1E1E1E',
                    borderBottomWidth: showBorder ? 1 : 0,
                    borderBottomColor: colorScheme === 'light' ? '#F0F0F0' : '#2A2A2A',
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.menuContent}>
                <View style={[
                    styles.menuIconContainer,
                    isDestructive && { backgroundColor: 'rgba(255, 71, 87, 0.1)' }
                ]}>
                    {icon}
                </View>
                <View style={styles.menuTextContainer}>
                    <ThemedText
                        style={[
                            styles.menuLabel,
                            isDestructive && { color: '#FF4757' }
                        ]}
                    >
                        {label}
                    </ThemedText>
                    {description && (
                        <ThemedText
                            style={[
                                styles.menuDescription,
                                isDestructive && { color: '#FF4757', opacity: 0.8 }
                            ]}
                        >
                            {description}
                        </ThemedText>
                    )}
                </View>
            </View>
            <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color={isDestructive ? '#FF4757' : (colorScheme === 'light' ? '#C0C0C0' : '#666666')}
            />
        </ThemedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionContainer: {
        marginBottom: 22,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
        marginLeft: 4,
    },
    menuGroup: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    menuDescription: {
        fontSize: 14,
        opacity: 0.6,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default MyInformations;