import { PrimaryButton } from '@/components/buttons/primary-button';
import PaperInput from '@/components/inputs/paper-input';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/config/api';
import { useAuth } from '@/contexts/auth-provider';
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useForm } from "react-hook-form";
import { Alert, StyleSheet } from 'react-native';
import { z } from 'zod';

export default function CreateCompany() {
    const { login, refreshUser } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const { email, password, authType } = useLocalSearchParams<{ email: string; password?: string; authType?: string }>();

    const schema = z.object({
        name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
    });

    const { control, handleSubmit, setError, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: { name: string }) => {
        try {
            setLoading(true);
            await api.post('/companies', {
                name: data.name,
                email: email
            });

            if (authType === 'google' || authType === 'apple') {
                await refreshUser();
                router.replace('/home');
            } else {
                await login(email, password!);
            }

        } catch (error: any) {
            console.log(error.response.data);
            Alert.alert('Erro', 'Não foi possível criar o lava jato. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
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
