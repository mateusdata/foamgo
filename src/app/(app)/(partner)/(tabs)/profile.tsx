import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/themed-view'

export default function ProfileClient() {
  return (
    <ThemedView style={styles.container}>
      <Text>profile</Text>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 16,
    }
})