import {
  pushCreateJournalEntry,
  pushDeleteJournalEntry,
  pushUpdateJournalEntry,
} from "@/services/syncService";
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
  | {
      type: "audio";
      uri: string;
      duration: number;
      title?: string;
      url?: string;
    };

export type JournalMood = 1 | 2 | 3 | 4 | 5;

export const JOURNAL_TAGS = [
  "focus",
  "work",
  "personal",
  "learning",
  "health",
  "creative",
] as const;

export type JournalTag = (typeof JOURNAL_TAGS)[number];

export type JournalSessionContext = {
  sessionType: string;
  durationSeconds: number;
  tasksCompleted: number;
};

export type JournalInsight = {
  summary: string;
  followUpQuestion: string;
  moodScore: number;
  themes: string[];
};

export type JournalEntry = {
  id: string;
  title: string;
  blocks: JournalBlock[];
  date: string; // ISO date string
  time: string; // HH:mm
  mood?: JournalMood;
  tags?: JournalTag[];
  sessionContext?: JournalSessionContext;
  createdAt?: number;
  updatedAt?: number;
  /** Backend UUID — set after the entry is synced to the cloud. */
  remoteId?: string;
  /** AI-generated insight, stored locally after the first fetch. */
  insight?: JournalInsight;
};

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (
    entry: Omit<
      JournalEntry,
      "id" | "date" | "time" | "createdAt" | "updatedAt"
    >,
  ) => void;
  editEntry: (
    id: string,
    updates: Partial<
      Omit<JournalEntry, "id" | "date" | "time" | "createdAt" | "updatedAt">
    >,
  ) => void;
  deleteEntry: (id: string) => void;
  saveInsight: (id: string, insight: JournalInsight) => void;
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
      addEntry: ({ title, blocks, mood, tags, sessionContext, remoteId }) => {
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().slice(0, 5);
        const entry: JournalEntry = {
          id: uuid.v4() as string,
          title,
          blocks,
          mood,
          tags,
          sessionContext,
          date,
          time,
          createdAt: now.getTime(),
          updatedAt: now.getTime(),
          remoteId,
        };
        set((state) => ({ entries: [entry, ...state.entries] }));
        // Push to cloud in background; store remoteId when we get it back
        if (!remoteId) {
          pushCreateJournalEntry({
            title,
            blocks: blocks as object[],
            mood,
            tags: tags as string[],
            sessionContext: sessionContext as object | null,
          }).then((newRemoteId) => {
            if (newRemoteId) {
              set((state) => ({
                entries: state.entries.map((e) =>
                  e.id === entry.id ? { ...e, remoteId: newRemoteId } : e,
                ),
              }));
            }
          });
        }
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
              : entry,
          ),
        }));
        const remoteId = get().entries.find((e) => e.id === id)?.remoteId;
        if (remoteId) {
          pushUpdateJournalEntry(remoteId, {
            title: updates.title,
            blocks: updates.blocks as object[] | undefined,
            mood: updates.mood,
            tags: updates.tags as string[] | undefined,
            sessionContext: updates.sessionContext as object | null | undefined,
          });
        }
      },
      deleteEntry: (id) => {
        const remoteId = get().entries.find((e) => e.id === id)?.remoteId;
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
        if (remoteId) pushDeleteJournalEntry(remoteId);
      },
      saveInsight: (id, insight) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, insight } : e,
          ),
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
    },
  ),
);
