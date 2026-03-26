import { PrimaryButton } from '@/components/buttons/primary-button'
import { ThemedScrollView } from '@/components/themed-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { api } from '@/config/api'
import { Colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal
} from 'react-native'
import { FilterButton } from '@/components/filter-button'

interface Team { id: string; name: string }
interface DaySchedule {
  dayOfWeek: number
  enabled: boolean
  startTime: string
  endTime: string
  hasBreak: boolean
  breakStart: string
  breakEnd: string
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Segunda' }, { id: 2, name: 'Terça' }, { id: 3, name: 'Quarta' },
  { id: 4, name: 'Quinta' }, { id: 5, name: 'Sexta' }, { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' },
]

const DEFAULT_SCHEDULE: DaySchedule = {
  dayOfWeek: 1,
  enabled: false,
  startTime: '08:00',
  endTime: '18:00',
  hasBreak: true,
  breakStart: '12:00',
  breakEnd: '13:00'
}

export default function TeamScheduleScreen() {
  const { companyId } = useLocalSearchParams<{ companyId: string }>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [showPicker, setShowPicker] = useState(false)
  const [pickerMode, setPickerMode] = useState<'startTime' | 'endTime' | 'breakStart' | 'breakEnd'>('startTime')
  const [pickerDayIndex, setPickerDayIndex] = useState(0)
  const [pickerDate, setPickerDate] = useState(new Date())
  const [tempTime, setTempTime] = useState<Date | null>(null)

  useEffect(() => {
    if (companyId) fetchTeams()
    setSchedules(DAYS_OF_WEEK.map(day => ({ ...DEFAULT_SCHEDULE, dayOfWeek: day.id, enabled: false })))
  }, [companyId])

  useEffect(() => {
    if (selectedTeam) fetchTeamSchedule(selectedTeam)
  }, [selectedTeam])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/teams?companyId=${companyId}`)
      setTeams(response.data)
      if (response.data.length > 0) setSelectedTeam(response.data[0].id)
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os times.')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamSchedule = async (teamId: string) => {
    try {
      const response = await api.get(`/availabilities?companyId=${companyId}&teamId=${teamId}&isActive=false`)
      const slots = response.data || []

      if (slots.length === 0) {
        setSchedules(DAYS_OF_WEEK.map(day => ({ ...DEFAULT_SCHEDULE, dayOfWeek: day.id, enabled: false })))
        return
      }

      const dayGroups: { [key: number]: any[] } = {}
      slots.forEach((s: any) => {
        const dId = Number(s.dayOfWeek)
        if (!dayGroups[dId]) dayGroups[dId] = []
        dayGroups[dId].push(s)
      })

      const loadedSchedules = DAYS_OF_WEEK.map(day => {
        const dSlots = (dayGroups[day.id] || []).filter((s: any) => s.isActive)
        if (dSlots.length === 0) return { ...DEFAULT_SCHEDULE, dayOfWeek: day.id, enabled: false }

        dSlots.sort((a: any, b: any) => a.time.localeCompare(b.time))
        const startTime = dSlots[0].time

        // Calculate duration based on first two slots, default to 60 mins
        let duration = 60
        if (dSlots.length > 1) {
          const t1 = timeToMinutes(dSlots[0].time)
          const t2 = timeToMinutes(dSlots[1].time)
          duration = t2 - t1
        }

        const lastSlotStart = timeToMinutes(dSlots[dSlots.length - 1].time)
        const endTime = minutesToTime(lastSlotStart + duration)

        let hasBreak = false
        let bStart = '12:00'
        let bEnd = '13:00'

        for (let i = 0; i < dSlots.length - 1; i++) {
          const c = timeToMinutes(dSlots[i].time)
          const n = timeToMinutes(dSlots[i + 1].time)
          if (n - c > duration) {
            hasBreak = true
            bStart = minutesToTime(c + duration)
            bEnd = dSlots[i + 1].time
            break
          }
        }

        return {
          dayOfWeek: day.id,
          enabled: true,
          startTime,
          endTime,
          hasBreak,
          breakStart: bStart,
          breakEnd: bEnd
        }
      })

      setSchedules(loadedSchedules)
    } catch (e) {
      console.error(e)
    }
  }

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const toggleDay = (idx: number) => {
    const newS = [...schedules]
    newS[idx].enabled = !newS[idx].enabled
    setSchedules(newS)
  }

  const toggleBreak = (idx: number) => {
    const newS = [...schedules]
    newS[idx].hasBreak = !newS[idx].hasBreak
    setSchedules(newS)
  }

  const openTimePicker = (idx: number, mode: 'startTime' | 'endTime' | 'breakStart' | 'breakEnd') => {
    const val = schedules[idx][mode]
    const [h, m] = val.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    setPickerDate(d)
    setPickerDayIndex(idx)
    setPickerMode(mode)
    setShowPicker(true)
  }

  const onTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      if (date) {
        setTempTime(date)
      }
    } else {
      setShowPicker(false)
      if (event.type === 'set' && date) {
        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        const newS = [...schedules]
        newS[pickerDayIndex][pickerMode] = time
        setSchedules(newS)
      }
    }
  }

  const confirmTimeIOS = () => {
    const dateToUse = tempTime || pickerDate
    const time = `${dateToUse.getHours().toString().padStart(2, '0')}:${dateToUse.getMinutes().toString().padStart(2, '0')}`
    const newS = [...schedules]
    newS[pickerDayIndex][pickerMode] = time
    setSchedules(newS)
    setShowPicker(false)
    setTempTime(null)
  }

  const saveSchedule = async () => {
    if (!selectedTeam) return

    const enabled = schedules.filter(s => s.enabled)
    // Removida validação - agora permite desativar todos os slots

    setSaving(true)
    try {
      const payload = {
        companyId,
        teamId: selectedTeam,
        schedules: enabled.map(sch => ({
          dayOfWeek: sch.dayOfWeek,
          startTime: sch.startTime,
          endTime: sch.endTime,
          hasBreak: sch.hasBreak,
          breakStart: sch.hasBreak ? sch.breakStart : undefined,
          breakEnd: sch.hasBreak ? sch.breakEnd : undefined,
          maxSlots: 1
        }))
      }

      await api.post('/availabilities/bulk', payload)
      // Alert.alert('Sucesso', 'Horários salvos para este time.')
    } catch (e: any) {
      console.error(e.response?.data)
      Alert.alert('Erro', e.response?.data?.message || 'Falha ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <ThemedText style={{ marginTop: 16, opacity: 0.6 }}>Carregando...</ThemedText>
      </ThemedView>
    )
  }

  if (teams.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <Ionicons name="people-outline" size={48} color={isDark ? '#555' : '#CCC'} />
        <ThemedText style={{ marginTop: 16, fontSize: 16, opacity: 0.6 }}>Nenhum time cadastrado</ThemedText>
        <ThemedText style={{ marginTop: 8, fontSize: 14, opacity: 0.4, textAlign: 'center', paddingHorizontal: 40 }}>
          Crie times primeiro para configurar horários
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Horários</ThemedText>
          <ThemedText style={styles.subtitle}>Configuração por equipe</ThemedText>
        </View>

        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamsScroll}>
            {teams.map(t => (
              <FilterButton
                key={t.id}
                label={t.name}
                isActive={selectedTeam === t.id}
                onPress={() => setSelectedTeam(t.id)}
              />
            ))}
          </ScrollView>
        </View>

        {schedules.map((sch, idx) => (
          <View
            key={DAYS_OF_WEEK[idx].id}
            style={[styles.dayCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
          >
            <View style={styles.dayHeader}>
              <TouchableOpacity style={styles.dayToggle} onPress={() => toggleDay(idx)}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: sch.enabled ? Colors.primary : 'transparent',
                      borderColor: sch.enabled ? Colors.primary : (isDark ? '#444' : '#DDD')
                    }
                  ]}
                >
                  {sch.enabled && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </View>
                <ThemedText style={[styles.dayName, { opacity: sch.enabled ? 1 : 0.5 }]}>
                  {DAYS_OF_WEEK[idx].name}
                </ThemedText>
              </TouchableOpacity>
              {!sch.enabled && <ThemedText style={styles.closedLabel}>Folga</ThemedText>}
            </View>

            {sch.enabled && (
              <View style={styles.timeConfig}>
                <View style={styles.timeRow}>
                  <View style={styles.timeGroup}>
                    <ThemedText style={styles.timeLabel}>Início</ThemedText>
                    <TouchableOpacity
                      style={[styles.timeButton, { backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                      onPress={() => openTimePicker(idx, 'startTime')}
                    >
                      <ThemedText style={styles.timeValue}>{sch.startTime}</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.timeGroup}>
                    <ThemedText style={styles.timeLabel}>Fim</ThemedText>
                    <TouchableOpacity
                      style={[styles.timeButton, { backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                      onPress={() => openTimePicker(idx, 'endTime')}
                    >
                      <ThemedText style={styles.timeValue}>{sch.endTime}</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.breakToggle} onPress={() => toggleBreak(idx)}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: sch.hasBreak ? Colors.primary : 'transparent',
                        borderColor: sch.hasBreak ? Colors.primary : (isDark ? '#444' : '#DDD')
                      }
                    ]}
                  >
                    {sch.hasBreak && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <ThemedText style={styles.breakLabel}>Possui intervalo</ThemedText>
                </TouchableOpacity>

                {sch.hasBreak && (
                  <View style={styles.timeRow}>
                    <View style={styles.timeGroup}>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                        onPress={() => openTimePicker(idx, 'breakStart')}
                      >
                        <ThemedText style={styles.timeValue}>{sch.breakStart}</ThemedText>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.timeGroup}>
                      <TouchableOpacity
                        style={[styles.timeButton, { backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                        onPress={() => openTimePicker(idx, 'breakEnd')}
                      >
                        <ThemedText style={styles.timeValue}>{sch.breakEnd}</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ThemedScrollView>

      <View
        style={[
          styles.floatingFooter,
          { backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
        ]}
      >
        <PrimaryButton
          name={saving ? 'Salvando...' : 'Salvar Expediente'}
          onPress={saveSchedule}
          disabled={saving}
          loading={saving}
        />
      </View>

      {showPicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={() => {
            setShowPicker(false)
            setTempTime(null)
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => {
                  setShowPicker(false)
                  setTempTime(null)
                }}>
                  <ThemedText style={{ color: Colors.primary, fontSize: 16 }}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmTimeIOS}>
                  <ThemedText style={{ color: Colors.primary, fontSize: 16, fontWeight: '600' }}>Confirmar</ThemedText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime || pickerDate}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                is24Hour={true}
                textColor={isDark ? '#FFF' : '#000'}
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS !== 'ios' && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
          is24Hour={true}
        />
      )}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  header: { paddingVertical: 24 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, opacity: 0.5, marginTop: 4 },
  section: { marginBottom: 20 },
  teamsScroll: { paddingBottom: 8 },
  dayCard: { borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayToggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  dayName: { fontSize: 16, fontWeight: '600' },
  closedLabel: { fontSize: 12, fontWeight: '600', color: '#FF5252' },
  timeConfig: { marginTop: 16, gap: 12 },
  timeRow: { flexDirection: 'row', gap: 10 },
  timeGroup: { flex: 1 },
  timeLabel: { fontSize: 11, fontWeight: '700', opacity: 0.4, marginBottom: 6, textTransform: 'uppercase' },
  timeButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timeValue: { fontSize: 15, fontWeight: '700' },
  breakToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  breakLabel: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
  floatingFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
})