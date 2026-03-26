import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/themed-view'

export default function Companies() {
  return (
    <ThemedView style={styles.container}>
      <Text>Pagina do parceiro</Text>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 16,
    }
})