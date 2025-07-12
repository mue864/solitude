import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types for settings
export interface NotificationSettings {
  sessionStart: boolean;
  sessionEnd: boolean;
  breakReminder: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
  streakReminder: boolean;
}

export interface ProNotificationSchedule {
  id: string;
  name: string;
  time: string; // HH:mm format
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  type: "session" | "break" | "reminder";
}

export interface CustomTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isDefault?: boolean;
}

export interface ProFeatures {
  customDurations: number[]; // in minutes
  notificationSchedules: ProNotificationSchedule[];
  customThemes: CustomTheme[];
  advancedAnalytics: boolean;
  dataBackup: boolean;
  hapticFeedback: boolean;
  reducedMotion: boolean;
  customFontSize: "small" | "medium" | "large";
}

export interface SettingsState {
  // Free tier settings
  defaultSessionDuration: number; // in minutes
  breakDuration: number; // in minutes
  autoStartNext: boolean;
  notifications: NotificationSettings;
  theme: "light" | "dark" | "auto";
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Pro tier settings
  proFeatures: ProFeatures;

  // Pro status
  isPro: boolean;

  // Actions
  updateSessionDuration: (duration: number) => void;
  updateBreakDuration: (duration: number) => void;
  toggleAutoStart: () => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateTheme: (theme: "light" | "dark" | "auto") => void;
  toggleSound: () => void;
  toggleVibration: () => void;

  // Pro actions
  upgradeToPro: () => void;
  addCustomDuration: (duration: number) => void;
  removeCustomDuration: (duration: number) => void;
  addNotificationSchedule: (schedule: ProNotificationSchedule) => void;
  updateNotificationSchedule: (
    id: string,
    schedule: Partial<ProNotificationSchedule>
  ) => void;
  removeNotificationSchedule: (id: string) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  updateCustomTheme: (id: string, theme: Partial<CustomTheme>) => void;
  removeCustomTheme: (id: string) => void;
  toggleAdvancedAnalytics: () => void;
  toggleDataBackup: () => void;
  toggleHapticFeedback: () => void;
  toggleReducedMotion: () => void;
  updateFontSize: (size: "small" | "medium" | "large") => void;

  // Utility actions
  resetToDefaults: () => void;
  exportSettings: (format?: "json" | "csv") => Promise<string>;
  importSettings: (settings: string) => Promise<boolean>;
}

// Default settings
const defaultSettings = {
  defaultSessionDuration: 25,
  breakDuration: 5,
  autoStartNext: false,
  notifications: {
    sessionStart: true,
    sessionEnd: true,
    breakReminder: true,
    dailySummary: false,
    weeklySummary: false,
    streakReminder: true,
  },
  theme: "auto" as const,
  soundEnabled: true,
  vibrationEnabled: true,
  proFeatures: {
    customDurations: [15, 45, 60, 90],
    notificationSchedules: [],
    customThemes: [
      {
        id: "default-blue",
        name: "Ocean Blue",
        primaryColor: "#3B82F6",
        secondaryColor: "#1E40AF",
        accentColor: "#60A5FA",
        isDefault: true,
      },
      {
        id: "forest-green",
        name: "Forest Green",
        primaryColor: "#10B981",
        secondaryColor: "#059669",
        accentColor: "#34D399",
      },
      {
        id: "sunset-orange",
        name: "Sunset Orange",
        primaryColor: "#F59E0B",
        secondaryColor: "#D97706",
        accentColor: "#FBBF24",
      },
      {
        id: "royal-purple",
        name: "Royal Purple",
        primaryColor: "#8B5CF6",
        secondaryColor: "#7C3AED",
        accentColor: "#A78BFA",
      },
    ],
    advancedAnalytics: false,
    dataBackup: false,
    hapticFeedback: true,
    reducedMotion: false,
    customFontSize: "medium" as const,
  },
  isPro: false, // Reverted back to false
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      // Free tier actions
      updateSessionDuration: (duration: number) => {
        set({ defaultSessionDuration: duration });
      },

      updateBreakDuration: (duration: number) => {
        set({ breakDuration: duration });
      },

      toggleAutoStart: () => {
        set((state) => ({ autoStartNext: !state.autoStartNext }));
      },

      updateNotifications: (settings: Partial<NotificationSettings>) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        }));
      },

      updateTheme: (theme: "light" | "dark" | "auto") => {
        set({ theme });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      toggleVibration: () => {
        set((state) => ({ vibrationEnabled: !state.vibrationEnabled }));
      },

      // Pro tier actions
      upgradeToPro: () => {
        set({ isPro: true });
      },

      addCustomDuration: (duration: number) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            customDurations: [
              ...state.proFeatures.customDurations,
              duration,
            ].sort((a, b) => a - b),
          },
        }));
      },

      removeCustomDuration: (duration: number) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            customDurations: state.proFeatures.customDurations.filter(
              (d) => d !== duration
            ),
          },
        }));
      },

      addNotificationSchedule: (schedule: ProNotificationSchedule) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            notificationSchedules: [
              ...state.proFeatures.notificationSchedules,
              schedule,
            ],
          },
        }));
      },

      updateNotificationSchedule: (
        id: string,
        schedule: Partial<ProNotificationSchedule>
      ) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            notificationSchedules: state.proFeatures.notificationSchedules.map(
              (s) => (s.id === id ? { ...s, ...schedule } : s)
            ),
          },
        }));
      },

      removeNotificationSchedule: (id: string) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            notificationSchedules:
              state.proFeatures.notificationSchedules.filter(
                (s) => s.id !== id
              ),
          },
        }));
      },

      addCustomTheme: (theme: CustomTheme) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            customThemes: [...state.proFeatures.customThemes, theme],
          },
        }));
      },

      updateCustomTheme: (id: string, theme: Partial<CustomTheme>) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            customThemes: state.proFeatures.customThemes.map((t) =>
              t.id === id ? { ...t, ...theme } : t
            ),
          },
        }));
      },

      removeCustomTheme: (id: string) => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            customThemes: state.proFeatures.customThemes.filter(
              (t) => t.id !== id
            ),
          },
        }));
      },

      toggleAdvancedAnalytics: () => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            advancedAnalytics: !state.proFeatures.advancedAnalytics,
          },
        }));
      },

      toggleDataBackup: () => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            dataBackup: !state.proFeatures.dataBackup,
          },
        }));
      },

      toggleHapticFeedback: () => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            hapticFeedback: !state.proFeatures.hapticFeedback,
          },
        }));
      },

      toggleReducedMotion: () => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            reducedMotion: !state.proFeatures.reducedMotion,
          },
        }));
      },

      updateFontSize: (size: "small" | "medium" | "large") => {
        if (!get().isPro) return;
        set((state) => ({
          proFeatures: {
            ...state.proFeatures,
            customFontSize: size,
          },
        }));
      },

      // Utility actions
      resetToDefaults: () => {
        set(defaultSettings);
      },

      exportSettings: async (format: "json" | "csv" = "json") => {
        const state = get();
        const isPro = state.isPro;
        // Free users: only allow JSON, only export basic settings
        if (!isPro && format === "csv") {
          throw new Error("Upgrade to Pro to export as CSV.");
        }
        if (!isPro) {
          const exportData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            settings: {
              defaultSessionDuration: state.defaultSessionDuration,
              breakDuration: state.breakDuration,
              autoStartNext: state.autoStartNext,
              notifications: state.notifications,
              theme: state.theme,
              soundEnabled: state.soundEnabled,
              vibrationEnabled: state.vibrationEnabled,
            },
          };
          return JSON.stringify(exportData, null, 2);
        }
        // Pro users: allow full export, all formats
        if (format === "csv") {
          // Example: just export settings as CSV (expand as needed)
          const csv = [
            ["Setting", "Value"],
            ["defaultSessionDuration", state.defaultSessionDuration],
            ["breakDuration", state.breakDuration],
            ["autoStartNext", state.autoStartNext],
            ["theme", state.theme],
            ["soundEnabled", state.soundEnabled],
            ["vibrationEnabled", state.vibrationEnabled],
            // Add more pro fields as needed
          ]
            .map((row) => row.join(","))
            .join("\n");
          return csv;
        }
        // Pro JSON export
        const exportData = {
          version: "1.0",
          timestamp: new Date().toISOString(),
          settings: {
            defaultSessionDuration: state.defaultSessionDuration,
            breakDuration: state.breakDuration,
            autoStartNext: state.autoStartNext,
            notifications: state.notifications,
            theme: state.theme,
            soundEnabled: state.soundEnabled,
            vibrationEnabled: state.vibrationEnabled,
            proFeatures: state.proFeatures,
          },
        };
        return JSON.stringify(exportData, null, 2);
      },

      importSettings: async (settings: string) => {
        try {
          const importData = JSON.parse(settings);
          if (importData.version && importData.settings) {
            set((state) => ({
              ...state,
              ...importData.settings,
              isPro: importData.settings.proFeatures ? true : false,
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error("Failed to import settings:", error);
          return false;
        }
      },
    }),
    {
      name: "settings-store",
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

// Helper functions
export const getAvailableDurations = () => {
  const { defaultSessionDuration, proFeatures, isPro } =
    useSettingsStore.getState();
  const baseDurations = [15, 25, 30, 45, 60];

  if (isPro) {
    return [
      ...new Set([...baseDurations, ...proFeatures.customDurations]),
    ].sort((a, b) => a - b);
  }

  return baseDurations;
};

export const getCurrentTheme = () => {
  const { theme } = useSettingsStore.getState();
  if (theme === "auto") {
    // You can implement system theme detection here
    return "light"; // Default fallback
  }
  return theme;
};

export const isProFeature = (feature: keyof ProFeatures) => {
  const { isPro } = useSettingsStore.getState();
  return isPro;
};
