import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FocusAudioTrack = {
  id: string;
  name: string;
  url: string;
  version: string;
  category?: string;
  sizeBytes?: number;
  isPremium: boolean;
};

export type FocusAudioCacheStatus = "idle" | "downloading" | "ready" | "error";

export type FocusAudioCacheEntry = {
  trackId: string;
  version: string;
  localUri: string;
  status: FocusAudioCacheStatus;
  lastUsedAt: number;
  lastError?: string;
};

type FocusAudioState = {
  catalog: FocusAudioTrack[];
  preferredTrackId: string | null;
  cache: Record<string, FocusAudioCacheEntry>;

  setCatalog: (tracks: FocusAudioTrack[]) => void;
  setPreferredTrackId: (trackId: string | null) => void;
  upsertCacheEntry: (entry: FocusAudioCacheEntry) => void;
  patchCacheEntry: (
    trackId: string,
    patch: Partial<FocusAudioCacheEntry>,
  ) => void;
  removeCacheEntry: (trackId: string) => void;
};

export const useFocusAudioStore = create<FocusAudioState>()(
  persist(
    (set) => ({
      catalog: [],
      preferredTrackId: null,
      cache: {},

      setCatalog: (tracks) => set({ catalog: tracks }),

      setPreferredTrackId: (trackId) => set({ preferredTrackId: trackId }),

      upsertCacheEntry: (entry) =>
        set((state) => ({
          cache: {
            ...state.cache,
            [entry.trackId]: entry,
          },
        })),

      patchCacheEntry: (trackId, patch) =>
        set((state) => {
          const existing = state.cache[trackId];
          if (!existing) return state;
          return {
            cache: {
              ...state.cache,
              [trackId]: {
                ...existing,
                ...patch,
              },
            },
          };
        }),

      removeCacheEntry: (trackId) =>
        set((state) => {
          const next = { ...state.cache };
          delete next[trackId];
          return { cache: next };
        }),
    }),
    {
      name: "focus-audio-store",
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
