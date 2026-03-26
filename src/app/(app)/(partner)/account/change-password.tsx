import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { useAuth } from '@/contexts/auth-provider'
import { zodResolver } from "@hookform/resolvers/zod"
import { router } from 'expo-router'
import React from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet } from 'react-native'
import { z } from 'zod'

export default function ChangePassword() {
  const { user, login } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const defaultValues = {
    currentPassword: '',
    newPassword: ''
  }

  const schema = z.object({
    currentPassword: z.string()
      .min(1, { message: "Senha atual é obrigatória" })
      .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
    newPassword: z.string()
      .min(1, { message: "Nova senha é obrigatória" })
      .min(6, { message: "Nova senha deve ter no mínimo 6 caracteres" })
      .max(50, { message: "Nova senha deve ter no máximo 50 caracteres" })
  })

  const { watch, control, setError, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { currentPassword: string, newPassword: string }) => {
    try {
      const checkPassword = await login(user!.email, data.currentPassword)
      if (checkPassword) {
        await api.patch(`/users/${user?.id}`, {
          password: data.newPassword
        })
        router.back()
      }
    } catch (error: any) {
      if (error.status === 401) {
        setError("currentPassword", { message: "Senha atual incorreta" })
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <PaperInput
          name="currentPassword"
          control={control}
          label="Senha atual"
          showPasswordToggle={true}
          watch={watch}
          error={errors?.currentPassword?.message}
          placeholder="Digite sua senha atual"
          autoFocus={true}
        />

        <PaperInput
          name="newPassword"
          control={control}
          label="Nova senha"
          showPasswordToggle={true}
          watch={watch}
          error={errors?.newPassword?.message}
          placeholder="Digite sua nova senha"
        />

        <PrimaryButton
          loading={loading}
          name='Salvar'
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
});