import { TrueSheet } from '@lodev09/react-native-true-sheet';
import * as DeviceContacts from 'expo-contacts/legacy';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-provider';
import { api } from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import PaperInput from '@/components/inputs/paper-input';
import { PrimaryButton } from '@/components/buttons/primary-button';
import { Avatar } from 'react-native-paper';

type Contact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isAppUser?: boolean;
  lastBookingDate?: string;
  lastCar?: string;
  avatar?: string;
};

export default function ContactsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'recent'>('all');

  const { control: searchControl, watch: watchSearch } = useForm({
    defaultValues: { search: '' }
  });
  const searchValue = watchSearch('search') || '';

  const { control: contactControl, handleSubmit: handleContactSubmit, reset: resetContact } = useForm({
    defaultValues: { name: '', phone: '' }
  });

  const scheduleSchema = z.object({
    carName: z.string().min(1, 'Nome do carro é obrigatório')
  });

  const { control: scheduleControl, handleSubmit: handleScheduleSubmit, reset: resetSchedule, formState: { errors: scheduleErrors } } = useForm({
    defaultValues: { carName: '' },
    resolver: zodResolver(scheduleSchema)
  });

  const sheetRef = useRef<TrueSheet>(null);
  const newContactSheetRef = useRef<TrueSheet>(null);

  const companyId = user?.activeCompanyId || user?.company?.id;

  const loadContactsAndSync = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      // 1. Tenta carregar do backend primeiro para ter algo na tela rápido
      const response = await api.get(`/contacts?companyId=${companyId}`);
      setContacts(response.data);

      // 2. Pede permissão da agenda automaticamente
      const { status } = await DeviceContacts.requestPermissionsAsync();
      
      // 3. Se deu permissão, faz o sync invisível
      if (status === DeviceContacts.PermissionStatus.GRANTED) {
        const { data } = await DeviceContacts.getContactsAsync({
          fields: [DeviceContacts.Fields.PhoneNumbers, DeviceContacts.Fields.Emails],
        });

        const cleaned = data
          .filter((c) => c.name && c.name.trim().length > 0)
          .map(c => ({
            name: c.name,
            phone: c.phoneNumbers?.[0]?.number,
            email: c.emails?.[0]?.email
          }));

        if (cleaned.length > 0) {
          const syncResponse = await api.post('/contacts/sync', {
            companyId,
            contacts: cleaned
          });
          setContacts(syncResponse.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar/sincronizar contatos:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadContactsAndSync();
  }, [loadContactsAndSync]);

  const handleSyncAgenda = async () => {
    if (!companyId) return;
    setSyncing(true);
    try {
      const { status } = await DeviceContacts.requestPermissionsAsync();
      
      if (status !== DeviceContacts.PermissionStatus.GRANTED) {
        Alert.alert('Permissão Negada', 'Ative a permissão de contatos nas configurações do aplicativo.');
        setSyncing(false);
        return;
      }

      const { data } = await DeviceContacts.getContactsAsync({
        fields: [
          DeviceContacts.Fields.PhoneNumbers,
          DeviceContacts.Fields.Emails,
        ],
      });

      const cleaned = data
        .filter((c) => c.name && c.name.trim().length > 0)
        .map(c => ({
          name: c.name,
          phone: c.phoneNumbers?.[0]?.number,
          email: c.emails?.[0]?.email
        }));

      const response = await api.post('/contacts/sync', {
        companyId,
        contacts: cleaned
      });
      
      setContacts(response.data);
      Alert.alert('Sucesso', 'Contatos sincronizados com sucesso!');
    } catch (err) {
      console.error('Erro ao sincronizar contatos:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao sincronizar os contatos.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateContact = async (data: { name: string, phone: string }) => {
    if (!companyId || !data.name.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }
    try {
      // 1. Salvar no Backend
      await api.post('/contacts', {
        companyId,
        name: data.name,
        phone: data.phone
      });
      
      // 2. Tentar salvar na agenda do celular
      try {
        const { status } = await DeviceContacts.getPermissionsAsync();
        let finalStatus = status;
        
        if (status !== DeviceContacts.PermissionStatus.GRANTED) {
           const { status: newStatus } = await DeviceContacts.requestPermissionsAsync();
           finalStatus = newStatus;
        }

        if (finalStatus === DeviceContacts.PermissionStatus.GRANTED) {
          const newNativeContact: any = {
            contactType: DeviceContacts.ContactTypes.Person,
            name: data.name,
          };
          if (data.phone) {
            newNativeContact.phoneNumbers = [{ label: 'mobile', number: data.phone }];
          }
          await DeviceContacts.addContactAsync(newNativeContact);
        }
      } catch (nativeErr) {
        console.warn('Erro ao salvar na agenda do celular:', nativeErr);
        // Não falhamos a criação no backend por causa disso
      }

      resetContact();
      await newContactSheetRef.current?.dismiss();
      loadContactsAndSync();
    } catch (err: any) {
       Alert.alert('Erro', err.response?.data?.message || 'Erro ao criar contato');
    }
  };

  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (filterMode === 'recent') {
      result = result
        .filter(c => !!c.lastBookingDate)
        .sort((a, b) => new Date(b.lastBookingDate!).getTime() - new Date(a.lastBookingDate!).getTime());
    }

    if (!searchValue.trim()) return result;

    return result.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(searchValue.toLowerCase());
      const phoneMatch = c.phone?.includes(searchValue);
      return nameMatch || phoneMatch;
    });
  }, [searchValue, contacts, filterMode]);

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    resetSchedule();
    await sheetRef.current?.present();
  };

  const handleAgendar = (data: { carName: string }) => {
    if (!companyId || !selectedContact) return;
    sheetRef.current?.dismiss();
    router.push({
      pathname: '/(app)/(client)/companies/[companyId]/booking',
      params: { companyId, contactId: selectedContact.id, carName: data.carName }
    });
  };

  if (loading && contacts.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Agenda de Contatos', headerShown: true }} />
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={styles.loadingText} themeColor="textSecondary">
            Carregando contatos...
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Agenda de Contatos', headerShown: true }} />
      <ThemedView style={styles.container}>
        
        <View style={styles.actionsContainer}>
            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.backgroundElement }]} 
                onPress={() => newContactSheetRef.current?.present()}
            >
                <Ionicons name="person-add" size={20} color={theme.text} />
                <ThemedText style={styles.actionBtnText}>Novo Contato</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.tint }]} 
                onPress={handleSyncAgenda}
                disabled={syncing}
            >
                {syncing ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="sync" size={20} color="#fff" />}
                <Text style={styles.actionBtnTextWhite}>Sincronizar da Agenda</Text>
            </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 }}>
          <TouchableOpacity 
            onPress={() => setFilterMode('all')}
            style={[{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }, filterMode === 'all' ? { backgroundColor: theme.tint } : { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText style={filterMode === 'all' ? { color: '#fff' } : {}}>Todos</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilterMode('recent')}
            style={[{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }, filterMode === 'recent' ? { backgroundColor: theme.tint } : { backgroundColor: theme.backgroundElement }]}
          >
            <ThemedText style={filterMode === 'recent' ? { color: '#fff' } : {}}>Recentes</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <PaperInput
            name="search"
            control={searchControl}
            label="Buscar por nome ou telefone"
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <ThemedView style={styles.centered}>
              <ThemedText style={styles.emptyText} themeColor="textSecondary">
                Nenhum contato encontrado.
              </ThemedText>
            </ThemedView>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.contactRow, { borderBottomColor: theme.cardBorder }]}
              activeOpacity={0.6}
              onPress={() => handleSelectContact(item)}
            >
              {item.avatar ? (
                <Avatar.Image size={48} source={{ uri: item.avatar }} style={[styles.avatar, { backgroundColor: 'transparent' }]} />
              ) : (
                <ThemedView
                  style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}
                >
                  <ThemedText style={styles.avatarText} type="medium">
                    {item.name?.charAt(0).toUpperCase() ?? '?'}
                  </ThemedText>
                </ThemedView>
              )}
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactName}>
                  {item.name} {item.isAppUser && <Ionicons name="phone-portrait-outline" size={14} color={theme.tint} />}
                </ThemedText>
                {item.phone && (
                  <ThemedText style={styles.contactDetail} themeColor="textSecondary">
                    {item.phone}
                  </ThemedText>
                )}
                {item.email && (
                  <ThemedText style={styles.contactDetail} themeColor="textSecondary">
                    {item.email}
                  </ThemedText>
                )}
                {item.lastCar && (
                  <ThemedText style={[styles.contactDetail, { color: theme.tint, marginTop: 2, fontSize: 12 }]} themeColor="textSecondary">
                    <Ionicons name="car-outline" size={12} color={theme.tint} /> Último veículo: {item.lastCar}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          )}
        />

        <TrueSheet
          ref={newContactSheetRef}
          detents={['auto']}
          cornerRadius={24}
          backgroundColor={theme.cardBackground}
        >
            <ThemedView style={styles.modalSheet}>
                <View style={[styles.modalHandle, { backgroundColor: theme.cardBorder }]} />
                <ThemedText style={[styles.modalName, { marginTop: 12, marginBottom: 20 }]}>Adicionar Contato Manual</ThemedText>
                
                <View style={{ paddingHorizontal: 20 }}>
                    <PaperInput
                        name="name"
                        control={contactControl}
                        label="Nome do cliente"
                    />
                    <View style={{ marginTop: 12 }}>
                        <PaperInput
                            name="phone"
                            control={contactControl}
                            label="Telefone (Opcional)"
                            keyboardType="phone-pad"
                        />
                    </View>
                    
                    <View style={{ marginTop: 24 }}>
                        <PrimaryButton 
                            name="Salvar Contato"
                            onPress={handleContactSubmit(handleCreateContact)}
                        />
                    </View>
                </View>
            </ThemedView>
        </TrueSheet>

        <TrueSheet
          ref={sheetRef}
          detents={['auto']}
          cornerRadius={24}
          backgroundColor={theme.cardBackground}
          onDidDismiss={() => setSelectedContact(null)}
        >
          <ThemedView style={styles.modalSheet}>
            <View style={[styles.modalHandle, { backgroundColor: theme.cardBorder }]} />

            {selectedContact && (
              <ScrollView
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedContact.avatar ? (
                  <Avatar.Image size={64} source={{ uri: selectedContact.avatar }} style={[styles.modalAvatar, { backgroundColor: 'transparent' }]} />
                ) : (
                  <ThemedView
                    style={[styles.modalAvatar, { backgroundColor: theme.backgroundElement }]}
                  >
                    <ThemedText style={styles.modalAvatarText}>
                      {selectedContact.name?.charAt(0).toUpperCase() ?? '?'}
                    </ThemedText>
                  </ThemedView>
                )}

                <ThemedText style={styles.modalName}>{selectedContact.name}</ThemedText>
                {selectedContact.phone && (
                  <ThemedText style={styles.modalSubtitle} themeColor="textSecondary">
                    {selectedContact.phone}
                  </ThemedText>
                )}

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalSectionTitle} themeColor="textSecondary">
                    Novo Agendamento
                  </ThemedText>
                  
                  <PaperInput
                    name="carName"
                    control={scheduleControl}
                    label="Nome ou Modelo do Carro (Obrigatório)"
                    error={scheduleErrors?.carName?.message}
                   />
                </View>

                <View style={{ width: '100%', marginTop: 24 }} onTouchStart={handleScheduleSubmit(handleAgendar)}>
                  <PrimaryButton 
                    name="Continuar Agendamento"
                    onPress={() => {}}
                    disabled={true}
                    style={{ backgroundColor: theme.tint }}
                  />
                </View>
              </ScrollView>
            )}
          </ThemedView>
        </TrueSheet>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8
  },
  actionBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  actionBtnTextWhite: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 15,
    width: '100%',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 40,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  modalSheet: {
    paddingBottom: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatarText: {
    fontWeight: '700',
    fontSize: 28,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  modalSection: {
    width: '100%',
    marginTop: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  agendarButton: {
    marginTop: 24,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  agendarButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }
});
