
import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React from 'react'
import { useForm } from "react-hook-form"
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

export default function SignUp() {
  const { login } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const schema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" })
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    email: z.string().email({ message: "E-mail inválido" }).trim().toLowerCase(),
    password: z.string().min(1, { message: "Senha é obrigatória" })
      .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
    companyName: z.string().min(1, { message: "Nome o lava jato é obrigatório" })
      .min(2, { message: "Nome o lava jato deve ter no mínimo 2 caracteres" }),

  })

  type FormValues = {
    name: string;
    email: string;
    password: string;
    companyName: string;

  };

  const { watch, control, setError, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      companyName: '',

    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      // 1. Criar usuário primeiro
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'PARTNER',
        companyName: data.companyName
      }

      const response = await api.post('/users', userData)

      if (response?.status === 201) {
        await login(data.email, data.password)
      }


    } catch (error: any) {
      if (error?.response?.status === 409) {
        setError('email', { message: 'E-mail já está em uso' })
        return
      }
      setError('email', { message: 'Erro ao criar conta' })


    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ThemedScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60 }}
      >
        <ThemedView style={styles.formContainer}>

          <PaperInput
            name="name"
            control={control}
            label="Nome Completo"
            autoCapitalize="words"
            error={errors?.name?.message}
          />

          <PaperInput
            name="email"
            control={control}
            label="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors?.email?.message}
          />

          <PaperInput
            name="password"
            control={control}
            label="Senha"
            showPasswordToggle={true}
            watch={watch}
            error={errors?.password?.message}
          />



          <PaperInput
            name="companyName"
            control={control}
            label="Nome do lava Jato"
            autoCapitalize="words"
            error={errors?.companyName?.message}
          />



          <PrimaryButton
            loading={loading}
            name='Criar Conta de Parceiro'
            onPress={handleSubmit(onSubmit)}
          />

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>
              Já tem uma conta?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <ThemedText style={styles.loginLink}>
                Entrar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ThemedScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
    color: Colors.primary || '#4285F4',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary || '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
});