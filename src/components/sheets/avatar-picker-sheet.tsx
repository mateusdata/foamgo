import { Platform, Pressable, StyleSheet, useColorScheme, useWindowDimensions, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { ThemedText } from "../themed-text";
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import React from "react";
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';

interface AvatarPickerSheetProps {
    sheetRef: React.RefObject<any>;
    onPickImage: () => void;
    onPickCamera: () => void;
    onRemoveImage: () => void;
}


export const AvatarPickerSheet = ({ sheetRef, onPickImage, onPickCamera, onRemoveImage, }: AvatarPickerSheetProps) => {

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const iconColor = isDark ? '#E8E8E8' : '#404040';
    const deleteColor = '#E53935';
    const { width } = useWindowDimensions();
    const handleClose = async () => {
        await sheetRef.current?.dismiss();
    };

    const handlePickImage = () => {
        handleClose();
        onPickImage()
    };

    const handlePickCamera = () => {
        handleClose();
        onPickCamera();
    };

    const handleRemoveImage = () => {
        handleClose();
        onRemoveImage();
    };

    return (
        <TrueSheet
            ref={sheetRef}
            detents={['auto']}

            backgroundColor={Platform.OS === "android" && isDark ? "#1B1B1D" : undefined}
        >

            <GestureHandlerRootView style={{ flexGrow: 1, width: width }}>
                <View style={styles.container}>
                    <View style={styles.sheetHeader}>
                        <ThemedText style={styles.sheetTitle}>Editar foto de perfil</ThemedText>
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
                            onPress={handlePickImage}

                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            ]}>
                                <MaterialCommunityIcons name="image-outline" size={24} color={iconColor} />
                            </View>
                            <ThemedText style={styles.sheetOptionText}>Escolher foto</ThemedText>
                        </RectButton>

                        <RectButton
                            rippleColor="#919191ff"
                            underlayColor="#919191ff"
                            style={styles.sheetOption}
                            onPress={handlePickCamera}

                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                            ]}>
                                <MaterialCommunityIcons name="camera-outline" size={24} color={iconColor} />
                            </View>
                            <ThemedText style={styles.sheetOptionText}>Tirar foto</ThemedText>
                        </RectButton>

                        <RectButton rippleColor="#919191ff"
                            underlayColor="#919191ff"
                            style={styles.sheetOption}
                            onPress={handleRemoveImage}

                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: 'rgba(229, 57, 53, 0.1)' }
                            ]}>
                                <MaterialCommunityIcons name="trash-can-outline" size={24} color={deleteColor} />
                            </View>
                            <ThemedText style={[styles.sheetOptionText, { color: deleteColor }]}>
                                Apagar foto
                            </ThemedText>
                        </RectButton>
                    </View>
                </View>
            </GestureHandlerRootView>
        </TrueSheet>
    );
};

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