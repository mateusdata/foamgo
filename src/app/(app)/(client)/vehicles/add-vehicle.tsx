import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { api } from '@/config/api'
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"

import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { router, Stack, useFocusEffect, useNavigation } from 'expo-router'
import { useAuth } from '@/contexts/auth-provider'
import { ThemedView } from '@/components/themed-view'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedText } from '@/components/themed-text'
import { PrimaryButton } from '@/components/buttons/primary-button'

type Vehicle = {
    id: string
    make: string
    model: string
    year: number
    plate: string
    color: string
}

const schema = z.object({
    make: z.string()
        .min(1, { message: "Marca é obrigatória" })
        .max(50, { message: "Marca deve ter no máximo 50 caracteres" }),
    model: z.string()
        .min(1, { message: "Modelo é obrigatório" })
        .max(50, { message: "Modelo deve ter no máximo 50 caracteres" }),
    year: z.string()
        .min(4, { message: "Ano inválido" })
        .max(4, { message: "Ano inválido" })
        .regex(/^\d{4}$/, { message: "Ano deve conter apenas números" })
        .refine((val) => {
            const yearNum = parseInt(val)
            return yearNum >= 1900 && yearNum <= 2026
        }, { message: "Ano deve estar entre 1900 e 2026" }),
   
    
})

type FormData = z.infer<typeof schema>

export default function AddVehicle() {
    const { user } = useAuth()
    const colorScheme = useColorScheme()
    const [loading, setLoading] = useState(false)
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [loadingVehicles, setLoadingVehicles] = useState(true)

    const defaultValues = {
        make: '',
        model: '',
        year: '',
    }

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
        defaultValues,
        resolver: zodResolver(schema),
    })





    const fetchVehicles = async () => {
        try {
            setLoadingVehicles(true)
            const response = await api.get(`/vehicles/me`)
            setVehicles(response.data)
        } catch (error) {
        } finally {
            setLoadingVehicles(false)
        }
    }

    useEffect(() => {
        fetchVehicles()
    }, [])

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true)

            const payload = {
                make: data.make,
                model: data.model,
                year: parseInt(data.year),
                userId: user?.id
            }

            if (editingVehicle) {
                await api.patch(`/vehicles/${editingVehicle.id}`, payload)
                router.push("/(app)/(client)/(tabs)/companies")
            } else {
                await api.post(`/vehicles`, payload)
                router.push("/(app)/(client)/(tabs)/companies")

            }

            reset()
            setEditingVehicle(null)
            await fetchVehicles()
        } catch (error: any) {
            Alert.alert('Erro', 'Ocorreu um erro. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        setValue('make', vehicle.make)
        setValue('model', vehicle.model)
        setValue('year', vehicle.year.toString())
    }

    const handleDelete = (vehicleId: string) => {
        Alert.alert(
            'Excluir veículo',
            'Tem certeza que deseja excluir este veículo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/vehicles/${vehicleId}`)
                            await fetchVehicles()
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o veículo.')
                        }
                    }
                }
            ]
        )
    }

    const handleCancelEdit = () => {
        setEditingVehicle(null)
        reset()
    }

    const isDark = colorScheme === 'dark'


    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: editingVehicle ? 'Editar Veículo' : 'Adicionar Veículo', animation: "none" }} />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                <ThemedView style={styles.formContainer}>


                    <PaperInput
                        name="make"
                        control={control}
                        label="Marca"
                        error={errors?.make?.message}
                        placeholder="Ex: Volkswagen"
                    />

                    <PaperInput
                        name="model"
                        control={control}
                        label="Modelo"
                        error={errors?.model?.message}
                        placeholder="Ex: Gol"
                    />

                    <PaperInput
                        name="year"
                        control={control}
                        label="Ano"
                        error={errors?.year?.message}
                        placeholder="Ex: 2020"
                        keyboardType="numeric"
                        maxLength={4}
                    />

                   

                    {editingVehicle && (
                        <TouchableOpacity
                            onPress={handleCancelEdit}
                            style={styles.cancelButton}
                        >
                            <ThemedText style={styles.cancelButtonText}>
                                Cancelar
                            </ThemedText>
                        </TouchableOpacity>
                    )}

                    <PrimaryButton
                        loading={loading}
                        name={editingVehicle ? 'Salvar' : 'Adicionar veículo'}
                        onPress={handleSubmit(onSubmit)}
                    />
                </ThemedView>

                {vehicles.length > 0 && (
                    <ThemedView style={styles.vehiclesContainer}>
                        <ThemedText style={styles.vehiclesTitle}>
                            Meus Veículos
                        </ThemedText>

                        {vehicles.map((vehicle) => (
                            <ThemedView
                                key={vehicle.id}
                                style={[
                                    styles.vehicleCard,
                                    { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }
                                ]}
                            >
                                <View style={styles.vehicleInfo}>
                                    <ThemedText style={styles.vehicleBrand}>
                                        {vehicle.make} {vehicle.model}
                                    </ThemedText>
                                    <ThemedText style={styles.vehicleDetails}>
                                        {vehicle.year} • {vehicle.color}
                                    </ThemedText>
                                    <ThemedText style={styles.vehiclePlate}>
                                        {vehicle.plate}
                                    </ThemedText>
                                </View>

                                <View style={styles.vehicleActions}>
                                    <TouchableOpacity
                                        onPress={() => handleEdit(vehicle)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons
                                            name="pencil"
                                            size={20}
                                            color={Colors.primary}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDelete(vehicle.id)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={20}
                                            color="#ff4444"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>
                        ))}
                    </ThemedView>
                )}
            </ScrollView>
        </ThemedView>
    )
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 0 },
    scrollView: { flex: 1 },
    formContainer: { paddingHorizontal: 20, paddingTop: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    cancelButton: { alignItems: 'center', marginTop: 10, marginBottom: 10 },
    cancelButtonText: { color: Colors.primary, fontSize: 14 },
    vehiclesContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 },
    vehiclesTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    vehicleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 12 },
    vehicleInfo: { flex: 1 },
    vehicleBrand: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    vehicleDetails: { fontSize: 14, opacity: 0.7, marginBottom: 4 },
    vehiclePlate: { fontSize: 14, fontWeight: '500', opacity: 0.8 },
    vehicleActions: { flexDirection: 'row', gap: 15 },
    actionButton: { padding: 8 },
});
