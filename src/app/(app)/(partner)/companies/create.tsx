import { PrimaryButton } from '@/components/buttons/primary-button';
import PaperInput from '@/components/inputs/paper-input';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/config/api';
import { useAuth } from '@/contexts/auth-provider';
import { zodResolver } from "@hookform/resolvers/zod";
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useForm } from "react-hook-form";
import { Alert, StyleSheet } from 'react-native';
import { z } from 'zod';

export default function CreateCompany() {
    const { login, refreshUser, user, logOut } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const { email, password, authType } = useLocalSearchParams<{ email: string; password?: string; authType?: string }>();
    const paramEmail = Array.isArray(email) ? email[0] : email;
    const paramPassword = Array.isArray(password) ? password[0] : password;
    const paramAuthType = Array.isArray(authType) ? authType[0] : authType;
    const targetEmail = paramEmail || user?.email;

    const schema = z.object({
        name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
    });

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const refreshUserWithRetry = async () => {
        let fresh = await refreshUser();
        if (fresh?.role === 'PARTNER') return fresh;

        for (let i = 0; i < 2; i++) {
            await sleep(500);
            fresh = await refreshUser();
            if (fresh?.role === 'PARTNER') return fresh;
        }

        return fresh;
    };

    const onSubmit = async (data: { name: string }) => {
        if (!targetEmail) {
            Alert.alert('Erro', 'Não foi possível identificar o e-mail da conta. Faça login novamente.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/companies', {
                name: data.name,
                email: targetEmail
            });

            const isSocialAuth = paramAuthType === 'google' || paramAuthType === 'apple';

            if (user || isSocialAuth) {
                const freshUser = await refreshUserWithRetry();

                if (freshUser?.role === 'PARTNER') {
                    router.replace('/(app)/(partner)/(tabs)/companies');
                    return;
                }

                Alert.alert(
                    'Sessão atualizada',
                    'Seu Lava Jato foi criado, mas precisamos renovar seu acesso. Faça login novamente como parceiro.',
                    [{
                        text: 'OK',
                        onPress: async () => {
                            await logOut();
                        }
                    }]
                );
                return;
            }

            if (!paramPassword) {
                Alert.alert('Erro', 'Não foi possível concluir o login automaticamente. Entre novamente.');
                return;
            }

            await login(targetEmail, paramPassword, 'partner');

        } catch (error: any) {
            console.log(error?.response?.data || error);
            Alert.alert('Erro', 'Não foi possível criar o lava jato. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ headerShown: true, headerTitle: 'Criar Lava Jato' }} />
            <PaperInput
                name="name"
                control={control}
                label="Nome do Lava Jato"
                error={errors?.name?.message}
            />

            <PrimaryButton
                loading={loading}
                name='Criar Lava Jato'
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    button: {
        marginTop: 20,
    }
});
