# Advanced State Management - Part 3: Complex State Scenarios & Real-World Examples

## Table of Contents

1. [Complex State Scenarios](#complex-state-scenarios)
2. [Real-World Examples](#real-world-examples)
3. [Advanced Patterns](#advanced-patterns)
4. [State Synchronization](#state-synchronization)
5. [Error Handling & Recovery](#error-handling--recovery)

## Complex State Scenarios

### 1. Multi-Session State Management

```typescript
// store/multiSessionStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface MultiSessionState {
  // Multiple concurrent sessions
  activeSessions: Record<string, Session>;
  sessionQueue: Session[];
  pausedSessions: Record<string, Session>;

  // Session management
  startSession: (taskId: string, sessionType: SessionType) => string;
  pauseSession: (sessionId: string) => void;
  resumeSession: (sessionId: string) => void;
  endSession: (sessionId: string) => void;
  switchSession: (fromSessionId: string, toTaskId: string) => void;

  // Session coordination
  getActiveSessionCount: () => number;
  getSessionByTask: (taskId: string) => Session | undefined;
  getSessionStats: () => MultiSessionStats;
}

export const useMultiSessionStore = create<MultiSessionState>()(
  subscribeWithSelector((set, get) => ({
    activeSessions: {},
    sessionQueue: [],
    pausedSessions: {},

    startSession: (taskId, sessionType) => {
      const sessionId = generateId();
      const session: Session = {
        id: sessionId,
        taskId,
        type: sessionType,
        startTime: new Date(),
        duration: 0,
        interruptions: 0,
        focusScore: 0,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        activeSessions: {
          ...state.activeSessions,
          [sessionId]: session,
        },
      }));

      return sessionId;
    },

    pauseSession: (sessionId) => {
      const session = get().activeSessions[sessionId];
      if (!session) return;

      const pausedSession = {
        ...session,
        status: "paused",
        pauseTime: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        activeSessions: Object.fromEntries(
          Object.entries(state.activeSessions).filter(
            ([id]) => id !== sessionId
          )
        ),
        pausedSessions: {
          ...state.pausedSessions,
          [sessionId]: pausedSession,
        },
      }));
    },

    resumeSession: (sessionId) => {
      const session = get().pausedSessions[sessionId];
      if (!session) return;

      const resumedSession = {
        ...session,
        status: "active",
        resumeTime: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        activeSessions: {
          ...state.activeSessions,
          [sessionId]: resumedSession,
        },
        pausedSessions: Object.fromEntries(
          Object.entries(state.pausedSessions).filter(
            ([id]) => id !== sessionId
          )
        ),
      }));
    },

    endSession: (sessionId) => {
      const session =
        get().activeSessions[sessionId] || get().pausedSessions[sessionId];
      if (!session) return;

      const endTime = new Date();
      const duration = endTime.getTime() - session.startTime.getTime();

      const completedSession = {
        ...session,
        status: "completed",
        endTime,
        duration,
        updatedAt: new Date(),
      };

      set((state) => ({
        activeSessions: Object.fromEntries(
          Object.entries(state.activeSessions).filter(
            ([id]) => id !== sessionId
          )
        ),
        pausedSessions: Object.fromEntries(
          Object.entries(state.pausedSessions).filter(
            ([id]) => id !== sessionId
          )
        ),
      }));

      // Save completed session to history
      // This would typically be handled by a separate history store
    },

    switchSession: (fromSessionId, toTaskId) => {
      const fromSession = get().activeSessions[fromSessionId];
      if (!fromSession) return;

      // Pause current session
      get().pauseSession(fromSessionId);

      // Start new session
      const newSessionId = get().startSession(toTaskId, fromSession.type);

      return newSessionId;
    },

    getActiveSessionCount: () => Object.keys(get().activeSessions).length,

    getSessionByTask: (taskId) => {
      const { activeSessions, pausedSessions } = get();
      return activeSessions[taskId] || pausedSessions[taskId];
    },

    getSessionStats: () => {
      const { activeSessions, pausedSessions } = get();
      const allSessions = { ...activeSessions, ...pausedSessions };

      return {
        activeCount: Object.keys(activeSessions).length,
        pausedCount: Object.keys(pausedSessions).length,
        totalSessions: Object.keys(allSessions).length,
        totalFocusTime: Object.values(allSessions).reduce(
          (total, session) => total + session.duration,
          0
        ),
      };
    },
  }))
);
```

### 2. Flow-Based State Management

```typescript
// store/flowState.ts
import { create } from "zustand";

interface FlowState {
  // Flow management
  flows: Record<string, Flow>;
  currentFlow: string | null;
  flowHistory: FlowHistory[];

  // Flow actions
  createFlow: (flowConfig: FlowConfig) => string;
  startFlow: (flowId: string) => void;
  pauseFlow: () => void;
  resumeFlow: () => void;
  completeFlow: () => void;
  skipFlowStep: () => void;

  // Flow navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepIndex: number) => void;

  // Flow queries
  getCurrentFlow: () => Flow | undefined;
  getCurrentStep: () => FlowStep | undefined;
  getFlowProgress: () => number;
  getFlowStats: () => FlowStats;
}

export const useFlowStore = create<FlowState>()((set, get) => ({
  flows: {},
  currentFlow: null,
  flowHistory: [],

  createFlow: (flowConfig) => {
    const flowId = generateId();
    const flow: Flow = {
      id: flowId,
      name: flowConfig.name,
      steps: flowConfig.steps,
      currentStepIndex: 0,
      status: "created",
      startTime: null,
      endTime: null,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [flowId]: flow,
      },
    }));

    return flowId;
  },

  startFlow: (flowId) => {
    const flow = get().flows[flowId];
    if (!flow) return;

    const updatedFlow = {
      ...flow,
      status: "active",
      startTime: new Date(),
      currentStepIndex: 0,
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [flowId]: updatedFlow,
      },
      currentFlow: flowId,
    }));
  },

  pauseFlow: () => {
    const { currentFlow, flows } = get();
    if (!currentFlow) return;

    const flow = flows[currentFlow];
    if (!flow) return;

    const updatedFlow = {
      ...flow,
      status: "paused",
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [currentFlow]: updatedFlow,
      },
    }));
  },

  resumeFlow: () => {
    const { currentFlow, flows } = get();
    if (!currentFlow) return;

    const flow = flows[currentFlow];
    if (!flow) return;

    const updatedFlow = {
      ...flow,
      status: "active",
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [currentFlow]: updatedFlow,
      },
    }));
  },

  completeFlow: () => {
    const { currentFlow, flows } = get();
    if (!currentFlow) return;

    const flow = flows[currentFlow];
    if (!flow) return;

    const endTime = new Date();
    const duration = flow.startTime
      ? endTime.getTime() - flow.startTime.getTime()
      : 0;

    const completedFlow = {
      ...flow,
      status: "completed",
      endTime,
      duration,
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [currentFlow]: completedFlow,
      },
      flowHistory: [...state.flowHistory, completedFlow],
      currentFlow: null,
    }));
  },

  goToNextStep: () => {
    const { currentFlow, flows } = get();
    if (!currentFlow) return;

    const flow = flows[currentFlow];
    if (!flow || flow.currentStepIndex >= flow.steps.length - 1) return;

    const updatedFlow = {
      ...flow,
      currentStepIndex: flow.currentStepIndex + 1,
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [currentFlow]: updatedFlow,
      },
    }));
  },

  goToPreviousStep: () => {
    const { currentFlow, flows } = get();
    if (!currentFlow) return;

    const flow = flows[currentFlow];
    if (!flow || flow.currentStepIndex <= 0) return;

    const updatedFlow = {
      ...flow,
      currentStepIndex: flow.currentStepIndex - 1,
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [currentFlow]: updatedFlow,
      },
    }));
  },

  goToStep: (stepIndex) => {
    const { currentFlow, flows } = get();
    if (!currentFlow) return;

    const flow = flows[currentFlow];
    if (!flow || stepIndex < 0 || stepIndex >= flow.steps.length) return;

    const updatedFlow = {
      ...flow,
      currentStepIndex: stepIndex,
      updatedAt: new Date(),
    };

    set((state) => ({
      flows: {
        ...state.flows,
        [currentFlow]: updatedFlow,
      },
    }));
  },

  getCurrentFlow: () => {
    const { currentFlow, flows } = get();
    return currentFlow ? flows[currentFlow] : undefined;
  },

  getCurrentStep: () => {
    const flow = get().getCurrentFlow();
    if (!flow) return undefined;

    return flow.steps[flow.currentStepIndex];
  },

  getFlowProgress: () => {
    const flow = get().getCurrentFlow();
    if (!flow) return 0;

    return (flow.currentStepIndex / (flow.steps.length - 1)) * 100;
  },

  getFlowStats: () => {
    const { flows, flowHistory } = get();
    const allFlows = {
      ...flows,
      ...Object.fromEntries(flowHistory.map((flow) => [flow.id, flow])),
    };

    return {
      totalFlows: Object.keys(allFlows).length,
      completedFlows: Object.values(allFlows).filter(
        (f) => f.status === "completed"
      ).length,
      activeFlows: Object.values(allFlows).filter((f) => f.status === "active")
        .length,
      averageDuration:
        Object.values(allFlows)
          .filter((f) => f.duration > 0)
          .reduce((total, flow) => total + flow.duration, 0) /
          Object.values(allFlows).filter((f) => f.duration > 0).length || 0,
    };
  },
}));
```

### 3. Real-Time State Synchronization

```typescript
// store/realTimeState.ts
import { create } from "zustand";

interface RealTimeState {
  // Real-time data
  onlineUsers: User[];
  liveSessions: LiveSession[];
  notifications: Notification[];

  // Connection state
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  lastSyncTime: Date | null;

  // Real-time actions
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: Message) => void;
  updatePresence: (status: UserStatus) => void;

  // Sync actions
  syncState: () => Promise<void>;
  handleReconnection: () => Promise<void>;

  // Real-time queries
  getOnlineUsers: () => User[];
  getLiveSessions: () => LiveSession[];
  getUnreadNotifications: () => Notification[];
}

export const useRealTimeStore = create<RealTimeState>()((set, get) => ({
  onlineUsers: [],
  liveSessions: [],
  notifications: [],
  isConnected: false,
  connectionStatus: "disconnected",
  lastSyncTime: null,

  connect: async () => {
    set({ connectionStatus: "connecting" });

    try {
      // Simulate WebSocket connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set({
        isConnected: true,
        connectionStatus: "connected",
        lastSyncTime: new Date(),
      });

      // Start real-time updates
      get().startRealTimeUpdates();
    } catch (error) {
      set({
        connectionStatus: "error",
        isConnected: false,
      });
      console.error("Connection failed:", error);
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      connectionStatus: "disconnected",
    });

    // Stop real-time updates
    get().stopRealTimeUpdates();
  },

  sendMessage: (message) => {
    if (!get().isConnected) return;

    // Send message to server
    console.log("Sending message:", message);

    // Optimistically update local state
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: generateId(),
          type: "message",
          content: message.content,
          timestamp: new Date(),
          isRead: false,
        },
      ],
    }));
  },

  updatePresence: (status) => {
    if (!get().isConnected) return;

    // Update presence on server
    console.log("Updating presence:", status);
  },

  syncState: async () => {
    try {
      // Fetch latest state from server
      const response = await fetch("/api/sync");
      const { onlineUsers, liveSessions, notifications } =
        await response.json();

      set({
        onlineUsers,
        liveSessions,
        notifications,
        lastSyncTime: new Date(),
      });
    } catch (error) {
      console.error("Sync failed:", error);
    }
  },

  handleReconnection: async () => {
    set({ connectionStatus: "connecting" });

    try {
      await get().connect();
      await get().syncState();
    } catch (error) {
      set({ connectionStatus: "error" });
      console.error("Reconnection failed:", error);
    }
  },

  getOnlineUsers: () => get().onlineUsers,

  getLiveSessions: () => get().liveSessions,

  getUnreadNotifications: () => get().notifications.filter((n) => !n.isRead),

  // Private methods for real-time updates
  startRealTimeUpdates: () => {
    // Start WebSocket listeners
    console.log("Starting real-time updates");
  },

  stopRealTimeUpdates: () => {
    // Stop WebSocket listeners
    console.log("Stopping real-time updates");
  },
}));
```

## Real-World Examples

### 1. Focus App State Management

```typescript
// store/focusAppStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface FocusAppState {
  // Core state
  user: User | null;
  tasks: Task[];
  sessions: Session[];
  flows: Flow[];

  // Current state
  currentTask: Task | null;
  currentSession: Session | null;
  currentFlow: Flow | null;

  // UI state
  ui: {
    theme: "light" | "dark";
    sidebarOpen: boolean;
    modalOpen: string | null;
    notifications: Notification[];
  };

  // Preferences
  preferences: {
    sessionDuration: number;
    breakDuration: number;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    autoStartBreaks: boolean;
  };

  // Actions
  // User management
  setUser: (user: User) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;

  // Task management
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setCurrentTask: (task: Task | null) => void;

  // Session management
  startSession: (taskId: string, sessionType: SessionType) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;

  // Flow management
  startFlow: (flowId: string) => void;
  pauseFlow: () => void;
  completeFlow: () => void;

  // UI actions
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;

  // Preferences
  updatePreferences: (
    preferences: Partial<FocusAppState["preferences"]>
  ) => void;

  // Computed values
  getTaskStats: () => TaskStats;
  getSessionStats: () => SessionStats;
  getProductivityScore: () => number;
  getCurrentSessionTime: () => number;
}

export const useFocusAppStore = create<FocusAppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    tasks: [],
    sessions: [],
    flows: [],
    currentTask: null,
    currentSession: null,
    currentFlow: null,
    ui: {
      theme: "light",
      sidebarOpen: false,
      modalOpen: null,
      notifications: [],
    },
    preferences: {
      sessionDuration: 25 * 60 * 1000, // 25 minutes
      breakDuration: 5 * 60 * 1000, // 5 minutes
      soundEnabled: true,
      notificationsEnabled: true,
      autoStartBreaks: false,
    },

    // User management
    setUser: (user) => set({ user }),
    updateUserPreferences: (preferences) =>
      set((state) => ({
        user: state.user ? { ...state.user, preferences } : null,
      })),

    // Task management
    addTask: (task) =>
      set((state) => ({
        tasks: [...state.tasks, task],
      })),
    updateTask: (taskId, updates) =>
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ),
      })),
    deleteTask: (taskId) =>
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
      })),
    setCurrentTask: (task) => set({ currentTask: task }),

    // Session management
    startSession: (taskId, sessionType) => {
      const session: Session = {
        id: generateId(),
        taskId,
        type: sessionType,
        startTime: new Date(),
        duration: 0,
        interruptions: 0,
        focusScore: 0,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        sessions: [...state.sessions, session],
        currentSession: session,
      }));
    },

    pauseSession: () =>
      set((state) => {
        if (!state.currentSession) return state;

        return {
          currentSession: {
            ...state.currentSession,
            status: "paused",
            pauseTime: new Date(),
          },
        };
      }),

    resumeSession: () =>
      set((state) => {
        if (!state.currentSession) return state;

        return {
          currentSession: {
            ...state.currentSession,
            status: "active",
            resumeTime: new Date(),
          },
        };
      }),

    endSession: () =>
      set((state) => {
        if (!state.currentSession) return state;

        const endTime = new Date();
        const duration =
          endTime.getTime() - state.currentSession.startTime.getTime();

        const completedSession = {
          ...state.currentSession,
          status: "completed",
          endTime,
          duration,
        };

        return {
          sessions: state.sessions.map((session) =>
            session.id === state.currentSession?.id ? completedSession : session
          ),
          currentSession: null,
        };
      }),

    // Flow management
    startFlow: (flowId) => {
      const flow = get().flows.find((f) => f.id === flowId);
      if (!flow) return;

      set({ currentFlow: flow });
    },

    pauseFlow: () =>
      set((state) => {
        if (!state.currentFlow) return state;

        return {
          currentFlow: {
            ...state.currentFlow,
            status: "paused",
          },
        };
      }),

    completeFlow: () => set({ currentFlow: null }),

    // UI actions
    setTheme: (theme) =>
      set((state) => ({
        ui: { ...state.ui, theme },
      })),

    toggleSidebar: () =>
      set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      })),

    openModal: (modalId) =>
      set((state) => ({
        ui: { ...state.ui, modalOpen: modalId },
      })),

    closeModal: () =>
      set((state) => ({
        ui: { ...state.ui, modalOpen: null },
      })),

    addNotification: (notification) =>
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, notification],
        },
      })),

    removeNotification: (notificationId) =>
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            (n) => n.id !== notificationId
          ),
        },
      })),

    // Preferences
    updatePreferences: (preferences) =>
      set((state) => ({
        preferences: { ...state.preferences, ...preferences },
      })),

    // Computed values
    getTaskStats: () => {
      const { tasks } = get();
      return {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
      };
    },

    getSessionStats: () => {
      const { sessions } = get();
      return {
        total: sessions.length,
        totalTime: sessions.reduce((total, s) => total + s.duration, 0),
        averageScore:
          sessions.length > 0
            ? sessions.reduce((total, s) => total + s.focusScore, 0) /
              sessions.length
            : 0,
      };
    },

    getProductivityScore: () => {
      const taskStats = get().getTaskStats();
      const sessionStats = get().getSessionStats();

      const completionRate =
        taskStats.total > 0 ? taskStats.completed / taskStats.total : 0;
      const focusEfficiency = sessionStats.averageScore / 100;

      return (completionRate * 0.6 + focusEfficiency * 0.4) * 100;
    },

    getCurrentSessionTime: () => {
      const { currentSession } = get();
      if (!currentSession || currentSession.status !== "active") return 0;

      const now = new Date();
      return now.getTime() - currentSession.startTime.getTime();
    },
  }))
);
```

### 2. Advanced Component Integration

```typescript
// components/FocusApp.tsx
import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusAppStore } from '../store/focusAppStore';

const FocusApp = () => {
  const {
    currentTask,
    currentSession,
    currentFlow,
    ui,
    preferences,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    setTheme,
    toggleSidebar,
    openModal,
    getCurrentSessionTime,
    getProductivityScore,
  } = useFocusAppStore();

  // Auto-update session time
  useEffect(() => {
    if (currentSession?.status === 'active') {
      const interval = setInterval(() => {
        // This will trigger re-render with updated time
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSession?.status]);

  const handleStartSession = useCallback(() => {
    if (!currentTask) {
      openModal('select-task');
      return;
    }

    startSession(currentTask.id, 'pomodoro');
  }, [currentTask, startSession, openModal]);

  const handlePauseSession = useCallback(() => {
    pauseSession();
  }, [pauseSession]);

  const handleResumeSession = useCallback(() => {
    resumeSession();
  }, [resumeSession]);

  const handleEndSession = useCallback(() => {
    endSession();
  }, [endSession]);

  return (
    <View style={{ flex: 1, backgroundColor: ui.theme === 'dark' ? '#000' : '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Text>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Solitude</Text>
        <TouchableOpacity onPress={() => setTheme(ui.theme === 'light' ? 'dark' : 'light')}>
          <Text>{ui.theme === 'light' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentSession ? (
          <SessionDisplay
            session={currentSession}
            time={getCurrentSessionTime()}
            onPause={handlePauseSession}
            onResume={handleResumeSession}
            onEnd={handleEndSession}
          />
        ) : (
          <TaskSelector onStartSession={handleStartSession} />
        )}
      </View>

      {/* Productivity Score */}
      <ProductivityScore score={getProductivityScore()} />

      {/* Notifications */}
      <NotificationList notifications={ui.notifications} />
    </View>
  );
};

const SessionDisplay = ({ session, time, onPause, onResume, onEnd }) => (
  <View style={styles.sessionDisplay}>
    <Text style={styles.sessionTime}>{formatTime(time)}</Text>
    <Text style={styles.sessionType}>{session.type}</Text>

    <View style={styles.sessionControls}>
      {session.status === 'active' ? (
        <TouchableOpacity onPress={onPause} style={styles.button}>
          <Text>Pause</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onResume} style={styles.button}>
          <Text>Resume</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onEnd} style={styles.button}>
        <Text>End</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ProductivityScore = ({ score }) => (
  <View style={styles.productivityScore}>
    <Text style={styles.scoreLabel}>Productivity Score</Text>
    <Text style={styles.scoreValue}>{score.toFixed(1)}%</Text>
  </View>
);

const NotificationList = ({ notifications }) => (
  <View style={styles.notificationList}>
    {notifications.map(notification => (
      <View key={notification.id} style={styles.notification}>
        <Text>{notification.content}</Text>
      </View>
    ))}
  </View>
);
```

This Part 3 covers complex state scenarios including multi-session management, flow-based state, real-time synchronization, and complete focus app integration. These patterns are essential for building sophisticated applications with complex state requirements.

The examples demonstrate how to handle multiple concurrent sessions, flow-based workflows, real-time updates, and comprehensive app state management for your focus application.

Would you like me to continue with **Part 4: State Synchronization & Error Handling** or move on to another topic?
