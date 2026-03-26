import { PrimaryButton } from '@/components/buttons/primary-button'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import { router } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Image, StyleSheet, View, useColorScheme, Animated } from 'react-native'

export default function WelcomeScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // Valores animados para cada card
  const float1 = useRef(new Animated.Value(0)).current
  const float2 = useRef(new Animated.Value(0)).current
  const float3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Função para criar a animação de flutuação (sobe e desce suavemente)
    const createFloatingAnimation = (animatedValue: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: -15, // Sobe 15 pixels
            duration: duration,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0, // Volta para a posição original
            duration: duration,
            useNativeDriver: true,
          })
        ])
      )
    }

    // Iniciando as animações com tempos e delays diferentes para ficar natural
    createFloatingAnimation(float1, 3000, 0).start()
    createFloatingAnimation(float2, 2500, 500).start()
    createFloatingAnimation(float3, 3500, 1000).start()
  }, [])

  return (
    <ThemedView style={styles.container}>
      
      <View style={styles.content}>
        
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
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
            Foam GO
          </ThemedText>

          <ThemedText style={styles.title}>
            O cuidado ideal{'\n'}para o veículo
          </ThemedText>

          <ThemedText style={styles.description}>
            Agende lavagens com facilidade ou{'\n'}
            gerencie o seu lava-jato em um só lugar
          </ThemedText>
        </View>

        
        <View style={styles.decorativeSection}>
          {/* Card 1 */}
          <Animated.View style={[styles.floatingCard, styles.card1, {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: isDark ? '#000' : '#4285F4',
            transform: [{ translateY: float1 }, { rotate: '-5deg' }]
          }]}>
            <View style={[styles.cardDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.cardLine} />
          </Animated.View>

          {/* Card 2 */}
          <Animated.View style={[styles.floatingCard, styles.card2, {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: isDark ? '#000' : '#4285F4',
            transform: [{ translateY: float2 }, { rotate: '8deg' }]
          }]}>
            <View style={[styles.cardDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.cardLine} />
          </Animated.View>

          {/* Card 3 */}
          <Animated.View style={[styles.floatingCard, styles.card3, {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            shadowColor: isDark ? '#000' : '#4285F4',
            transform: [{ translateY: float3 }, { rotate: '3deg' }]
          }]}>
            <View style={[styles.cardDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.cardLine} />
          </Animated.View>
        </View>
      </View>

      
      <View style={styles.footer}>
        <PrimaryButton 
          name='Sou cliente' 
          onPress={() => router.push('/client')} // Ajuste a rota conforme seu app
        />

        <PrimaryButton 
          name='Sou parceiro' 
          variant='secondary'
          onPress={() => router.push('/partner')} // Ajuste a rota conforme seu app
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
    paddingTop: 50, // Reduzido de 80 para subir a imagem
    paddingHorizontal: 28,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40, // Reduzido de 60 para dar mais espaço aos cards
  },
  iconContainer: {
    marginBottom: 16, // Reduzido para aproximar a logo do texto
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
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
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
    marginTop: -20, // Puxa os cards um pouco mais para cima
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
    top: '15%',
    left: '5%',
  },
  card2: {
    width: 120,
    height: 70,
    top: '35%',
    right: '8%',
  },
  card3: {
    width: 160,
    height: 85,
    bottom: '25%',
    left: '15%',
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