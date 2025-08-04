# Zustand Comprehensive Guide for React Native

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Basic Usage](#basic-usage)
4. [Advanced Patterns](#advanced-patterns)
5. [Middleware](#middleware)
6. [Best Practices](#best-practices)
7. [Real-World Examples](#real-world-examples)
8. [Performance Optimization](#performance-optimization)
9. [Testing](#testing)
10. [Migration from Redux](#migration-from-redux)

## Introduction

Zustand is a small, fast, and scalable state management solution for React. It's designed to be simple and unopinionated, making it perfect for React Native applications. Unlike Redux, Zustand doesn't require providers, actions, or reducers - just a simple store with state and actions.

### Why Zustand?

- **Simple**: No providers, actions, or reducers needed
- **Lightweight**: ~1KB bundle size
- **TypeScript**: Excellent TypeScript support
- **Flexible**: Works with any React setup
- **Fast**: Minimal re-renders with automatic optimization
- **Middleware**: Built-in middleware support
- **DevTools**: Excellent debugging support

### Key Features

- **No Boilerplate**: Create stores with minimal code
- **Automatic Updates**: Components re-render when state changes
- **Middleware Support**: Persist, devtools, immer, etc.
- **TypeScript First**: Excellent type inference
- **Cross-Platform**: Works perfectly with React Native

## Core Concepts

### 1. Store

A store is a simple object that contains state and actions to modify that state.

```typescript
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### 2. State

State is the data your application manages. It can be any JavaScript value.

```typescript
interface AppState {
  // Primitive values
  isLoading: boolean;
  error: string | null;

  // Objects
  user: {
    id: string;
    name: string;
    email: string;
  } | null;

  // Arrays
  items: Item[];

  // Complex nested state
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
    language: string;
  };
}
```

### 3. Actions

Actions are functions that modify the state. They receive `set` and `get` functions.

```typescript
interface StoreActions {
  // Simple actions
  setLoading: (loading: boolean) => void;

  // Actions with logic
  fetchUser: (id: string) => Promise<void>;

  // Actions that use get()
  toggleItem: (id: string) => void;

  // Async actions
  saveData: (data: any) => Promise<void>;
}
```

## Basic Usage

### 1. Creating a Simple Store

```typescript
import { create } from "zustand";

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],

  addTodo: (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };

    set((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },

  removeTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));
  },

  toggleTodo: (id: string) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  },
}));
```

### 2. Using the Store in Components

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTodoStore } from './store/todoStore';

const TodoList = () => {
  // Subscribe to specific parts of the store
  const { todos, addTodo, removeTodo, toggleTodo } = useTodoStore();

  // Or subscribe to individual values
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);

  return (
    <View>
      {todos.map(todo => (
        <TouchableOpacity
          key={todo.id}
          onPress={() => toggleTodo(todo.id)}
        >
          <Text style={{ textDecorationLine: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### 3. Computed Values

```typescript
const TodoStats = () => {
  const todos = useTodoStore((state) => state.todos);

  // Compute derived state
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const pendingCount = totalCount - completedCount;

  return (
    <View>
      <Text>Total: {totalCount}</Text>
      <Text>Completed: {completedCount}</Text>
      <Text>Pending: {pendingCount}</Text>
    </View>
  );
};
```

## Advanced Patterns

### 1. Store Composition

Break down large stores into smaller, focused stores.

```typescript
// User store
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Settings store
interface SettingsState {
  theme: "light" | "dark";
  language: string;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: string) => void;
}

const useSettingsStore = create<SettingsState>((set) => ({
  theme: "light",
  language: "en",
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));

// Combined store (if needed)
const useAppStore = create<AppState>((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),

  // Settings state
  theme: "light",
  language: "en",
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),

  // Computed values
  isAuthenticated: () => get().user !== null,
}));
```

### 2. Async Actions

```typescript
interface AsyncState {
  data: any[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  saveData: (data: any) => Promise<void>;
}

const useAsyncStore = create<AsyncState>((set, get) => ({
  data: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch("/api/data");
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  saveData: async (newData: any) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      const savedData = await response.json();
      set((state) => ({
        data: [...state.data, savedData],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 3. Actions with Dependencies

```typescript
interface ComplexState {
  items: Item[];
  selectedItems: string[];
  addItem: (item: Item) => void;
  selectItem: (id: string) => void;
  removeSelectedItems: () => void;
  getSelectedItems: () => Item[];
}

const useComplexStore = create<ComplexState>((set, get) => ({
  items: [],
  selectedItems: [],

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  selectItem: (id) => {
    set((state) => ({
      selectedItems: state.selectedItems.includes(id)
        ? state.selectedItems.filter((itemId) => itemId !== id)
        : [...state.selectedItems, id],
    }));
  },

  removeSelectedItems: () => {
    const { selectedItems } = get();
    set((state) => ({
      items: state.items.filter((item) => !selectedItems.includes(item.id)),
      selectedItems: [],
    }));
  },

  getSelectedItems: () => {
    const { items, selectedItems } = get();
    return items.filter((item) => selectedItems.includes(item.id));
  },
}));
```

### 4. Store with Computed Values

```typescript
interface ComputedState {
  todos: Todo[];
  filter: "all" | "active" | "completed";
  addTodo: (text: string) => void;
  setFilter: (filter: "all" | "active" | "completed") => void;
  filteredTodos: Todo[];
  stats: {
    total: number;
    completed: number;
    active: number;
  };
}

const useComputedStore = create<ComputedState>((set, get) => ({
  todos: [],
  filter: "all",

  addTodo: (text) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };

    set((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },

  setFilter: (filter) => set({ filter }),

  get filteredTodos() {
    const { todos, filter } = get();

    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },

  get stats() {
    const { todos } = get();
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;

    return { total, completed, active };
  },
}));
```

## Middleware

### 1. Persist Middleware

Persist state to storage (AsyncStorage in React Native).

```typescript
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PersistedState {
  user: User | null;
  settings: Settings;
  setUser: (user: User) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const usePersistedStore = create<PersistedState>()(
  persist(
    (set) => ({
      user: null,
      settings: {
        theme: "light",
        notifications: true,
        language: "en",
      },

      setUser: (user) => set({ user }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "app-storage", // unique name for storage key
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
      // Optional: partial persistence
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);
```

### 2. DevTools Middleware

Enable Redux DevTools for debugging.

```typescript
import { devtools } from "zustand/middleware";

const useDevToolsStore = create<State>()(
  devtools(
    (set) => ({
      // your state and actions
    }),
    {
      name: "my-store", // name for devtools
      enabled: __DEV__, // only enable in development
    }
  )
);
```

### 3. Immer Middleware

Use Immer for immutable updates with mutable syntax.

```typescript
import { immer } from "zustand/middleware/immer";

const useImmerStore = create<State>()(
  immer((set) => ({
    todos: [],

    addTodo: (text: string) =>
      set((state) => {
        state.todos.push({
          id: Date.now().toString(),
          text,
          completed: false,
        });
      }),

    toggleTodo: (id: string) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),
  }))
);
```

### 4. Multiple Middleware

Combine multiple middleware.

```typescript
const useAdvancedStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        // your state and actions
      })),
      {
        name: "advanced-store",
        storage: createJSONStorage(() => AsyncStorage),
      }
    ),
    {
      name: "advanced-store",
    }
  )
);
```

## Best Practices

### 1. Store Organization

```typescript
// store/index.ts - Export all stores
export { useUserStore } from "./userStore";
export { useSettingsStore } from "./settingsStore";
export { useTodoStore } from "./todoStore";

// store/userStore.ts - Single responsibility
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.login(credentials);
          set({ user, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        set({ loading: true, error: null });
        try {
          const updatedUser = await userService.updateProfile(user.id, updates);
          set({ user: updatedUser, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 2. Type Safety

```typescript
// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Settings {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
  autoSave: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// store/types.ts
export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  actions: {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    updateProfile: (updates: Partial<User>) => Promise<void>;
  };
}

export interface SettingsState {
  settings: Settings;
  actions: {
    updateSettings: (updates: Partial<Settings>) => void;
    resetSettings: () => void;
  };
}
```

### 3. Action Organization

```typescript
interface WellOrganizedState {
  // State
  data: any[];
  loading: boolean;
  error: string | null;

  // Actions grouped by functionality
  dataActions: {
    fetch: () => Promise<void>;
    save: (item: any) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };

  uiActions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
  };
}

const useWellOrganizedStore = create<WellOrganizedState>()((set, get) => ({
  data: [],
  loading: false,
  error: null,

  dataActions: {
    fetch: async () => {
      set({ loading: true, error: null });
      try {
        const data = await api.fetchData();
        set({ data, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    save: async (item) => {
      set({ loading: true, error: null });
      try {
        const savedItem = await api.saveData(item);
        set((state) => ({
          data: [...state.data, savedItem],
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    delete: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.deleteData(id);
        set((state) => ({
          data: state.data.filter((item) => item.id !== id),
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
  },

  uiActions: {
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  },
}));
```

### 4. Computed Values and Selectors

```typescript
interface ComputedState {
  todos: Todo[];
  filter: "all" | "active" | "completed";

  // Actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: "all" | "active" | "completed") => void;

  // Computed values
  filteredTodos: Todo[];
  stats: {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
  };
}

const useComputedStore = create<ComputedState>()((set, get) => ({
  todos: [],
  filter: "all",

  addTodo: (text) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },

  toggleTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      ),
    }));
  },

  setFilter: (filter) => set({ filter }),

  get filteredTodos() {
    const { todos, filter } = get();

    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },

  get stats() {
    const { todos } = get();
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      active,
      completionRate: Math.round(completionRate),
    };
  },
}));
```

## Real-World Examples

### 1. Focus App Session Store

Based on your current implementation:

```typescript
interface SessionState {
  // Session state
  sessionType: SessionType;
  duration: number;
  isRunning: boolean;
  isPaused: boolean;
  currentFlowId: string | null;
  currentFlowStep: number;
  sessionId: string;

  // Stats
  completedSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;

  // Actions
  setSessionType: (type: SessionType) => void;
  setDuration: (duration: number) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  resetSession: () => void;

  // Flow actions
  startFlow: (flowId: string) => void;
  nextSession: () => void;
  endFlow: () => void;

  // Computed values
  formattedTime: string;
  progress: number;
  isInFlow: boolean;
}

const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionType: "Classic",
      duration: 25 * 60, // 25 minutes in seconds
      isRunning: false,
      isPaused: false,
      currentFlowId: null,
      currentFlowStep: 0,
      sessionId: "",

      completedSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,

      // Actions
      setSessionType: (type) => {
        set({ sessionType: type, duration: SESSION_TYPES[type] });
      },

      setDuration: (duration) => set({ duration }),

      startSession: () => {
        const sessionId = Date.now().toString();
        set({
          isRunning: true,
          isPaused: false,
          sessionId,
        });
      },

      pauseSession: () => set({ isPaused: true, isRunning: false }),

      resumeSession: () => set({ isPaused: false, isRunning: true }),

      completeSession: () => {
        const { currentStreak, longestStreak } = get();
        const today = new Date().toISOString().split("T")[0];

        set((state) => ({
          isRunning: false,
          isPaused: false,
          completedSessions: state.completedSessions + 1,
          currentStreak: currentStreak + 1,
          longestStreak: Math.max(longestStreak, currentStreak + 1),
          lastSessionDate: today,
          sessionId: "",
        }));
      },

      resetSession: () => {
        set({
          isRunning: false,
          isPaused: false,
          sessionId: "",
        });
      },

      startFlow: (flowId) => {
        set({
          currentFlowId: flowId,
          currentFlowStep: 0,
          isRunning: true,
          isPaused: false,
          sessionId: Date.now().toString(),
        });
      },

      nextSession: () => {
        const { currentFlowId, currentFlowStep } = get();
        if (!currentFlowId) return;

        const flow = FLOWS[currentFlowId];
        if (currentFlowStep < flow.length - 1) {
          set({ currentFlowStep: currentFlowStep + 1 });
        } else {
          set({
            currentFlowId: null,
            currentFlowStep: 0,
            isRunning: false,
          });
        }
      },

      endFlow: () => {
        set({
          currentFlowId: null,
          currentFlowStep: 0,
          isRunning: false,
          isPaused: false,
        });
      },

      // Computed values
      get formattedTime() {
        const { duration } = get();
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      },

      get progress() {
        // This would be calculated based on elapsed time
        return 0;
      },

      get isInFlow() {
        return get().currentFlowId !== null;
      },
    }),
    {
      name: "session-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 2. Task Management Store

```typescript
interface TaskState {
  tasks: Task[];
  currentTaskId: string | null;

  // Actions
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  setCurrentTask: (id: string | null) => void;

  // Computed values
  currentTask: Task | null;
  activeTasks: Task[];
  completedTasks: Task[];
  tasksByTag: Record<TaskTag, Task[]>;
  taskStats: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
}

const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTaskId: null,

      addTask: (taskData) => {
        const newTask: Task = {
          id: Date.now().toString(),
          ...taskData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          currentTaskId:
            state.currentTaskId === id ? null : state.currentTaskId,
        }));
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: true, updatedAt: new Date() }
              : task
          ),
        }));
      },

      setCurrentTask: (id) => set({ currentTaskId: id }),

      get currentTask() {
        const { tasks, currentTaskId } = get();
        return currentTaskId
          ? tasks.find((task) => task.id === currentTaskId) || null
          : null;
      },

      get activeTasks() {
        return get().tasks.filter((task) => !task.completed);
      },

      get completedTasks() {
        return get().tasks.filter((task) => task.completed);
      },

      get tasksByTag() {
        const { tasks } = get();
        return tasks.reduce(
          (acc, task) => {
            const tag = task.tag || "none";
            if (!acc[tag]) acc[tag] = [];
            acc[tag].push(task);
            return acc;
          },
          {} as Record<TaskTag, Task[]>
        );
      },

      get taskStats() {
        const { tasks } = get();
        const total = tasks.length;
        const completed = tasks.filter((task) => task.completed).length;
        const active = total - completed;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          total,
          active,
          completed,
          completionRate: Math.round(completionRate),
        };
      },
    }),
    {
      name: "task-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 3. Settings Store

```typescript
interface SettingsState {
  settings: Settings;

  // Actions
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;

  // Computed values
  isDarkMode: boolean;
  hasNotifications: boolean;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: "light",
        notifications: true,
        language: "en",
        autoSave: true,
        soundEnabled: true,
        vibrationEnabled: true,
        focusMode: "pomodoro",
        breakDuration: 5,
        sessionDuration: 25,
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({
          settings: {
            theme: "light",
            notifications: true,
            language: "en",
            autoSave: true,
            soundEnabled: true,
            vibrationEnabled: true,
            focusMode: "pomodoro",
            breakDuration: 5,
            sessionDuration: 25,
          },
        });
      },

      toggleTheme: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme: state.settings.theme === "light" ? "dark" : "light",
          },
        }));
      },

      toggleNotifications: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: !state.settings.notifications,
          },
        }));
      },

      get isDarkMode() {
        return get().settings.theme === "dark";
      },

      get hasNotifications() {
        return get().settings.notifications;
      },
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## Performance Optimization

### 1. Selective Subscriptions

```typescript
// Bad: Subscribe to entire store
const Component = () => {
  const store = useTaskStore(); // Re-renders on any state change
  return <div>{store.tasks.length}</div>;
};

// Good: Subscribe to specific values
const Component = () => {
  const taskCount = useTaskStore((state) => state.tasks.length);
  return <div>{taskCount}</div>;
};

// Better: Use selectors for complex computations
const useTaskStats = () => {
  return useTaskStore((state) => ({
    total: state.tasks.length,
    completed: state.tasks.filter(task => task.completed).length,
    active: state.tasks.filter(task => !task.completed).length,
  }));
};
```

### 2. Memoized Selectors

```typescript
import { useMemo } from 'react';

const TaskList = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const filter = useTaskStore((state) => state.filter);

  // Memoize filtered tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  return (
    <div>
      {filteredTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
```

### 3. Store Splitting

```typescript
// Split large stores into smaller ones
const useUserStore = create<UserState>()(/* ... */);
const useSettingsStore = create<SettingsState>()(/* ... */);
const useTaskStore = create<TaskState>()(/* ... */);

// Only subscribe to what you need
const UserProfile = () => {
  const user = useUserStore((state) => state.user);
  const settings = useSettingsStore((state) => state.settings.theme);

  return (
    <div className={settings}>
      <h1>{user?.name}</h1>
    </div>
  );
};
```

## Testing

### 1. Unit Testing Stores

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useTaskStore } from "./taskStore";

describe("Task Store", () => {
  beforeEach(() => {
    // Reset store before each test
    useTaskStore.setState({ tasks: [], currentTaskId: null });
  });

  it("should add a task", () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({
        text: "Test task",
        tag: "important",
        completed: false,
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].text).toBe("Test task");
  });

  it("should complete a task", () => {
    const { result } = renderHook(() => useTaskStore());

    // Add a task first
    act(() => {
      result.current.addTask({
        text: "Test task",
        tag: "important",
        completed: false,
      });
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.completeTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);
  });

  it("should calculate stats correctly", () => {
    const { result } = renderHook(() => useTaskStore());

    // Add some tasks
    act(() => {
      result.current.addTask({
        text: "Task 1",
        tag: "important",
        completed: false,
      });
      result.current.addTask({
        text: "Task 2",
        tag: "urgent",
        completed: true,
      });
      result.current.addTask({
        text: "Task 3",
        tag: "quickwin",
        completed: false,
      });
    });

    expect(result.current.taskStats.total).toBe(3);
    expect(result.current.taskStats.completed).toBe(1);
    expect(result.current.taskStats.active).toBe(2);
    expect(result.current.taskStats.completionRate).toBe(33);
  });
});
```

### 2. Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskList } from './TaskList';

describe('TaskList Integration', () => {
  it('should add and display tasks', () => {
    render(<TaskList />);

    const addButton = screen.getByText('Add Task');
    const input = screen.getByPlaceholderText('Enter task...');

    fireEvent.changeText(input, 'New task');
    fireEvent.press(addButton);

    expect(screen.getByText('New task')).toBeInTheDocument();
  });

  it('should complete tasks', () => {
    render(<TaskList />);

    // Add a task
    const addButton = screen.getByText('Add Task');
    const input = screen.getByPlaceholderText('Enter task...');

    fireEvent.changeText(input, 'Test task');
    fireEvent.press(addButton);

    // Complete the task
    const completeButton = screen.getByTestId('complete-task');
    fireEvent.press(completeButton);

    // Check if task is marked as completed
    const taskElement = screen.getByText('Test task');
    expect(taskElement).toHaveStyle({ textDecorationLine: 'line-through' });
  });
});
```

## Migration from Redux

### 1. Basic Migration

```typescript
// Redux way
const initialState = {
  todos: [],
  loading: false,
  error: null,
};

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return { ...state, todos: [...state.todos, action.payload] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Zustand way
const useTodoStore = create((set) => ({
  todos: [],
  loading: false,
  error: null,

  addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
  setLoading: (loading) => set({ loading }),
}));
```

### 2. Action Creators

```typescript
// Redux action creators
const addTodo = (text) => ({
  type: "ADD_TODO",
  payload: { text, completed: false },
});
const toggleTodo = (id) => ({ type: "TOGGLE_TODO", payload: id });

// Zustand actions (no action creators needed)
const useTodoStore = create((set) => ({
  todos: [],

  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, completed: false }],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),
}));
```

### 3. Selectors

```typescript
// Redux selectors
const selectTodos = (state) => state.todos;
const selectCompletedTodos = (state) =>
  state.todos.filter((todo) => todo.completed);

// Zustand selectors
const useTodoStore = create((set, get) => ({
  todos: [],

  get completedTodos() {
    return get().todos.filter((todo) => todo.completed);
  },
}));

// In components
const completedTodos = useTodoStore((state) => state.completedTodos);
```

## Conclusion

Zustand is a powerful, lightweight state management solution that's perfect for React Native applications. Its simplicity and flexibility make it an excellent choice for managing application state without the boilerplate of Redux.

### Key Takeaways

1. **Start Simple**: Begin with basic stores and add complexity as needed
2. **Use TypeScript**: Leverage TypeScript for better type safety and developer experience
3. **Organize Stores**: Split large stores into smaller, focused ones
4. **Optimize Performance**: Use selective subscriptions and memoization
5. **Persist State**: Use the persist middleware for data persistence
6. **Test Thoroughly**: Write unit and integration tests for your stores

### Best Practices Summary

- **Single Responsibility**: Each store should have a clear, focused purpose
- **Type Safety**: Always define interfaces for your state and actions
- **Performance**: Subscribe only to the state you need
- **Persistence**: Use middleware for data that needs to survive app restarts
- **Testing**: Write comprehensive tests for your stores and components
- **Documentation**: Document complex stores and actions

Zustand's simplicity and power make it an excellent choice for React Native applications, providing all the benefits of modern state management without the complexity of traditional solutions.
