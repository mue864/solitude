import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSessionIntelligence } from "../store/sessionIntelligence";

export const SessionIntelligenceTest: React.FC = () => {
  const {
    sessionRecords,
    patterns,
    userStats,
    getRecommendations,
    getProductivityInsights,
    getWeeklyAnalytics,
    recordSession,
    clearAllData,
    getSessionHistory,
  } = useSessionIntelligence();

  const testRecordSession = (completed: boolean) => {
    recordSession({
      sessionType: "Classic",
      duration: 25 * 60, // 25 minutes
      completed,
      focusQuality: completed
        ? Math.floor(Math.random() * 5) + 6
        : Math.floor(Math.random() * 4) + 1,
      energyLevel: Math.floor(Math.random() * 5) + 6,
      interruptions: Math.floor(Math.random() * 3),
    });
  };

  const recommendations = getRecommendations();
  const productivityInsights = getProductivityInsights();
  const weeklyAnalytics = getWeeklyAnalytics();
  const sessionHistory = getSessionHistory(5);

  return (
    <ScrollView className="flex-1 bg-primary dark:bg-primary-dark p-4">
      <Text className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
        Session Intelligence Test
      </Text>

      {/* Test Buttons */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Test Actions
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="bg-green-500 px-4 py-2 rounded-lg"
            onPress={() => testRecordSession(true)}
          >
            <Text className="text-white font-semibold">Record Success</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 px-4 py-2 rounded-lg"
            onPress={() => testRecordSession(false)}
          >
            <Text className="text-white font-semibold">Record Failure</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg"
            onPress={clearAllData}
          >
            <Text className="text-white font-semibold">Clear Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Session Records */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Session Records ({sessionRecords.length})
        </Text>
        {sessionHistory.map((record) => (
          <View
            key={record.id}
            className="bg-card-bg dark:bg-card-bg-dark p-3 rounded-lg mb-2"
          >
            <Text className="text-text-primary dark:text-text-primary-dark">
              {record.sessionType} - {record.completed ? "✅" : "❌"} -{" "}
              {new Date(record.timestamp).toLocaleTimeString()}
            </Text>
            {record.focusQuality && (
              <Text className="text-text-secondary dark:text-text-secondary-dark">
                Focus Quality: {record.focusQuality}/10
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* User Stats */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          User Stats
        </Text>
        <View className="bg-card-bg dark:bg-card-bg-dark p-3 rounded-lg">
          <Text className="text-text-primary dark:text-text-primary-dark">
            Total Sessions: {userStats.totalSessions}
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Completion Rate: {userStats.completionRate.toFixed(1)}%
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Most Successful: {userStats.mostSuccessfulSession}
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Productivity Score: {userStats.productivityScore.toFixed(0)}/100
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Focus Trend: {userStats.focusTrend}
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Current Streak: {userStats.currentStreak}
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Recommendations
        </Text>
        <View className="bg-card-bg dark:bg-card-bg-dark p-3 rounded-lg">
          <Text className="text-text-primary dark:text-text-primary-dark">
            Recommended: {recommendations.recommendedSession}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark">
            Reason: {recommendations.reason}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark">
            Success Rate: {recommendations.successRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Productivity Insights */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Productivity Insights
        </Text>
        <View className="bg-card-bg dark:bg-card-bg-dark p-3 rounded-lg">
          <Text className="text-text-primary dark:text-text-primary-dark">
            Score: {productivityInsights.productivityScore.toFixed(0)}/100
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Trend: {productivityInsights.focusTrend}
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Best Streak: {productivityInsights.bestSessionStreak}
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Peak Hours:{" "}
            {productivityInsights.peakProductivityHours
              .map((h) => `${h}:00`)
              .join(", ")}
          </Text>
          {productivityInsights.recommendations.length > 0 && (
            <Text className="text-text-secondary dark:text-text-secondary-dark mt-2">
              Tips: {productivityInsights.recommendations[0]}
            </Text>
          )}
        </View>
      </View>

      {/* Weekly Analytics */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          This Week
        </Text>
        <View className="bg-card-bg dark:bg-card-bg-dark p-3 rounded-lg">
          <Text className="text-text-primary dark:text-text-primary-dark">
            Sessions: {weeklyAnalytics.sessionsCompleted}
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Focus Time: {Math.round(weeklyAnalytics.totalFocusTime / 60)}{" "}
            minutes
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Avg Quality: {weeklyAnalytics.averageFocusQuality.toFixed(1)}/10
          </Text>
          <Text className="text-text-primary dark:text-text-primary-dark">
            Improvement: {weeklyAnalytics.improvement.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Session Patterns */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Session Patterns
        </Text>
        {Object.entries(patterns).map(([sessionType, pattern]) => (
          <View
            key={sessionType}
            className="bg-card-bg dark:bg-card-bg-dark p-3 rounded-lg mb-2"
          >
            <Text className="text-text-primary dark:text-text-primary-dark font-semibold">
              {sessionType}
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark">
              Total: {pattern.totalSessions} | Completed:{" "}
              {pattern.completedSessions} | Success:{" "}
              {pattern.successRate.toFixed(1)}%
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark">
              Avg Focus: {pattern.averageFocusQuality.toFixed(1)}/10 | Avg
              Energy: {pattern.averageEnergyLevel.toFixed(1)}/10
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
