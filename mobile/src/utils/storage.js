import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@ai-millionaire/token';
const REMEMBER_KEY_PREFIX = '@ai-millionaire/remember-session:';
let sessionToken = null;

export const storage = {
  async getToken() {
    return (await AsyncStorage.getItem(TOKEN_KEY)) || sessionToken;
  },
  async setToken(token, persist = true) {
    sessionToken = token;
    if (persist) await AsyncStorage.setItem(TOKEN_KEY, token);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  },
  async clearToken() {
    sessionToken = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
  getRememberSession: (email) => AsyncStorage.getItem(`${REMEMBER_KEY_PREFIX}${String(email).trim().toLowerCase()}`),
  setRememberSession: (email, remember) => AsyncStorage.setItem(`${REMEMBER_KEY_PREFIX}${String(email).trim().toLowerCase()}`, String(Boolean(remember))),
};
