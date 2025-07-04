import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";
import {persist} from "zustand/middleware";

type StreakStore = {
    streak: number;
    setStreak: () => void;
}

export const useStreakStore = create<StreakStore>()(persist(
        (set) => ({
            streak: 0 as number,
            setStreak: () => set((state) => ({streak: state.streak + 1}))
        }),
        {
            name: "streak",
            storage: {
                getItem: async (key) => {
                    const value = await AsyncStorage.getItem(key);
                    return value ? JSON.parse(value) : 0;
                },
                setItem: async (key, value) => {
                    await AsyncStorage.setItem(key, JSON.stringify(value));
                },
                removeItem: async (key) => {
                    await AsyncStorage.removeItem(key);
                }
            }
        }
    )
)