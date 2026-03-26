import { Platform, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image' // use expo-image para melhor compatibilidade com a transição
import { Link, useLocalSearchParams } from 'expo-router'

export default function AvatarScreen() {
  const { avatar } = useLocalSearchParams<{ avatar: string }>()

  return (
    <View style={styles.container}>
      <Link.AppleZoomTarget>
        <Image
          source={{ uri: avatar }}
          style={styles.image}
            contentFit="contain"
        />
      </Link.AppleZoomTarget>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  image: {
    width: '100%',
    height: Platform.OS === "ios" ? "68%" : "100%",
  },
})