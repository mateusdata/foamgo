import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  LocaleConfig
} from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Seus componentes base
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

// Configuração de Idioma
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt-br';
dayjs.locale('pt-br');

// Mock de dados para teste (Já que você não quer importar de fora)
const MOCK_BOOKINGS = [
  { id: '1', scheduledAt: dayjs().set('hour', 10).toISOString(), status: 'CONFIRMED', service: { name: 'Lavagem Completa' }, user: { name: 'João Silva' } },
  { id: '2', scheduledAt: dayjs().set('hour', 14).toISOString(), status: 'COMPLETED', service: { name: 'Ducha Rápida' }, user: { name: 'Maria Souza' } },
  { id: '3', scheduledAt: dayjs().add(1, 'day').set('hour', 9).toISOString(), status: 'CANCELLED', service: { name: 'Polimento' }, user: { name: 'Carlos Alberto' } },
];

export default function ExploreCalendarScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const handleItemPress = (id: string) => {
    Alert.alert('Agendamento', `ID: ${id}\nEm desenvolvimento`);
  };

  // Processamento dos itens para o formato da Agenda
  const agendaItems = useMemo(() => {
    const groups: any = {};
    MOCK_BOOKINGS.forEach(booking => {
      const date = dayjs(booking.scheduledAt).format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(booking);
    });
    return Object.keys(groups).map(date => ({ title: date, data: groups[date] }));
  }, []);

  const theme = {
    calendarBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    dayTextColor: isDark ? '#FFFFFF' : '#2d4150',
    monthTextColor: isDark ? '#FFFFFF' : '#2d4150',
    selectedDayBackgroundColor: '#007AFF',
    todayTextColor: '#007AFF',
    arrowColor: '#007AFF',
    dotColor: '#007AFF',
    agendaKnobColor: isDark ? '#3A3A3C' : '#E5E5EA',
  };

  const renderItem = ({ item }: any) => {
    const time = dayjs(item.scheduledAt).format('HH:mm');
    const statusColor = item.status === 'CONFIRMED' ? '#66BB6A' : item.status === 'COMPLETED' ? '#42A5F5' : '#EF5350';

    return (
      <TouchableOpacity 
        style={[styles.itemCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        onPress={() => handleItemPress(item.id)}
      >
        <View style={styles.itemHeader}>
          <ThemedText type="smallBold">{time}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]} />
        </View>
        <ThemedText type="defaultSemiBold">{item.user.name}</ThemedText>
        <ThemedText type="small" style={{ opacity: 0.6 }}>{item.service.name}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <CalendarProvider date={dayjs().format('YYYY-MM-DD')}>
        <AgendaList
          sections={agendaItems}
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={() => (
            <View style={{ paddingTop: insets.top + Spacing.two }}>
              <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
                    <TouchableOpacity 
                      key={s} 
                      onPress={() => setSelectedStatus(s)}
                      style={[styles.filterBtn, selectedStatus === s && styles.filterBtnActive]}
                    >
                      <ThemedText style={[styles.filterText, selectedStatus === s && { color: '#FFF' }]}>
                        {s === 'ALL' ? 'Todos' : s}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <ExpandableCalendar 
                theme={theme} 
                firstDay={1}
                hideKnob={false}
              />
            </View>
          )}
          sectionStyle={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#3A3A3C' }]}
        />
      </CalendarProvider>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#8E8E9322',
  },
  filterBtnActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 }
    })
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  }
});