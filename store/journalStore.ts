import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- Block-based journal types ---
export type JournalBlock =
  | { type: "text"; content: string }
  | {
      type: "checkbox";
      items: { text: string; checked: boolean }[];
      title?: string;
    }
  | { type: "list"; items: string[] }
  | { type: "image"; uri: string }
  | { type: "audio"; uri: string; duration: number; title?: string };

export type JournalEntry = {
  id: string;
  title: string;
  blocks: JournalBlock[];
  date: string; // ISO date string
  time: string; // HH:mm
  createdAt?: number;
  updatedAt?: number;
};

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (
    entry: Omit<
      JournalEntry,
      "id" | "date" | "time" | "createdAt" | "updatedAt"
    >
  ) => void;
  editEntry: (
    id: string,
    updates: Partial<
      Omit<JournalEntry, "id" | "date" | "time" | "createdAt" | "updatedAt">
    >
  ) => void;
  deleteEntry: (id: string) => void;
  getEntries: () => JournalEntry[];
}

function migrateLegacyEntries(entries: any[]): JournalEntry[] {
  // Convert legacy entries with 'content' to block-based format
  return entries.map((entry) => {
    if (entry.blocks) return entry;
    // Legacy: convert 'content' string to a single text block
    return {
      ...entry,
      blocks: entry.content ? [{ type: "text", content: entry.content }] : [],
      content: undefined,
    };
  });
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: ({ title, blocks }) => {
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().slice(0, 5);
        const entry: JournalEntry = {
          id: uuid.v4() as string,
          title,
          blocks,
          date,
          time,
          createdAt: now.getTime(),
          updatedAt: now.getTime(),
        };
        set((state) => ({ entries: [entry, ...state.entries] }));
      },
      editEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...updates,
                  updatedAt: Date.now(),
                }
              : entry
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
          if (!value) return null;
          const parsed = JSON.parse(value);
          // Migrate legacy entries if needed
          if (parsed && Array.isArray(parsed.state?.entries)) {
            parsed.state.entries = migrateLegacyEntries(parsed.state.entries);
          }
          return parsed;
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
