import { PrimaryButton } from '@/components/buttons/primary-button'
import PaperInput from '@/components/inputs/paper-input'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { StyleSheet, View, TouchableOpacity, Alert, useColorScheme, ScrollView } from 'react-native'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'
import { FilterButton } from '@/components/filter-button'

type Service = {
  id: string
  name: string
  durationMinutes: number
  price: number
  description: string
  categoryId: string
}

type ServiceCategory = {
  id: string
  name: string
}

export default function Services() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>()
  const [services, setServices] = useState<Service[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const colorScheme = useColorScheme() || 'light'

  const schema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" })
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    description: z.string().min(1, { message: "Descrição é obrigatória" })
      .min(5, { message: "Descrição deve ter no mínimo 5 caracteres" }),
    price: z.string().optional().refine((val) => {
      if (val === undefined || val === '') {
        return true;
      }
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, { message: "Preço deve ser um número válido" }),
    durationMinutes: z.string().min(1, { message: "Duração é obrigatória" }),
    categoryId: z.string().min(1, { message: "Crie uma categoria" }),
  })

  type FormValues = {
    name: string
    description: string
    price?: string
    durationMinutes: string
    categoryId: string
  }

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      durationMinutes: '60',
      categoryId: '',
    },
    resolver: zodResolver(schema),
  })


  useFocusEffect(
    useCallback(() => {
      fetchData(companyId)

    }, [companyId])
  )

  const fetchData = async (companyId: string) => {
    try {
      const response = await api.get(`/services?companyId=${companyId}`)
      const categoriesResponse = await api.get(`/categories?companyId=${companyId}`)
      setServiceCategories(categoriesResponse.data)
      setServices(response.data)


      if (categoriesResponse.data.length > 0 && !selectedCategory) {
        const firstCategory = categoriesResponse.data[0]
        setSelectedCategory(firstCategory.id)
        setValue('categoryId', firstCategory.id)
      }
    } catch (error) {
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      const serviceData = {
        name: data.name,
        companyId: companyId,
        durationMinutes: parseInt(data.durationMinutes),
        price: data.price ? parseFloat(data.price) : null,
        description: data.description,
        categoryId: selectedCategory
      }

      if (editingService) {

        await api.patch(`/services/${editingService.id}`, serviceData)
      } else {
        console.log(JSON.stringify(serviceData, null))
        await api.post('/services', serviceData)
      }

      resetForm()
      fetchData(companyId)
    } catch (error) {
      Alert.alert('Erro', editingService ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    reset()
    setSelectedCategory('')
    setShowForm(false)
    setEditingService(null)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setShowForm(true)
    setSelectedCategory(service.categoryId)


    setValue('name', service.name)
    setValue('description', service.description)
    setValue('price', service.price ? service.price.toString() : '')
    setValue('durationMinutes', service.durationMinutes?.toString())
    setValue('categoryId', service.categoryId)
  }

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Excluir Serviço',
      `Tem certeza que deseja excluir o serviço "${service.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteService(service.id),
        },
      ]
    )
  }

  const deleteService = async (serviceId: string) => {
    try {
      await api.delete(`/services/${serviceId}`)
      fetchData(companyId)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao excluir serviço')
    }
  }

  const handleAddNew = () => {
    if (showForm) {
      resetForm()
    } else {
      setEditingService(null)
      reset()
      setShowForm(true)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Categoria não encontrada'
  }

  const formatPrice = (price: number) => {
    return price?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${remainingMinutes}min`
  }

  return (
    <ThemedScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Serviços Cadastrados </ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNew}
        >
          <Ionicons
            name={showForm ? "close" : "add"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formContainer}>
          <ThemedText style={styles.formTitle}>
            {editingService ? 'Editar Serviço' : 'Criar Novo Serviço'}
          </ThemedText>

          <PaperInput
            name="name"
            control={control}
            label="Nome do Serviço"
            autoCapitalize="words"
            error={errors?.name?.message}
          />

          <PaperInput
            name="description"
            control={control}
            label="Descrição"
            multiline
            stringOfLines={3}
            error={errors?.description?.message}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <PaperInput
                name="price"
                control={control}
                label="Preço (R$)"
                keyboardType="numeric"
                error={errors?.price?.message}

              />
            </View>
            <View style={styles.halfWidth}>
              <PaperInput
                name="durationMinutes"
                control={control}
                label="Duração (min)"
                keyboardType="numeric"
                editable={false}
                error={errors?.durationMinutes?.message}
              />
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '500', color: '#666', flex: 1, flexShrink: 1, marginRight: 8 }}>Categoria</ThemedText>
              <TouchableOpacity onPress={() => router.push({ pathname: '/companies/[companyId]/categories', params: { companyId } })}>
                <ThemedText style={{ color: Colors.primary || '#4285F4', fontSize: 14, fontWeight: '600', flexShrink: 0, right: 8 }}>+ Criar Nova</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
              {serviceCategories.map((category) => (
                <FilterButton
                  key={category.id}
                  label={category.name}
                  isActive={selectedCategory === category.id}
                  onPress={() => {
                    setSelectedCategory(category.id)
                    setValue('categoryId', category.id)
                  }}
                />
              ))}
            </ScrollView>
            {errors?.categoryId && (
              <ThemedText style={styles.errorText}>
                {errors.categoryId.message}
              </ThemedText>
            )}
          </View>

          <PrimaryButton
            loading={loading}
            name={editingService ? 'Atualizar Serviço' : 'Criar Serviço'}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      )}


      {!showForm && (
        <View style={styles.servicesContainer}>


          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="car-outline"
                size={48}
                color={colorScheme === 'light' ? '#C0C0C0' : '#666'}
              />
              <ThemedText style={styles.emptyText}>
                Nenhum serviço cadastrado
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Toque no botão + para criar seu primeiro serviço
              </ThemedText>
            </View>
          ) : (
            services.map((service) => (
              <TouchableOpacity key={service.id} activeOpacity={0.7}>
                <View style={[
                  styles.serviceCard,
                  {
                    backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E',
                  }
                ]}>
                  <View style={styles.cardContent}>
                    <View style={styles.serviceMain}>
                      <View style={styles.serviceInfo}>
                        <ThemedText style={styles.serviceName}>
                          {service.name}
                        </ThemedText>
                      </View>

                      <View style={styles.serviceMetadata}>
                        <View style={styles.metadataItem}>
                          <Ionicons
                            name="wallet-outline"
                            size={16}
                            color={colorScheme === 'light' ? '#666' : '#999'}
                          />
                          <ThemedText style={styles.metadataText}>
                            {service.price ? formatPrice(service.price) : 'R$ 0,00'}
                          </ThemedText>
                        </View>

                        <View style={styles.metadataItem}>
                          <Ionicons
                            name="pricetag-outline"
                            size={16}
                            color={colorScheme === 'light' ? '#666' : '#999'}
                          />
                          <ThemedText style={styles.metadataText}>
                            {getCategoryName(service.categoryId)}
                          </ThemedText>
                        </View>
                      </View>
                    </View>

                    <View style={styles.serviceActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleEditService(service)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="pencil"
                          size={20}
                          color={Colors.primary || '#4285F4'}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDeleteService(service)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#FF4757"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </ThemedScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 20, },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  addButton: {
    backgroundColor: Colors.primary || '#4285F4', width: 45, height: 45, borderRadius: 24, right: 12,
    justifyContent: 'center', alignItems: 'center'
  },
  formContainer: { borderRadius: 16, padding: 0, marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  pickerContainer: { marginBottom: 16 },
  pickerLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#666' },
  categoriesContainer: { flexDirection: 'row', gap: 8, paddingRight: 20 },
  categoryChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  categoryText: { fontSize: 14, fontWeight: '500' },
  errorText: { color: '#FF4757', fontSize: 12, marginTop: 4 },
  servicesContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '500', marginTop: 16, color: '#666' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 4, textAlign: 'center' },
  serviceCard: {
    borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardContent: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  serviceMain: { flex: 1 },
  serviceInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  serviceName: { fontSize: 17, fontWeight: '600', flex: 1, marginRight: 12 },
  servicePrice: { fontSize: 17, fontWeight: 'bold', color: Colors.primary || '#4285F4' },
  serviceMetadata: { flexDirection: 'row', gap: 16 },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metadataText: { fontSize: 12, color: '#666' },
  serviceActions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  actionBtn: { padding: 8 },
});
