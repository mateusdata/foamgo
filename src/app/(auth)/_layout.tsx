import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function _layout() {
  return (
    <>
    <StatusBar style='auto' />  
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleAlign: "center", headerShown: false }}>

      <Stack.Screen name="index" options={{
        headerShown: false, headerTitle: "Welcome", title: "Welcome",
        headerTitleAlign: "center", headerShadowVisible: false,
      }} />
      <Stack.Screen name="sign-in" options={{ headerTitle: "Conta do Parceiro", headerShown: true, }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Conta do Parceiro", headerShown: true, }} />
      <Stack.Screen name="forgot-password" options={{ headerTitle: "", headerShown: true, }} />
      <Stack.Screen name="reset-password" options={{ headerTitle: "", headerShown: true, }} />
      <Stack.Screen name="verify-code" options={{ headerTitle: "", headerShown: true, }} />

    </Stack>
    </>
  );
}
