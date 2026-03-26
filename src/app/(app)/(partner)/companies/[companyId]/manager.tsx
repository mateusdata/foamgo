import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import React from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { z } from 'zod'
import { Colors } from '@/constants/theme'

export default function Manager() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const company = user?.company

  const defaultValues = {
    name: company?.name || '',
    phone: company?.phone || '',
    description: company?.description || '',
    googleMapLink: company?.googleMapLink || '',
    pixKey: company?.pixKey || '',
  }

  const schema = z.object({
    name: z.string()
      .min(1, { message: "Nome é obrigatório" })
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
      .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
      .trim(),
    phone: z.string()
      .trim()
      .optional().or(z.literal("")),
    description: z.string()
      .max(500, { message: "Descrição deve ter no máximo 500 caracteres" })
      .trim()
      .optional().or(z.literal("")),
    googleMapLink: z.string()
      .url({ message: "Por favor, insira um link válido." })
      .trim()
      .optional().or(z.literal("")),
    pixKey: z.string()
      .max(100, { message: "Chave PIX muito longa" })
      .trim()
      .optional().or(z.literal("")),
  })

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setLoading(true)
      await api.patch(`/companies/${company?.id}`, data)
      //Alert.alert('Sucesso', 'Lava-jato atualizado')
      await refreshUser()
    } catch (error: any) {
      setError("name", {
        message: error?.response?.data?.message || 'Erro ao atualizar lava-jato. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      {/* Envolvemos o conteúdo com KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          <ThemedView style={styles.formContainer}>
            <PaperInput
              name="name"
              control={control}
              label="Nome do Lava-Jato"
              autoCapitalize="words"
              error={errors?.name?.message}
            />

            <PaperInput
              name="phone"
              control={control}
              label="Telefone"
              keyboardType="phone-pad"
              error={errors?.phone?.message}
            />

            <PaperInput
              name="description"
              control={control}
              label="Descrição"
              keyboardType="default"
              error={errors?.description?.message}
            />

            <PaperInput
              name="googleMapLink"
              control={control}
              label="Link do Google Maps"
              error={errors?.googleMapLink?.message}
              keyboardType="default"
            />

            <PaperInput
              name="pixKey"
              control={control}
              label="Chave PIX"
              error={errors?.pixKey?.message}
            />

            <PrimaryButton
              loading={loading}
              name='Salvar'
              onPress={handleSubmit(onSubmit)}
            />
          </ThemedView>

          {/* Seção de Endereço Simplificada */}
          <ThemedView style={styles.addressSection}>
            <ThemedView style={styles.addressHeader}>
              <ThemedText style={styles.sectionTitle}>Endereço</ThemedText>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => router.push({
                  pathname: '/companies/[companyId]/address',
                  params: { companyId: user!.company!.id }
                })}
              >
                <ThemedText style={styles.toggleButtonText}>
                  {company?.addresses ? 'Editar' : 'Adicionar'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {company?.addresses ? (
              <ThemedView darkColor='#2A2A2A' lightColor='#f9f9f9' style={styles.addressInfo}>
                <ThemedText style={styles.addressText}>{company.addresses.street}</ThemedText>
                <ThemedText style={styles.addressText}>
                  {company.addresses.city && company.addresses.state &&
                    `${company.addresses.city}, ${company.addresses.state}`}
                </ThemedText>
                {company.addresses.zipCode && (
                  <ThemedText style={styles.addressText}>CEP: {company.addresses.zipCode}</ThemedText>
                )}
              </ThemedView>
            ) : (
              <ThemedView style={styles.noAddressInfo}>
                <ThemedText style={styles.noAddressText}>
                  Nenhum endereço cadastrado
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  )
}


const styles = StyleSheet.create({
  container: { flex: 1, },
  scrollView: { flex: 1, marginTop: 18 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 30 },
  formContainer: { flex: 1, paddingHorizontal: 20, marginBottom: 30, gap: 16 },
  addressSection: { paddingHorizontal: 20, marginBottom: 30 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  toggleButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  toggleButtonText: { color: 'white', fontWeight: '600' },
  addressInfo: { padding: 16, borderRadius: 12, gap: 4 },
  noAddressInfo: { padding: 16, borderRadius: 12, alignItems: 'center' },
  noAddressText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  addressText: { fontSize: 14, },
});