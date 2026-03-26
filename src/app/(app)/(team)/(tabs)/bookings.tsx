import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/themed-view'

export default function Bookings() {
  return (
    <ThemedView style={styles.container}>
      <Text>bookings</Text>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 16,
    }
})