import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet } from 'react-native'
import { z } from 'zod'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  
  const schema = z.object({
    email: z.string().email({ message: "E-mail inválido" }).trim().toLowerCase(),
  })

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    try {
      const response = await api.post("/auth/send-code", data)
      
      if (response.data) {
        router.push(`/verify-code?email=${encodeURIComponent(data.email)}`)
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setError('email', { message: 'E-mail não encontrado' })
        return
      }
      const errorMessage = error.response?.data?.message || "Erro ao enviar código. Tente novamente."
      setError('email', { message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.infoText}>
        Informe seu e-mail para receber o código de recuperação de senha.
      </ThemedText>

      <PaperInput
        name="email"
        control={control}
        label="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors?.email?.message}
      />
     
      <PrimaryButton 
        name={loading ? 'Enviando...' : 'Enviar Código'} 
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  infoText: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary || '#4285F4',
    borderRadius: 25,
    paddingVertical: 10,
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})