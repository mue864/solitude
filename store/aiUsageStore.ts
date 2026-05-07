import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Limits ────────────────────────────────────────────────────────────────
// Entries that contain at least one audio block: max 5 AI insights per day.
// All other entries (text / checkbox / list / image): uncapped for now —
// revisit if spend grows.
export const DAILY_AUDIO_INSIGHT_LIMIT = 10;

// ─── Types ─────────────────────────────────────────────────────────────────

interface DayBucket {
  date: string; // "YYYY-MM-DD"
  audioCount: number;
  totalCount: number;
}

interface AiUsageState {
  today: DayBucket;

  /** Returns true when the AI call is allowed; false when blocked. */
  canRequestInsight: (hasAudio: boolean) => boolean;

  /** Call this after a successful AI insight call. */
  recordInsight: (hasAudio: boolean) => void;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function freshBucket(): DayBucket {
  return { date: todayStr(), audioCount: 0, totalCount: 0 };
}

function ensureToday(bucket: DayBucket): DayBucket {
  return bucket.date === todayStr() ? bucket : freshBucket();
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useAiUsageStore = create<AiUsageState>()(
  persist(
    (set, get) => ({
      today: freshBucket(),

      canRequestInsight: (hasAudio) => {
        const bucket = ensureToday(get().today);
        if (hasAudio && bucket.audioCount >= DAILY_AUDIO_INSIGHT_LIMIT) {
          return false;
        }
        return true;
      },

      recordInsight: (hasAudio) => {
        set((state) => {
          const bucket = ensureToday(state.today);
          return {
            today: {
              ...bucket,
              audioCount: hasAudio ? bucket.audioCount + 1 : bucket.audioCount,
              totalCount: bucket.totalCount + 1,
            },
          };
        });
      },
    }),
    {
      name: "ai-usage-store",
      storage: {
        getItem: async (key) => {
          const val = await AsyncStorage.getItem(key);
          return val ? JSON.parse(val) : null;
        },
        setItem: async (key, val) => {
          await AsyncStorage.setItem(key, JSON.stringify(val));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);
