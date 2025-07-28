# Zustand Patterns and Examples

This document provides practical patterns and examples for using Zustand in React Native applications, based on real-world scenarios and common use cases.

## Table of Contents

1. [Store Patterns](#store-patterns)
2. [Component Integration](#component-integration)
3. [Async Operations](#async-operations)
4. [Cross-Store Communication](#cross-store-communication)
5. [Performance Patterns](#performance-patterns)
6. [Common Anti-Patterns](#common-anti-patterns)
7. [Real-World Scenarios](#real-world-scenarios)

## Store Patterns

### 1. Simple State Store

```typescript
// Simple state without complex logic
interface SimpleState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useSimpleStore = create<SimpleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### 2. Form State Store

```typescript
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;

  setValue: (field: string, value: any) => void;
  setError: (field: string, error: string) => void;
  setTouched: (field: string, touched: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
  validate: () => boolean;
}

const useFormStore = create<FormState>((set, get) => ({
  values: {},
  errors: {},
  touched: {},
  isSubmitting: false,

  setValue: (field, value) => {
    set((state) => ({
      values: { ...state.values, [field]: value },
      // Clear error when user starts typing
      errors: { ...state.errors, [field]: "" },
    }));
  },

  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error },
    }));
  },

  setTouched: (field, touched) => {
    set((state) => ({
      touched: { ...state.touched, [field]: touched },
    }));
  },

  setSubmitting: (submitting) => set({ isSubmitting: submitting }),

  reset: () =>
    set({ values: {}, errors: {}, touched: {}, isSubmitting: false }),

  validate: () => {
    const { values } = get();
    const errors: Record<string, string> = {};

    // Simple validation example
    if (!values.email) errors.email = "Email is required";
    if (!values.password) errors.password = "Password is required";
    if (values.password && values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));
```

### 3. Modal/UI State Store

```typescript
interface UIState {
  modals: Record<string, boolean>;
  loading: Record<string, boolean>;
  notifications: Notification[];

  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

const useUIStore = create<UIState>((set, get) => ({
  modals: {},
  loading: {},
  notifications: [],

  openModal: (modalId) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    }));
  },

  closeModal: (modalId) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: false },
    }));
  },

  setLoading: (key, loading) => {
    set((state) => ({
      loading: { ...state.loading, [key]: loading },
    }));
  },

  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
```

### 4. Pagination Store

```typescript
interface PaginationState<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  hasMore: boolean;

  setData: (data: T[]) => void;
  setPage: (page: number) => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  loadMore: () => void;
  reset: () => void;
}

const createPaginationStore = <T>() =>
  create<PaginationState<T>>((set, get) => ({
    data: [],
    page: 1,
    limit: 20,
    total: 0,
    loading: false,
    hasMore: true,

    setData: (data) => set({ data }),

    setPage: (page) => {
      const { limit, total } = get();
      set({
        page,
        hasMore: page * limit < total,
      });
    },

    setTotal: (total) => {
      const { page, limit } = get();
      set({
        total,
        hasMore: page * limit < total,
      });
    },

    setLoading: (loading) => set({ loading }),

    loadMore: () => {
      const { page, hasMore, loading } = get();
      if (hasMore && !loading) {
        set({ page: page + 1 });
      }
    },

    reset: () =>
      set({
        data: [],
        page: 1,
        total: 0,
        loading: false,
        hasMore: true,
      }),
  }));

// Usage
const useTaskPaginationStore = createPaginationStore<Task>();
```

## Component Integration

### 1. Basic Component Usage

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTaskStore } from './store/taskStore';

const TaskList = () => {
  // Subscribe to specific parts of the store
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  return (
    <View>
      {tasks.map(task => (
        <View key={task.id}>
          <Text>{task.text}</Text>
          <TouchableOpacity onPress={() => deleteTask(task.id)}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};
```

### 2. Custom Hooks for Store Logic

```typescript
// Custom hook for task operations
const useTaskOperations = () => {
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const completeTask = useTaskStore((state) => state.completeTask);

  const createTask = useCallback((text: string, tag?: TaskTag) => {
    addTask({
      text,
      tag: tag || null,
      completed: false,
    });
  }, [addTask]);

  const toggleTask = useCallback((id: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { completed: !task.completed });
    }
  }, [updateTask]);

  return {
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    toggleTask,
  };
};

// Usage in component
const TaskManager = () => {
  const { createTask, toggleTask, deleteTask } = useTaskOperations();
  const tasks = useTaskStore((state) => state.tasks);

  return (
    <View>
      {/* Component logic */}
    </View>
  );
};
```

### 3. Conditional Rendering with Store State

```typescript
const TaskDashboard = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const error = useTaskStore((state) => state.error);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  return <TaskList tasks={tasks} />;
};
```

### 4. Form Integration

```typescript
const TaskForm = () => {
  const { values, errors, setValue, setTouched, validate, isSubmitting } = useFormStore();
  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = async () => {
    if (validate()) {
      addTask({
        text: values.text,
        tag: values.tag,
        completed: false,
      });
      // Reset form
      useFormStore.getState().reset();
    }
  };

  return (
    <View>
      <TextInput
        value={values.text || ''}
        onChangeText={(text) => setValue('text', text)}
        onBlur={() => setTouched('text', true)}
        placeholder="Enter task..."
      />
      {errors.text && <Text style={{ color: 'red' }}>{errors.text}</Text>}

      <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
        <Text>{isSubmitting ? 'Adding...' : 'Add Task'}</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Async Operations

### 1. API Integration

```typescript
interface ApiState {
  data: any[];
  loading: boolean;
  error: string | null;

  fetchData: () => Promise<void>;
  createItem: (item: any) => Promise<void>;
  updateItem: (id: string, updates: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

const useApiStore = create<ApiState>((set, get) => ({
  data: [],
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createItem: async (item) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const newItem = await response.json();
      set((state) => ({
        data: [...state.data, newItem],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateItem: async (id, updates) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const updatedItem = await response.json();
      set((state) => ({
        data: state.data.map((item) => (item.id === id ? updatedItem : item)),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null });

    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      set((state) => ({
        data: state.data.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 2. Optimistic Updates

```typescript
interface OptimisticState {
  tasks: Task[];
  pendingUpdates: Record<string, Task>;

  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  revertUpdate: (id: string) => void;
}

const useOptimisticStore = create<OptimisticState>((set, get) => ({
  tasks: [],
  pendingUpdates: {},

  updateTask: async (id, updates) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic update
    const optimisticTask = { ...task, ...updates };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? optimisticTask : t)),
      pendingUpdates: { ...state.pendingUpdates, [id]: task }, // Store original for rollback
    }));

    try {
      // API call
      await api.updateTask(id, updates);

      // Remove from pending updates on success
      set((state) => {
        const { [id]: removed, ...rest } = state.pendingUpdates;
        return { pendingUpdates: rest };
      });
    } catch (error) {
      // Revert on error
      get().revertUpdate(id);
      throw error;
    }
  },

  revertUpdate: (id) => {
    const { pendingUpdates } = get();
    const originalTask = pendingUpdates[id];

    if (originalTask) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? originalTask : t)),
        pendingUpdates: { ...state.pendingUpdates, [id]: undefined },
      }));
    }
  },
}));
```

### 3. Debounced Updates

```typescript
import { debounce } from "lodash";

interface DebouncedState {
  searchTerm: string;
  searchResults: any[];
  loading: boolean;

  setSearchTerm: (term: string) => void;
  search: (term: string) => Promise<void>;
}

const useDebouncedStore = create<DebouncedState>((set, get) => ({
  searchTerm: "",
  searchResults: [],
  loading: false,

  setSearchTerm: (term) => {
    set({ searchTerm: term });
    // Debounce the search
    get().debouncedSearch(term);
  },

  search: async (term) => {
    if (!term.trim()) {
      set({ searchResults: [], loading: false });
      return;
    }

    set({ loading: true });

    try {
      const results = await api.search(term);
      set({ searchResults: results, loading: false });
    } catch (error) {
      set({ searchResults: [], loading: false });
    }
  },

  // Debounced search function
  debouncedSearch: debounce((term: string) => {
    get().search(term);
  }, 300),
}));
```

## Cross-Store Communication

### 1. Store Dependencies

```typescript
// User store
const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Settings store that depends on user
const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},

  updateSettings: (updates) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));

    // Sync with user store if needed
    useUserStore.getState().setUser({ ...user, settings: updates });
  },
}));
```

### 2. Event-Based Communication

```typescript
// Event emitter for cross-store communication
class StoreEvents {
  private listeners: Record<string, Function[]> = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data?: any) {
    const callbacks = this.listeners[event] || [];
    callbacks.forEach((callback) => callback(data));
  }
}

const storeEvents = new StoreEvents();

// Task store
const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      ),
    }));

    // Emit event for other stores
    storeEvents.emit("taskCompleted", { taskId: id });
  },
}));

// Stats store that listens to task events
const useStatsStore = create<StatsState>((set, get) => {
  // Listen to task completion events
  storeEvents.on("taskCompleted", () => {
    const { updateStats } = get();
    updateStats();
  });

  return {
    stats: { completed: 0, total: 0 },

    updateStats: () => {
      const tasks = useTaskStore.getState().tasks;
      const completed = tasks.filter((t) => t.completed).length;
      set({ stats: { completed, total: tasks.length } });
    },
  };
});
```

### 3. Shared State Pattern

```typescript
// Shared state store
interface SharedState {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;

  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
}

const useSharedStore = create<SharedState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "en",
      notifications: true,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: "shared-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Other stores can access shared state
const useAppStore = create<AppState>((set, get) => ({
  // ... other state

  someAction: () => {
    const theme = useSharedStore.getState().theme;
    // Use theme in action
  },
}));
```

## Performance Patterns

### 1. Selective Subscriptions

```typescript
// Bad: Subscribe to entire store
const BadComponent = () => {
  const store = useTaskStore(); // Re-renders on any change
  return <div>{store.tasks.length}</div>;
};

// Good: Subscribe to specific values
const GoodComponent = () => {
  const taskCount = useTaskStore((state) => state.tasks.length);
  return <div>{taskCount}</div>;
};

// Better: Use selectors for complex computations
const TaskStats = () => {
  const stats = useTaskStore((state) => ({
    total: state.tasks.length,
    completed: state.tasks.filter(t => t.completed).length,
    active: state.tasks.filter(t => !t.completed).length,
  }));

  return (
    <div>
      <span>Total: {stats.total}</span>
      <span>Completed: {stats.completed}</span>
      <span>Active: {stats.active}</span>
    </div>
  );
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
// Split large stores into smaller, focused ones
const useUserStore = create<UserState>()(/* ... */);
const useSettingsStore = create<SettingsState>()(/* ... */);
const useTaskStore = create<TaskState>()(/* ... */);

// Only subscribe to what you need
const UserProfile = () => {
  const user = useUserStore((state) => state.user);
  const theme = useSettingsStore((state) => state.theme);

  return (
    <div className={theme}>
      <h1>{user?.name}</h1>
    </div>
  );
};
```

## Common Anti-Patterns

### 1. Over-Subscription

```typescript
// ❌ Bad: Subscribe to entire store
const Component = () => {
  const store = useTaskStore(); // Re-renders on any change
  return <div>{store.tasks.length}</div>;
};

// ✅ Good: Subscribe to specific values
const Component = () => {
  const taskCount = useTaskStore((state) => state.tasks.length);
  return <div>{taskCount}</div>;
};
```

### 2. Mutating State Directly

```typescript
// ❌ Bad: Mutating state directly
const badAction = () => {
  const state = useTaskStore.getState();
  state.tasks.push(newTask); // This won't trigger re-renders
};

// ✅ Good: Use set function
const goodAction = () => {
  useTaskStore.setState((state) => ({
    tasks: [...state.tasks, newTask],
  }));
};
```

### 3. Complex Store Logic

```typescript
// ❌ Bad: Complex logic in store
const useComplexStore = create((set, get) => ({
  data: [],

  complexAction: () => {
    // 100 lines of complex logic here
    // This makes the store hard to test and maintain
  },
}));

// ✅ Good: Extract logic to separate functions
const processData = (data: any[]) => {
  // Complex logic here
  return processedData;
};

const useSimpleStore = create((set, get) => ({
  data: [],

  simpleAction: () => {
    const { data } = get();
    const processed = processData(data);
    set({ data: processed });
  },
}));
```

### 4. Not Using TypeScript

```typescript
// ❌ Bad: No type safety
const useUntypedStore = create((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));

// ✅ Good: TypeScript interfaces
interface TypedState {
  data: any[];
  setData: (data: any[]) => void;
}

const useTypedStore = create<TypedState>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));
```

## Real-World Scenarios

### 1. E-commerce Cart

```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Computed values
  totalItems: number;
  totalPrice: number;
  isEmpty: boolean;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);

      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  get totalItems() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  get totalPrice() {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  get isEmpty() {
    return get().items.length === 0;
  },
}));
```

### 2. Authentication Flow

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;

  // Computed values
  isAuthenticated: boolean;
  isGuest: boolean;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });

        try {
          const response = await authApi.login(credentials);
          const { user, token } = response;

          set({ user, token, loading: false });

          // Set auth header for future requests
          api.setAuthToken(token);
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        api.clearAuthToken();
      },

      register: async (userData) => {
        set({ loading: true, error: null });

        try {
          const response = await authApi.register(userData);
          const { user, token } = response;

          set({ user, token, loading: false });
          api.setAuthToken(token);
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await authApi.refreshToken(token);
          const { newToken } = response;

          set({ token: newToken });
          api.setAuthToken(newToken);
        } catch (error) {
          get().logout();
        }
      },

      get isAuthenticated() {
        return get().user !== null && get().token !== null;
      },

      get isGuest() {
        return !get().isAuthenticated;
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### 3. Real-time Chat

```typescript
interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read" | "error";
}

interface ChatState {
  messages: Message[];
  onlineUsers: string[];
  typingUsers: string[];
  loading: boolean;

  sendMessage: (text: string) => void;
  markAsRead: (messageId: string) => void;
  setTyping: (isTyping: boolean) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message["status"]) => void;

  // Computed values
  unreadCount: number;
  lastMessage: Message | null;
}

const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,

  sendMessage: (text) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      userId: useAuthStore.getState().user?.id || "",
      timestamp: new Date(),
      status: "sending",
    };

    set((state) => ({
      messages: [...state.messages, message],
    }));

    // Send to server
    chatApi
      .sendMessage(message)
      .then(() => {
        get().updateMessageStatus(message.id, "sent");
      })
      .catch(() => {
        get().updateMessageStatus(message.id, "error");
      });
  },

  markAsRead: (messageId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: "read" } : msg
      ),
    }));
  },

  setTyping: (isTyping) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    if (isTyping) {
      set((state) => ({
        typingUsers: [...state.typingUsers, userId],
      }));
    } else {
      set((state) => ({
        typingUsers: state.typingUsers.filter((id) => id !== userId),
      }));
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  },

  get unreadCount() {
    const currentUserId = useAuthStore.getState().user?.id;
    return get().messages.filter(
      (msg) => msg.userId !== currentUserId && msg.status !== "read"
    ).length;
  },

  get lastMessage() {
    const messages = get().messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  },
}));
```

These patterns and examples should help you build robust, performant applications with Zustand. Remember to always consider your specific use case and choose the pattern that best fits your needs.
