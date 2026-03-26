import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from "@hookform/resolvers/zod"
import { router, useNavigation } from 'expo-router'
import React, { useEffect } from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet, ScrollView, Alert, View } from 'react-native'
import { z } from 'zod'

export default function companyAddress() {
    const { user, refreshUser } = useAuth()
    const [loading, setLoading] = React.useState(false)
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: user?.company?.addresses ? 'Editar Endereço' : 'Adicionar Endereço'
        });
    }, [navigation]);

    const company = user?.company
    const address = company?.addresses

    const addressSchema = z.object({
        street: z.string().min(1, { message: "Rua é obrigatória" }).trim(),
        city: z.string().trim().optional().or(z.literal("")),
        state: z.string().trim().optional().or(z.literal("")),
        zipCode: z.string().trim().optional().or(z.literal("")),
    })

    type AddressFormValues = z.infer<typeof addressSchema>

    const { control, handleSubmit, setError, formState: { errors } } = useForm<AddressFormValues>({
        defaultValues: {
            street: address?.street || '',
            city: address?.city || '',
            state: address?.state || '',
            zipCode: address?.zipCode || '',
        },
        resolver: zodResolver(addressSchema),
    })

    const onSubmit = async (data: AddressFormValues) => {
        try {
            setLoading(true)

            if (address?.id) {

                await api.patch(`/addresses/${address.id}`, data)
                //Alert.alert('Sucesso', 'Endereço atualizado!')
            } else {

                await api.post('/addresses', { ...data })
                //Alert.alert('Sucesso', 'Endereço salvo!')
            }

            await refreshUser()
            router.back()
        } catch (error: any) {
            setError("street", {
                message: error?.response?.data?.message || 'Erro ao salvar endereço. Tente novamente.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                <ThemedView style={styles.formContainer}>
                    <PaperInput
                        name="street"
                        control={control}
                        label="Endereço"
                        error={errors?.street?.message}
                    />

                    <PaperInput
                        name="city"
                        control={control}
                        label="Cidade"
                        error={errors?.city?.message}
                    />

                    <View style={styles.row}>
                        <View style={styles.flex1}>
                            <PaperInput
                                name="state"
                                control={control}
                                label="Estado/UF"
                                error={errors?.state?.message}
                            />
                        </View>
                        <View style={styles.flex1}>
                            <PaperInput
                                name="zipCode"
                                control={control}
                                label="CEP"
                                keyboardType="numeric"
                                error={errors?.zipCode?.message}
                            />
                        </View>
                    </View>

                    <PrimaryButton
                        loading={loading}
                        name={address ? 'Atualizar' : 'Salvar'}
                        onPress={handleSubmit(onSubmit)}
                    />
                </ThemedView>
            </ScrollView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1, marginTop: 18 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 30, paddingHorizontal: 20 },
    formContainer: { flex: 1, paddingHorizontal: 20, gap: 16 },
    row: { flexDirection: 'row', gap: 12 },
    flex1: { flex: 1 },
});