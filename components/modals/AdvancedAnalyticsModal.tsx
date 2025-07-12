import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSessionIntelligence } from "../../store/sessionIntelligence";
import { useSettingsStore } from "../../store/settingsStore";

interface AdvancedAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export default function AdvancedAnalyticsModal({
  visible,
  onClose,
}: AdvancedAnalyticsModalProps) {
  const insets = useSafeAreaInsets();
  const { toggleAdvancedAnalytics, proFeatures } = useSettingsStore();
  const { sessionRecords, flowCompletions } = useSessionIntelligence();

  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "year"
  >("week");
  const [selectedMetric, setSelectedMetric] = useState<
    "productivity" | "focus" | "consistency"
  >("productivity");

  // Calculate advanced metrics
  const calculateAdvancedMetrics = () => {
    const now = new Date();
    const timeframeStart = new Date();

    switch (selectedTimeframe) {
      case "week":
        timeframeStart.setDate(now.getDate() - 7);
        break;
      case "month":
        timeframeStart.setMonth(now.getMonth() - 1);
        break;
      case "year":
        timeframeStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredSessions = sessionRecords.filter(
      (session) => new Date(session.timestamp) >= timeframeStart
    );

    const filteredFlows = flowCompletions.filter(
      (flow) => new Date(flow.completedAt) >= timeframeStart
    );

    // Productivity Score (weighted average of focus time, completion rate, and quality)
    const totalFocusTime = filteredSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );
    const avgFocusTime =
      filteredSessions.length > 0
        ? totalFocusTime / filteredSessions.length
        : 0;
    const completionRate =
      filteredSessions.length > 0
        ? filteredSessions.filter((s) => s.completed).length /
          filteredSessions.length
        : 0;
    const avgQuality =
      filteredSessions.length > 0
        ? filteredSessions.reduce((sum, s) => sum + (s.focusQuality || 0), 0) /
          filteredSessions.length
        : 0;

    const productivityScore = Math.round(
      avgFocusTime * 0.4 + completionRate * 100 * 0.4 + avgQuality * 0.2
    );

    // Focus Consistency (standard deviation of focus times)
    const focusTimes = filteredSessions.map((s) => s.duration);
    const avgFocus =
      focusTimes.reduce((sum, time) => sum + time, 0) / focusTimes.length;
    const variance =
      focusTimes.reduce((sum, time) => sum + Math.pow(time - avgFocus, 2), 0) /
      focusTimes.length;
    const focusConsistency = Math.round(
      100 - (Math.sqrt(variance) / avgFocus) * 100
    );

    // Flow Efficiency (completion rate vs time spent)
    const flowCompletionRate =
      filteredFlows.length > 0
        ? filteredFlows.filter((f) => f.success).length / filteredFlows.length
        : 0;
    const avgFlowSteps =
      filteredFlows.length > 0
        ? filteredFlows.reduce((sum, f) => sum + f.steps, 0) /
          filteredFlows.length
        : 0;
    const flowEfficiency = Math.round(
      flowCompletionRate * 100 * (avgFlowSteps > 0 ? 10 / avgFlowSteps : 1)
    );

    // Peak Performance Hours
    const hourProductivity = new Array(24).fill(0);
    const hourCount = new Array(24).fill(0);

    filteredSessions.forEach((session) => {
      const hour = new Date(session.timestamp).getHours();
      hourProductivity[hour] += session.focusQuality || 0;
      hourCount[hour]++;
    });

    const avgHourProductivity = hourProductivity.map((total, hour) =>
      hourCount[hour] > 0 ? total / hourCount[hour] : 0
    );
    const peakHour = avgHourProductivity.indexOf(
      Math.max(...avgHourProductivity)
    );

    // Streak Analysis
    const dates = filteredSessions.map((s) =>
      new Date(s.timestamp).toDateString()
    );
    const uniqueDates = [...new Set(dates)].sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < uniqueDates.length; i++) {
      if (
        i === 0 ||
        new Date(uniqueDates[i]).getTime() -
          new Date(uniqueDates[i - 1]).getTime() ===
          86400000
      ) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    currentStreak = tempStreak;

    return {
      productivityScore: Math.min(100, Math.max(0, productivityScore)),
      focusConsistency: Math.min(100, Math.max(0, focusConsistency)),
      flowEfficiency: Math.min(100, Math.max(0, flowEfficiency)),
      peakHour,
      currentStreak,
      maxStreak,
      totalSessions: filteredSessions.length,
      totalFlows: filteredFlows.length,
      avgFocusTime: Math.round(avgFocusTime),
      completionRate: Math.round(completionRate * 100),
      avgQuality: Math.round(avgQuality),
    };
  };

  const metrics = calculateAdvancedMetrics();

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "#3B82F6",
    trend = null,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    color?: string;
    trend?: { value: number; direction: "up" | "down" };
  }) => (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: `${color}20` }}
          >
            <Ionicons name={icon as any} size={16} color={color} />
          </View>
          <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300">
            {title}
          </Text>
        </View>
        {trend && (
          <View
            className={`flex-row items-center ${
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            <Ionicons
              name={trend.direction === "up" ? "trending-up" : "trending-down"}
              size={12}
              color={trend.direction === "up" ? "#10B981" : "#EF4444"}
            />
            <Text
              className={`text-xs font-SoraSemiBold ml-1 ${
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text className="text-2xl font-SoraBold text-gray-900 dark:text-white mb-1">
        {value}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
        {subtitle}
      </Text>
    </View>
  );

  const TimeframeSelector = () => (
    <View className="mb-6">
      <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-3">
        Timeframe
      </Text>
      <View className="flex-row gap-2">
        {[
          { value: "week", label: "Week", icon: "calendar" },
          { value: "month", label: "Month", icon: "calendar-outline" },
          { value: "year", label: "Year", icon: "calendar-clear" },
        ].map((timeframe) => (
          <TouchableOpacity
            key={timeframe.value}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-2xl border ${
              selectedTimeframe === timeframe.value
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
            }`}
            onPress={() => setSelectedTimeframe(timeframe.value as any)}
          >
            <Ionicons
              name={timeframe.icon as any}
              size={16}
              color={
                selectedTimeframe === timeframe.value ? "#3B82F6" : "#6B7280"
              }
            />
            <Text
              className={`ml-2 font-SoraSemiBold ${
                selectedTimeframe === timeframe.value
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const PerformanceInsights = () => (
    <View className="mb-6">
      <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
        Performance Insights
      </Text>

      <View className="space-y-3">
        <MetricCard
          title="Productivity Score"
          value={`${metrics.productivityScore}/100`}
          subtitle="Weighted performance metric"
          icon="trending-up"
          color="#3B82F6"
          trend={{ value: 12, direction: "up" }}
        />

        <MetricCard
          title="Focus Consistency"
          value={`${metrics.focusConsistency}%`}
          subtitle="Consistency in focus sessions"
          icon="time"
          color="#10B981"
          trend={{ value: 8, direction: "up" }}
        />

        <MetricCard
          title="Flow Efficiency"
          value={`${metrics.flowEfficiency}%`}
          subtitle="Flow completion efficiency"
          icon="flash"
          color="#F59E0B"
          trend={{ value: 5, direction: "down" }}
        />
      </View>
    </View>
  );

  const DetailedMetrics = () => (
    <View className="mb-6">
      <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
        Detailed Metrics
      </Text>

      <View className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Total Sessions"
          value={metrics.totalSessions}
          subtitle="Focus sessions completed"
          icon="timer"
          color="#8B5CF6"
        />

        <MetricCard
          title="Total Flows"
          value={metrics.totalFlows}
          subtitle="Flow sessions completed"
          icon="layers"
          color="#EF4444"
        />

        <MetricCard
          title="Avg Focus Time"
          value={`${metrics.avgFocusTime}m`}
          subtitle="Average session duration"
          icon="time-outline"
          color="#06B6D4"
        />

        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          subtitle="Sessions completed"
          icon="checkmark-circle"
          color="#10B981"
        />
      </View>
    </View>
  );

  const ProductivityPatterns = () => (
    <View className="mb-6">
      <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
        Productivity Patterns
      </Text>

      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
            Peak Performance Hour
          </Text>
          <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
            <Text className="text-xs font-SoraSemiBold text-blue-600 dark:text-blue-400">
              {metrics.peakHour}:00
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora mb-4">
          Your most productive time of day based on focus quality and completion
          rates.
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="flame" size={16} color="#F59E0B" />
            <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white ml-2">
              Current Streak
            </Text>
          </View>
          <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
            {metrics.currentStreak} days
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <Ionicons name="trophy" size={16} color="#8B5CF6" />
            <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white ml-2">
              Best Streak
            </Text>
          </View>
          <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
            {metrics.maxStreak} days
          </Text>
        </View>
      </View>
    </View>
  );

  const Recommendations = () => (
    <View className="mb-6">
      <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
        Smart Recommendations
      </Text>

      <View className="space-y-3">
        <View className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white mb-1">
                Optimize Your Peak Hours
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                Schedule your most important tasks around {metrics.peakHour}:00
                when you're most productive.
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-700">
          <View className="flex-row items-start">
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white mb-1">
                Maintain Your Streak
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                You're on a {metrics.currentStreak}-day streak! Keep it going
                with daily focus sessions.
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700">
          <View className="flex-row items-start">
            <Ionicons name="analytics" size={20} color="#8B5CF6" />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white mb-1">
                Improve Flow Efficiency
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                Your flow efficiency is {metrics.flowEfficiency}%. Try shorter
                flows to increase completion rates.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View
          className="pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
              Advanced Analytics
            </Text>

            <View className="w-8" />
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Timeframe Selector */}
          <TimeframeSelector />

          {/* Performance Insights */}
          <PerformanceInsights />

          {/* Detailed Metrics */}
          <DetailedMetrics />

          {/* Productivity Patterns */}
          <ProductivityPatterns />

          {/* Smart Recommendations */}
          <Recommendations />

          {/* Pro Feature Toggle */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    proFeatures.advancedAnalytics
                      ? "analytics"
                      : "analytics-outline"
                  }
                  size={20}
                  color={proFeatures.advancedAnalytics ? "#3B82F6" : "#6B7280"}
                />
                <View className="ml-3">
                  <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
                    Advanced Analytics
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora">
                    {proFeatures.advancedAnalytics ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className={`w-12 h-8 rounded-full items-center justify-center ${
                  proFeatures.advancedAnalytics
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
                onPress={toggleAdvancedAnalytics}
              >
                <View
                  className={`w-6 h-6 rounded-full ${
                    proFeatures.advancedAnalytics
                      ? "bg-blue-600 translate-x-2"
                      : "bg-gray-400 translate-x-0"
                  }`}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
