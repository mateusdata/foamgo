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
import { StyleSheet, View, TouchableOpacity, Alert, useColorScheme, FlatList } from 'react-native'
import { z } from 'zod'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { ThemedView } from '@/components/themed-view'
import { router } from 'expo-router'

type User = {
  id: string
  name: string
  email: string
}

type TeamMember = {
  id: string
  userId: string
  teamId: string
  role: 'MANAGER' | 'MEMBER' | 'TRAINER'
  user: User
}

type Team = {
  id: string
  name: string
  members?: TeamMember[]
}

export default function Teams() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)


  /* Removed managingTeam, showMemberForm, availableUsers state */

  const colorScheme = useColorScheme() || 'light'


  const teamSchema = z.object({
    name: z.string().min(1, { message: "Nome é obrigatório" })
      .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
  })

  type TeamFormValues = {
    name: string
  }

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TeamFormValues>({
    defaultValues: { name: '' },
    resolver: zodResolver(teamSchema),
  })


  /* Removed MemberFormValues and member schema */


  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      console.log("CompanyId", companyId)
      const response = await api.get(`/teams?companyId=${companyId}`)

      setTeams(response.data)
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar times')
    }
  }

  const onSubmitTeam = async (data: TeamFormValues) => {
    try {
      setLoading(true)
      if (editingTeam) {
        await api.patch(`/teams/${editingTeam.id}`, data)
      } else {
        await api.post('/teams', data)
      }
      resetForm()
      fetchTeams()
    } catch (error) {
      Alert.alert('Erro', editingTeam ? 'Erro ao atualizar time' : 'Erro ao criar time')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    reset()
    setShowForm(false)
    setEditingTeam(null)
  }

  const handleDataEdit = (team: Team) => {
    setEditingTeam(team)
    setShowForm(true)
    setValue('name', team.name)
  }

  const handleDeleteTeam = (team: Team) => {
    Alert.alert('Excluir Time', `Deseja excluir "${team.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/teams/${team.id}`)
            fetchTeams()
          } catch (e) { Alert.alert('Erro', 'Não foi possível excluir o time') }
        }
      }
    ])
  }





  const goToAddMember = (team: Team) => {
    router.push({
      pathname: '/companies/[companyId]/team-member',
      params: { companyId, teamId: team.id, action: 'add' }
    })
  }

  const goToMembers = (team: Team) => {
    router.push({
      pathname: '/companies/[companyId]/team-member',
      params: { companyId, teamId: team.id }
    })
  }

  return (
    <ThemedScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Gerenciar Times</ThemedText>
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
            {editingTeam ? 'Editar Time' : 'Novo Time'}
          </ThemedText>

          <PaperInput
            name="name"
            control={control}
            label="Nome do Time"
            autoCapitalize="words"
            error={errors?.name?.message}
          />

          <PrimaryButton
            loading={loading}
            name={editingTeam ? 'Salvar' : 'Criar'}
            onPress={handleSubmit(onSubmitTeam)}
          />
        </View>
      ) : (
        <View style={styles.listContainer}>
          {teams.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>Nenhum time cadastrado</ThemedText>
            </View>
          ) : (
            teams.map((team) => (
              <View key={team.id} style={[
                styles.card,
                { backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E' }
              ]}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader} onTouchStart={() => goToMembers(team)}>
                    <ThemedText style={styles.cardTitle}>{team.name}</ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => goToMembers(team)}>
                    <ThemedText style={styles.cardSubtitle}>
                      Gerenciar membros
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => goToAddMember(team)} style={styles.actionBtn}>
                    <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDataEdit(team)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteTeam(team)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF4757" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}


      {/* Removed Modal */}

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
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  actionBtn: { padding: 8 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { color: '#888', fontSize: 16 },
})