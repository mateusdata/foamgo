import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'

import { useForm } from "react-hook-form"
import { Colors } from '@/constants/theme'
import { api } from '@/config/api'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Alert } from 'react-native'
import { useAuth } from '@/contexts/auth-provider'
import { ThemedView } from '@/components/themed-view'
import PaperInput from '@/components/inputs/paper-input'
import { PrimaryButton } from '@/components/buttons/primary-button'

export default function ChangeName() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const defaultValues = {
    name: user?.name || ''
  }

  const schema = z.object({
    name: z.string()
      .min(1, { message: "Nome é obrigatório" })
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
      .max(50, { message: "Nome deve ter no máximo 50 caracteres" })
      .trim(),
  })

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { name: string }) => {
    try {
      setLoading(true)

      // Requisição PATCH para atualizar o nome
      await api.patch('/users', {
        name: data.name
      })

      // Chama a função para atualizar os dados do usuário no contexto
      await refreshUser()
      router.back()
    } catch (error: any) {    
      setError("name", { message: error?.response?.data?.message || 'Ocorreu um erro ao atualizar o nome. Tente novamente.' })

    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>


      <ThemedView style={styles.formContainer}>
        <PaperInput
          name="name"
          control={control}
          label="Nome completo"
          autoCapitalize="words"
          error={errors?.name?.message}
          placeholder="Digite seu nome completo"
          autoFocus={true}
        />

        <PrimaryButton
          loading={loading}
          name='Salvar alterações'
          onPress={handleSubmit(onSubmit)}
        />


      </ThemedView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    marginTop: 60,
  },
  formContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },

});