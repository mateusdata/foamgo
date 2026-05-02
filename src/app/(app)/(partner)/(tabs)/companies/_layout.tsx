import { Stack } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: Platform.OS === 'ios',
        headerLargeTitleShadowVisible: true,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Foamgo',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/(app)/(partner)/store/subscription' as any)}
              style={styles.upgradeButton}
            >
              <View style={styles.upgradeContent}>
                <Ionicons name="star" size={16} color={Colors.primary} />
                <Text style={styles.upgradeText}>Fazer Upgrade</Text>
              </View>
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  upgradeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upgradeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
