import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSessionIntelligence } from "../../store/sessionIntelligence";
import { type SessionType } from "../../store/sessionState";

interface SessionIntelligenceModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectSession: (sessionType: SessionType) => void;
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

export default function SessionIntelligenceModal({
  isVisible,
  onClose,
  onSelectSession,
}: SessionIntelligenceModalProps) {
  const {
    getRecommendations,
    getProductivityInsights,
    getWeeklyAnalytics,
    getSessionTypeStats,
  } = useSessionIntelligence();

  const recommendations = getRecommendations();
  const insights = getProductivityInsights();
  const weeklyAnalytics = getWeeklyAnalytics();

  const [showAllSessions, setShowAllSessions] = useState(false);

  const handleSessionSelect = (sessionType: SessionType) => {
    onSelectSession(sessionType);
    onClose();
  };

  const getSessionStats = (sessionType: SessionType) => {
    const stats = getSessionTypeStats(sessionType);
    if (!stats) return null;
    return {
      successRate: stats.successRate,
      totalSessions: stats.totalSessions,
      avgFocus: stats.averageFocusQuality,
    };
  };

  const renderSessionCard = (
    sessionType: SessionType,
    isRecommended = false
  ) => {
    try {
      const stats = getSessionStats(sessionType);
      const icon = SESSION_ICONS[sessionType];
      const color = SESSION_COLORS[sessionType];

      // Add fallbacks for missing data
      if (!icon || !color) {
        console.warn(`Missing icon or color for session type: ${sessionType}`);
        return null;
      }

      return (
        <TouchableOpacity
          key={sessionType}
          onPress={() => handleSessionSelect(sessionType)}
          className={`mb-3 p-4 rounded-xl border-2 ${
            isRecommended
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
          style={{
            shadowColor: isRecommended ? "#3B82F6" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isRecommended ? 0.15 : 0.08,
            shadowRadius: isRecommended ? 8 : 4,
            elevation: isRecommended ? 4 : 2,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${color}20` }}
              >
                <Ionicons name={icon as any} size={24} color={color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-text-primary text-lg font-SoraSemiBold">
                    {sessionType}
                  </Text>
                  {isRecommended && (
                    <View className="bg-blue-500 rounded-full px-2 py-1">
                      <Text className="text-white text-xs font-SoraSemiBold">
                        Recommended
                      </Text>
                    </View>
                  )}
                </View>
                {stats && (
                  <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full bg-green-500" />
                      <Text className="text-text-secondary text-sm">
                        {stats.successRate.toFixed(0)}% success
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full bg-blue-500" />
                      <Text className="text-text-secondary text-sm">
                        {stats.totalSessions} sessions
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2 h-2 rounded-full bg-purple-500" />
                      <Text className="text-text-secondary text-sm">
                        {stats.avgFocus.toFixed(1)}/10 focus
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error(`Error rendering session card for ${sessionType}:`, error);
      return null;
    }
  };

  // Add error boundary for the entire modal content
  if (!isVisible) {
    return null;
  }

  try {
    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white dark:bg-gray-900 rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center">
                  <Ionicons name="analytics-outline" size={20} color="white" />
                </View>
                <Text className="text-text-primary text-xl font-SoraSemiBold">
                  Session Intelligence
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 p-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Productivity Overview */}
              <View className="mb-6">
                <Text className="text-text-primary text-lg font-SoraSemiBold mb-3">
                  Your Productivity
                </Text>
                <View
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "#3B82F6",
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white text-sm font-SoraMedium">
                      Productivity Score
                    </Text>
                    <Text className="text-white text-2xl font-SoraBold">
                      {insights.productivityScore.toFixed(0)}/100
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="trending-up" size={16} color="white" />
                      <Text className="text-white text-sm">
                        {insights.focusTrend}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={16} color="white" />
                      <Text className="text-white text-sm">
                        {Math.round(weeklyAnalytics.totalFocusTime / 60)}m this
                        week
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Recommendation */}
              <View className="mb-6">
                <Text className="text-text-primary text-lg font-SoraSemiBold mb-3">
                  Smart Recommendation
                </Text>
                <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="bulb-outline" size={20} color="#10B981" />
                    <Text className="text-green-700 dark:text-green-300 text-base font-SoraSemiBold">
                      Try {recommendations.recommendedSession}
                    </Text>
                  </View>
                  <Text className="text-green-600 dark:text-green-400 text-sm">
                    {recommendations.reason}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <View className="bg-green-200 dark:bg-green-800 rounded-full px-2 py-1">
                      <Text className="text-green-700 dark:text-green-300 text-xs font-SoraSemiBold">
                        {recommendations.successRate.toFixed(0)}% success rate
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Session Types */}
              <View className="mb-6">
                <Text className="text-text-primary text-lg font-SoraSemiBold mb-3">
                  Recommended Sessions
                </Text>

                {/* Always show recommended session first */}
                <View>
                  {renderSessionCard(
                    recommendations.recommendedSession as SessionType,
                    true
                  )}
                  {Object.keys(SESSION_ICONS)
                    .filter(
                      (type) => type !== recommendations.recommendedSession
                    )
                    .slice(0, 3)
                    .map((type) => renderSessionCard(type as SessionType))}
                </View>

                {/* All Sessions Dropdown */}
                <View className="mt-4">
                  <TouchableOpacity
                    onPress={() => setShowAllSessions(!showAllSessions)}
                    className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Text className="text-text-primary text-base font-SoraSemiBold">
                      All Session Types
                    </Text>
                    <Ionicons
                      name={showAllSessions ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {showAllSessions && (
                    <View className="mt-3">
                      {Object.keys(SESSION_ICONS)
                        .filter(
                          (type) => type !== recommendations.recommendedSession
                        )
                        .map((type) =>
                          renderSessionCard(
                            type as SessionType,
                            type === recommendations.recommendedSession
                          )
                        )
                        .filter(Boolean)}
                    </View>
                  )}
                </View>
              </View>

              {/* Weekly Insights */}
              <View className="mb-6">
                <Text className="text-text-primary text-lg font-SoraSemiBold mb-3">
                  This Week's Progress
                </Text>
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#6B7280"
                      />
                      <Text className="text-text-secondary text-sm">
                        {weeklyAnalytics.sessionsCompleted} sessions completed
                      </Text>
                    </View>
                    <Text className="text-text-primary font-SoraSemiBold">
                      {weeklyAnalytics.improvement > 0 ? "+" : ""}
                      {weeklyAnalytics.improvement.toFixed(1)}%
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <View className="items-center">
                      <Text className="text-text-primary text-lg font-SoraBold">
                        {Math.round(weeklyAnalytics.totalFocusTime / 60)}
                      </Text>
                      <Text className="text-text-secondary text-xs">
                        Minutes
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-text-primary text-lg font-SoraBold">
                        {weeklyAnalytics.averageFocusQuality.toFixed(1)}
                      </Text>
                      <Text className="text-text-secondary text-xs">
                        Avg Focus
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-text-primary text-lg font-SoraBold">
                        {weeklyAnalytics.mostProductiveDay}
                      </Text>
                      <Text className="text-text-secondary text-xs">
                        Best Day
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  } catch (error) {
    console.error("Error rendering SessionIntelligenceModal:", error);
    return null;
  }
}
