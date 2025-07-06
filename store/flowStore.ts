import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FlowStep = {
  id: string; // Unique for drag-and-drop
  type: string; // e.g., "Focus", "Break", "Review"
  duration: number; // in seconds
};

// Flow categories for organization
export const FLOW_CATEGORIES = {
  focus: {
    name: "Focus & Productivity",
    icon: "🎯",
    color: "#3B82F6", // blue
  },
  work: {
    name: "Work & Study",
    icon: "💻",
    color: "#10B981", // emerald
  },
  creative: {
    name: "Creative & Writing",
    icon: "✨",
    color: "#8B5CF6", // violet
  },
  wellness: {
    name: "Wellness & Balance",
    icon: "🧘",
    color: "#F59E0B", // amber
  },
  specialized: {
    name: "Specialized",
    icon: "🔧",
    color: "#EF4444", // red
  },
} as const;

export type FlowCategory = keyof typeof FLOW_CATEGORIES;

export type CustomFlow = {
  id: string; // Unique flow id
  name: string;
  steps: FlowStep[];
  category: FlowCategory;
  createdAt: number;
  updatedAt: number;
  readonly?: boolean; // true for built-in flows
};

// Built-in flows (migrated from sessionState) - MOVED BEFORE STORE
const BUILTIN_FLOWS: CustomFlow[] = [
  {
    id: "builtin-classic-focus",
    name: "Classic Focus",
    category: "focus",
    steps: [
      { id: "1", type: "Classic", duration: 25 * 60 },
      { id: "2", type: "Short Break", duration: 5 * 60 },
      { id: "3", type: "Classic", duration: 25 * 60 },
      { id: "4", type: "Short Break", duration: 5 * 60 },
      { id: "5", type: "Classic", duration: 25 * 60 },
      { id: "6", type: "Short Break", duration: 5 * 60 },
      { id: "7", type: "Classic", duration: 25 * 60 },
      { id: "8", type: "Long Break", duration: 15 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-solo-study",
    name: "Solo Study",
    category: "work",
    steps: [
      { id: "1", type: "Deep Focus", duration: 50 * 60 },
      { id: "2", type: "Short Break", duration: 5 * 60 },
      { id: "3", type: "Review Mode", duration: 20 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-creative-rhythm",
    name: "Creative Rhythm",
    category: "creative",
    steps: [
      { id: "1", type: "Creative Time", duration: 30 * 60 },
      { id: "2", type: "Mindful Moment", duration: 10 * 60 },
      { id: "3", type: "Quick Task", duration: 15 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-debug-flow",
    name: "Debug Flow",
    category: "specialized",
    steps: [
      { id: "1", type: "Session 1", duration: 60 },
      { id: "2", type: "Session 2", duration: 60 },
      { id: "3", type: "Session 3", duration: 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-morning-routine",
    name: "Morning Routine",
    category: "wellness",
    steps: [
      { id: "1", type: "Mindful Moment", duration: 10 * 60 },
      { id: "2", type: "Quick Task", duration: 15 * 60 },
      { id: "3", type: "Short Break", duration: 5 * 60 },
      { id: "4", type: "Deep Focus", duration: 45 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-meeting-prep",
    name: "Meeting Prep",
    category: "work",
    steps: [
      { id: "1", type: "Review Mode", duration: 15 * 60 },
      { id: "2", type: "Short Break", duration: 3 * 60 },
      { id: "3", type: "Quick Task", duration: 10 * 60 },
      { id: "4", type: "Mindful Moment", duration: 5 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-coding-session",
    name: "Coding Session",
    category: "work",
    steps: [
      { id: "1", type: "Deep Focus", duration: 45 * 60 },
      { id: "2", type: "Short Break", duration: 5 * 60 },
      { id: "3", type: "Review Mode", duration: 15 * 60 },
      { id: "4", type: "Short Break", duration: 5 * 60 },
      { id: "5", type: "Deep Focus", duration: 30 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-writing-flow",
    name: "Writing Flow",
    category: "creative",
    steps: [
      { id: "1", type: "Creative Time", duration: 40 * 60 },
      { id: "2", type: "Mindful Moment", duration: 8 * 60 },
      { id: "3", type: "Review Mode", duration: 20 * 60 },
      { id: "4", type: "Short Break", duration: 5 * 60 },
      { id: "5", type: "Creative Time", duration: 30 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-exercise-breaks",
    name: "Exercise Breaks",
    category: "wellness",
    steps: [
      { id: "1", type: "Classic", duration: 25 * 60 },
      { id: "2", type: "Long Break", duration: 15 * 60 },
      { id: "3", type: "Classic", duration: 25 * 60 },
      { id: "4", type: "Long Break", duration: 15 * 60 },
      { id: "5", type: "Classic", duration: 25 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-power-hour",
    name: "Power Hour",
    category: "focus",
    steps: [
      { id: "1", type: "Deep Focus", duration: 50 * 60 },
      { id: "2", type: "Short Break", duration: 10 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-study-session",
    name: "Study Session",
    category: "work",
    steps: [
      { id: "1", type: "Deep Focus", duration: 40 * 60 },
      { id: "2", type: "Short Break", duration: 5 * 60 },
      { id: "3", type: "Review Mode", duration: 20 * 60 },
      { id: "4", type: "Short Break", duration: 5 * 60 },
      { id: "5", type: "Deep Focus", duration: 30 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
  {
    id: "builtin-quick-sprints",
    name: "Quick Sprints",
    category: "focus",
    steps: [
      { id: "1", type: "Quick Task", duration: 15 * 60 },
      { id: "2", type: "Short Break", duration: 3 * 60 },
      { id: "3", type: "Quick Task", duration: 15 * 60 },
      { id: "4", type: "Short Break", duration: 3 * 60 },
      { id: "5", type: "Quick Task", duration: 15 * 60 },
    ],
    createdAt: 0,
    updatedAt: 0,
    readonly: true,
  },
];

interface FlowStore {
  customFlows: CustomFlow[];
  addFlow: (flow: Omit<CustomFlow, "createdAt" | "updatedAt">) => void;
  updateFlow: (flow: CustomFlow) => void;
  deleteFlow: (id: string) => void;
  duplicateFlow: (id: string) => void;
  reorderSteps: (flowId: string, newSteps: FlowStep[]) => void;
  addStep: (flowId: string, step: FlowStep) => void;
  updateStep: (flowId: string, step: FlowStep) => void;
  deleteStep: (flowId: string, stepId: string) => void;
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      customFlows: [],
      addFlow: (flow) =>
        set((state) => ({
          customFlows: [
            ...state.customFlows,
            {
              ...flow,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              category: flow.category || "focus", // Default to focus category
            },
          ],
        })),
      updateFlow: (flow) =>
        set((state) => ({
          customFlows: state.customFlows.map((f) =>
            f.id === flow.id ? { ...flow, updatedAt: Date.now() } : f
          ),
        })),
      deleteFlow: (id) =>
        set((state) => ({
          customFlows: state.customFlows.filter((f) => f.id !== id),
        })),
      duplicateFlow: (id) =>
        set((state) => {
          const flow = state.customFlows.find((f) => f.id === id);
          if (!flow) return {};
          const newId = Date.now().toString();
          return {
            customFlows: [
              ...state.customFlows,
              {
                ...flow,
                id: newId,
                name: flow.name + " (Copy)",
                createdAt: Date.now(),
                updatedAt: Date.now(),
                steps: flow.steps.map((s) => ({
                  ...s,
                  id: Date.now().toString() + Math.random(),
                })),
              },
            ],
          };
        }),
      reorderSteps: (flowId, newSteps) =>
        set((state) => ({
          customFlows: state.customFlows.map((f) =>
            f.id === flowId
              ? { ...f, steps: newSteps, updatedAt: Date.now() }
              : f
          ),
        })),
      addStep: (flowId, step) =>
        set((state) => ({
          customFlows: state.customFlows.map((f) =>
            f.id === flowId
              ? { ...f, steps: [...f.steps, step], updatedAt: Date.now() }
              : f
          ),
        })),
      updateStep: (flowId, step) =>
        set((state) => ({
          customFlows: state.customFlows.map((f) =>
            f.id === flowId
              ? {
                  ...f,
                  steps: f.steps.map((s) =>
                    s.id === step.id ? { ...s, ...step } : s
                  ),
                  updatedAt: Date.now(),
                }
              : f
          ),
        })),
      deleteStep: (flowId, stepId) =>
        set((state) => ({
          customFlows: state.customFlows.map((f) =>
            f.id === flowId
              ? {
                  ...f,
                  steps: f.steps.filter((s) => s.id !== stepId),
                  updatedAt: Date.now(),
                }
              : f
          ),
        })),
    }),
    {
      name: "flow-store",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          // If no flows exist, initialize with built-in flows
          if (!value) {
            return { state: { customFlows: BUILTIN_FLOWS } };
          }
          return JSON.parse(value);
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
