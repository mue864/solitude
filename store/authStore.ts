import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const TOKEN_KEY = "solitude_access_token";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  audioInsightsEnabled: boolean;
  isPro: boolean;
  creationDate: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;

  // Hydrate from storage on app start
  hydrate: () => Promise<void>;
  setAuth: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (stored) {
        const { token, user } = JSON.parse(stored);
        set({ token, user, isLoggedIn: true });
      }
    } catch {
      // Corrupted data — clear it
      await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    }
  },

  setAuth: async (token, user) => {
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({ token, user }));
    set({ token, user, isLoggedIn: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    set({ token: null, user: null, isLoggedIn: false });
  },
}));
