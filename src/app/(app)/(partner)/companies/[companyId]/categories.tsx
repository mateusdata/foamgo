import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet, View, TouchableOpacity, Alert, useColorScheme } from 'react-native'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'

type Category = {
  id: string
  name: string
  type: 'SERVICE' | 'PRODUCT'
  description: string
  companyId: string
}

const schema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" })
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
  description: z.string().optional().or(z.literal("")),
  type: z.enum(['SERVICE', 'PRODUCT']).default('SERVICE'),
})

type FormValues = z.input<typeof schema>

export default function Categories() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const colorScheme = useColorScheme() || 'light'

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      type: 'SERVICE',
    },
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/categories?companyId=${companyId}`)
      setCategories(response.data)
    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Erro ao carregar categorias')
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      const categoryData = {
        name: data.name,
        companyId: companyId,
        description: data.description,
        type: data.type
      }

      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, categoryData)
      } else {
        await api.post('/categories', categoryData)
      }

      resetForm()
      fetchCategories()
    } catch (error) {
      Alert.alert('Erro', editingCategory ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    reset()
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
    setValue('name', category.name)
    setValue('description', category.description || '')
    setValue('type', category.type)
  }

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Excluir Categoria',
      `Tem certeza que deseja excluir "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${category.id}`)
              fetchCategories()
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir categoria')
            }
          }
        },
      ]
    )
  }

  return (
    <ThemedScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Categorias</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (showForm) resetForm()
            else setShowForm(true)
          }}
        >
          <Ionicons name={showForm ? "close" : "add"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showForm ? (
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </ThemedText>

          <PaperInput
            name="name"
            control={control}
            label="Nome da Categoria"
            autoCapitalize="words"
            error={errors?.name?.message}
          />

          <PaperInput
            name="description"
            control={control}
            label="Descrição (Opcional)"
            multiline
            error={errors?.description?.message}
          />

          <PrimaryButton
            loading={loading}
            name={editingCategory ? 'Salvar' : 'Criar'}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>Nenhuma categoria cadastrada</ThemedText>
            </View>
          ) : (
            categories.map((category) => (
              <View key={category.id} style={[
                styles.card,
                { backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E' }
              ]}>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle}>{category.name}</ThemedText>
                  <ThemedText style={styles.cardSubtitle}>{category.type === 'SERVICE' ? 'Serviço' : 'Produto'}</ThemedText>
                  {category.description && (
                    <ThemedText style={styles.cardDescription}>{category.description}</ThemedText>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => handleEditCategory(category)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteCategory(category)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF4757" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ThemedScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: {
    backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', elevation: 2
  },
  formContainer: { gap: 16 },
  formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  listContainer: { gap: 12, paddingBottom: 40 },
  card: {
    borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#666', marginTop: 2, textTransform: 'uppercase' },
  cardDescription: { fontSize: 14, color: '#888', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 12, marginLeft: 10 },
  actionBtn: { padding: 8 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { color: '#888', fontSize: 16 }
})