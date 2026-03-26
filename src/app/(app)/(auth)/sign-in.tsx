import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import React from 'react'
import { useForm } from "react-hook-form"
import { Image, Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native'
import { z } from 'zod'

import { configGoogleSignin } from '@/config/signinGoogle'
import { FontAwesome } from '@expo/vector-icons'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
GoogleSignin.configure(configGoogleSignin);

export default function SignIn() {
  const { login, signInWithGoogle, signInWithApple } = useAuth()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const defaultValues = { email: __DEV__ ? 'parceiro@gmail.com' : '', password: __DEV__ ? '123456' : '' }
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [appleLoading, setAppleLoading] = React.useState(false)

  const schema = z.object({
    email: z.string().email({ message: "E-mail inválido" }).trim().toLowerCase(),
    password: z.string().min(1, { message: "Senha é obrigatória" })
      .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  })

  const { watch, control, setError, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });


  const loginGoogle = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (error) {
      //console.log(error);
    } finally {
      setGoogleLoading(false);
    }
  };



  const loginApple = async (credential: any) => {
    try {
      setAppleLoading(true);
      await signInWithApple(credential);
    } catch (error) {
      console.log(error);
    } finally {
      setAppleLoading(false);
    }
  };




  const onSubmit = async (data: { email: string, password: string }) => {
    try {
      setLoading(true)
      await login(data!.email, data?.password)
    } catch (error: unknown | any) {
      if (error?.status === 401) {
        return setError("password", { message: "Usuario ou senha incorretos" })
      }
      else if (error?.status === 404) {
        return setError("email", { message: "Conta não encontrada" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.welcomeText}>
        Bem-vindo(a) de volta!
      </ThemedText>

      <ThemedView style={styles.formContainer}>
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

        <PrimaryButton
          loading={loading}
          name='Entrar'
          onPress={handleSubmit(onSubmit)}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <ThemedText style={styles.dividerText}>ou</ThemedText>
          <View style={styles.divider} />
        </View>

        <ThemedView style={{ gap: 10 }}>

          <PrimaryButton

            onPress={loginGoogle}
            loading={googleLoading}
            icon={() => <Image source={require('@/assets/images/google.png')} style={{ width: 15, height: 15, marginRight: 1 }} />}
            buttonColor={isDark ? Colors.dark.cardBackground : '#4a4e57f1'}
            textColor={Colors.dark.text}
            name='Entrar com Google'
          />

          {Platform.OS === 'ios' && <PrimaryButton

            onPress={loginApple}
            loading={appleLoading}
            icon={() => <FontAwesome name="apple" size={18} color="white" style={{ marginRight: 1 }} />}
            buttonColor={"black"}
            textColor={Colors.dark.text}
            name='Entrar com Apple'
          />}
        </ThemedView>


        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          style={styles.forgotPasswordContainer}
        >
          <ThemedText style={styles.forgotPasswordText}>
            Esqueceu a senha?
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.registerContainer}>
          <ThemedText style={styles.registerText}>
            Não tem uma conta?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <ThemedText style={styles.registerLink}>
              Criar conta
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
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
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: Colors.primary || '#4285F4',
    borderRadius: 25,
    paddingVertical: 5,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    borderRadius: 100,
    paddingVertical: 7,
    marginTop: 5,
  },

  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: Colors.primary || '#4285F4',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary || '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
});