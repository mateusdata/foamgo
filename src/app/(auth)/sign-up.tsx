
import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect } from 'react'
import { useForm } from "react-hook-form"
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

export default function SignUp() {
  const { login } = useAuth()
  const [loading, setLoading] = React.useState(false)
  
  // Pega a flag e normaliza para uppercase (CLIENT ou PARTNER)
  const { role } = useLocalSearchParams<{ role: string }>()
  const userRole = role?.toUpperCase() || 'CLIENT'
  const isPartner = userRole === 'PARTNER'

    const navigation = useNavigation();
    useEffect(() => {
      const isPartner = role?.toUpperCase() === 'PARTNER';
      
      // Altera as opções do header dinamicamente
      navigation.setOptions({
        headerTitle: isPartner ? 'Conta do Parceiro' : 'Conta do Cliente'
      });
    }, [role, navigation]);

  // Schema de validação dinâmico
  const schema = z.object({
    name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    email: z.string().email({ message: "E-mail inválido" }).trim().toLowerCase(),
    password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
    companyName: z.string().optional()
  }).superRefine((data, ctx) => {
    // Exige o nome do lava jato apenas se for parceiro
    if (isPartner && (!data.companyName || data.companyName.trim().length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome do Lava Jato é obrigatório",
        path: ["companyName"]
      });
    }
  });

  type FormValues = z.infer<typeof schema>;

  const { watch, control, setError, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', email: '', password: '', companyName: '' },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: userRole,
        ...(isPartner && { companyName: data.companyName }) // Envia companyName só se for parceiro
      }

      const response = await api.post('/users', userData)

      if (response?.status === 201) {
        await login(data.email, data.password)
        // O _layout.tsx já vai interceptar o login e mandar pra aba certa baseada na role!
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
      <ThemedScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60 }}>
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.welcomeText}>
            {isPartner ? 'Criar Conta Parceiro' : 'Criar Conta Cliente'}
          </ThemedText>

          <PaperInput name="name" control={control} label="Nome Completo" autoCapitalize="words" error={errors?.name?.message} />
          <PaperInput name="email" control={control} label="E-mail" keyboardType="email-address" autoCapitalize="none" error={errors?.email?.message} />
          <PaperInput name="password" control={control} label="Senha" showPasswordToggle={true} watch={watch} error={errors?.password?.message} />

          {/* Renderiza o input de Lava Jato condicionalmente */}
          {isPartner && (
            <PaperInput
              name="companyName"
              control={control}
              label="Nome do Lava Jato"
              autoCapitalize="words"
              error={errors?.companyName?.message}
            />
          )}

          <PrimaryButton loading={loading} name='Criar Conta' onPress={handleSubmit(onSubmit)} />

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>Já tem uma conta?{' '}</ThemedText>
            <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/sign-in", params: { role } })}>
              <ThemedText style={styles.loginLink}>Entrar</ThemedText>
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