import AsyncStorage from "@react-native-async-storage/async-storage";
import { revenuecatService } from "@/services/revenuecatService";
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
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
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
        try {
          if (user?.id) {
            await revenuecatService.logIn(user.id);
          }
        } catch {
          // Non-fatal: entitlement can still be refreshed later.
        }
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

  updateUser: async (patch) => {
    const state = useAuthStore.getState();
    if (!state.user || !state.token) return;
    const user = { ...state.user, ...patch };
    await AsyncStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({ token: state.token, user }),
    );
    set({ user });
  },

  logout: async () => {
    try {
      await revenuecatService.logOut();
    } catch {
      // Non-fatal: local logout should continue.
    }
    await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    set({ token: null, user: null, isLoggedIn: false });
  },
}));
