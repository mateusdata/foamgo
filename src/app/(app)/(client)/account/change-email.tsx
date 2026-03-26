import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet } from 'react-native'
import { z } from 'zod'


type FormData = z.infer<typeof schema>;

const schema = z.object({
  email: z.string()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Digite um email válido" })
    .max(50, { message: "Email deve ter no máximo 50 caracteres" })
    .trim(),
  password: z.string()
    .min(1, { message: "Senha é obrigatória para confirmar a alteração" }),
})

export default function ChangeEmail() {
  const { user, refreshUser, login } = useAuth()  
  const [loading, setLoading] = useState(false)
  
  const defaultValues = { 
    email: user?.email || '',
  password: '', 
  }

  const { control, handleSubmit, setError, formState: { errors, } } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {    
    if (!user?.email) {     
      return;
    }

    setLoading(true)
    try {            
      await login(user.email, data.password)
                  
      await api.patch('/users', {
        email: data.email
      })
            
      await refreshUser()
    
      router.back()

    } catch (error: any) {     
      if (error?.response?.status === 401) {        
        setError('password', { message: 'Senha incorreta. Tente novamente.' })
        return
      }     
    
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
       

        <PaperInput
          name="email"
          control={control}
          label="Novo e-mail"
          keyboardType="email-address"
          error={errors?.email?.message}          
          autoFocus={true}
        />

        <PaperInput
          name="password"
          control={control}
          label="Sua senha atual"
        secureTextEntry 
          error={errors?.password?.message}          
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
    padding: 0,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
    lineHeight: 22,
  },
});