import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  time: string; // HH:mm
};

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, "id" | "date" | "time">) => void;
  editEntry: (
    id: string,
    updates: Partial<Omit<JournalEntry, "id" | "date" | "time">>
  ) => void;
  deleteEntry: (id: string) => void;
  getEntries: () => JournalEntry[];
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: ({ title, content }) => {
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().slice(0, 5);
        const entry: JournalEntry = {
          id: uuid.v4() as string,
          title,
          content,
          date,
          time,
        };
        set((state) => ({ entries: [entry, ...state.entries] }));
      },
      editEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      getEntries: () => {
        return get().entries;
      },
    }),
    {
      name: "journal-store",
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
