import { TrueSheet } from '@lodev09/react-native-true-sheet';
import * as DeviceContacts from 'expo-contacts/legacy';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type Contact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

export default function ContactsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const [carName, setCarName] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const sheetRef = useRef<TrueSheet>(null);
  const newContactSheetRef = useRef<TrueSheet>(null);

  const companyId = user?.activeCompanyId || user?.company?.id;

  const loadContacts = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const response = await api.get(`/contacts?companyId=${companyId}`);
      setContacts(response.data);
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

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

  const handleCreateContact = async () => {
    if (!companyId || !newName.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }
    try {
      // 1. Salvar no Backend
      await api.post('/contacts', {
        companyId,
        name: newName,
        phone: newPhone
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
            name: newName,
          };
          if (newPhone) {
            newNativeContact.phoneNumbers = [{ label: 'mobile', number: newPhone }];
          }
          await DeviceContacts.addContactAsync(newNativeContact);
        }
      } catch (nativeErr) {
        console.warn('Erro ao salvar na agenda do celular:', nativeErr);
        // Não falhamos a criação no backend por causa disso
      }

      setNewName('');
      setNewPhone('');
      await newContactSheetRef.current?.dismiss();
      loadContacts();
    } catch (err: any) {
       Alert.alert('Erro', err.response?.data?.message || 'Erro ao criar contato');
    }
  };

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const query = search.toLowerCase();
    return contacts.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(query);
      const phoneMatch = c.phone?.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
      return nameMatch || phoneMatch;
    });
  }, [search, contacts]);

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    setCarName('');
    await sheetRef.current?.present();
  };

  const handleAgendar = () => {
    if (!companyId || !selectedContact) return;
    sheetRef.current?.dismiss();
    router.push({
      pathname: '/(app)/(client)/companies/[companyId]/booking',
      params: { companyId, contactId: selectedContact.id, carName }
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

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundElement,
              color: theme.text,
            },
          ]}
          placeholder="Buscar por nome ou telefone"
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />

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
              <ThemedView
                style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}
              >
                <ThemedText style={styles.avatarText} type="medium">
                  {item.name?.charAt(0).toUpperCase() ?? '?'}
                </ThemedText>
              </ThemedView>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactName}>{item.name}</ThemedText>
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
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
                        placeholder="Nome do cliente"
                        placeholderTextColor={theme.placeholder}
                        value={newName}
                        onChangeText={setNewName}
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, marginTop: 12 }]}
                        placeholder="Telefone (Opcional)"
                        placeholderTextColor={theme.placeholder}
                        keyboardType="phone-pad"
                        value={newPhone}
                        onChangeText={setNewPhone}
                    />
                    
                    <TouchableOpacity
                        style={[styles.agendarButton, { backgroundColor: theme.tint, marginTop: 24 }]}
                        onPress={handleCreateContact}
                    >
                        <Text style={styles.agendarButtonText}>Salvar Contato</Text>
                    </TouchableOpacity>
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
                <ThemedView
                  style={[styles.modalAvatar, { backgroundColor: theme.backgroundElement }]}
                >
                  <ThemedText style={styles.modalAvatarText}>
                    {selectedContact.name?.charAt(0).toUpperCase() ?? '?'}
                  </ThemedText>
                </ThemedView>

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
                  
                  <TextInput
                    style={[
                        styles.input,
                        {
                        backgroundColor: theme.backgroundElement,
                        color: theme.text,
                        }
                    ]}
                    placeholder="Nome ou Modelo do Carro (Opcional)"
                    placeholderTextColor={theme.placeholder}
                    value={carName}
                    onChangeText={setCarName}
                   />
                </View>

                <View
                  style={[styles.agendarButton, { backgroundColor: theme.tint }]}
                  onTouchStart={handleAgendar}
                >
                  <Text style={styles.agendarButtonText}>Continuar Agendamento</Text>
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
