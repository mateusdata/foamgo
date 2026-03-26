import { PrimaryButton } from '@/components/components/buttons/primary-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import { router } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, View, useColorScheme } from 'react-native'

export default function WelcomePartner() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  

  return (
    <ThemedView style={styles.container}>

      
      <View style={styles.content}>
        
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { 
             
            }]}>
              <Image 
                source={isDark 
                  ? require('@/assets/images/logo-dark.png') 
                  : require('@/assets/images/logo.png')
                }
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          <ThemedText style={styles.appName}>
            Foam GO Parceiro
          </ThemedText>

          <ThemedText style={styles.title}>
            Gerencie seu{'\n'}lava jato
          </ThemedText>

          <ThemedText style={styles.description}>
            Controle agendamentos e serviços{'\n'}
            de forma simples e eficiente
          </ThemedText>
        </View>

        
        <View style={styles.decorativeSection}>
          <View style={[styles.floatingCard, styles.card1, {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: isDark ? '#000' : '#4285F4',
          }]}>
            <View style={[styles.cardDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.cardLine} />
          </View>

          <View style={[styles.floatingCard, styles.card2, {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: isDark ? '#000' : '#4285F4',
          }]}>
            <View style={[styles.cardDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.cardLine} />
          </View>

          <View style={[styles.floatingCard, styles.card3, {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: isDark ? '#000' : '#4285F4',
          }]}>
            <View style={[styles.cardDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.cardLine} />
          </View>
        </View>
      </View>

      
      <View style={styles.footer}>
        <PrimaryButton 
          name='Fazer Login' 
          onPress={() => router.push('/sign-in')}
        />

        <PrimaryButton 
          name='Criar conta' 
          variant='secondary'
          onPress={() => router.push('/sign-up')}
        />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 28,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 160,
    height: 160,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
    letterSpacing: -1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  decorativeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingCard: {
    position: 'absolute',
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  card1: {
    width: 140,
    height: 80,
    top: '20%',
    left: '5%',
    transform: [{ rotate: '-5deg' }],
  },
  card2: {
    width: 120,
    height: 70,
    top: '35%',
    right: '8%',
    transform: [{ rotate: '8deg' }],
  },
  card3: {
    width: 160,
    height: 85,
    bottom: '25%',
    left: '15%',
    transform: [{ rotate: '3deg' }],
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  cardLine: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    width: '60%',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 12,
  },
})