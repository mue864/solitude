import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskTag = "urgent" | "important" | "quickwin" | "deepwork" | null;

export interface Task {
  id: string;
  name: string;
  tag: TaskTag;
  completed: boolean;
}

export interface TaskState {
  tasks: Task[];
  currentTaskId: string | null;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (id: string) => void;
  clearCurrentTask: () => void;
  completeCurrentTask: () => void;
  getCurrentTask: () => Task | null;
  getCompletedTasks: () => Task[];
  getActiveTasks: () => Task[];
  clearAllTasks: () => void;
  clearCompletedTasks: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTaskId: null,
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (task) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === task.id ? { ...t, ...task } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          currentTaskId:
            state.currentTaskId === id ? null : state.currentTaskId,
        })),
      setCurrentTask: (id) => set({ currentTaskId: id }),
      clearCurrentTask: () => set({ currentTaskId: null }),
      completeCurrentTask: () =>
        set((state) => {
          if (!state.currentTaskId) return {};
          return {
            tasks: state.tasks.map((t) =>
              t.id === state.currentTaskId ? { ...t, completed: true } : t
            ),
          };
        }),
      getCurrentTask: () => {
        const state = get();
        return state.currentTaskId
          ? state.tasks.find((t) => t.id === state.currentTaskId) || null
          : null;
      },
      getCompletedTasks: () => {
        const state = get();
        return state.tasks.filter((t) => t.completed);
      },
      getActiveTasks: () => {
        const state = get();
        return state.tasks.filter((t) => !t.completed);
      },
      clearAllTasks: () => set({ tasks: [], currentTaskId: null }),
      clearCompletedTasks: () =>
        set({ tasks: get().tasks.filter((t) => !t.completed) }),
    }),
    {
      name: "task-store",
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
