import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

// Usei o Ionicons porque vi no seu código, mas se não quiser 
// nenhuma lib, pode substituir por um caractere de texto como "•" ou ">"
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PartnerHome() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Cores dinâmicas para simular o seu ThemedView
  const themeContainer = isDark ? '#000000' : '#F2F2F7';
  const themeCard = isDark ? '#1C1C1E' : '#FFFFFF';
  const themeText = isDark ? '#FFFFFF' : '#000000';
  const themeSubText = '#8E8E93';

  const ActionCard = ({ title, subtitle, icon }: any) => (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: themeCard }]}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconWrapper, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: themeText }]}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeContainer }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header Simples */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Mateus</Text>
            <Text style={[styles.companyName, { color: themeText }]}>Foam GO Partner</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
             <Ionicons name="notifications-outline" size={24} color={themeText} />
          </TouchableOpacity>
        </View>

        {/* Card de Estatísticas */}
        <View style={[styles.mainStatsCard, { backgroundColor: themeCard }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: themeText }]}>12</Text>
              <Text style={styles.statLabel}>Agendamentos Hoje</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: themeText }]}>R$ 1.250,00</Text>
              <Text style={styles.statLabel}>Receita do Mês</Text>
            </View>
          </View>
        </View>

        {/* Seção de Acesso Rápido */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeText }]}>Acesso Rápido</Text>
          
          <ActionCard 
            title="Gerenciar Times" 
            subtitle="Equipes e colaboradores" 
            icon="people-outline" 
          />
          <ActionCard 
            title="Serviços" 
            subtitle="Catálogo e preços" 
            icon="construct-outline" 
          />
          <ActionCard 
            title="Lava Jato" 
            subtitle="Configurações do negócio" 
            icon="business-outline" 
          />
          <ActionCard 
            title="Disponibilidade" 
            subtitle="Horários de atendimento" 
            icon="time-outline" 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  companyName: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  notificationBtn: {
    padding: 8,
  },
  mainStatsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    // Sombra leve para Android/iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
});