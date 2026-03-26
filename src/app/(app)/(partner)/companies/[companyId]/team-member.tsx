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
import { StyleSheet, View, TouchableOpacity, Alert, useColorScheme, Share } from 'react-native'
import { z } from 'zod'
import { Ionicons } from '@expo/vector-icons'

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

const schema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    role: z.enum(['MANAGER', 'MEMBER', 'TRAINER']).default('MEMBER'),
})

type FormValues = z.input<typeof schema>

export default function TeamMemberScreen() {
    const { teamId, action, companyId } = useLocalSearchParams<{ teamId: string, action?: string, companyId: string }>()
    const [team, setTeam] = useState<Team | null>(null)
    const [companyName, setCompanyName] = useState('')
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const colorScheme = useColorScheme() || 'light'

    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            role: 'MEMBER',
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        if (action === 'add') {
            setShowForm(true)
        }
        fetchTeam()
        fetchCompany()
    }, [teamId, action, companyId])

    const fetchCompany = async () => {
        try {
            const res = await api.get(`/companies/${companyId}`)
            setCompanyName(res.data.name)
        } catch (e) { console.log('Erro ao buscar empresa', e) }
    }

    const fetchTeam = async () => {
        try {

            const response = await api.get(`/teams/${teamId}`)
            setTeam(response.data)
        } catch (error) {
            console.error(error)
            Alert.alert('Erro', 'Erro ao carregar time')
        }
    }

    const onSubmit = async (data: FormValues) => {
        setLoading(true)
        try {
            let userId: string | null = null
            let isNewUser = false


            try {
                const userRes = await api.post('/users', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                })
                userId = userRes.data.id
                isNewUser = true
            } catch (error: any) {
                if (error.response?.status === 409) {
                    try {
                        const usersRes = await api.get('/users')
                        const existingUser = usersRes.data.find((u: User) => u.email === data.email)

                        if (existingUser) {
                            userId = existingUser.id
                            isNewUser = false
                        } else {
                            Alert.alert('Erro', 'O e-mail já está em uso, mas não foi possível encontrar o usuário.')
                            return
                        }
                    } catch (findError) {
                        console.log('Erro ao buscar usuário existente', findError)
                        Alert.alert('Erro', 'Falha ao verificar usuário existente.')
                        return
                    }
                } else {
                    console.log('Erro ao criar usuário', error)
                    Alert.alert('Erro', error.response?.data?.message || 'Erro ao criar usuário.')
                    return
                }
            }

            if (!userId) {
                Alert.alert('Erro', 'Não foi possível obter o ID do usuário.')
                return
            }


            try {
                await api.post('/team-members', {
                    userId,
                    teamId,
                    role: data.role
                })



                let message = ''
                if (isNewUser) {
                    message = `Você foi adicionado ao ${companyName || 'Lavajato'}.\n\nPara acessar seu app:\nNome: ${data.name}\nEmail: ${data.email}\nSenha: ${data.password}\n\nBaixe o app e entre!`
                } else {
                    message = `Você foi adicionado ao ${companyName || 'Lavajato'}.\n\nComo você já tinha uma conta, use sua senha atual.\nEmail: ${data.email}`
                }

                Alert.alert(
                    'Sucesso',
                    isNewUser ? 'Usuário criado e adicionado!' : 'Usuário existente adicionado!',
                    [
                        {
                            text: 'Compartilhar Acesso',
                            onPress: () => Share.share({ message })
                        },
                        { text: 'OK' }
                    ]
                )

                fetchTeam()
                resetForm()

            } catch (teamError: any) {
                console.log('Erro ao adicionar membro ao time', teamError.response?.data)

                if (teamError.response?.status === 409) {
                    Alert.alert('Atenção', 'Este usuário já está vinculado a este time (conflito de registro).')
                } else {
                    Alert.alert('Erro', teamError.response?.data?.message || 'Erro ao adicionar membro ao time.')
                }
            }

        } catch (error) {
            console.error("Erro geral onSubmit", error)
            Alert.alert('Erro', 'Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        reset()
        setShowForm(false)
    }

    const handleDeleteMember = (member: TeamMember) => {
        Alert.alert(
            'Remover Membro',
            `Deseja remover "${member.user.name}" do time?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/team-members/${member.id}`)
                            fetchTeam()
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao remover membro')
                        }
                    }
                }
            ]
        )
    }

    return (
        <ThemedScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>{team?.name || 'Carregando...'}</ThemedText>
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
                    <ThemedText style={styles.formTitle}>Novo Membro</ThemedText>

                    <PaperInput
                        name="name"
                        control={control}
                        label="Nome"
                        autoCapitalize="words"
                        error={errors?.name?.message}
                    />

                    <PaperInput
                        name="email"
                        control={control}
                        label="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors?.email?.message}
                    />

                    <PaperInput
                        name="password"
                        control={control}
                        label="Senha"
                        secureTextEntry
                        error={errors?.password?.message}
                    />

                    <PrimaryButton
                        loading={loading}
                        name="Adicionar ao Time"
                        onPress={handleSubmit(onSubmit)}
                    />
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {!team?.members || team.members.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color="#ccc" />
                            <ThemedText style={styles.emptyText}>Nenhum membro neste time</ThemedText>
                        </View>
                    ) : (
                        team.members.map((member) => (
                            <View key={member.id} style={[
                                styles.card,
                                { backgroundColor: colorScheme === 'light' ? 'white' : '#1E1E1E' }
                            ]}>
                                <View style={styles.cardContent}>
                                    <ThemedText style={styles.cardTitle}>{member.user.name}</ThemedText>
                                    <ThemedText style={styles.cardSubtitle}>{member.user.email}</ThemedText>
                                    <ThemedText style={styles.roleText}>{member.role}</ThemedText>
                                </View>
                                <TouchableOpacity onPress={() => handleDeleteMember(member)} style={styles.actionBtn}>
                                    <Ionicons name="trash-outline" size={20} color="#FF4757" />
                                </TouchableOpacity>
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
    cardSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
    roleText: { fontSize: 10, color: Colors.primary, marginTop: 4, fontWeight: 'bold' },
    actionBtn: { padding: 8 },
    emptyState: { alignItems: 'center', marginTop: 60, gap: 10 },
    emptyText: { color: '#888', fontSize: 16 }
})