import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useMemo, Suspense } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getAvailableDurations,
  useSettingsStore,
} from "../../store/settingsStore";

// Lazy-load modal components
const AdvancedAnalyticsModal = React.lazy(() => import("../../components/modals/AdvancedAnalyticsModal"));
const NotificationScheduleModal = React.lazy(() => import("../../components/modals/NotificationScheduleModal"));
const ThemeEditorModal = React.lazy(() => import("../../components/modals/ThemeEditorModal"));

// Loading fallback for modals
const ModalLoadingFallback = () => (
  <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text className="text-gray-600 dark:text-gray-400 mt-2 font-Sora">
      Loading...
    </Text>
  </View>
);

// Error boundary for modals
const ModalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-red-600 dark:text-red-400 font-Sora">
          Failed to load modal
        </Text>
        <TouchableOpacity
          className="mt-2 px-4 py-2 bg-blue-600 rounded-lg"
          onPress={() => setHasError(false)}
        >
          <Text className="text-white font-Sora">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      {children}
    </Suspense>
  );
};

// Memoize the main component to prevent unnecessary re-renders from parent
export default React.memo(function Settings() {
  const insets = useSafeAreaInsets();
  // Zustand selectors for each value/action
  const defaultSessionDuration = useSettingsStore(
    (s) => s.defaultSessionDuration
  );
  const breakDuration = useSettingsStore((s) => s.breakDuration);
  const autoStartNext = useSettingsStore((s) => s.autoStartNext);
  const notifications = useSettingsStore((s) => s.notifications);
  const theme = useSettingsStore((s) => s.theme);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);
  const proFeatures = useSettingsStore((s) => s.proFeatures);
  const isPro = useSettingsStore((s) => s.isPro);
  const updateSessionDuration = useSettingsStore(
    (s) => s.updateSessionDuration
  );
  const updateBreakDuration = useSettingsStore((s) => s.updateBreakDuration);
  const toggleAutoStart = useSettingsStore((s) => s.toggleAutoStart);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const updateTheme = useSettingsStore((s) => s.updateTheme);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const toggleVibration = useSettingsStore((s) => s.toggleVibration);
  const upgradeToPro = useSettingsStore((s) => s.upgradeToPro);
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);
  const exportSettings = useSettingsStore((s) => s.exportSettings);

  // Safety check to ensure proFeatures is initialized
  const safeProFeatures = proFeatures || {
    customDurations: [15, 45, 60, 90],
    notificationSchedules: [],
    customThemes: [],
    advancedAnalytics: false,
    dataBackup: false,
    hapticFeedback: true,
    reducedMotion: false,
    customFontSize: "medium" as const,
  };

  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const [proFeatureName, setProFeatureName] = useState<string | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [editingTheme, setEditingTheme] = useState<any>(null);
  const [showNotificationSchedule, setShowNotificationSchedule] =
    useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  // Memoized handlers
  const handleProUpgrade = useCallback(() => {
    Alert.alert(
      "Upgrade to Pro",
      "Unlock advanced features like custom themes, notification schedules, and advanced analytics!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          style: "default",
          onPress: () => {
            upgradeToPro();
            setShowProUpgrade(false);
          },
        },
      ]
    );
  }, [upgradeToPro]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      "Reset Settings",
      "This will reset all your settings to default values. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: resetToDefaults,
        },
      ]
    );
  }, [resetToDefaults]);

  const handleExportSettings = useCallback(async () => {
    try {
      const settings = await exportSettings();
      // In a real app, you'd share this or save to file
      Alert.alert(
        "Settings Exported",
        "Your settings have been exported successfully."
      );
    } catch (error) {
      Alert.alert(
        "Export Failed",
        "Failed to export settings. Please try again."
      );
    }
  }, [exportSettings]);

  const handleProFeaturePress = useCallback((feature: string) => {
    setProFeatureName(feature);
    setShowProUpgrade(true);
  }, []);

  // Memoized options
  const durationOptions = useMemo(
    () => (isPro ? getAvailableDurations() : [15, 25, 30, 45, 60]),
    [isPro]
  );

  const themeOptions = useMemo(
    () => [
      { value: "light", label: "Light", icon: "sunny" },
      { value: "dark", label: "Dark", icon: "moon" },
      { value: "auto", label: "Auto", icon: "contrast" },
    ],
    []
  );

  const scrollViewContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 20,
      paddingBottom: insets.bottom + 20,
    }),
    [insets.bottom]
  );

  // Memoized SettingItem
  const SettingItem = React.memo(function SettingItem({
    title,
    subtitle,
    icon,
    children,
    isPro = false,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    children: React.ReactNode;
    isPro?: boolean;
  }) {
    return (
      <View className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
            <Ionicons name={icon as any} size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
                {title}
              </Text>
              {isPro && !isPro && (
                <View className="ml-2 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                  <Text className="text-xs font-SoraSemiBold text-purple-600 dark:text-purple-400">
                    PRO
                  </Text>
                </View>
              )}
            </View>
            {subtitle && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {children}
      </View>
    );
  });

  // Memoized ProUpgradeCard
  const ProUpgradeCard = React.memo(function ProUpgradeCard({
    handleProUpgrade,
  }: {
    handleProUpgrade: () => void;
  }) {
    return (
      <View className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border border-purple-100 dark:border-purple-800 mb-6">
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
            <Ionicons name="diamond" size={24} color="#8B5CF6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
              Upgrade to Pro
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
              Unlock advanced features
            </Text>
          </View>
        </View>
        <View className="space-y-2 mb-4">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#8B5CF6" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 font-Sora ml-2">
              Custom themes and color schemes
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#8B5CF6" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 font-Sora ml-2">
              Advanced notification schedules
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="#8B5CF6" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 font-Sora ml-2">
              Detailed analytics and insights
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-purple-600 dark:bg-purple-700 rounded-2xl p-4 items-center"
          onPress={handleProUpgrade}
        >
          <Text className="text-white font-SoraSemiBold text-base">
            Upgrade Now
          </Text>
        </TouchableOpacity>
      </View>
    );
  });

  // Memoized ProSettingItem
  const ProSettingItem = React.memo(function ProSettingItem({
    title,
    subtitle,
    icon,
    children,
    disabled,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    children?: React.ReactNode;
    disabled?: boolean;
    onPress?: () => void;
  }) {
    return (
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        onPress={disabled ? onPress : undefined}
        className={`flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 ${
          disabled ? "opacity-60" : ""
        }`}
        disabled={!disabled}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
            <Ionicons name={icon as any} size={20} color="#8B5CF6" />
          </View>
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center">
              <Text
                className="text-base font-SoraSemiBold text-gray-900 dark:text-white"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
              <View className="ml-2 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full flex-row items-center">
                <Ionicons name="lock-closed" size={12} color="#8B5CF6" />
                <Text className="text-xs font-SoraSemiBold text-purple-600 dark:text-purple-400 ml-1">
                  PRO
                </Text>
              </View>
            </View>
            {subtitle && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {children}
      </TouchableOpacity>
    );
  });

  // Memoized list data
  const themeListData = useMemo(
    () => safeProFeatures?.customThemes || [],
    [safeProFeatures?.customThemes]
  );

  const notificationSchedulesData = useMemo(
    () => safeProFeatures?.notificationSchedules || [],
    [safeProFeatures?.notificationSchedules]
  );

  const enabledSchedulesCount = useMemo(
    () => notificationSchedulesData.filter((s) => s.enabled).length,
    [notificationSchedulesData]
  );

  const hasSchedules = useMemo(
    () => notificationSchedulesData.length > 0,
    [notificationSchedulesData]
  );

  const schedulesToShow = useMemo(
    () => notificationSchedulesData.slice(0, 3),
    [notificationSchedulesData]
  );

  const remainingSchedulesCount = useMemo(
    () => Math.max(0, notificationSchedulesData.length - 3),
    [notificationSchedulesData]
  );

  // Memoized render functions for list items
  const renderThemeItem = useCallback(
    ({ item: theme }: { item: any }) => (
      <TouchableOpacity
        key={theme.id}
        className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 min-w-[100px]"
        onPress={() => {
          setEditingTheme(theme);
          setShowThemeEditor(true);
        }}
      >
        <View
          className="w-full h-16 rounded-xl mb-2"
          style={{ backgroundColor: theme.primaryColor }}
        />
        <Text className="text-xs font-SoraSemiBold text-gray-900 dark:text-white text-center">
          {theme.name}
        </Text>
        {theme.isDefault && (
          <View className="absolute top-2 right-2 bg-blue-500 rounded-full w-4 h-4 items-center justify-center">
            <Text className="text-white text-xs">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    ),
    []
  );

  const renderScheduleItem = useCallback(
    (schedule: any) => (
      <View
        key={schedule.id}
        className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
      >
        <View className="flex-row items-center flex-1">
          <Ionicons
            name={
              schedule.type === "session"
                ? "timer"
                : schedule.type === "break"
                  ? "cafe"
                  : "notifications"
            }
            size={16}
            color={schedule.enabled ? "#3B82F6" : "#9CA3AF"}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white">
              {schedule.name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
              {schedule.time} •{" "}
              {schedule.days.length === 7
                ? "Every day"
                : schedule.days.length === 5 &&
                    schedule.days.every((d: number) => [1, 2, 3, 4, 5].includes(d))
                  ? "Weekdays"
                  : schedule.days.length === 2 &&
                      schedule.days.every((d: number) => [0, 6].includes(d))
                    ? "Weekends"
                    : `${schedule.days.length} day${schedule.days.length > 1 ? "s" : ""}`}
            </Text>
          </View>
        </View>
        <View
          className={`w-2 h-2 rounded-full ${
            schedule.enabled ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </View>
    ),
    []
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 pt-12 pb-4">
        <Text className="text-2xl font-SoraBold text-gray-900 dark:text-white">
          Settings
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mt-1 font-Sora">
          Customize your productivity experience
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={scrollViewContentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Pro Upgrade Card */}
        {!isPro && <ProUpgradeCard handleProUpgrade={handleProUpgrade} />}

        {/* Timer Settings */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Timer Settings
          </Text>

          {/* Default Session Duration Card */}
          <View className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
              <Ionicons name="time" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white mb-0.5">
                Default Session Duration
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora mb-2">
                {defaultSessionDuration} minutes
              </Text>
              <View className="flex-row items-center gap-1">
                {durationOptions.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    className={`px-2.5 py-1.5 rounded-lg ${
                      defaultSessionDuration === duration
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                    onPress={() => updateSessionDuration(duration)}
                  >
                    <Text
                      className={`text-xs font-SoraSemiBold ${
                        defaultSessionDuration === duration
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Break Duration Card */}
          <View className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3">
              <Ionicons name="cafe" size={20} color="#10B981" />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white mb-0.5">
                Break Duration
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora mb-2">
                {breakDuration} minutes
              </Text>
              <View className="flex-row items-center gap-1">
                {[5, 10, 15, 20].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    className={`px-2.5 py-1.5 rounded-lg ${
                      breakDuration === duration
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                    onPress={() => updateBreakDuration(duration)}
                  >
                    <Text
                      className={`text-xs font-SoraSemiBold ${
                        breakDuration === duration
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Auto-start Next Session (unchanged) */}
          <SettingItem
            title="Auto-start Next Session"
            subtitle="Automatically start the next session after breaks"
            icon="play-circle"
          >
            <Switch
              value={autoStartNext}
              onValueChange={toggleAutoStart}
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={autoStartNext ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>
        </View>

        {/* Notifications */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Notifications
          </Text>

          <SettingItem
            title="Session Start"
            subtitle="Get notified when sessions begin"
            icon="notifications"
          >
            <Switch
              value={notifications.sessionStart}
              onValueChange={(value) =>
                updateNotifications({ sessionStart: value })
              }
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={notifications.sessionStart ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>

          <SettingItem
            title="Session End"
            subtitle="Get notified when sessions complete"
            icon="checkmark-circle"
          >
            <Switch
              value={notifications.sessionEnd}
              onValueChange={(value) =>
                updateNotifications({ sessionEnd: value })
              }
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={notifications.sessionEnd ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>

          <SettingItem
            title="Break Reminders"
            subtitle="Get reminded to take breaks"
            icon="cafe"
          >
            <Switch
              value={notifications.breakReminder}
              onValueChange={(value) =>
                updateNotifications({ breakReminder: value })
              }
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={notifications.breakReminder ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>

          <SettingItem
            title="Streak Reminders"
            subtitle="Get motivated to maintain your streak"
            icon="flame"
          >
            <Switch
              value={notifications.streakReminder}
              onValueChange={(value) =>
                updateNotifications({ streakReminder: value })
              }
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={notifications.streakReminder ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>
        </View>

        {/* Appearance */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Appearance
          </Text>

          <SettingItem
            title="Theme"
            subtitle={`Currently using ${theme} theme`}
            icon="color-palette"
          >
            <View className="flex-row items-center">
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`w-8 h-8 rounded-full mr-2 items-center justify-center ${
                    theme === option.value
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                  onPress={() => updateTheme(option.value as any)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={theme === option.value ? "#3B82F6" : "#6B7280"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </SettingItem>

          <SettingItem
            title="Sound Effects"
            subtitle="Play sounds for notifications"
            icon="volume-high"
          >
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={soundEnabled ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>

          <SettingItem
            title="Vibration"
            subtitle="Vibrate for notifications"
            icon="phone-portrait"
          >
            <Switch
              value={vibrationEnabled}
              onValueChange={toggleVibration}
              trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
              thumbColor={vibrationEnabled ? "#FFFFFF" : "#FFFFFF"}
            />
          </SettingItem>
        </View>

        {/* Custom Themes Section */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Custom Themes
          </Text>

          {isPro ? (
            <>
              {/* Current Theme Display */}
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
                    Current Theme
                  </Text>
                  <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                    <Text className="text-xs font-SoraSemiBold text-blue-600 dark:text-blue-400">
                      Active
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View
                    className="w-12 h-12 rounded-xl"
                    style={{
                      backgroundColor:
                        (safeProFeatures?.customThemes || []).find(
                          (t) => t.isDefault
                        )?.primaryColor || "#3B82F6",
                    }}
                  />
                  <View className="flex-1">
                    <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white">
                      {(safeProFeatures?.customThemes || []).find(
                        (t) => t.isDefault
                      )?.name || "Ocean Blue"}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
                      Default theme
                    </Text>
                  </View>
                </View>
              </View>

              {/* Available Themes */}
              <View className="mb-3">
                <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-2">
                  Available Themes
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-3"
                >
                  {themeListData.map((theme) =>
                    renderThemeItem({ item: theme })
                  )}
                </ScrollView>
              </View>

              {/* Theme Management Actions */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-blue-100 dark:bg-blue-900 rounded-2xl p-3 items-center"
                  onPress={() => {
                    setEditingTheme(null); // New theme
                    setShowThemeEditor(true);
                  }}
                >
                  <Ionicons name="add" size={20} color="#3B82F6" />
                  <Text className="text-sm font-SoraSemiBold text-blue-600 dark:text-blue-400 mt-1">
                    Create Theme
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 items-center"
                  onPress={() => {
                    // Show theme management options
                    Alert.alert("Theme Management", "Choose an action", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Create New Theme",
                        onPress: () => {
                          setEditingTheme(null);
                          setShowThemeEditor(true);
                        },
                      },
                      {
                        text: "Edit Existing Theme",
                        onPress: () => {
                          // Show theme selection for editing
                          const themeNames = (
                            safeProFeatures?.customThemes || []
                          )
                            .filter((t) => !t.isDefault)
                            .map((t) => t.name);

                          if (themeNames.length === 0) {
                            Alert.alert(
                              "No Themes",
                              "Create your first theme!"
                            );
                            return;
                          }

                          Alert.alert(
                            "Select Theme to Edit",
                            "Choose a theme to edit",
                            [
                              { text: "Cancel", style: "cancel" },
                              ...themeNames.map((name) => ({
                                text: name,
                                onPress: () => {
                                  const theme = (
                                    safeProFeatures?.customThemes || []
                                  ).find((t) => t.name === name);
                                  if (theme) {
                                    setEditingTheme(theme);
                                    setShowThemeEditor(true);
                                  }
                                },
                              })),
                            ]
                          );
                        },
                      },
                    ]);
                  }}
                >
                  <Ionicons name="settings" size={20} color="#6B7280" />
                  <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mt-1">
                    Manage
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleProFeaturePress("Custom Themes")}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 opacity-60"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
                  <Ionicons name="color-palette" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center">
                    <Text
                      className="text-base font-SoraSemiBold text-gray-900 dark:text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Custom Themes
                    </Text>
                    <View className="ml-2 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full flex-row items-center">
                      <Ionicons name="lock-closed" size={12} color="#8B5CF6" />
                      <Text className="text-xs font-SoraSemiBold text-purple-600 dark:text-purple-400 ml-1">
                        PRO
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-1">
                    Create your own color schemes
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Schedules Section */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Notification Schedules
          </Text>

          {isPro ? (
            <>
              {/* Schedule Summary */}
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
                    Active Schedules
                  </Text>
                  <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                    <Text className="text-xs font-SoraSemiBold text-green-600 dark:text-green-400">
                      {enabledSchedulesCount} Active
                    </Text>
                  </View>
                </View>

                {hasSchedules ? (
                  <View className="space-y-2">
                    {schedulesToShow.map(renderScheduleItem)}
                    {remainingSchedulesCount > 0 && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora text-center">
                        +{remainingSchedulesCount} more schedules
                      </Text>
                    )}
                  </View>
                ) : (
                  <View className="items-center py-4">
                    <Ionicons
                      name="notifications-off"
                      size={32}
                      color="#9CA3AF"
                    />
                    <Text className="text-gray-500 dark:text-gray-400 font-Sora mt-2 text-center">
                      No custom schedules yet
                    </Text>
                    <Text className="text-gray-400 dark:text-gray-500 font-Sora text-sm text-center">
                      Create your first schedule to get started
                    </Text>
                  </View>
                )}
              </View>

              {/* Schedule Management Actions */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-blue-100 dark:bg-blue-900 rounded-2xl p-3 items-center"
                  onPress={() => {
                    setEditingSchedule(null); // New schedule
                    setShowNotificationSchedule(true);
                  }}
                >
                  <Ionicons name="add" size={20} color="#3B82F6" />
                  <Text className="text-sm font-SoraSemiBold text-blue-600 dark:text-blue-400 mt-1">
                    Create Schedule
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 items-center"
                  onPress={() => {
                    if (
                      (proFeatures?.notificationSchedules || []).length === 0
                    ) {
                      Alert.alert(
                        "No Schedules",
                        "Create your first schedule!"
                      );
                      return;
                    }

                    // Show schedule selection for editing
                    const scheduleNames = (
                      proFeatures?.notificationSchedules || []
                    ).map((s) => s.name);

                    Alert.alert(
                      "Select Schedule to Edit",
                      "Choose a schedule to edit",
                      [
                        { text: "Cancel", style: "cancel" },
                        ...scheduleNames.map((name) => ({
                          text: name,
                          onPress: () => {
                            const schedule = (
                              proFeatures?.notificationSchedules || []
                            ).find((s) => s.name === name);
                            if (schedule) {
                              setEditingSchedule(schedule);
                              setShowNotificationSchedule(true);
                            }
                          },
                        })),
                      ]
                    );
                  }}
                >
                  <Ionicons name="settings" size={20} color="#6B7280" />
                  <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mt-1">
                    Manage
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleProFeaturePress("Notification Schedules")}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 opacity-60"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
                  <Ionicons name="time" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center">
                    <Text
                      className="text-base font-SoraSemiBold text-gray-900 dark:text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Notification Schedules
                    </Text>
                    <View className="ml-2 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full flex-row items-center">
                      <Ionicons name="lock-closed" size={12} color="#8B5CF6" />
                      <Text className="text-xs font-SoraSemiBold text-purple-600 dark:text-purple-400 ml-1">
                        PRO
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-1">
                    Set custom notification times
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Advanced Analytics Section */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Advanced Analytics
          </Text>

          {isPro ? (
            <>
              {/* Analytics Status */}
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
                    Analytics Status
                  </Text>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      proFeatures?.advancedAnalytics
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-xs font-SoraSemiBold ${
                        proFeatures?.advancedAnalytics
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {proFeatures?.advancedAnalytics ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>

                <View className="space-y-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="trending-up"
                        size={16}
                        color={
                          proFeatures?.advancedAnalytics ? "#3B82F6" : "#9CA3AF"
                        }
                      />
                      <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white ml-2">
                        Performance Insights
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={
                        proFeatures?.advancedAnalytics ? "#10B981" : "#9CA3AF"
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="analytics"
                        size={16}
                        color={
                          proFeatures?.advancedAnalytics ? "#3B82F6" : "#9CA3AF"
                        }
                      />
                      <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white ml-2">
                        Detailed Metrics
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={
                        proFeatures?.advancedAnalytics ? "#10B981" : "#9CA3AF"
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="bulb"
                        size={16}
                        color={
                          proFeatures?.advancedAnalytics ? "#3B82F6" : "#9CA3AF"
                        }
                      />
                      <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white ml-2">
                        Smart Recommendations
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={
                        proFeatures?.advancedAnalytics ? "#10B981" : "#9CA3AF"
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="time"
                        size={16}
                        color={
                          proFeatures?.advancedAnalytics ? "#3B82F6" : "#9CA3AF"
                        }
                      />
                      <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white ml-2">
                        Peak Performance Analysis
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={
                        proFeatures?.advancedAnalytics ? "#10B981" : "#9CA3AF"
                      }
                    />
                  </View>
                </View>
              </View>

              {/* Analytics Features Preview */}
              <View className="mb-3">
                <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-2">
                  Key Features
                </Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 border border-blue-200 dark:border-blue-700">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="trending-up" size={16} color="#3B82F6" />
                      <Text className="text-xs font-SoraSemiBold text-blue-600 dark:text-blue-400 ml-1">
                        Productivity Score
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 font-Sora">
                      Weighted performance metric
                    </Text>
                  </View>

                  <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl p-3 border border-green-200 dark:border-green-700">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="time" size={16} color="#10B981" />
                      <Text className="text-xs font-SoraSemiBold text-green-600 dark:text-green-400 ml-1">
                        Focus Consistency
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 font-Sora">
                      Session consistency analysis
                    </Text>
                  </View>

                  <View className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 border border-orange-200 dark:border-orange-700">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="flash" size={16} color="#F59E0B" />
                      <Text className="text-xs font-SoraSemiBold text-orange-600 dark:text-orange-400 ml-1">
                        Flow Efficiency
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600 dark:text-gray-400 font-Sora">
                      Flow completion efficiency
                    </Text>
                  </View>
                </View>
              </View>

              {/* Analytics Management Actions */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-blue-100 dark:bg-blue-900 rounded-2xl p-3 items-center"
                  onPress={() => setShowAdvancedAnalytics(true)}
                >
                  <Ionicons name="analytics" size={20} color="#3B82F6" />
                  <Text className="text-sm font-SoraSemiBold text-blue-600 dark:text-blue-400 mt-1">
                    View Analytics
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 items-center"
                  onPress={() => {
                    // Toggle advanced analytics
                    const { toggleAdvancedAnalytics } =
                      useSettingsStore.getState();
                    toggleAdvancedAnalytics();
                  }}
                >
                  <Ionicons
                    name={
                      proFeatures?.advancedAnalytics
                        ? "toggle"
                        : "toggle-outline"
                    }
                    size={20}
                    color="#6B7280"
                  />
                  <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mt-1">
                    {proFeatures?.advancedAnalytics ? "Disable" : "Enable"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handleProFeaturePress("Advanced Analytics")}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 opacity-60"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
                  <Ionicons name="analytics" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center">
                    <Text
                      className="text-base font-SoraSemiBold text-gray-900 dark:text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Advanced Analytics
                    </Text>
                    <View className="ml-2 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full flex-row items-center">
                      <Ionicons name="lock-closed" size={12} color="#8B5CF6" />
                      <Text className="text-xs font-SoraSemiBold text-purple-600 dark:text-purple-400 ml-1">
                        PRO
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-1">
                    Detailed insights and trends
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Data & Privacy */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            Data & Privacy
          </Text>

          {/* Export Settings (JSON) - available to all users */}
          <SettingItem
            title="Export Settings (JSON)"
            subtitle="Backup your basic settings"
            icon="download"
          >
            <TouchableOpacity
              className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full"
              onPress={async () => {
                try {
                  const settings = await exportSettings("json");
                  Alert.alert(
                    "Settings Exported",
                    "Your settings have been exported successfully."
                  );
                } catch (error) {
                  Alert.alert(
                    "Export Failed",
                    "Failed to export settings. Please try again."
                  );
                }
              }}
            >
              <Text className="text-sm font-SoraSemiBold text-blue-600 dark:text-blue-400">
                Export
              </Text>
            </TouchableOpacity>
          </SettingItem>

          {/* Export All Data (CSV) - pro only */}
          {isPro ? (
            <SettingItem
              title="Export All Data (CSV)"
              subtitle="Export all settings and data as CSV"
              icon="document-text"
            >
              <TouchableOpacity
                className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full"
                onPress={async () => {
                  try {
                    const csv = await exportSettings("csv");
                    Alert.alert(
                      "Data Exported",
                      "Your data has been exported as CSV."
                    );
                  } catch (error) {
                    Alert.alert(
                      "Export Failed",
                      "Failed to export data. Please try again."
                    );
                  }
                }}
              >
                <Text className="text-sm font-SoraSemiBold text-green-600 dark:text-green-400">
                  Export CSV
                </Text>
              </TouchableOpacity>
            </SettingItem>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowProUpgrade(true)}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl mb-3 border border-gray-100 dark:border-gray-700 opacity-60"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3">
                  <Ionicons name="document-text" size={20} color="#10B981" />
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center">
                    <Text
                      className="text-base font-SoraSemiBold text-gray-900 dark:text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Export All Data (CSV)
                    </Text>
                    <View className="ml-2 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full flex-row items-center">
                      <Ionicons name="lock-closed" size={12} color="#8B5CF6" />
                      <Text className="text-xs font-SoraSemiBold text-purple-600 dark:text-purple-400 ml-1">
                        PRO
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-1">
                    Export all settings and data as CSV
                  </Text>
                </View>
              </View>
              <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
                <Text className="text-sm font-SoraSemiBold text-green-600 dark:text-green-400">
                  Export CSV
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <SettingItem
            title="Reset Settings"
            subtitle="Restore default settings"
            icon="refresh"
          >
            <TouchableOpacity
              className="bg-red-100 dark:bg-red-900 px-3 py-1 rounded-full"
              onPress={handleResetSettings}
            >
              <Text className="text-sm font-SoraSemiBold text-red-600 dark:text-red-400">
                Reset
              </Text>
            </TouchableOpacity>
          </SettingItem>
        </View>

        {/* App Info */}
        <View className="mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-3">
            App Info
          </Text>

          <SettingItem
            title="Version"
            subtitle="1.0.0"
            icon="information-circle"
          >
            <View />
          </SettingItem>

          <SettingItem
            title="Made with ❤️"
            subtitle="Built for productivity"
            icon="heart"
          >
            <View />
          </SettingItem>
        </View>
      </ScrollView>

      {/* Pro Upgrade Modal */}
      <Modal
        visible={showProUpgrade}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProUpgrade(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md items-center border border-purple-200 dark:border-purple-800">
            <Ionicons
              name="diamond"
              size={40}
              color="#8B5CF6"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-xl font-SoraBold text-gray-900 dark:text-white mb-2 text-center">
              Go Pro to Unlock {proFeatureName || "this feature"}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 font-Sora text-center mb-6">
              Upgrade to Pro and get access to advanced customization,
              scheduling, and analytics features.
            </Text>
            <TouchableOpacity
              className="bg-purple-600 dark:bg-purple-700 rounded-2xl px-8 py-3 mb-2"
              onPress={() => {
                upgradeToPro();
                setShowProUpgrade(false);
              }}
            >
              <Text className="text-white font-SoraSemiBold text-base">
                Upgrade Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowProUpgrade(false)}>
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora mt-2">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Editor Modal */}
      <ModalErrorBoundary>
        <ThemeEditorModal
          visible={showThemeEditor}
          onClose={() => {
            setShowThemeEditor(false);
            setEditingTheme(null);
          }}
          editingTheme={editingTheme}
        />
      </ModalErrorBoundary>

      {/* Notification Schedule Modal */}
      <ModalErrorBoundary>
        <NotificationScheduleModal
          visible={showNotificationSchedule}
          onClose={() => {
            setShowNotificationSchedule(false);
            setEditingSchedule(null);
          }}
          editingSchedule={editingSchedule}
        />
      </ModalErrorBoundary>

      {/* Advanced Analytics Modal */}
      <ModalErrorBoundary>
        <AdvancedAnalyticsModal
          visible={showAdvancedAnalytics}
          onClose={() => setShowAdvancedAnalytics(false)}
        />
      </ModalErrorBoundary>
    </View>
  );
});
