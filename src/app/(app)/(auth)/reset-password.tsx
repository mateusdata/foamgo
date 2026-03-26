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

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const { email, code } = useLocalSearchParams()
  
  const schema = z.object({
    password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirmação deve ter no mínimo 6 caracteres" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    setLoading(true)
    try {
      if (!email || !code) {
        setError('password', { message: 'Dados não encontrados. Reinicie o processo.' })
        router.push('/forgot-password')
        return
      }

      const payload = {
        email: email as string,
        code: code as string,
        password: data.password
      }

      const response = await api.post("/auth/change-password", payload)
         router.push('/sign-in')
    
     
   
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setError('password', { message: 'Código inválido. Verifique o código digitado.' })
        return
      }
      if (error?.response?.status === 400) {
        setError('password', { message: 'Código expirado. Reinicie o processo de recuperação.' })
        return
      }
      const errorMessage = error.response?.data?.message || "Erro ao alterar senha. Tente novamente."
      setError('password', { message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.infoText}>
        Defina sua nova senha.
      </ThemedText>

      <PaperInput
        name="password"
        control={control}
        label="Nova Senha"
        secureTextEntry
        error={errors?.password?.message}
      />

      <PaperInput
        name="confirmPassword"
        control={control}
        label="Confirmar Senha"
        secureTextEntry
        error={errors?.confirmPassword?.message}
      />
      
      <PrimaryButton 
        name={loading ? 'Redefinindo...' : 'Redefinir Senha'} 
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