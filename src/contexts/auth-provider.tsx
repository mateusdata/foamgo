import Loading from '@/components/loading';
import { api, setInterceptors } from '@/config/api';
import { configGoogleSignin } from '@/config/signinGoogle';
import { AuthContextProps, User } from '@/types';
import { Haptics } from '@/utils/Haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

GoogleSignin.configure(configGoogleSignin);

const AuthContext = React.createContext<AuthContextProps>({} as AuthContextProps);

export default function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Interceptor global: se o token expirar, faz logout automático
    setInterceptors(logOut, setUser);
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  // ─── Carrega o usuário persistido no storage ──────────────────────────────
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (_) {
      // storage corrompido: deixa user nulo, root layout redireciona para login
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Salva token + user no storage e atualiza o estado ───────────────────
  const loadUser = async (data: any) => {
    await AsyncStorage.setItem('token', JSON.stringify(data.token));
    await AsyncStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  // ─── Busca dados frescos do usuário na API ────────────────────────────────
  // Retorna o User atualizado para quem precisar (ex: root layout)
  const refreshUser = async (): Promise<User | null> => {
    try {
      const response = await api.get('/users/me');
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // ─── Login com email/senha ────────────────────────────────────────────────
  // NÃO navega aqui. A navegação fica no root _layout.tsx via `user.role`.
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      await loadUser(response.data);
      const fresh = await refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return fresh;
    } catch (error) {
      throw error;
    }
  };

  // ─── Login com Google ─────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const response = await api.post('/auth/google', {
        idToken: userInfo.data?.idToken,
      });
      await loadUser(response.data);
      await refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (error?.status === 404) {
        // Usuário não cadastrado: manda para o cadastro
        router.push('/(auth)/sign-up');
      }
    }
  };

  // ─── Login com Apple ──────────────────────────────────────────────────────
  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const response = await api.post('/auth/apple', credential);
      await loadUser(response.data);
      await refreshUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (error?.status === 404) {
        router.push('/(auth)/sign-up');
      }
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logOut = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.clear();
      setUser(null);
      router.replace('/(auth)/sign-in');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (_) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, logOut, isLoading, login, refreshUser, signInWithGoogle, signInWithApple }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}