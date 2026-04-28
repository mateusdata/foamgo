import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const PROD_URL = "https://blip-api.fly.dev/api";
const DEV_URL = "http://192.168.25.10:3333/api";

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
  async (response: any) => {
    return response;
  },

  async (error: any) => {
    const status = error?.response?.status;
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);

    // Faz logout automático apenas quando falha de autenticação da sessão/token.
    if (status === 401 && hadAuthHeader) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      if (setUserCallback) setUserCallback(null);
      if (logoutCallback) logoutCallback();
    }

    return Promise.reject(error);
  }
);

export { api, setInterceptors };
