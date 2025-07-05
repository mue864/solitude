import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Session types and their durations in seconds
export const SESSION_TYPES: Record<SessionType, number> = {
  'Classic': 25 * 60, // 25 minutes
  'Deep Focus': 50 * 60, // 50 minutes
  'Quick Task': 15 * 60, // 15 minutes
  'Creative Time': 30 * 60, // 30 minutes
  'Review Mode': 20 * 60, // 20 minutes
  'Course Time': 45 * 60, // 45 minutes
  'Short Break': 5 * 60, // 5 minutes
  'Long Break': 15 * 60, // 15 minutes
  'Reset Session': 60, // 1 minute
  'Mindful Moment': 10 * 60, // 10 minutes
};

export type SessionType = 
  | 'Classic' 
  | 'Deep Focus' 
  | 'Quick Task' 
  | 'Creative Time' 
  | 'Review Mode' 
  | 'Course Time' 
  | 'Short Break' 
  | 'Long Break' 
  | 'Reset Session' 
  | 'Mindful Moment';

// Preset flows
export const FLOWS = {
  'Classic Focus': [
    { type: 'Classic', duration: SESSION_TYPES['Classic'] },
    { type: 'Short Break', duration: SESSION_TYPES['Short Break'] },
    { type: 'Classic', duration: SESSION_TYPES['Classic'] },
    { type: 'Short Break', duration: SESSION_TYPES['Short Break'] },
    { type: 'Classic', duration: SESSION_TYPES['Classic'] },
    { type: 'Short Break', duration: SESSION_TYPES['Short Break'] },
    { type: 'Classic', duration: SESSION_TYPES['Classic'] },
    { type: 'Long Break', duration: SESSION_TYPES['Long Break'] },
  ],
  'Solo Study': [
    { type: 'Deep Focus', duration: SESSION_TYPES['Deep Focus'] },
    { type: 'Short Break', duration: SESSION_TYPES['Short Break'] },
    { type: 'Review Mode', duration: SESSION_TYPES['Review Mode'] },
  ],
  'Creative Rhythm': [
    { type: 'Creative Time', duration: SESSION_TYPES['Creative Time'] },
    { type: 'Mindful Moment', duration: SESSION_TYPES['Mindful Moment'] },
    { type: 'Quick Task', duration: SESSION_TYPES['Quick Task'] },
  ],
};

type FlowName = keyof typeof FLOWS;

export interface SessionState {
  // Session state
  sessionType: SessionType;
  duration: number;
  isRunning: boolean;
  isPaused: boolean;
  currentFlow: FlowName | null;
  currentFlowStep: number;
  sessionId: string; // Unique ID for each session
  
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
  startFlow: (flowName: FlowName) => void;
  nextSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionType: 'Classic',
      duration: SESSION_TYPES['Classic'],
      isRunning: false,
      isPaused: false,
      currentFlow: null,
      currentFlowStep: 0,
      sessionId: Date.now().toString(),
      completedPomodoros: 0,
      completedSessions: 0,
      missedSessions: 0,
      totalSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,

      // Set a specific session type
      setSessionType: (type) => {
        const newDuration = SESSION_TYPES[type] || SESSION_TYPES['Classic'];
        set({
          sessionType: type,
          duration: newDuration,
          isRunning: false,
          isPaused: false,
          currentFlow: null, // Clear current flow when manually setting session
          currentFlowStep: 0,
        });
      },

      // Start a predefined flow
      startFlow: (flowName) => {
        const flow = FLOWS[flowName];
        if (!flow || flow.length === 0) return;
        
        // Clear any existing intervals
        if (get().isRunning) {
          // If a session is running, stop it properly
          set({
            isRunning: false,
            isPaused: false,
          });
        }
        
        // Set the new flow state
        set({
          currentFlow: flowName,
          currentFlowStep: 0,
          sessionType: flow[0].type as SessionType, // Ensure type safety
          duration: flow[0].duration,
          isRunning: false, // Don't start automatically
          isPaused: false,
          sessionId: Date.now().toString(), // New session ID
        });
      },

      // Move to the next session in the current flow
      nextSession: () => {
        const { currentFlow, currentFlowStep, sessionType } = get();
        
        if (get().currentFlowStep > 0) {
          // If we're in a flow but not at the first step, reset to the first step
          return set({
            ...get(),
            isRunning: false,
            isPaused: false,
            currentFlowStep: 0,
            duration: currentFlow ? 
              FLOWS[currentFlow][0].duration : 
              SESSION_TYPES[sessionType]
          });
        }

        if (!currentFlow) return; // No active flow
        
        const flow = FLOWS[currentFlow];
        const nextStep = currentFlowStep + 1;
        
        if (nextStep >= flow.length) {
          // End of flow
          set({
            currentFlow: null,
            currentFlowStep: 0,
            isRunning: false,
            isPaused: false,
          });
          return;
        }

        // Move to next step in flow
        set({
          currentFlowStep: nextStep,
          sessionType: flow[nextStep].type as SessionType, // Ensure type safety
          duration: flow[nextStep].duration,
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
      resumeSession: () => set((state) => ({
        isRunning: true,
        isPaused: false,
        // Generate new sessionId if this is a new session (not resuming from pause)
        sessionId: state.isPaused ? state.sessionId : Date.now().toString()
      })),
      
      // Reset to default state
      reset: () =>
        set({
          sessionType: 'Classic',
          duration: SESSION_TYPES['Classic'],
          isRunning: false,
          isPaused: false,
          currentFlow: null,
          currentFlowStep: 0,
          sessionId: Date.now().toString(), // New session ID
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
          
          // Check if this was a work session (Classic or Deep Focus)
          if (['Classic', 'Deep Focus'].includes(state.sessionType)) {
            completedPomodoros += 1;
            
            // Every 4 Pomodoros, log a completed cycle
            if (completedPomodoros % 4 === 0) {
              console.log('Completed a Pomodoro cycle!');
            }
          }
          
          // Calculate streak if this is the first session of the day
          let newStreak = state.currentStreak;
          if (state.lastSessionDate !== today) {
            newStreak =
              state.lastSessionDate === yesterdayStr
                ? state.currentStreak + 1
                : state.lastSessionDate && state.lastSessionDate < yesterdayStr
                  ? 1 // Missed a day, reset to 1
                  : state.currentStreak; // No change if same day
          }

          // Check if we've reached the session limit
          const hasReachedLimit = state.completedSessions >= state.totalSessions;
          
          // Prepare the base update
          const update: Partial<SessionState> = {
            isRunning: false, // Will be set to true if continuing a flow
            isPaused: false,
            completedPomodoros,
            lastSessionDate: today,
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
          };
          
          // If we haven't reached the session limit, increment completed sessions
          if (!hasReachedLimit) {
            update.completedSessions = state.completedSessions + 1;
            update.missedSessions = Math.min(
              state.missedSessions,
              state.totalSessions - (state.completedSessions + 1)
            );
          }
          
          // If we're in a flow, move to the next session
          if (state.currentFlow) {
            const flow = FLOWS[state.currentFlow];
            const nextStep = state.currentFlowStep + 1;
            
            if (nextStep < flow.length) {
              update.currentFlowStep = nextStep;
              update.sessionType = flow[nextStep].type as SessionType; // Ensure type safety
              update.duration = flow[nextStep].duration;
              // Auto-start the next session in the flow
              update.isRunning = true;
            } else {
              // End of flow
              update.currentFlow = null;
              update.currentFlowStep = 0;
            }
          }
          
          return {
            ...state,
            ...update,
          };
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
            currentFlow: null,
            currentFlowStep: 0,
          };
          
          // If we were in a flow, reset to the first session type
          if (state.currentFlow) {
            const flow = FLOWS[state.currentFlow];
            update.sessionType = flow[0].type as SessionType; // Ensure type safety
            update.duration = flow[0].duration;
          }
          
          return {
            ...state,
            ...update,
          };
        }),
        
      // Reset all progress and statistics
      resetProgress: () =>
        set({
          sessionType: 'Classic',
          duration: SESSION_TYPES['Classic'],
          isRunning: false,
          isPaused: false,
          currentFlow: null,
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
