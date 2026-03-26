import { StyleSheet, View, TouchableOpacity, useColorScheme, Linking } from 'react-native'
import React from 'react'

import { useForm } from "react-hook-form"
import { Colors } from '@/constants/theme'
import { api } from '@/config/api'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Alert } from 'react-native'
import { useAuth } from '@/contexts/auth-provider'
import { ThemedView } from '@/components/themed-view'
import PaperInput from '@/components/inputs/paper-input'
import { PrimaryButton } from '@/components/buttons/primary-button'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import AvatarUser from '@/components/avatar-user'
import { ThemedText } from '@/components/themed-text'
import { ThemedPressable } from '@/components/themed-pressable'



const Account = () => {
    const { logOut } = useAuth();
    const colorScheme = useColorScheme() || 'light';



    return (
        <ThemedScrollView
            contentInsetAdjustmentBehavior="automatic"
            lightColor="#F8F8F8"
            darkColor="#121212"
            style={styles.container}

        >

            <ThemedView style={styles.headerContainer}>
                <AvatarUser />

            </ThemedView>


            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Perfil</ThemedText>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="person-outline" size={24} color={Colors.primary} />}
                        label="Conta"
                        description="Gerenciar informações pessoais"
                        onPress={() => router.push("/(app)/(client)/account/my-informations")}
                        showBorder={true}
                    />
                    <MenuItem
                        icon={<Ionicons name="settings-outline" size={24} color={Colors.primary} />}
                        label="Configurações"
                        description="Abrir configurações do dispositivo"
                        onPress={() => {
                            Linking.openSettings();
                        }}
                        showBorder={false}
                    />
                </View>
            </View>


            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Suporte</ThemedText>
                <View style={styles.menuGroup}>
                    <MenuItem
                        icon={<Ionicons name="help-circle-outline" size={24} color={Colors.primary} />}
                        label="Ajuda"
                        description="Central de ajuda e FAQ"
                        onPress={() => router.push("/(app)/(client)/account/help")}
                        showBorder={true}
                    />
                    <MenuItem
                        icon={<Ionicons name="star-outline" size={24} color={Colors.primary} />}
                        label="Avaliação"
                        description="Avaliar o aplicativo"
                        onPress={() => alert('Funcionalidade em desenvolvimento')}
                        showBorder={false}
                    />
                </View>
            </View>


            <View style={styles.sectionContainer}>
                <View style={styles.sectionContainer}>
                    <View style={styles.menuGroup}>

                        <MenuItem
                            icon={<Ionicons name="trash-outline" size={24} color="#FF4757" />}
                            label="Excluir conta"
                            description="Apagar dados permanentemente"
                            onPress={() => {
                                Alert.alert(
                                    'Excluir conta',
                                    'Tem certeza que deseja excluir sua conta? Essa ação é irreversível.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Excluir',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await api.delete('/users/me');
                                                    logOut();
                                                } catch (error) {
                                                    Alert.alert('Erro', 'Não foi possível excluir a conta.');
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            showBorder={false}
                            isDestructive={true}
                        />
                    </View>
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
                <View style={styles.menuIconContainer}>
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
                        <ThemedText style={styles.menuDescription}>
                            {description}
                        </ThemedText>
                    )}
                </View>
            </View>
            <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color={colorScheme === 'light' ? '#C0C0C0' : '#666666'}
            />
        </ThemedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerContainer: {
        alignItems: 'center',

        marginBottom: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 16,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        opacity: 0.7,
        marginTop: 4,
        textAlign: 'center',
    },
    sectionContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
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

export default Account;