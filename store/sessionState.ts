import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  sessionType: "Work" | "Study" | "Break";
  duration: number;
  isRunning: boolean;
  isPaused: boolean;
  completedSessions: number;
  missedSessions: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  setSessionType: (type: SessionState["sessionType"]) => void;
  setDuration: (duration: number | ((prev: number) => number)) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  reset: () => void;
  completeSession: () => void;
  missSession: () => void;
  resetProgress: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionType: "Work",
      duration: 25 * 60,
      isRunning: false,
      isPaused: false,
      completedSessions: 0,
      missedSessions: 0,
      totalSessions: 8, // Default total sessions per day
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      setSessionType: (type) => {
        let newDuration = 25 * 60;
        if (type === "Break") newDuration = 5 * 60;
        else if (type === "Study") newDuration = 50 * 60;

        set({
          sessionType: type,
          duration: newDuration,
          isRunning: false,
          isPaused: false,
        });
      },
      setDuration: (durationOrUpdater) => {
        if (typeof durationOrUpdater === "function") {
          set((state) => ({
            duration: durationOrUpdater(state.duration),
          }));
        } else {
          set({ duration: durationOrUpdater });
        }
      },
      pauseSession: () => {
        // No need to update duration here, just toggle the states
        set({ 
          isRunning: false, 
          isPaused: true,
        });
      },
      resumeSession: () => set({ 
        isRunning: true, 
        isPaused: false
      }),
      reset: () =>
        set({
          sessionType: "Work",
          duration: 25 * 60,
          isRunning: false,
          isPaused: false,
        }),
      completeSession: () =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          
          // Only calculate streak if this is the first session of the day
          let newStreak = state.currentStreak;
          if (state.lastSessionDate !== today) {
            newStreak =
              state.lastSessionDate === yesterdayStr
                ? state.currentStreak + 1
                : state.lastSessionDate && state.lastSessionDate < yesterdayStr
                  ? 1 // Missed a day, reset to 1
                  : state.currentStreak; // No change if same day
          }

          // Only proceed if we haven't exceeded total sessions
          if (state.completedSessions >= state.totalSessions) {
            return {
              ...state,
              isRunning: false,
              isPaused: false,
              lastSessionDate: today, // Still update last session date
            };
          }

          return {
            ...state,
            isRunning: false,
            isPaused: false,
            completedSessions: state.completedSessions + 1,
            lastSessionDate: today,
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            missedSessions: Math.min(
              state.missedSessions,
              state.totalSessions - (state.completedSessions + 1)
            ),
          };
        }),
      missSession: () =>
        set((state) => {
          // Only increment if we haven't reached the total sessions
          if (state.missedSessions >= state.totalSessions) {
            return state; // No change if we've already missed all sessions
          }

          const newMissed = state.missedSessions + 1;
          const remaining = Math.max(0, state.totalSessions - newMissed);

          return {
            missedSessions: newMissed,
            // Only update completed sessions if it would make sense (not less than 0)
            completedSessions: Math.min(state.completedSessions, remaining),
          };
        }),
      resetProgress: () =>
        set({
          completedSessions: 0,
          missedSessions: 0,
        }),
      checkAndResetStreak: () =>
        set((state) => {
          if (!state.lastSessionDate) return state;

          const lastSession = new Date(state.lastSessionDate);
          const today = new Date();
          const dayDifference = Math.floor(
            (today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayDifference >= 1) {
            return {
              ...state,
              currentStreak: 0,
              lastSessionDate: today.toISOString().split("T")[0],
            };
          }
          return state;
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
