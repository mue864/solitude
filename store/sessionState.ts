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
  toggleRunning: () => void;
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
      toggleRunning: () =>
        set({
          isRunning: !get().isRunning,
          isPaused: get().isRunning ? true : false,
        }),
      pauseSession: () => set({ isRunning: false, isPaused: true }),
      resumeSession: () => set({ isRunning: true, isPaused: false }),
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

          // If we already completed a session today, don't increment
          if (state.lastSessionDate === today) {
            return state;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          // Calculate new streak
          const newStreak =
            state.lastSessionDate === yesterdayStr
              ? state.currentStreak + 1
              : state.lastSessionDate === today
                ? state.currentStreak // Same day, no change
                : 1; // Missed a day, reset to 1

          // Only proceed if we haven't exceeded total sessions
          if (state.completedSessions >= state.totalSessions) {
            return state;
          }

          return {
            ...state,
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
