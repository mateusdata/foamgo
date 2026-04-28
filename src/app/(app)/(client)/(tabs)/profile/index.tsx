import AvatarUser from '@/components/avatar-user';
import { ThemedPressable } from '@/components/themed-pressable';
import { ThemedScrollView } from '@/components/themed-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-provider';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, useColorScheme, Linking } from 'react-native';

const Profile = () => {
    const { logOut } = useAuth();
    const colorScheme = useColorScheme() || 'light';
    const isDark = colorScheme === 'dark';

    return (
        <ThemedView style={styles.container} lightColor="#F4F5F7" darkColor="#121212">
            <ThemedScrollView
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                lightColor="#F4F5F7"
                darkColor="#121212"
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
            >

                <View style={styles.headerContainer}>
                    <AvatarUser />
                </View>

                <View style={styles.sectionContainer}>
                    <ThemedText style={styles.sectionTitle}>Perfil</ThemedText>
                    
                    <MenuItem
                        icon={<Ionicons name="person-outline" size={24} color={Colors.primary} />}
                        label="Conta"
                        description="Gerenciar informações pessoais"
                        onPress={() => router.push("/(app)/(client)/account/my-informations")}
                    />

                    {false && (
                        <MenuItem
                            icon={<Ionicons name="settings-outline" size={24} color={Colors.primary} />}
                            label="Configurações"
                            description="Abrir configurações do dispositivo"
                            onPress={() => Linking.openSettings()}
                        />
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <ThemedText style={styles.sectionTitle}>Suporte</ThemedText>
                    
                    <MenuItem
                        icon={<Ionicons name="help-circle-outline" size={24} color={Colors.primary} />}
                        label="Ajuda"
                        description="Central de ajuda e FAQ"
                        onPress={() => router.push("/(app)/(client)/account/help")}
                    />

                    {false && (
                        <MenuItem
                            icon={<Ionicons name="star-outline" size={24} color={Colors.primary} />}
                            label="Avaliação"
                            description="Avaliar o aplicativo"
                            onPress={() => alert('Funcionalidade em desenvolvimento')}
                        />
                    )}
                </View>

                <View style={styles.logoutContainer}>
                    <MenuItem
                        icon={<Ionicons name="log-out-outline" size={24} color="#FF3B30" />}
                        label="Sair da conta"
                        description="Desconectar do aplicativo"
                        onPress={logOut}
                        isDestructive={true}
                    />
                </View>

            </ThemedScrollView>
        </ThemedView>
    );
};

type MenuItemProps = {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onPress: () => void;
    isDestructive?: boolean;
};

const MenuItem = ({
    icon,
    label,
    description,
    onPress,
    isDestructive = false
}: MenuItemProps) => {
    const colorScheme = useColorScheme() || 'light';
    const isDark = colorScheme === 'dark';

    // Fundo do ícone dinâmico: vermelho claro se for botão de sair, ou cinza padrão se for normal
    const iconBg = isDestructive
        ? (isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFEBEB')
        : (isDark ? '#2C2C2E' : '#F3F4F6');

    return (
        <ThemedPressable
            style={[
                styles.menuItem,
                {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.menuContent}>
                <View style={[styles.menuIconContainer, { backgroundColor: iconBg }]}>
                    {icon}
                </View>
                <View style={styles.menuTextContainer}>
                    <ThemedText
                        style={[
                            styles.menuLabel,
                            isDestructive && { color: '#FF3B30' }
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
                color={isDark ? '#8E8E93' : '#D1D5DB'}
            />
        </ThemedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
        flexGrow: 1,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24, // Diminuí o espaço abaixo do avatar
    },
    sectionContainer: {
        marginBottom: 5, // Reduzi bastante o espaçamento entre as categorias
    },
    logoutContainer: {
        marginTop: 4, // Colado logo abaixo de "Ajuda", sem espaços gigantes
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16, // Deixei um pouco mais sutil
        fontWeight: '700',
        marginBottom: 12, // Título mais colado no botão
        marginLeft: 4,
        letterSpacing: -0.3,
        color: '#8E8E93' // Cor de título de seção mais moderno (estilo iOS)
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14, // Deixei o card um pouco mais compacto verticalmente
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8, // Menor distância entre cards da mesma seção
    },
    menuContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIconContainer: {
        width: 44, // Ícone levemente mais compacto
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: -0.2
    },
    menuDescription: {
        fontSize: 13,
        color: '#8E8E93',
    },
});

export default Profile;