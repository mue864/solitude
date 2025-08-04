# Advanced State Management - Part 1: Advanced Patterns & Architectures

## Table of Contents

1. [Advanced Zustand Patterns](#advanced-zustand-patterns)
2. [State Composition](#state-composition)
3. [Cross-Store Communication](#cross-store-communication)
4. [Performance Optimization](#performance-optimization)
5. [Complex State Scenarios](#complex-state-scenarios)

## Advanced Zustand Patterns

### 1. Store Composition Pattern

```typescript
// store/composedStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Base store interface
interface BaseStore {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create base store
const createBaseStore = (set: any): BaseStore => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
});

// User store with composition
interface UserStore extends BaseStore {
  user: User | null;
  userPreferences: UserPreferences;
  setUser: (user: User) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    // Include base store functionality
    ...createBaseStore(set),

    // User-specific state
    user: null,
    userPreferences: {
      theme: "light",
      notifications: true,
      soundEnabled: true,
    },

    // User-specific actions
    setUser: (user) => set({ user }),
    updatePreferences: (preferences) =>
      set((state) => ({
        userPreferences: { ...state.userPreferences, ...preferences },
      })),
    logout: () => set({ user: null, userPreferences: get().userPreferences }),
  }))
);
```

### 2. Store Factory Pattern

```typescript
// store/storeFactory.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Generic store factory
interface StoreConfig<T> {
  name: string;
  initialState: T;
  actions: (set: any, get: any) => Record<string, Function>;
  persist?: boolean;
  devtools?: boolean;
}

export function createStore<T>(config: StoreConfig<T>) {
  const {
    name,
    initialState,
    actions,
    persist: shouldPersist,
    devtools: shouldDevtools,
  } = config;

  let store = (set: any, get: any) => ({
    ...initialState,
    ...actions(set, get),
  });

  // Add middleware conditionally
  if (shouldPersist) {
    store = persist(store, {
      name,
      partialize: (state) => state,
    });
  }

  if (shouldDevtools) {
    store = devtools(store, { name });
  }

  return create(store);
}

// Usage example
const sessionStore = createStore({
  name: "session-store",
  initialState: {
    currentSession: null,
    sessionHistory: [],
    totalFocusTime: 0,
  },
  actions: (set, get) => ({
    startSession: (sessionData) => set({ currentSession: sessionData }),
    endSession: () => {
      const { currentSession } = get();
      if (currentSession) {
        set((state) => ({
          sessionHistory: [...state.sessionHistory, currentSession],
          currentSession: null,
          totalFocusTime: state.totalFocusTime + currentSession.duration,
        }));
      }
    },
    clearHistory: () => set({ sessionHistory: [], totalFocusTime: 0 }),
  }),
  persist: true,
  devtools: true,
});
```

### 3. Store Middleware Pattern

```typescript
// store/middleware/logger.ts
import { StateCreator } from "zustand";

export const logger =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (...args) => {
        console.log("🔄 State Update:", args);
        set(...args);
      },
      get,
      api
    );

// store/middleware/analytics.ts
export const analytics =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (...args) => {
        // Track state changes for analytics
        const [partial, replace] = args;
        if (typeof partial === "function") {
          const newState = partial(get());
          trackStateChange(newState);
        }
        set(...args);
      },
      get,
      api
    );

// store/middleware/validation.ts
export const validation =
  <T extends object>(
    config: StateCreator<T>,
    validators: Record<string, (value: any) => boolean>
  ): StateCreator<T> =>
  (set, get, api) =>
    config(
      (...args) => {
        const [partial, replace] = args;
        if (typeof partial === "function") {
          const newState = partial(get());

          // Validate state changes
          Object.entries(validators).forEach(([key, validator]) => {
            if (newState[key] !== undefined && !validator(newState[key])) {
              console.warn(`❌ Validation failed for ${key}:`, newState[key]);
              return; // Don't update if validation fails
            }
          });
        }
        set(...args);
      },
      get,
      api
    );

// Usage with middleware
export const useTaskStore = create<TaskStore>()(
  logger(
    analytics(
      validation(
        (set, get) => ({
          tasks: [],
          currentTask: null,
          addTask: (task) =>
            set((state) => ({
              tasks: [...state.tasks, task],
            })),
          setCurrentTask: (task) => set({ currentTask: task }),
        }),
        {
          tasks: (tasks) => Array.isArray(tasks),
          currentTask: (task) => task === null || typeof task === "object",
        }
      )
    )
  )
);
```

## State Composition

### 1. Hierarchical State Pattern

```typescript
// store/hierarchicalState.ts
import { create } from "zustand";

// Base state interface
interface BaseState {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task state
interface Task extends BaseState {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  tags: string[];
  estimatedTime: number;
  actualTime: number;
}

// Session state
interface Session extends BaseState {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  interruptions: number;
  focusScore: number;
}

// Project state
interface Project extends BaseState {
  name: string;
  description: string;
  tasks: Task[];
  sessions: Session[];
  totalFocusTime: number;
  completionRate: number;
}

// Hierarchical store
interface HierarchicalStore {
  // Projects level
  projects: Project[];
  currentProject: Project | null;

  // Tasks level
  tasks: Task[];
  currentTask: Task | null;

  // Sessions level
  sessions: Session[];
  currentSession: Session | null;

  // Actions
  setCurrentProject: (project: Project) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  startSession: (taskId: string) => void;
  endSession: () => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;

  // Computed values
  getProjectTasks: (projectId: string) => Task[];
  getTaskSessions: (taskId: string) => Session[];
  getProjectStats: (projectId: string) => ProjectStats;
}

export const useHierarchicalStore = create<HierarchicalStore>()((set, get) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  currentTask: null,
  sessions: [],
  currentSession: null,

  setCurrentProject: (project) => set({ currentProject: project }),

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

  startSession: (taskId) => {
    const session: Session = {
      id: generateId(),
      taskId,
      startTime: new Date(),
      duration: 0,
      interruptions: 0,
      focusScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      sessions: [...state.sessions, session],
      currentSession: session,
    }));
  },

  endSession: () =>
    set((state) => {
      if (!state.currentSession) return state;

      const endTime = new Date();
      const duration =
        endTime.getTime() - state.currentSession.startTime.getTime();

      return {
        sessions: state.sessions.map((session) =>
          session.id === state.currentSession?.id
            ? { ...session, endTime, duration, updatedAt: new Date() }
            : session
        ),
        currentSession: null,
      };
    }),

  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, ...updates, updatedAt: new Date() }
          : session
      ),
    })),

  // Computed values
  getProjectTasks: (projectId) =>
    get().tasks.filter((task) => task.projectId === projectId),

  getTaskSessions: (taskId) =>
    get().sessions.filter((session) => session.taskId === taskId),

  getProjectStats: (projectId) => {
    const tasks = get().getProjectTasks(projectId);
    const sessions = get().sessions.filter((session) =>
      tasks.some((task) => task.id === session.taskId)
    );

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.status === "completed")
        .length,
      totalFocusTime: sessions.reduce(
        (total, session) => total + session.duration,
        0
      ),
      averageFocusScore:
        sessions.length > 0
          ? sessions.reduce((total, session) => total + session.focusScore, 0) /
            sessions.length
          : 0,
    };
  },
}));
```

### 2. State Slice Pattern

```typescript
// store/slices/taskSlice.ts
import { StateCreator } from "zustand";

export interface TaskSlice {
  tasks: Task[];
  currentTask: Task | null;
  taskFilters: TaskFilters;

  // Actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setCurrentTask: (task: Task | null) => void;
  setTaskFilters: (filters: TaskFilters) => void;

  // Selectors
  getFilteredTasks: () => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export const createTaskSlice: StateCreator<TaskSlice> = (set, get) => ({
  tasks: [],
  currentTask: null,
  taskFilters: {
    status: "all",
    priority: "all",
    tags: [],
  },

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

  setTaskFilters: (filters) => set({ taskFilters: filters }),

  getFilteredTasks: () => {
    const { tasks, taskFilters } = get();
    return tasks.filter((task) => {
      if (taskFilters.status !== "all" && task.status !== taskFilters.status) {
        return false;
      }
      if (
        taskFilters.priority !== "all" &&
        task.priority !== taskFilters.priority
      ) {
        return false;
      }
      if (
        taskFilters.tags.length > 0 &&
        !taskFilters.tags.some((tag) => task.tags.includes(tag))
      ) {
        return false;
      }
      return true;
    });
  },

  getTaskById: (taskId) => get().tasks.find((task) => task.id === taskId),

  getTasksByStatus: (status) =>
    get().tasks.filter((task) => task.status === status),
});

// store/slices/sessionSlice.ts
export interface SessionSlice {
  sessions: Session[];
  currentSession: Session | null;
  sessionStats: SessionStats;

  // Actions
  startSession: (taskId: string) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  updateSessionFocus: (focusScore: number) => void;

  // Selectors
  getSessionStats: () => SessionStats;
  getSessionsByTask: (taskId: string) => Session[];
  getTodaySessions: () => Session[];
}

export const createSessionSlice: StateCreator<SessionSlice> = (set, get) => ({
  sessions: [],
  currentSession: null,
  sessionStats: {
    totalSessions: 0,
    totalFocusTime: 0,
    averageFocusScore: 0,
    longestStreak: 0,
  },

  startSession: (taskId) => {
    const session: Session = {
      id: generateId(),
      taskId,
      startTime: new Date(),
      duration: 0,
      interruptions: 0,
      focusScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      sessions: [...state.sessions, session],
      currentSession: session,
    }));
  },

  endSession: () =>
    set((state) => {
      if (!state.currentSession) return state;

      const endTime = new Date();
      const duration =
        endTime.getTime() - state.currentSession.startTime.getTime();

      return {
        sessions: state.sessions.map((session) =>
          session.id === state.currentSession?.id
            ? { ...session, endTime, duration, updatedAt: new Date() }
            : session
        ),
        currentSession: null,
      };
    }),

  pauseSession: () =>
    set((state) => {
      if (!state.currentSession) return state;

      return {
        currentSession: { ...state.currentSession, isPaused: true },
      };
    }),

  resumeSession: () =>
    set((state) => {
      if (!state.currentSession) return state;

      return {
        currentSession: { ...state.currentSession, isPaused: false },
      };
    }),

  updateSessionFocus: (focusScore) =>
    set((state) => {
      if (!state.currentSession) return state;

      return {
        currentSession: { ...state.currentSession, focusScore },
      };
    }),

  getSessionStats: () => {
    const { sessions } = get();
    const totalSessions = sessions.length;
    const totalFocusTime = sessions.reduce(
      (total, session) => total + session.duration,
      0
    );
    const averageFocusScore =
      totalSessions > 0
        ? sessions.reduce((total, session) => total + session.focusScore, 0) /
          totalSessions
        : 0;

    return {
      totalSessions,
      totalFocusTime,
      averageFocusScore,
      longestStreak: 0,
    };
  },

  getSessionsByTask: (taskId) =>
    get().sessions.filter((session) => session.taskId === taskId),

  getTodaySessions: () => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return get().sessions.filter((session) => session.startTime >= startOfDay);
  },
});

// Combined store with slices
export const useAppStore = create<TaskSlice & SessionSlice>()((...args) => ({
  ...createTaskSlice(...args),
  ...createSessionSlice(...args),
}));
```

## Cross-Store Communication

### 1. Store Dependencies Pattern

```typescript
// store/storeDependencies.ts
import { create } from "zustand";
import { useTaskStore } from "./taskStore";
import { useSessionStore } from "./sessionStore";

// Store that depends on other stores
interface AnalyticsStore {
  analytics: AnalyticsData;
  trackTaskCompletion: (taskId: string) => void;
  trackSessionStart: (taskId: string) => void;
  trackSessionEnd: (sessionId: string) => void;
  generateReport: () => AnalyticsReport;
}

export const useAnalyticsStore = create<AnalyticsStore>()((set, get) => ({
  analytics: {
    totalTasksCompleted: 0,
    totalFocusTime: 0,
    averageSessionDuration: 0,
    productivityScore: 0,
  },

  trackTaskCompletion: (taskId) => {
    const task = useTaskStore.getState().getTaskById(taskId);
    if (task) {
      set((state) => ({
        analytics: {
          ...state.analytics,
          totalTasksCompleted: state.analytics.totalTasksCompleted + 1,
        },
      }));
    }
  },

  trackSessionStart: (taskId) => {
    // Track session start analytics
    console.log("Session started for task:", taskId);
  },

  trackSessionEnd: (sessionId) => {
    const session = useSessionStore
      .getState()
      .sessions.find((s) => s.id === sessionId);
    if (session) {
      set((state) => ({
        analytics: {
          ...state.analytics,
          totalFocusTime: state.analytics.totalFocusTime + session.duration,
        },
      }));
    }
  },

  generateReport: () => {
    const tasks = useTaskStore.getState().tasks;
    const sessions = useSessionStore.getState().sessions;
    const { analytics } = get();

    return {
      ...analytics,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalSessions: sessions.length,
      averageSessionDuration:
        sessions.length > 0
          ? sessions.reduce((total, s) => total + s.duration, 0) /
            sessions.length
          : 0,
    };
  },
}));
```

### 2. Event-Driven Communication

```typescript
// store/eventBus.ts
type EventHandler = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventHandler[]> = new Map();

  subscribe(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  unsubscribe(event: string, handler: EventHandler) {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }
}

export const eventBus = new EventBus();

// Store with event-driven updates
export const useNotificationStore = create<NotificationStore>()((set, get) => {
  // Subscribe to events from other stores
  eventBus.subscribe("task:completed", (taskId) => {
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: generateId(),
          type: "task_completed",
          message: `Task completed: ${taskId}`,
          timestamp: new Date(),
        },
      ],
    }));
  });

  eventBus.subscribe("session:started", (taskId) => {
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: generateId(),
          type: "session_started",
          message: `Focus session started`,
          timestamp: new Date(),
        },
      ],
    }));
  });

  return {
    notifications: [],
    addNotification: (notification) =>
      set((state) => ({
        notifications: [...state.notifications, notification],
      })),
    clearNotifications: () => set({ notifications: [] }),
  };
});

// Emit events from other stores
export const useTaskStore = create<TaskStore>()((set, get) => ({
  // ... other state and actions

  completeTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: "completed" } : task
      ),
    }));

    // Emit event for other stores
    eventBus.emit("task:completed", taskId);
  },
}));
```

This Part 1 covers advanced state management patterns including store composition, hierarchical state, cross-store communication, and event-driven architecture. The patterns are specifically designed for complex applications like your focus app.

Would you like me to continue with **Part 2: Performance Optimization & Advanced Techniques**?
