import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { type SessionType } from "../store/sessionState";

interface SessionIndicatorProps {
  sessionType: SessionType;
  duration: number;
  isRunning: boolean;
  isPaused: boolean;
  onPress?: () => void;
}

const SESSION_ICONS: Record<SessionType, string> = {
  Classic: "timer-outline",
  "Deep Focus": "brain-outline",
  "Quick Task": "flash-outline",
  "Creative Time": "color-palette-outline",
  "Review Mode": "document-text-outline",
  "Course Time": "school-outline",
  "Short Break": "cafe-outline",
  "Long Break": "bed-outline",
  "Reset Session": "refresh-outline",
  "Mindful Moment": "leaf-outline",
};

const SESSION_COLORS: Record<SessionType, string> = {
  Classic: "#3B82F6",
  "Deep Focus": "#8B5CF6",
  "Quick Task": "#10B981",
  "Creative Time": "#F59E0B",
  "Review Mode": "#EF4444",
  "Course Time": "#06B6D4",
  "Short Break": "#84CC16",
  "Long Break": "#6366F1",
  "Reset Session": "#6B7280",
  "Mindful Moment": "#EC4899",
};

export default function SessionIndicator({
  sessionType,
  duration,
  isRunning,
  isPaused,
  onPress,
}: SessionIndicatorProps) {
  const icon = SESSION_ICONS[sessionType];
  const color = SESSION_COLORS[sessionType];
  const durationMinutes = Math.floor(duration / 60);

  const getStatusText = () => {
    if (isPaused) return "Paused";
    if (isRunning) return "Running";
    return "Ready";
  };

  const getStatusColor = () => {
    if (isPaused) return "#F59E0B"; // Amber
    if (isRunning) return "#10B981"; // Green
    return "#6B7280"; // Gray
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between w-full bg-white dark:bg-gray-800 rounded-xl px-5 py-4 border-2 border-blue-200 dark:border-blue-700"
      style={{
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center gap-4 flex-1 min-w-0">
        <View
          className="w-12 h-12 rounded-full items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-text-primary text-lg font-SoraSemiBold"
            numberOfLines={1}
          >
            {sessionType}
          </Text>
          <View className="flex-row items-center gap-3 mt-2">
            <View className="flex-row items-center gap-2">
              <View
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getStatusColor() }}
              />
              <Text
                className="text-sm font-SoraMedium"
                style={{ color: getStatusColor() }}
              >
                {getStatusText()}
              </Text>
            </View>
            <Text className="text-text-secondary text-sm">
              • {durationMinutes} min
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-2 flex-shrink-0 ml-3">
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-full px-2 py-1">
          <Text className="text-blue-600 dark:text-blue-400 text-xs font-SoraSemiBold">
            Session
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}
