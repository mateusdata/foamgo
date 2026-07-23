import { TrueSheet } from '@lodev09/react-native-true-sheet';
import * as Contacts from 'expo-contacts/legacy';
import { Stack } from 'expo-router';
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
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

type Contact = Contacts.Contact;

export default function ContactsScreen() {
  const theme = useTheme();
  const [permissionStatus, setPermissionStatus] = useState<Contacts.PermissionStatus | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const sheetRef = useRef<TrueSheet>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Contacts.PermissionStatus.GRANTED) {
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const cleaned = data.filter((c) => c.name && c.name.trim().length > 0);
      setContacts(cleaned);
    } catch (err) {
      console.error('Erro ao carregar contatos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const query = search.toLowerCase();
    return contacts.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(query);
      const phoneMatch = c.phoneNumbers?.some((p) =>
        p.number?.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
      );
      return nameMatch || phoneMatch;
    });
  }, [search, contacts]);

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    await sheetRef.current?.present();
  };

  const handleCloseSheet = async () => {
    await sheetRef.current?.dismiss();
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Contatos', headerShown: true }} />
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={styles.loadingText} themeColor="textSecondary">
            Carregando contatos...
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  if (permissionStatus !== Contacts.PermissionStatus.GRANTED) {
    return (
      <>
        <Stack.Screen options={{ title: 'Contatos', headerShown: true }} />
        <ThemedView style={styles.centered}>
          <ThemedText style={styles.permissionTitle} type="medium">
            Precisamos acessar seus contatos
          </ThemedText>
          <ThemedText style={styles.permissionText} themeColor="textSecondary">
            Ative a permissão de contatos nas configurações do app para continuar.
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={openSettings}
          >
            <Text style={styles.buttonText}>Abrir configurações</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={loadContacts} style={{ marginTop: 12 }}>
            <ThemedText style={styles.retryText} themeColor="textSecondary">
              Tentar novamente
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Contatos', headerShown: true }} />
      <ThemedView style={styles.container}>
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
          keyExtractor={(item, index) => (item as any).id ?? index.toString()}
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
                {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                  <ThemedText style={styles.contactDetail} themeColor="textSecondary">
                    {item.phoneNumbers[0].number}
                  </ThemedText>
                )}
                {item.emails && item.emails.length > 0 && (
                  <ThemedText style={styles.contactDetail} themeColor="textSecondary">
                    {item.emails[0].email}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          )}
        />

        <TrueSheet
          ref={sheetRef}
          detents={['auto', 0.8]}
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
                {selectedContact.company && (
                  <ThemedText style={styles.modalSubtitle} themeColor="textSecondary">
                    {selectedContact.company}
                  </ThemedText>
                )}

                {selectedContact.phoneNumbers &&
                  selectedContact.phoneNumbers.length > 0 && (
                    <View style={styles.modalSection}>
                      <ThemedText style={styles.modalSectionTitle} themeColor="textSecondary">
                        Telefones
                      </ThemedText>
                      {selectedContact.phoneNumbers.map((phone, index) => (
                        <TouchableOpacity
                          key={(phone as any).id ?? index}
                          style={[styles.modalRow, { borderBottomColor: theme.cardBorder }]}
                          onPress={() =>
                            phone.number &&
                            Linking.openURL(`tel:${phone.number}`)
                          }
                        >
                          <ThemedText style={styles.modalRowLabel} themeColor="textSecondary">
                            {phone.label ?? 'outro'}
                          </ThemedText>
                          <ThemedText style={styles.modalRowValue}>
                            {phone.number}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {selectedContact.emails &&
                  selectedContact.emails.length > 0 && (
                    <View style={styles.modalSection}>
                      <ThemedText style={styles.modalSectionTitle} themeColor="textSecondary">
                        E-mails
                      </ThemedText>
                      {selectedContact.emails.map((email, index) => (
                        <TouchableOpacity
                          key={(email as any).id ?? index}
                          style={[styles.modalRow, { borderBottomColor: theme.cardBorder }]}
                          onPress={() =>
                            email.email &&
                            Linking.openURL(`mailto:${email.email}`)
                          }
                        >
                          <ThemedText style={styles.modalRowLabel} themeColor="textSecondary">
                            {email.label ?? 'outro'}
                          </ThemedText>
                          <ThemedText style={styles.modalRowValue}>
                            {email.email}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                {(!selectedContact.phoneNumbers ||
                  selectedContact.phoneNumbers.length === 0) &&
                  (!selectedContact.emails ||
                    selectedContact.emails.length === 0) && (
                    <ThemedText style={styles.modalEmptyText} themeColor="textSecondary">
                      Nenhuma informação adicional encontrada.
                    </ThemedText>
                  )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.tint }]}
              onPress={handleCloseSheet}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
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
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  retryText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 15,
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalRowLabel: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  modalRowValue: {
    fontSize: 15,
    marginTop: 2,
  },
  modalEmptyText: {
    fontSize: 14,
    marginTop: 24,
  },
  closeButton: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
