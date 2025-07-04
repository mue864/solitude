import {create} from "zustand";
import {persist} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OnboardingStore = {
    isOnboardingFinished: boolean,
    setFinishedOnboarding: () => void
};

export const useOnboardingStore = create<OnboardingStore>()(persist(
    (set) => ({
        isOnboardingFinished: false as boolean,
        setFinishedOnboarding: () => set((state) => ({isOnboardingFinished: state.isOnboardingFinished = true}))
    }),
    {
        name: 'onboardingFinished',
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
            }
        }
    }
))