import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useFlowStore } from "./flowStore";

// Session types and their durations in seconds
export const SESSION_TYPES: Record<SessionType, number> = {
  Classic: 25 * 60, // 25 minutes
  "Deep Focus": 50 * 60, // 50 minutes
  "Quick Task": 15 * 60, // 15 minutes
  "Creative Time": 30 * 60, // 30 minutes
  "Review Mode": 20 * 60, // 20 minutes
  "Course Time": 45 * 60, // 45 minutes
  "Short Break": 5 * 60, // 5 minutes
  "Long Break": 15 * 60, // 15 minutes
  "Reset Session": 60, // 1 minute
  "Mindful Moment": 10 * 60, // 10 minutes
};

export type SessionType =
  | "Classic"
  | "Deep Focus"
  | "Quick Task"
  | "Creative Time"
  | "Review Mode"
  | "Course Time"
  | "Short Break"
  | "Long Break"
  | "Reset Session"
  | "Mindful Moment";

// Preset flows
export const FLOWS = {
  "Classic Focus": [
    { type: "Classic", duration: SESSION_TYPES["Classic"] },
    { type: "Short Break", duration: SESSION_TYPES["Short Break"] },
    { type: "Classic", duration: SESSION_TYPES["Classic"] },
    { type: "Short Break", duration: SESSION_TYPES["Short Break"] },
    { type: "Classic", duration: SESSION_TYPES["Classic"] },
    { type: "Short Break", duration: SESSION_TYPES["Short Break"] },
    { type: "Classic", duration: SESSION_TYPES["Classic"] },
    { type: "Long Break", duration: SESSION_TYPES["Long Break"] },
  ],
  "Solo Study": [
    { type: "Deep Focus", duration: SESSION_TYPES["Deep Focus"] },
    { type: "Short Break", duration: SESSION_TYPES["Short Break"] },
    { type: "Review Mode", duration: SESSION_TYPES["Review Mode"] },
  ],
  "Creative Rhythm": [
    { type: "Creative Time", duration: SESSION_TYPES["Creative Time"] },
    { type: "Mindful Moment", duration: SESSION_TYPES["Mindful Moment"] },
    { type: "Quick Task", duration: SESSION_TYPES["Quick Task"] },
  ],
  "Debug Flow": [
    { type: "Session 1", duration: 1 * 60 },
    { type: "Session 2", duration: 1 * 60 },
    { type: "Session 3", duration: 1 * 60 },
  ],
};

export interface SessionState {
  // Session state
  sessionType: SessionType;
  duration: number;
  isRunning: boolean;
  isPaused: boolean;
  currentFlowId: string | null;
  currentFlowStep: number;
  sessionId: string; // Unique ID for each session

  // Flow completion modal state
  showFlowCompletionModal: boolean;
  flowCompletionData: {
    completedSessions: number;
    totalSessions: number;
    nextSessionType: string;
    nextSessionDuration: number;
    currentFlowName: string;
  } | null;

  // Stats
  completedPomodoros: number;
  completedSessions: number;
  missedSessions: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;

  // Actions
  setSessionType: (type: SessionType) => void;
  setDuration: (duration: number | ((prev: number) => number)) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  reset: () => void;
  completeSession: () => void;
  missSession: () => void;
  resetProgress: () => void;
  startFlow: (flowId: string) => void;
  nextSession: () => void;
  checkAndResetStreak: () => void;

  // Flow completion actions
  continueFlow: () => void;
  pauseFlow: () => void;
  endFlow: () => void;
  hideFlowCompletionModal: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionType: "Classic",
      duration: SESSION_TYPES["Classic"],
      isRunning: false,
      isPaused: false,
      currentFlowId: null,
      currentFlowStep: 0,
      sessionId: Date.now().toString(),
      showFlowCompletionModal: false,
      flowCompletionData: null,
      completedPomodoros: 0,
      completedSessions: 0,
      missedSessions: 0,
      totalSessions: 8,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,

      // Set a specific session type
      setSessionType: (type) => {
        const newDuration = SESSION_TYPES[type] || SESSION_TYPES["Classic"];
        set({
          sessionType: type,
          duration: newDuration,
          isRunning: false,
          isPaused: false,
          currentFlowId: null, // Clear current flow when manually setting session
          currentFlowStep: 0,
        });
      },

      // Start a predefined flow
      startFlow: (flowId) => {
        console.log("Starting flow:", flowId);
        const flow = useFlowStore
          .getState()
          .customFlows.find((f) => f.id === flowId);
        console.log("Flow data:", flow);

        if (!flow || flow.steps.length === 0) {
          console.log("Invalid or empty flow");
          return;
        }

        const firstSession = flow.steps[0];
        console.log("First session:", firstSession);

        // Clear any existing intervals
        if (get().isRunning) {
          console.log("Stopping current session");
          set({
            isRunning: false,
            isPaused: false,
          });
        }

        const newState = {
          currentFlowId: flowId,
          currentFlowStep: 0,
          sessionType: firstSession.type as SessionType,
          duration: firstSession.duration,
          isRunning: false,
          isPaused: false,
          sessionId: Date.now().toString(),
        };

        console.log("Setting new state:", newState);
        set(newState);
      },

      // Move to the next session in the current flow
      nextSession: () => {
        const { currentFlowId, currentFlowStep, sessionType } = get();

        if (get().currentFlowStep > 0) {
          // If we're in a flow but not at the first step, reset to the first step
          return set({
            ...get(),
            isRunning: false,
            isPaused: false,
            currentFlowStep: 0,
            duration: currentFlowId
              ? useFlowStore
                  .getState()
                  .customFlows.find((f) => f.id === currentFlowId)?.steps[0]
                  .duration
              : SESSION_TYPES[sessionType],
          });
        }

        if (!currentFlowId) return; // No active flow

        const flow = useFlowStore
          .getState()
          .customFlows.find((f) => f.id === currentFlowId);
        const nextStep = currentFlowStep + 1;

        if (nextStep >= flow?.steps.length || !flow) {
          // End of flow
          set({
            currentFlowId: null,
            currentFlowStep: 0,
            isRunning: false,
            isPaused: false,
          });
          return;
        }

        // Move to next step in flow
        set({
          currentFlowStep: nextStep,
          sessionType: flow.steps[nextStep].type as SessionType, // Ensure type safety
          duration: flow.steps[nextStep].duration,
          isRunning: false,
          isPaused: false,
        });
      },

      // Update the current duration
      setDuration: (durationOrUpdater) => {
        if (typeof durationOrUpdater === "function") {
          set((state) => ({
            duration: durationOrUpdater(state.duration),
          }));
        } else {
          set({ duration: durationOrUpdater });
        }
      },

      // Pause the current session
      pauseSession: () => {
        set({
          isRunning: false,
          isPaused: true,
        });
      },

      // Resume the current session
      resumeSession: () =>
        set((state) => ({
          isRunning: true,
          isPaused: false,
          // Generate new sessionId if this is a new session (not resuming from pause)
          sessionId: state.isPaused ? state.sessionId : Date.now().toString(),
        })),

      // Reset to default state
      reset: () =>
        set({
          sessionType: "Classic",
          duration: SESSION_TYPES["Classic"],
          isRunning: false,
          isPaused: false,
          currentFlowId: null,
          currentFlowStep: 0,
          sessionId: Date.now().toString(),
        }),

      // Mark the current session as completed
      completeSession: () =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          // Track Pomodoro completion for work sessions
          let completedPomodoros = state.completedPomodoros;
          let newSessionType = state.sessionType;
          let newDuration = state.duration;
          let newFlowId = state.currentFlowId;
          let newFlowStep = state.currentFlowStep;
          let shouldStartNextSession = false;

          // Check if this was a work session (Classic or Deep Focus)
          if (["Classic", "Deep Focus"].includes(state.sessionType)) {
            completedPomodoros += 1;
          }

          // Calculate streak if this is the first session of the day
          let newStreak = state.currentStreak;
          let shouldUpdateStreak = false;

          // If this is the first session ever or we haven't had a session today
          if (!state.lastSessionDate || state.lastSessionDate !== today) {
            shouldUpdateStreak = true;

            // If this is the first session ever
            if (!state.lastSessionDate) {
              newStreak = 1;
            }
            // If we've had a session before and it's a new day
            else if (state.lastSessionDate !== today) {
              // If we had a session yesterday, increment the streak
              if (state.lastSessionDate === yesterdayStr) {
                newStreak = state.currentStreak + 1;
              }
              // If we missed one day, keep the current streak (allow one day of leeway)
              else if (state.lastSessionDate < yesterdayStr) {
                const twoDaysAgo = new Date();
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];
                newStreak =
                  state.lastSessionDate >= twoDaysAgoStr
                    ? state.currentStreak
                    : 1;
              }
            }
          }

          // Handle flow logic first
          if (
            state.currentFlowId &&
            state.currentFlowId in useFlowStore.getState().customFlows
          ) {
            const flow = useFlowStore
              .getState()
              .customFlows.find((f) => f.id === state.currentFlowId);
            const nextStep = state.currentFlowStep + 1;

            if (nextStep < flow?.steps.length) {
              // Update the session data for the next step
              newFlowStep = nextStep;
              newSessionType = flow.steps[nextStep].type as SessionType;
              newDuration = flow.steps[nextStep].duration;

              // Show flow completion modal instead of auto-starting
              return {
                ...state,
                sessionType: newSessionType,
                duration: newDuration,
                currentFlowId: state.currentFlowId,
                currentFlowStep: newFlowStep,
                isRunning: false, // Don't auto-start
                isPaused: false,
                completedPomodoros,
                lastSessionDate: today,
                completedSessions: state.completedSessions + 1,
                sessionId: Date.now().toString(),
                showFlowCompletionModal: true,
                flowCompletionData: {
                  completedSessions: nextStep, // nextStep is already the number of completed sessions
                  totalSessions: flow.steps.length,
                  nextSessionType: flow.steps[nextStep].type,
                  nextSessionDuration: flow.steps[nextStep].duration,
                  currentFlowName: state.currentFlowId,
                },
                ...(shouldUpdateStreak && {
                  currentStreak: newStreak,
                  longestStreak: Math.max(state.longestStreak, newStreak),
                }),
              };
            } else {
              // End of flow - show completion modal for the last session
              return {
                ...state,
                currentFlowId: null,
                currentFlowStep: 0,
                isRunning: false,
                isPaused: false,
                completedPomodoros,
                lastSessionDate: today,
                completedSessions: state.completedSessions + 1,
                sessionId: Date.now().toString(),
                showFlowCompletionModal: true,
                flowCompletionData: {
                  completedSessions: flow.steps.length,
                  totalSessions: flow.steps.length,
                  nextSessionType: "Flow Complete",
                  nextSessionDuration: 0,
                  currentFlowName: state.currentFlowId,
                },
                ...(shouldUpdateStreak && {
                  currentStreak: newStreak,
                  longestStreak: Math.max(state.longestStreak, newStreak),
                }),
              };
            }
          }

          // Update the state for non-flow sessions
          const update: Partial<SessionState> = {
            sessionType: newSessionType,
            duration: newDuration,
            currentFlowId: newFlowId,
            currentFlowStep: newFlowStep,
            isRunning: shouldStartNextSession,
            isPaused: false,
            completedPomodoros,
            lastSessionDate: today,
            completedSessions: state.completedSessions + 1,
            sessionId: Date.now().toString(),
          };

          // Only update streak if needed
          if (shouldUpdateStreak) {
            update.currentStreak = newStreak;
            update.longestStreak = Math.max(state.longestStreak, newStreak);
          }

          return update;
        }),

      // Mark the current session as missed
      missSession: () =>
        set((state) => {
          // Only increment if we haven't reached the total sessions
          if (state.missedSessions >= state.totalSessions) {
            return state; // No change if we've already missed all sessions
          }

          const update: Partial<SessionState> = {
            missedSessions: state.missedSessions + 1,
            isRunning: false,
            isPaused: false,
            // Reset flow if a session is missed
            currentFlowId: null,
            currentFlowStep: 0,
          };

          // If we were in a flow, reset to the first session type
          if (state.currentFlowId) {
            const flow = useFlowStore
              .getState()
              .customFlows.find((f) => f.id === state.currentFlowId);
            update.sessionType = flow?.steps[0].type as SessionType; // Ensure type safety
            update.duration = flow?.steps[0].duration;
          }

          return {
            ...state,
            ...update,
          };
        }),

      // Reset all progress and statistics
      resetProgress: () =>
        set({
          sessionType: "Classic",
          duration: SESSION_TYPES["Classic"],
          isRunning: false,
          isPaused: false,
          currentFlowId: null,
          currentFlowStep: 0,
          completedPomodoros: 0,
          completedSessions: 0,
          missedSessions: 0,
          currentStreak: 0,
          lastSessionDate: null,
          // Keep longest streak as it's an all-time record
        }),
      checkAndResetStreak: () =>
        set((state) => {
          if (!state.lastSessionDate) return state;

          const lastSession = new Date(state.lastSessionDate);
          const today = new Date();

          // Reset time parts for accurate day comparison
          lastSession.setHours(0, 0, 0, 0);
          const todayReset = new Date(today);
          todayReset.setHours(0, 0, 0, 0);

          const dayDifference = Math.floor(
            (todayReset.getTime() - lastSession.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          // If it's been more than 1 day since the last session, reset the streak
          if (dayDifference > 1) {
            return {
              ...state,
              currentStreak: 0,
              lastSessionDate: todayReset.toISOString().split("T")[0],
            };
          }
          return state;
        }),

      // Flow completion actions
      continueFlow: () =>
        set((state) => ({
          ...state,
          isRunning: true,
          isPaused: false,
          showFlowCompletionModal: false,
          flowCompletionData: null,
          sessionId: Date.now().toString(),
        })),

      pauseFlow: () =>
        set((state) => ({
          ...state,
          isRunning: false,
          isPaused: true,
          showFlowCompletionModal: false,
          flowCompletionData: null,
        })),

      endFlow: () =>
        set((state) => ({
          ...state,
          currentFlowId: null,
          currentFlowStep: 0,
          isRunning: false,
          isPaused: false,
          showFlowCompletionModal: false,
          flowCompletionData: null,
          sessionType: "Classic",
          duration: SESSION_TYPES["Classic"],
        })),

      hideFlowCompletionModal: () =>
        set((state) => ({
          ...state,
          showFlowCompletionModal: false,
          flowCompletionData: null,
        })),
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
