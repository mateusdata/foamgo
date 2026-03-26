import { PrimaryButton } from '@/components/components/buttons/primary-button'
import PaperInput from '@/components/components/inputs/paper-input'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { StyleSheet } from 'react-native'
import { z } from 'zod'

export default function VerifyCode() {
  const [loading, setLoading] = useState(false)
  const { email } = useLocalSearchParams()
  
  const schema = z.object({
    code: z.string().length(6, { message: "O código deve ter 6 dígitos" }).trim(),
  })

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: { code: '' },
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { code: string }) => {
    setLoading(true)
    try {
      if (!email) {
        setError('code', { message: 'Email não encontrado. Reinicie o processo.' })
        router.push('/forgot-password')
        return
      }

      const payload = {
        email: email as string,
        code: data.code,
      }
      
      await api.post("/auth/validate-code", payload)
      
      router.push(`/reset-password?email=${encodeURIComponent(email as string)}&code=${data.code}`)

    } catch (error: any) {
      if (error?.response?.status === 401) {        
        setError('code', { message: 'Código inválido. Verifique o código digitado.' })
        return
      }
      if (error?.response?.status === 400) {        
        setError('code', { message: 'Código expirado. Solicite um novo código.' })
        return
      }      
      const errorMessage = error.response?.data?.message || "Erro ao verificar código. Tente novamente."
      setError('code', { message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.infoText}>
        Digite o código que enviamos para seu e-mail.
      </ThemedText>

      <PaperInput
        name="code"
        focusable={true}
        control={control}
        label="Código"
        keyboardType="numeric"
        maxLength={6}
        error={errors?.code?.message}
      />

      <PrimaryButton 
        name={loading ? 'Verificando...' : 'Verificar Código'} 
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
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})