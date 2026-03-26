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
import parsePhoneNumberFromString, { isValidPhoneNumber, } from 'libphonenumber-js'

export default function ChangePhone() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = React.useState(false)

  const defaultValues = {
    phone: parsePhoneNumberFromString(user?.phone ?? '', 'BR')?.formatNational() ?? ''
  }

  const schema = z.object({
    phone: z.string()
      .min(1, { message: "Telefone é obrigatório" })
      .refine((value) => {
        const cleanPhone = value.replace(/[\s\(\)\-]/g, '')
        return isValidPhoneNumber(cleanPhone, 'BR')
      }, {
        message: "Telefone inválido. Use o formato: (XX) XXXXX-XXXX"
      })
      .trim()
  })

  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { phone: string }) => {
    try {
      setLoading(true)

      const cleanPhone = data.phone.replace(/[\s\(\)\-]/g, '')

      await api.patch(`/users/${user?.id}`, {
        phone: cleanPhone
      })

      await refreshUser()
      router.back()
    } catch (error: any) {
      setError("phone", {
        message: error?.response?.data?.message || 'Ocorreu um erro ao atualizar o telefone. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <PaperInput
          name="phone"
          control={control}
          keyboardType='phone-pad'
          label="Telefone"
          error={errors?.phone?.message}
          placeholder="(XX) XXXXX-XXXX"
          autoFocus={true}
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