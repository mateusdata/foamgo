import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const PROD_URL = "https://blip-api.fly.dev/api";
const DEV_URL = "http://192.168.25.168:3000/api";

const api = axios.create({
  baseURL: __DEV__ ? DEV_URL : PROD_URL,
});

let logoutCallback: Function | null = null;
let setUserCallback: Function | null = null;

const setInterceptors = (logOut: Function, setUser: Function) => {
  logoutCallback = logOut;
  setUserCallback = setUser;
}

api.interceptors.request.use(async (config) => {
  try {
    const accessToken = await AsyncStorage.getItem("token");

    if (accessToken !== null) {
      const token = JSON.parse(accessToken);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return config;
  }
});


api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const hadAuthHeader = Boolean(originalRequest?.headers?.Authorization);

    if (status === 401 && hadAuthHeader && !originalRequest._retry) {
      console.log('⚠️ [Interceptor] Token expirado! Iniciando tentativa de refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (refreshToken) {
          console.log('🔄 [Interceptor] Enviando refresh token para a API...');
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
            token: refreshToken
          });

          const newToken = response.data.token;
          const newRefreshToken = response.data.refreshToken;

          console.log('✅ [Interceptor] Sucesso! Novos tokens recebidos.');
          await AsyncStorage.setItem('token', JSON.stringify(newToken));
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
             const userObj = JSON.parse(userStr);
             userObj.token = newToken;
             userObj.refreshToken = newRefreshToken;
             await AsyncStorage.setItem('user', JSON.stringify(userObj));
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('🔁 [Interceptor] Refazendo a requisição original de forma transparente...');
          return api(originalRequest);
        } else {
          console.log('❌ [Interceptor] Nenhum refresh token encontrado localmente.');
        }
      } catch (refreshError) {
        console.log('❌ [Interceptor] Falha ao renovar o token (Refresh token também expirou ou é inválido). Fazendo logout...');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');

        if (setUserCallback) setUserCallback(null);
        if (logoutCallback) logoutCallback();
        
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && hadAuthHeader) {
      console.log('🛑 [Interceptor] Erro 401 final. Deslogando usuário...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');

      if (setUserCallback) setUserCallback(null);
      if (logoutCallback) logoutCallback();
    }

    return Promise.reject(error);
  }
);

export { api, setInterceptors };
