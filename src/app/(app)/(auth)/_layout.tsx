import { Stack } from 'expo-router';

export default function _layout() {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "center", headerShown: false }}>

      <Stack.Screen name="index" options={{ headerShown: false, headerTitle: "Welcome", title: "Welcome", 
        headerTitleAlign: "center", headerShadowVisible: false,
       }} />
      <Stack.Screen name="sign-in" options={{ headerTitle: "Conta do Parceiro", }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Conta do Parceiro", }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: "", }} />
      <Stack.Screen name="reset-password" options={{ headerTitle: "", }} />
      <Stack.Screen name="verify-code" options={{ headerTitle: "", }} />
        
    </Stack>
  );
}
