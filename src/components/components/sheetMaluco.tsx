import { Platform, StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";

export default function AddScreen() {
    const sheetRef = useRef<any>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const iconColor = isDark ? '#E8E8E8' : '#404040';
    const { width } = useWindowDimensions();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // Garante que o sheet está montado antes de abrir
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            // Usa requestAnimationFrame para garantir que o sheet está pronto
            requestAnimationFrame(() => {
                setTimeout(async () => {
                    try {
                        await sheetRef.current?.present();
                    } catch (error) {
                        console.error('Erro ao abrir sheet:', error);
                        // Se falhar ao abrir, volta para tela anterior
                        router.back();
                    }
                }, 300);
            });
        }
    }, [isMounted]);

    const handleClose = async () => {
        try {
            await sheetRef.current?.dismiss();
        } catch (error) {
            console.error('Erro ao fechar sheet:', error);
        } finally {
            // Volta para a tela anterior
            router.back();
        }
    };

    const handleOptionPress = (option: string) => {
        console.log('Selecionado:', option);
        
        // Aqui você pode navegar para telas específicas baseado na opção
        switch (option) {
            case 'times':
                // router.push('/times');
                break;
            case 'servicos':
                // router.push('/servicos');
                break;
            case 'categorias':
                // router.push('/categorias');
                break;
            case 'gerenciar':
                // router.push('/gerenciar');
                break;
        }
        
        handleClose();
    };

    if (!isMounted) {
        return <View style={{ flex: 1 }} />;
    }

    return (
        <View style={{ flex: 1 }}>
            <TrueSheet
                ref={sheetRef}
                detents={['auto']}
                backgroundColor={Platform.OS === "android" && isDark ? "#1B1B1D" : undefined}
                onDidDismiss={() => {
                    // Volta para a tela anterior quando o sheet é fechado
                    router.back();
                }}
            >
                <GestureHandlerRootView style={{ flexGrow: 1, width: width }}>
                    <View style={styles.container}>
                        <View style={styles.sheetHeader}>
                            <ThemedText style={styles.sheetTitle}>Menu</ThemedText>
                            <RectButton
                                rippleColor="#919191ff"
                                underlayColor="#919191ff"
                                onPress={handleClose}
                                style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={24} color={iconColor} />
                            </RectButton>
                        </View>

                        <View style={styles.optionsContainer}>
                            <RectButton
                                rippleColor="#919191ff"
                                underlayColor="#919191ff"
                                style={styles.sheetOption}
                                onPress={() => handleOptionPress('times')}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                                ]}>
                                    <MaterialCommunityIcons name="account-group-outline" size={24} color={iconColor} />
                                </View>
                                <ThemedText style={styles.sheetOptionText}>Times</ThemedText>
                            </RectButton>

                            <RectButton
                                rippleColor="#919191ff"
                                underlayColor="#919191ff"
                                style={styles.sheetOption}
                                onPress={() => handleOptionPress('servicos')}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                                ]}>
                                    <MaterialCommunityIcons name="briefcase-outline" size={24} color={iconColor} />
                                </View>
                                <ThemedText style={styles.sheetOptionText}>Meus Serviços</ThemedText>
                            </RectButton>

                            <RectButton
                                rippleColor="#919191ff"
                                underlayColor="#919191ff"
                                style={styles.sheetOption}
                                onPress={() => handleOptionPress('categorias')}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                                ]}>
                                    <MaterialCommunityIcons name="shape-outline" size={24} color={iconColor} />
                                </View>
                                <ThemedText style={styles.sheetOptionText}>Categorias</ThemedText>
                            </RectButton>

                            <RectButton
                                rippleColor="#919191ff"
                                underlayColor="#919191ff"
                                style={styles.sheetOption}
                                onPress={() => handleOptionPress('gerenciar')}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                                ]}>
                                    <MaterialCommunityIcons name="car-wash" size={24} color={iconColor} />
                                </View>
                                <ThemedText style={styles.sheetOptionText}>Gerenciar Lava-Jato</ThemedText>
                            </RectButton>
                        </View>
                    </View>
                </GestureHandlerRootView>
            </TrueSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(128, 128, 128, 0.2)',
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    sheetOptionText: {
        fontSize: 16,
        fontWeight: '400',
    },
});