import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function _layout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "center", }}>

      <Stack.Screen name="index" options={{ headerShown: false, headerTitle: "Welcome", }} />
      <Stack.Screen name="sign-in" options={{ headerTitle: "Conta do Parceiro", }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Conta do Parceiro", }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: "", }} />
      <Stack.Screen name="reset-password" options={{ headerTitle: "", }} />
      <Stack.Screen name="verify-code" options={{ headerTitle: "", }} />
        

  

    </Stack>
  );
}
