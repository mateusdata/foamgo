import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
    LocaleConfig,
    CalendarProvider,
    ExpandableCalendar,
    AgendaList,
    CalendarContext
} from 'react-native-calendars';
import { Colors } from '@/constants/theme';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { FilterButton } from '@/components/filter-button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan.', 'Fev.', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul.', 'Ago', 'Set.', 'Out.', 'Nov.', 'Dez.'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
    today: "Hoje"
};
LocaleConfig.defaultLocale = 'pt-br';
dayjs.locale('pt-br');

export type Booking = {
    id: string
    scheduledAt: string
    status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string
    carService?: { name: string, price: string | number }
    service?: { name: string, price: string | number }
    carWash?: { name: string }
    company?: { name: string }
    user?: { name: string, avatar?: string }
    team?: { name: string, id?: string }
    carName?: string
    vehicle?: { model?: string, make?: string, year?: number | string }
}

type BookingCalendarProps = {
    bookings: any[];
    refreshing?: boolean;
    onRefresh?: () => void;
    onItemPress?: (id: string) => void;
    filterStatus?: 'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;
    selectedStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ALL';
    onStatusChange: (status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ALL') => void;
};

const STATUS_FILTERS: { label: string; value: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ALL' }[] = [
    { label: 'Confirmados', value: 'CONFIRMED' },
    { label: 'Concluídos', value: 'COMPLETED' },
    { label: 'Cancelados', value: 'CANCELLED' },
];

const CustomTodayButton = () => {
    const context = React.useContext(CalendarContext);
    const isToday = context?.date === dayjs().format('YYYY-MM-DD');

    const onPress = useCallback(() => {
        const today = dayjs().format('YYYY-MM-DD');
        context?.setDate(today, 'todayPress' as any);
    }, [context]);

    if (isToday) return null;

    return (
        <TouchableOpacity style={styles.todayButton} onPress={onPress}>
            <Ionicons name="calendar" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <ThemedText style={styles.todayButtonText}>Hoje</ThemedText>
        </TouchableOpacity>
    );
};

export const BookingCalendar = ({ 
    bookings, 
    refreshing, 
    onRefresh, 
    onItemPress, 
    filterStatus = 'ALL',
    selectedStatus,
    onStatusChange 
}: BookingCalendarProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [limit, setLimit] = React.useState(9);

    React.useEffect(() => {
        setLimit(9);
    }, [filterStatus]);

    const items = useMemo(() => {
        const newItems: { [key: string]: Booking[] } = {};

        const filteredBookings = bookings.filter(b => {
            if (!filterStatus || filterStatus === 'ALL') return true;
            return b.status === filterStatus;
        });

        filteredBookings.forEach(booking => {
            const date = dayjs(booking.scheduledAt).format('YYYY-MM-DD');
            if (!newItems[date]) {
                newItems[date] = [];
            }
            newItems[date].push(booking);
        });
        return newItems;
    }, [bookings, filterStatus]);

    const visibleSections = useMemo(() => {
        const sortedDates = Object.keys(items).sort();
        const visibleDates = sortedDates.slice(0, limit);
        return visibleDates.map(date => ({ title: date, data: items[date] }));
    }, [items, limit]);

    const markedDates = useMemo(() => {
        const dates: any = {};
        Object.keys(items).forEach(date => {
            dates[date] = { marked: true, dotColor: Colors.primary };
        });
        return dates;
    }, [items]);

    const renderItem = (item: Booking) => {
        const serviceName = item.service?.name || item.carService?.name || 'Serviço';
        const titleName = item.user?.name || item.company?.name || item.carWash?.name || 'Cliente/Empresa';
        const time = dayjs(item.scheduledAt).format('HH:mm');
        const teamName = item.team?.name || 'Equipe';

        const statusColor = item.status === 'CONFIRMED' ? '#66BB6A' :
            item.status === 'COMPLETED' ? '#42A5F5' : '#EF5350';

        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderLeftColor: Colors.primary
                    }
                ]}
                onPress={() => onItemPress?.(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.itemHeader}>
                    <ThemedText style={styles.itemTime}>{time}</ThemedText>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>

                <ThemedText style={styles.itemTitle}>{titleName}</ThemedText>
                <ThemedText style={styles.itemSubtitle}>{serviceName + ' - ' + teamName}</ThemedText>
            </TouchableOpacity>
        );
    };

    const theme = useMemo(() => ({
        backgroundColor: isDark ? '#000000' : '#FFFFFF',
        calendarBackground: isDark ? '#1C1C1E' : '#FFFFFF',
        textSectionTitleColor: isDark ? '#AAAAAA' : '#b6c1cd',
        textSectionTitleDisabledColor: isDark ? '#444444' : '#d9e1e8',
        dayTextColor: isDark ? '#FFFFFF' : '#2d4150',
        textDisabledColor: isDark ? '#444444' : '#d9e1e8',
        monthTextColor: isDark ? '#FFFFFF' : '#2d4150',
        selectedDayBackgroundColor: Colors.primary,
        selectedDayTextColor: '#ffffff',
        todayTextColor: Colors.primary,
        dotColor: Colors.primary,
        selectedDotColor: '#ffffff',
        arrowColor: Colors.primary,
        disabledArrowColor: isDark ? '#444444' : '#d9e1e8',
        agendaKnobColor: isDark ? '#555555' : '#F2F2F7',
    }), [isDark]);

    // ===== HEADER QUE ROLA JUNTO =====
    const ListHeaderComponent = useCallback(() => (
    <View style={{ paddingTop: 10 }}>
        {/* Filtros */}
        <View style={styles.filtersContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.statusFilterScrollView}
            >
                {STATUS_FILTERS.map((filter) => (
                    <FilterButton
                        key={filter.value}
                        label={filter.label}
                        isActive={selectedStatus === filter.value}
                        onPress={() => onStatusChange(filter.value)}
                    />
                ))}
            </ScrollView>
        </View>

        {/* Calendário */}
        <ExpandableCalendar
            markedDates={markedDates}
            theme={theme}
            firstDay={1}
            renderArrow={(direction) => (
                <Ionicons
                    name={direction === 'left' ? "chevron-back" : "chevron-forward"}
                    size={20}
                    color={Colors.primary}
                />
            )}
        />
    </View>
    ), [selectedStatus, markedDates, theme, onStatusChange]);

    return (
        <ThemedView style={styles.container}>
            <CalendarProvider
                key={colorScheme}
                date={dayjs().format('YYYY-MM-DD')}
                theme={theme}
            >
                <AgendaList
                    // ===== HEADER QUE ROLA =====
                    ListHeaderComponent={ListHeaderComponent}
                    
                    // ===== LISTA =====
                    sections={visibleSections}
                    renderItem={({ item }) => renderItem(item as Booking)}
                    onEndReached={() => setLimit(l => l + 9)}
                    onEndReachedThreshold={0.5}
                    
                    // ===== NADA FICA FIXO! =====
                    stickySectionHeadersEnabled={false}
                    
                    sectionStyle={StyleSheet.flatten([
                        styles.section,
                        {
                            backgroundColor: 'transparent',
                            color: isDark ? '#AAAAAA' : '#555555'
                        }
                    ])}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyData}>
                            <Ionicons name="calendar-outline" size={48} color={isDark ? '#555' : '#CCC'} />
                            <ThemedText style={styles.emptyDataText}>Nenhum agendamento encontrado</ThemedText>
                        </View>
                    )}
                />
                <CustomTodayButton />
            </CalendarProvider>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filtersContainer: { 
        paddingVertical: 12, 
        paddingHorizontal: 16,
        backgroundColor: 'transparent'
    },
    statusFilterScrollView: { 
        paddingVertical: 4 
    },
    item: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        borderLeftWidth: 4,
        justifyContent: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        justifyContent: 'space-between'
    },
    itemTime: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2
    },
    itemSubtitle: {
        fontSize: 12,
        opacity: 0.6
    },
    emptyData: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100
    },
    emptyDataText: {
        marginTop: 10,
        fontSize: 16,
        opacity: 0.6
    },
    section: {
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingVertical: 8,
        textTransform: 'capitalize'
    },
    todayButton: {
        position: 'absolute',
        bottom: 26,
        right: 20,
        zIndex: 100,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    todayButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14
    }
});
