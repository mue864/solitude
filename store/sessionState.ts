import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  sessionType: "Work" | "Study" | "Break";
  duration: number;
  isRunning: boolean;
  setSessionType: (type: SessionState["sessionType"]) => void;
  setDuration: (duration: number) => void;
  toggleRunning: () => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionType: "Work",
      duration: 25 * 60,
      isRunning: false,
      setSessionType: (type) => {
        let newDuration = 25 * 60;
        if (type === "Break") newDuration = 5 * 60;
        else if (type === "Study") newDuration = 50 * 60;

        set({ sessionType: type, duration: newDuration, isRunning: false });
      },
      setDuration: (duration) => set({ duration }),
      toggleRunning: () => set({ isRunning: !get().isRunning }),
      reset: () =>
        set({
          sessionType: "Work",
          duration: 25 * 60,
          isRunning: false,
        }),
    }),
    {
      name: "session-store",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);
