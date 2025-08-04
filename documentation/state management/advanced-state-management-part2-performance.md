# Advanced State Management - Part 2: Performance Optimization & Advanced Techniques

## Table of Contents

1. [Selective Subscriptions](#selective-subscriptions)
2. [Memoization & Caching](#memoization--caching)
3. [State Normalization](#state-normalization)
4. [Optimization Techniques](#optimization-techniques)
5. [Advanced Patterns](#advanced-patterns)

## Selective Subscriptions

### 1. Granular State Selection

```typescript
// store/optimizedStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

interface OptimizedStore {
  // User state
  user: User | null;
  userPreferences: UserPreferences;

  // Task state
  tasks: Task[];
  currentTask: Task | null;
  taskFilters: TaskFilters;

  // Session state
  sessions: Session[];
  currentSession: Session | null;

  // Actions
  setUser: (user: User) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  setCurrentTask: (task: Task | null) => void;
  startSession: (taskId: string) => void;
  endSession: () => void;

  // Optimized selectors
  getTaskById: (taskId: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getFilteredTasks: () => Task[];
  getSessionStats: () => SessionStats;
}

export const useOptimizedStore = create<OptimizedStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    user: null,
    userPreferences: {
      theme: 'light',
      notifications: true,
      soundEnabled: true,
    },
    tasks: [],
    currentTask: null,
    taskFilters: {
      status: 'all',
      priority: 'all',
      tags: [],
    },
    sessions: [],
    currentSession: null,

    // Actions
    setUser: (user) => set({ user }),
    updatePreferences: (preferences) =>
      set((state) => ({
        userPreferences: { ...state.userPreferences, ...preferences }
      })),
    addTask: (task) => set((state) => ({
      tasks: [...state.tasks, task]
    })),
    updateTask: (taskId, updates) => set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      )
    })),
    setCurrentTask: (task) => set({ currentTask: task }),
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
        currentSession: session
      }));
    },
    endSession: () => set((state) => {
      if (!state.currentSession) return state;
      const endTime = new Date();
      const duration = endTime.getTime() - state.currentSession.startTime.getTime();
      return {
        sessions: state.sessions.map(session =>
          session.id === state.currentSession?.id
            ? { ...session, endTime, duration, updatedAt: new Date() }
            : session
        ),
        currentSession: null,
      };
    }),

    // Optimized selectors
    getTaskById: (taskId) => get().tasks.find(task => task.id === taskId),
    getTasksByStatus: (status) => get().tasks.filter(task => task.status === status),
    getFilteredTasks: () => {
      const { tasks, taskFilters } = get();
      return tasks.filter(task => {
        if (taskFilters.status !== 'all' && task.status !== taskFilters.status) {
          return false;
        }
        if (taskFilters.priority !== 'all' && task.priority !== taskFilters.priority) {
          return false;
        }
        if (taskFilters.tags.length > 0 && !taskFilters.tags.some(tag => task.tags.includes(tag))) {
          return false;
        }
        return true;
      });
    },
    getSessionStats: () => {
      const { sessions } = get();
      return {
        totalSessions: sessions.length,
        totalFocusTime: sessions.reduce((total, session) => total + session.duration, 0),
        averageFocusScore: sessions.length > 0
          ? sessions.reduce((total, session) => total + session.focusScore, 0) / sessions.length
          : 0,
      };
    },
  }))
);

// Optimized component with selective subscriptions
const TaskList = React.memo(() => {
  // Only subscribe to tasks and filters
  const tasks = useOptimizedStore(
    (state) => state.getFilteredTasks(),
    shallow // Use shallow comparison for array
  );

  const updateTask = useOptimizedStore((state) => state.updateTask);

  return (
    <View>
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onUpdate={updateTask} />
      ))}
    </View>
  );
});

// Component that only needs current task
const CurrentTaskDisplay = React.memo(() => {
  const currentTask = useOptimizedStore((state) => state.currentTask);

  if (!currentTask) {
    return <Text>No task selected</Text>;
  }

  return (
    <View>
      <Text>{currentTask.title}</Text>
      <Text>{currentTask.description}</Text>
    </View>
  );
});

// Component that only needs session stats
const SessionStats = React.memo(() => {
  const stats = useOptimizedStore((state) => state.getSessionStats());

  return (
    <View>
      <Text>Total Sessions: {stats.totalSessions}</Text>
      <Text>Total Focus Time: {stats.totalFocusTime}ms</Text>
      <Text>Average Focus Score: {stats.averageFocusScore}</Text>
    </View>
  );
});
```

### 2. Subscription Optimization

```typescript
// hooks/useOptimizedSelector.ts
import { useMemo } from 'react';
import { useOptimizedStore } from '../store/optimizedStore';

// Custom hook for optimized selectors
export function useOptimizedSelector<T>(
  selector: (state: any) => T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  return useOptimizedStore(selector, equalityFn);
}

// Hook for derived state
export function useDerivedState<T>(
  selector: (state: any) => T,
  deps: any[] = []
): T {
  return useMemo(() => {
    return useOptimizedStore.getState()[selector.name] || selector(useOptimizedStore.getState());
  }, deps);
}

// Usage examples
const TaskCounter = () => {
  const taskCount = useOptimizedSelector(
    (state) => state.tasks.length,
    (a, b) => a === b // Custom equality function
  );

  return <Text>Total Tasks: {taskCount}</Text>;
};

const CompletedTaskCounter = () => {
  const completedCount = useOptimizedSelector(
    (state) => state.tasks.filter(task => task.status === 'completed').length
  );

  return <Text>Completed Tasks: {completedCount}</Text>;
};

const TaskProgress = () => {
  const progress = useDerivedState(
    (state) => {
      const tasks = state.tasks;
      const completed = tasks.filter(t => t.status === 'completed').length;
      return tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
    },
    ['tasks'] // Dependencies
  );

  return <Text>Progress: {progress.toFixed(1)}%</Text>;
};
```

## Memoization & Caching

### 1. Computed State with Memoization

```typescript
// store/computedState.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface ComputedState {
  // Raw state
  tasks: Task[];
  sessions: Session[];

  // Computed state (cached)
  taskStats: TaskStats;
  sessionStats: SessionStats;
  productivityScore: number;

  // Actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addSession: (session: Session) => void;

  // Computed getters
  getTaskStats: () => TaskStats;
  getSessionStats: () => SessionStats;
  getProductivityScore: () => number;
}

// Memoization cache
const memoCache = new Map<string, { value: any; timestamp: number }>();
const CACHE_DURATION = 5000; // 5 seconds

function memoized<T>(key: string, compute: () => T): T {
  const cached = memoCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }

  const value = compute();
  memoCache.set(key, { value, timestamp: now });
  return value;
}

export const useComputedStore = create<ComputedState>()(
  subscribeWithSelector((set, get) => ({
    tasks: [],
    sessions: [],
    taskStats: { total: 0, completed: 0, pending: 0 },
    sessionStats: { total: 0, totalTime: 0, averageScore: 0 },
    productivityScore: 0,

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

    addSession: (session) =>
      set((state) => ({
        sessions: [...state.sessions, session],
      })),

    getTaskStats: () => {
      const { tasks } = get();
      return memoized("taskStats", () => ({
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
      }));
    },

    getSessionStats: () => {
      const { sessions } = get();
      return memoized("sessionStats", () => ({
        total: sessions.length,
        totalTime: sessions.reduce((total, s) => total + s.duration, 0),
        averageScore:
          sessions.length > 0
            ? sessions.reduce((total, s) => total + s.focusScore, 0) /
              sessions.length
            : 0,
        averageDuration:
          sessions.length > 0
            ? sessions.reduce((total, s) => total + s.duration, 0) /
              sessions.length
            : 0,
      }));
    },

    getProductivityScore: () => {
      const taskStats = get().getTaskStats();
      const sessionStats = get().getSessionStats();

      return memoized("productivityScore", () => {
        const completionRate =
          taskStats.total > 0 ? taskStats.completed / taskStats.total : 0;
        const focusEfficiency = sessionStats.averageScore / 100;
        const timeEfficiency = Math.min(
          sessionStats.averageDuration / 3600000,
          1
        ); // Normalize to 1 hour

        return (
          (completionRate * 0.4 +
            focusEfficiency * 0.4 +
            timeEfficiency * 0.2) *
          100
        );
      });
    },
  }))
);
```

### 2. Advanced Caching Strategies

```typescript
// utils/cacheManager.ts
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  dependencies: string[];
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private dependencyGraph = new Map<string, Set<string>>();

  set<T>(
    key: string,
    value: T,
    ttl: number = 5000,
    dependencies: string[] = []
  ): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      dependencies,
    });

    // Update dependency graph
    dependencies.forEach((dep) => {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep)!.add(key);
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  invalidate(dependency: string): void {
    const dependents = this.dependencyGraph.get(dependency);
    if (dependents) {
      dependents.forEach((key) => this.cache.delete(key));
      this.dependencyGraph.delete(dependency);
    }
  }

  clear(): void {
    this.cache.clear();
    this.dependencyGraph.clear();
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85, // Mock hit rate
    };
  }
}

export const cacheManager = new CacheManager();

// Enhanced store with advanced caching
export const useCachedStore = create<CachedState>()((set, get) => ({
  tasks: [],
  sessions: [],

  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    // Invalidate cached computations
    cacheManager.invalidate("tasks");
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
    cacheManager.invalidate("tasks");
  },

  getTaskStats: () => {
    const cached = cacheManager.get<TaskStats>("taskStats");
    if (cached) return cached;

    const { tasks } = get();
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
    };

    cacheManager.set("taskStats", stats, 5000, ["tasks"]);
    return stats;
  },

  getSessionStats: () => {
    const cached = cacheManager.get<SessionStats>("sessionStats");
    if (cached) return cached;

    const { sessions } = get();
    const stats = {
      total: sessions.length,
      totalTime: sessions.reduce((total, s) => total + s.duration, 0),
      averageScore:
        sessions.length > 0
          ? sessions.reduce((total, s) => total + s.focusScore, 0) /
            sessions.length
          : 0,
    };

    cacheManager.set("sessionStats", stats, 5000, ["sessions"]);
    return stats;
  },
}));
```

## State Normalization

### 1. Normalized State Structure

```typescript
// store/normalizedState.ts
import { create } from "zustand";

interface NormalizedState {
  // Normalized entities
  entities: {
    tasks: Record<string, Task>;
    sessions: Record<string, Session>;
    projects: Record<string, Project>;
  };

  // Lists for ordering
  lists: {
    taskIds: string[];
    sessionIds: string[];
    projectIds: string[];
  };

  // Current selections
  current: {
    taskId: string | null;
    sessionId: string | null;
    projectId: string | null;
  };

  // Actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  addSession: (session: Session) => void;
  setCurrentTask: (taskId: string | null) => void;

  // Selectors
  getTask: (taskId: string) => Task | undefined;
  getTasks: () => Task[];
  getSessionsForTask: (taskId: string) => Session[];
  getCurrentTask: () => Task | undefined;
}

export const useNormalizedStore = create<NormalizedState>()((set, get) => ({
  entities: {
    tasks: {},
    sessions: {},
    projects: {},
  },
  lists: {
    taskIds: [],
    sessionIds: [],
    projectIds: [],
  },
  current: {
    taskId: null,
    sessionId: null,
    projectId: null,
  },

  addTask: (task) =>
    set((state) => ({
      entities: {
        ...state.entities,
        tasks: {
          ...state.entities.tasks,
          [task.id]: task,
        },
      },
      lists: {
        ...state.lists,
        taskIds: [...state.lists.taskIds, task.id],
      },
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      entities: {
        ...state.entities,
        tasks: {
          ...state.entities.tasks,
          [taskId]: {
            ...state.entities.tasks[taskId],
            ...updates,
            updatedAt: new Date(),
          },
        },
      },
    })),

  removeTask: (taskId) =>
    set((state) => {
      const { [taskId]: removed, ...remainingTasks } = state.entities.tasks;
      return {
        entities: {
          ...state.entities,
          tasks: remainingTasks,
        },
        lists: {
          ...state.lists,
          taskIds: state.lists.taskIds.filter((id) => id !== taskId),
        },
      };
    }),

  addSession: (session) =>
    set((state) => ({
      entities: {
        ...state.entities,
        sessions: {
          ...state.entities.sessions,
          [session.id]: session,
        },
      },
      lists: {
        ...state.lists,
        sessionIds: [...state.lists.sessionIds, session.id],
      },
    })),

  setCurrentTask: (taskId) =>
    set((state) => ({
      current: {
        ...state.current,
        taskId,
      },
    })),

  getTask: (taskId) => get().entities.tasks[taskId],

  getTasks: () => {
    const { entities, lists } = get();
    return lists.taskIds.map((id) => entities.tasks[id]);
  },

  getSessionsForTask: (taskId) => {
    const { entities, lists } = get();
    return lists.sessionIds
      .map((id) => entities.sessions[id])
      .filter((session) => session.taskId === taskId);
  },

  getCurrentTask: () => {
    const { current, entities } = get();
    return current.taskId ? entities.tasks[current.taskId] : undefined;
  },
}));
```

### 2. Optimized Normalized Components

```typescript
// components/NormalizedTaskList.tsx
import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNormalizedStore } from '../store/normalizedState';

const TaskItem = React.memo<{ taskId: string }>(({ taskId }) => {
  const task = useNormalizedStore((state) => state.getTask(taskId));
  const updateTask = useNormalizedStore((state) => state.updateTask);

  if (!task) return null;

  return (
    <View>
      <Text>{task.title}</Text>
      <Text>{task.description}</Text>
    </View>
  );
});

const NormalizedTaskList = React.memo(() => {
  const taskIds = useNormalizedStore((state) => state.lists.taskIds);
  const addTask = useNormalizedStore((state) => state.addTask);

  // Memoize the task list to prevent unnecessary re-renders
  const tasks = useMemo(() => {
    return taskIds.map(id => ({ id }));
  }, [taskIds]);

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TaskItem taskId={item.id} />}
    />
  );
});

// Optimized session component
const TaskSessions = React.memo<{ taskId: string }>(({ taskId }) => {
  const sessions = useNormalizedStore((state) => state.getSessionsForTask(taskId));

  return (
    <View>
      {sessions.map(session => (
        <View key={session.id}>
          <Text>Duration: {session.duration}ms</Text>
          <Text>Focus Score: {session.focusScore}</Text>
        </View>
      ))}
    </View>
  );
});
```

## Optimization Techniques

### 1. Batch Updates

```typescript
// store/batchUpdates.ts
import { create } from 'zustand';

interface BatchUpdateState {
  tasks: Task[];
  sessions: Session[];

  // Batch operations
  batchAddTasks: (tasks: Task[]) => void;
  batchUpdateTasks: (updates: Array<{ id: string; updates: Partial<Task> }>) => void;
  batchRemoveTasks: (taskIds: string[]) => void;

  // Individual operations
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
}

export const useBatchStore = create<BatchUpdateState>()((set, get) => ({
  tasks: [],
  sessions: [],

  batchAddTasks: (tasks) => set((state) => ({
    tasks: [...state.tasks, ...tasks],
  })),

  batchUpdateTasks: (updates) => set((state) => ({
    tasks: state.tasks.map(task => {
      const update = updates.find(u => u.id === task.id);
      return update ? { ...task, ...update.updates, updatedAt: new Date() } : task;
    }),
  })),

  batchRemoveTasks: (taskIds) => set((state) => ({
    tasks: state.tasks.filter(task => !taskIds.includes(task.id)),
  })),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
    )
  })),

  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId),
  })),
}));

// Usage with batch operations
const TaskImporter = () => {
  const batchAddTasks = useBatchStore((state) => state.batchAddTasks);

  const importTasks = async () => {
    const tasks = await fetchTasksFromAPI();
    batchAddTasks(tasks); // Single state update for multiple tasks
  };

  return (
    <Button title="Import Tasks" onPress={importTasks} />
  );
};
```

### 2. Lazy Loading & Pagination

```typescript
// store/lazyLoading.ts
import { create } from 'zustand';

interface LazyLoadingState {
  tasks: Task[];
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;

  // Actions
  loadTasks: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPageSize: (size: number) => void;
}

export const useLazyStore = create<LazyLoadingState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  hasMore: true,
  currentPage: 1,
  pageSize: 20,

  loadTasks: async (page = 1) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`/api/tasks?page=${page}&size=${get().pageSize}`);
      const { tasks, hasMore } = await response.json();

      set((state) => ({
        tasks: page === 1 ? tasks : [...state.tasks, ...tasks],
        hasMore,
        currentPage: page,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to load tasks:', error);
    }
  },

  loadMore: async () => {
    const { currentPage, hasMore, isLoading } = get();
    if (isLoading || !hasMore) return;

    await get().loadTasks(currentPage + 1);
  },

  refresh: async () => {
    await get().loadTasks(1);
  },

  setPageSize: (size) => set({ pageSize: size }),
}));

// Optimized component with lazy loading
const LazyTaskList = () => {
  const { tasks, isLoading, hasMore, loadMore, refresh } = useLazyStore();

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem task={item} />
  ), []);

  const onEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshing={isLoading}
      onRefresh={refresh}
      ListFooterComponent={isLoading ? <ActivityIndicator /> : null}
    />
  );
};
```

This Part 2 covers advanced performance optimization techniques including selective subscriptions, memoization, state normalization, and lazy loading. These techniques are essential for building high-performance React Native applications.

Would you like me to continue with **Part 3: Complex State Scenarios & Real-World Examples**?
