import { Alert, Pressable, StyleSheet, View, ActivityIndicator, useColorScheme } from 'react-native';
import React, { useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/config/api';
import { Colors } from '@/constants/theme';
import { Haptics } from '@/utils/Haptics';
import { useAuth } from '@/contexts/auth-provider';
import { AvatarPickerSheet } from './sheets/avatar-picker-sheet';
import { ThemedText } from './themed-text';

export default function AvatarUser() {
    const { user, refreshUser } = useAuth();
    const sheet = useRef<any>(null);
    const [loading, setLoading] = useState(false);


    const openSheet = () => {
        sheet.current?.present();
    };
 

    const handleUploadImage = async (selectedImageUri: string) => {
        
       
        try {
            setLoading(true);

            const formData: any = new FormData();
            formData.append('avatar', {
                uri: selectedImageUri,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            });

            await api.put(`/users/avatar`, formData);

            await refreshUser();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.3,
            });            
            if (!result.canceled && result.assets?.[0]?.uri) {
               
                await handleUploadImage(result.assets[0].uri);
            }
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
        }
    };

    const pickCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permissão necessária',
                    'Habilite o acesso à câmera nas configurações do dispositivo.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.3,
            });              
            if (!result.canceled && result.assets?.[0]?.uri) {
                await handleUploadImage(result.assets[0].uri);
            }
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível abrir a câmera. Tente novamente.');
        }
    };

    const removeImage = async () => {
        try {
            setLoading(true);                
            await api.delete('/users/avatar');
            await refreshUser();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', 'Não foi possível remover a foto. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const confirmRemoveImage = () => {
        if (!user?.avatar) {
            Alert.alert('Atenção', 'Você não possui foto de perfil.');
            return;
        }

        Alert.alert(
            'Apagar foto de perfil',
            'Tem certeza que deseja apagar a foto de perfil?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Apagar', onPress: removeImage, style: 'destructive' },
            ]
        );
    };

    const renderAvatar = () => {
        if (user?.avatar) {
            return <Avatar.Image size={130} source={{ uri: user.avatar }} />;
        }

        return (
            <Avatar.Text
                size={130}
                label={user?.name?.[0]?.toUpperCase() || '?'}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                    {renderAvatar()}

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size={50} color={Colors.primary} />
                        </View>
                    )}

                    <Pressable
                        onPress={openSheet}
                        style={styles.cameraButton}
                        disabled={loading}
                    >
                        <MaterialCommunityIcons name="camera" size={22} color="white" />
                    </Pressable>
                </View>

                <ThemedText style={styles.userName}>{user?.name}</ThemedText>
            </Pressable>

            <AvatarPickerSheet
                sheetRef={sheet}
                onPickImage={pickImage}
                onPickCamera={pickCamera}
                onRemoveImage={confirmRemoveImage}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 0,
    },
    avatarContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    avatarWrapper: {
        position: 'relative',
        width: 130,
        height: 130,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 65,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
});