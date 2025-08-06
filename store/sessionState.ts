import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useFlowStore } from "./flowStore";
import { useSessionIntelligence } from "./sessionIntelligence";

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

  // checking if it's a new session
  isNewSession: boolean;

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
    (set, get) => {
      let startTimeRef: number | null = null;
      let pausedTimeRef = 0;
      let intervalRef: NodeJS.Timeout | null = null;
      let backgroundTimeRef: number | null = null;
      let initialDurationRef: number | null = null;
      let lastPauseTimeRef: number | null = null;

      const cleanup = () => {
        if (intervalRef) {
          clearInterval(intervalRef);
          intervalRef = null;
        }
      };

      const updateTimer = () => {
        if (!startTimeRef || !initialDurationRef || get().isPaused) return;

        const now = Date.now();
        const elapsedMs = now - startTimeRef - pausedTimeRef;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const remaining = Math.max(0, initialDurationRef - elapsedSeconds);

        set({ duration: remaining });

        if (remaining <= 0) {
          cleanup();
          set({ isRunning: false, isPaused: false });
          get().completeSession();
        }
      };

      // Set up app state change listener
      if (typeof window !== "undefined") {
        AppState.addEventListener("change", (nextAppState) => {
          const state = get();
          if (!state.isRunning) return;

          if (nextAppState === "background") {
            backgroundTimeRef = Date.now();
            cleanup();
          } else if (nextAppState === "active" && backgroundTimeRef) {
            const backgroundDuration = Date.now() - backgroundTimeRef;
            pausedTimeRef += backgroundDuration;
            backgroundTimeRef = null;

            if (startTimeRef && initialDurationRef) {
              const elapsedMs = Date.now() - startTimeRef - pausedTimeRef;
              const elapsedSeconds = Math.floor(elapsedMs / 1000);
              const remaining = Math.max(
                0,
                initialDurationRef - elapsedSeconds
              );

              if (remaining <= 0) {
                cleanup();
                set({ isRunning: false, isPaused: false });
                state.completeSession();
              } else {
                set({ duration: remaining });
                if (!state.isPaused) {
                  intervalRef = setInterval(updateTimer, 1000);
                }
              }
            }
          }
        });
      }

      return {
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
        isNewSession: true,

        // Actions
        setSessionType: (type) => {
          cleanup();
          const newDuration = SESSION_TYPES[type] || SESSION_TYPES["Classic"];
          set({
            sessionType: type,
            duration: newDuration,
            isRunning: false,
            isPaused: false,
            currentFlowId: null,
            currentFlowStep: 0,
          });
          startTimeRef = null;
          pausedTimeRef = 0;
          initialDurationRef = newDuration;
          lastPauseTimeRef = null;
        },

        resumeSession: () => {
          const state = get();

          if (state.isRunning && !state.isPaused) return;

          // handle start notification here
          if (!state.isRunning && !state.isPaused) {
            // basically this means that the session is new
            set({ isNewSession: true });
          } else {
            set({ isNewSession: false });
          }

          if (state.isPaused && lastPauseTimeRef) {
            // Resume from pause - calculate and accumulate pause duration
            const now = Date.now();
            const pauseDuration = now - lastPauseTimeRef;
            pausedTimeRef += pauseDuration;
            lastPauseTimeRef = null;
          } else {
            // Fresh start
            startTimeRef = Date.now();
            pausedTimeRef = 0;
            lastPauseTimeRef = null;
            initialDurationRef = state.duration;
          }

          cleanup();
          intervalRef = setInterval(updateTimer, 1000);
          set({ isRunning: true, isPaused: false });
        },

        pauseSession: () => {
          lastPauseTimeRef = Date.now();
          cleanup();
          // Keep the current duration value in state
          set({ isRunning: false, isPaused: true });
        },

        reset: () => {
          cleanup();
          startTimeRef = null;
          pausedTimeRef = 0;
          backgroundTimeRef = null;
          initialDurationRef = null;
          lastPauseTimeRef = null;
          set((state) => ({
            isRunning: false,
            isPaused: false,
            currentFlowId: null,
            currentFlowStep: 0,
            sessionType: "Classic",
            duration: SESSION_TYPES["Classic"],
          }));
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

          if (!flow || nextStep >= flow?.steps.length) {
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
            set((state) => {
              const newDuration = durationOrUpdater(state.duration);
              initialDurationRef = newDuration;
              return { duration: newDuration };
            });
          } else {
            initialDurationRef = durationOrUpdater;
            set({ duration: durationOrUpdater });
          }
        },

        // Mark the current session as completed
        completeSession: () =>
          set((state) => {
            // Record session in session intelligence
            try {
              const sessionIntelligence = useSessionIntelligence.getState();
              sessionIntelligence.recordSession({
                sessionType: state.sessionType,
                duration: state.duration,
                completed: true,
                focusQuality: 7, // Default value, can be enhanced later
                energyLevel: 7, // Default value, can be enhanced later
                interruptions: 0, // Default value, can be enhanced later
                flowId: state.currentFlowId, // Pass flowId
              });
            } catch (error) {
              console.log("Error recording session in intelligence:", error);
            }

            console.log("completeSession called with state:", {
              currentFlowId: state.currentFlowId,
              currentFlowStep: state.currentFlowStep,
              sessionType: state.sessionType,
              duration: state.duration,
            });
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            // Track Pomodoro completion for work sessions
            let completedPomodoros = state.completedPomodoros;
            let newSessionType = "Classic"; // Default to Classic for non-flow sessions
            let newDuration = SESSION_TYPES["Classic"]; // Default to Classic duration
            let newFlowStep = state.currentFlowStep;

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
            if (state.currentFlowId) {
              const flow = useFlowStore
                .getState()
                .customFlows.find((f) => f.id === state.currentFlowId);
              const nextStep = state.currentFlowStep + 1;

              console.log("Flow completion logic:", {
                flowId: state.currentFlowId,
                flow: flow,
                currentStep: state.currentFlowStep,
                nextStep: nextStep,
                totalSteps: flow?.steps.length,
              });

              if (flow && nextStep < flow.steps.length) {
                // Update the session data for the next step
                newFlowStep = nextStep;
                newSessionType = flow.steps[nextStep].type as SessionType;
                newDuration = flow.steps[nextStep].duration;

                // Show flow completion modal instead of auto-starting
                return {
                  ...state,
                  sessionType: newSessionType as SessionType,
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
                    completedSessions: nextStep,
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
                // End of flow - reset to Classic session
                cleanup();
                startTimeRef = null;
                pausedTimeRef = 0;
                lastPauseTimeRef = null;
                initialDurationRef = SESSION_TYPES["Classic"];

                // Record flow completion in session intelligence
                try {
                  const sessionIntelligence = useSessionIntelligence.getState();
                  sessionIntelligence.recordFlowCompletion({
                    flowId: state.currentFlowId!,
                    flowName: flow!.name,
                    steps: flow!.steps.length,
                    completedAt: Date.now(),
                    success: true,
                  });
                } catch (error) {
                  console.log(
                    "Error recording flow completion in intelligence:",
                    error
                  );
                }

                return {
                  ...state,
                  currentFlowId: null,
                  currentFlowStep: 0,
                  isRunning: false,
                  isPaused: false,
                  sessionType: "Classic" as SessionType,
                  duration: SESSION_TYPES["Classic"],
                  completedPomodoros,
                  lastSessionDate: today,
                  completedSessions: state.completedSessions + 1,
                  sessionId: Date.now().toString(),
                  showFlowCompletionModal: true,
                  flowCompletionData: {
                    completedSessions: flow ? flow.steps.length : 0,
                    totalSessions: flow ? flow.steps.length : 0,
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

            // For non-flow sessions, reset to Classic
            cleanup();
            startTimeRef = null;
            pausedTimeRef = 0;
            lastPauseTimeRef = null;
            initialDurationRef = SESSION_TYPES["Classic"];

            // Update the state for non-flow sessions
            const update: Partial<SessionState> = {
              sessionType: "Classic" as SessionType,
              duration: SESSION_TYPES["Classic"],
              currentFlowId: null,
              currentFlowStep: 0,
              isRunning: false,
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
            // Record failed session in session intelligence
            try {
              const sessionIntelligence = useSessionIntelligence.getState();
              sessionIntelligence.recordSession({
                sessionType: state.sessionType,
                duration: state.duration,
                completed: false,
                focusQuality: 3, // Default value for failed sessions
                energyLevel: 4, // Default value for failed sessions
                interruptions: 2, // Default value for failed sessions
                flowId: state.currentFlowId, // Pass flowId
              });
            } catch (error) {
              console.log(
                "Error recording failed session in intelligence:",
                error
              );
            }

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
              sessionType: "Classic",
              duration: SESSION_TYPES["Classic"],
            };

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
          set((state) => {
            // Ensure we have the correct session data for the current flow step
            if (state.currentFlowId) {
              const flow = useFlowStore
                .getState()
                .customFlows.find((f) => f.id === state.currentFlowId);

              if (flow && state.currentFlowStep < flow.steps.length) {
                const currentStep = flow.steps[state.currentFlowStep];

                // Initialize timer state
                startTimeRef = Date.now();
                pausedTimeRef = 0;
                lastPauseTimeRef = null;
                initialDurationRef = currentStep.duration;
                cleanup();
                intervalRef = setInterval(updateTimer, 1000);

                return {
                  ...state,
                  sessionType: currentStep.type as SessionType,
                  duration: currentStep.duration,
                  isRunning: true,
                  isPaused: false,
                  showFlowCompletionModal: false,
                  flowCompletionData: null,
                  sessionId: Date.now().toString(),
                };
              }
            }

            // Fallback for non-flow sessions
            // Initialize timer state for fallback
            startTimeRef = Date.now();
            pausedTimeRef = 0;
            lastPauseTimeRef = null;
            initialDurationRef = state.duration;
            cleanup();
            intervalRef = setInterval(updateTimer, 1000);

            return {
              ...state,
              isRunning: true,
              isPaused: false,
              showFlowCompletionModal: false,
              flowCompletionData: null,
              sessionId: Date.now().toString(),
            };
          }),

        pauseFlow: () => {
          // Clean up timer state
          lastPauseTimeRef = Date.now();
          cleanup();

          set((state) => ({
            ...state,
            isRunning: false,
            isPaused: true,
            showFlowCompletionModal: false,
            flowCompletionData: null,
          }));
        },

        endFlow: () => {
          // Clean up timer state
          cleanup();
          startTimeRef = null;
          pausedTimeRef = 0;
          lastPauseTimeRef = null;
          initialDurationRef = SESSION_TYPES["Classic"];

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
          }));
        },

        hideFlowCompletionModal: () =>
          set((state) => ({
            ...state,
            showFlowCompletionModal: false,
            flowCompletionData: null,
          })),
      };
    },
    {
      name: "session-store",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
