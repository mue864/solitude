import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkType =
  | "screen"
  | "reading"
  | "writing"
  | "creative"
  | "other"
  | null;

type OnboardingStore = {
  isOnboardingFinished: boolean;
  workType: WorkType;
  setFinishedOnboarding: () => void;
  setWorkType: (type: WorkType) => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      isOnboardingFinished: false as boolean,
      workType: null as WorkType,
      setFinishedOnboarding: () =>
        set((state) => ({
          isOnboardingFinished: (state.isOnboardingFinished = true),
        })),
      setWorkType: (type: WorkType) => set({ workType: type }),
    }),
    {
      name: "onboardingFinished",
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
    },
  ),
);
