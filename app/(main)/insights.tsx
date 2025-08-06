import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FocusQualityChart,
  PieChartComponent,
  WeeklyChart,
} from "../../components/ChartComponents";
import { useSessionIntelligence, getDateString, getDayName, getDayNameShort } from "../../store/sessionIntelligence";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 80 + 20; // Add extra width to avoid clipping
const miniChartWidth = screenWidth - 100; // For smaller embedded charts

export default function Insights() {
  const {
    userStats,
    getProductivityInsights,
    getWeeklyAnalytics,
    getMostCompletedFlows,
    getFlowStreaks,
    getFlowSuccessRates,
    getRecommendations,
    getNextMilestone,
    getMilestoneProgress,
    cleanupSessionData,
    sessionRecords,
  } = useSessionIntelligence();

  // Memoize all expensive calculations
  const productivity = useMemo(
    () => getProductivityInsights(),
    [getProductivityInsights]
  );
  const weekly = useMemo(() => getWeeklyAnalytics(), [getWeeklyAnalytics]);
  const mostCompletedFlows = useMemo(
    () => getMostCompletedFlows(),
    [getMostCompletedFlows]
  );
  const flowStreaks = useMemo(() => getFlowStreaks(), [getFlowStreaks]);
  const flowSuccessRates = useMemo(
    () => getFlowSuccessRates(),
    [getFlowSuccessRates]
  );
  const recommendations = useMemo(
    () => getRecommendations(),
    [getRecommendations]
  );

  // Animated progress bar for productivity score
  const progressAnim = useRef(new Animated.Value(0)).current;
  const score = Math.min(productivity.productivityScore, 100);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: score,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const showMilestone = score >= 90;

  // Cleanup bad session data on component mount
  useEffect(() => {
    // Check if we have sessions with zero duration or future timestamps
    const hasBadData = sessionRecords.some(r => 
      (r.completed && r.duration <= 0) || r.timestamp > Date.now()
    );
    
    if (hasBadData) {
      console.log('🔧 Detected bad session data, running cleanup...');
      cleanupSessionData();
    }
  }, []); // Run only once on mount

  // Memoized weekly data calculation
  const weekData = useMemo(() => {
    const now = new Date();
    const weekDataArray = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const dayStr = getDayNameShort(d.getTime());
        const dateStr = getDateString(d.getTime());

        const dayRecords = sessionRecords.filter(
          (r) => getDateString(r.timestamp) === dateStr && r.completed
        );

        const total = dayRecords.reduce((sum, r) => sum + (r.duration || 0), 0);

        return {
          day: dayStr,
          total: Math.round(total / 60),
        };
      });

    return weekDataArray;
  }, [sessionRecords]);

  // Memoized focus quality data calculation
  const focusQualityData = useMemo(() => {
    const now = new Date();
    const qualityDataArray = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const dateStr = getDateString(d.getTime());

        const dayRecords = sessionRecords.filter(
          (r) => getDateString(r.timestamp) === dateStr && r.completed
        );

        const avgQuality =
          dayRecords.length > 0
            ? dayRecords.reduce((sum, r) => sum + (r.focusQuality !== undefined ? r.focusQuality : 5), 0) /
              dayRecords.length
            : 0;

        return {
          day: getDayNameShort(d.getTime()),
          quality: avgQuality,
        };
      });

    return qualityDataArray;
  }, [sessionRecords]);

  // Memoized flow distribution data
  const flowDistributionData = useMemo(() => {
    return mostCompletedFlows.slice(0, 4).map((flow, index) => ({
      name:
        flow.flowName.length > 12
          ? flow.flowName.substring(0, 12) + "..."
          : flow.flowName,
      count: flow.count,
      color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][index] || "#6B7280",
      legendFontColor: "#6B7280",
      legendFontSize: 11,
    }));
  }, [mostCompletedFlows]);

  // Memoized session type data (already optimized)
  const sessionTypeData = useMemo(() => {
    const typeStats: Record<string, { totalTime: number; count: number }> = {};

    sessionRecords.forEach((record) => {
      if (record.completed) {
        if (!typeStats[record.sessionType]) {
          typeStats[record.sessionType] = { totalTime: 0, count: 0 };
        }
        typeStats[record.sessionType].totalTime += record.duration || 0;
        typeStats[record.sessionType].count += 1;
      }
    });

    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
    ];

    return Object.entries(typeStats)
      .sort(([, a], [, b]) => b.totalTime - a.totalTime)
      .slice(0, 6)
      .map(([type, stats], index) => ({
        name: type.length > 12 ? type.substring(0, 12) + "..." : type,
        totalTime: Math.round(stats.totalTime / 60), // Convert to minutes
        count: stats.count,
        color: colors[index] || "#6B7280",
        legendFontColor: "#6B7280",
        legendFontSize: 11,
      }));
  }, [sessionRecords]);

  // Memoized success rate progress data
  const successRateProgress = useMemo(() => {
    return flowSuccessRates.slice(0, 3).map((flow) => ({
      name: flow.flowName,
      rate: flow.successRate,
      color:
        flow.successRate >= 80
          ? "#10B981"
          : flow.successRate >= 60
            ? "#F59E0B"
            : "#EF4444",
    }));
  }, [flowSuccessRates]);

  // Memoized chart data for better performance
  const weeklyChartData = useMemo(
    () => ({
      labels: weekData.map((d) => d.day),
      datasets: [
        {
          data: weekData.map((d) => d.total),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        },
      ],
    }),
    [weekData]
  );

  const focusQualityChartData = useMemo(
    () => ({
      labels: focusQualityData.map((d) => d.day),
      datasets: [
        {
          data: focusQualityData.map((d) => d.quality),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    }),
    [focusQualityData]
  );

  // Memoized best day calculation
  const bestDay = useMemo(() => {
    return weekData.length > 0
      ? weekData.reduce((a, b) => (a.total > b.total ? a : b)).day
      : "No data";
  }, [weekData]);

  // Memoized total weekly time
  const totalWeeklyTime = useMemo(() => {
    return weekData.reduce((sum, d) => sum + d.total, 0);
  }, [weekData]);

  // Memoized max weekly sessions
  const maxWeeklySessions = useMemo(() => {
    return Math.max(...weekData.map((d) => d.total), 0);
  }, [weekData]);

  // Memoized total session type time
  const totalSessionTypeTime = useMemo(() => {
    return sessionTypeData.reduce((sum, item) => sum + item.totalTime, 0);
  }, [sessionTypeData]);

  // Memoized most used session type
  const mostUsedSessionType = useMemo(() => {
    return sessionTypeData[0]?.name || "No data";
  }, [sessionTypeData]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-6 pt-12 pb-4">
        <Text className="text-2xl font-SoraBold text-gray-900 dark:text-white">
          Your Insights
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mt-1 font-Sora">
          Track your progress and optimize your flow
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Productivity Score Card */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              {showMilestone ? (
                <LottieView
                  source={require("../../assets/lottie/trophy.json")}
                  autoPlay
                  loop={false}
                  style={{ width: 40, height: 40, marginRight: 12 }}
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
                  <Ionicons name="trending-up" size={20} color="#3B82F6" />
                </View>
              )}
              <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white">
                Productivity Score
              </Text>
            </View>
            <Text className="text-3xl font-SoraBold text-blue-600 dark:text-blue-400">
              {score.toFixed(0)}
            </Text>
          </View>

          <View className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <Animated.View
              className="h-full rounded-full"
              style={{
                width: progressWidth,
                backgroundColor:
                  score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444",
              }}
            />
          </View>

          {showMilestone && (
            <View className="items-center mb-4">
              <LottieView
                source={require("../../assets/lottie/confetti.json")}
                autoPlay
                loop={false}
                style={{ width: 120, height: 60 }}
              />
              <Text className="text-sm font-SoraSemiBold text-green-600 dark:text-green-400">
                🎉 Excellent productivity!
              </Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
                Sessions
              </Text>
              <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
                {userStats.totalSessions}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
                Current Streak
              </Text>
              <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
                {userStats.currentStreak}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
                Best Streak
              </Text>
              <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
                {productivity.bestSessionStreak ?? "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Bests */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-3">
              <Ionicons name="trophy" size={20} color="#8B5CF6" />
            </View>
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white">
              Personal Bests
            </Text>
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mb-3">
                This Week
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                    Best Day
                  </Text>
                  <Text className="text-sm font-SoraBold text-gray-900 dark:text-white">
                    {bestDay}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                    Most Sessions
                  </Text>
                  <Text className="text-sm font-SoraBold text-gray-900 dark:text-white">
                    {maxWeeklySessions} min
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                    Avg Quality
                  </Text>
                  <Text className="text-sm font-SoraBold text-gray-900 dark:text-white">
                    {userStats.averageFocusQuality.toFixed(1)}/10
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mb-3">
                All Time
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                    Best Streak
                  </Text>
                  <Text className="text-sm font-SoraBold text-gray-900 dark:text-white">
                    {productivity.bestSessionStreak ?? userStats.currentStreak}{" "}
                    days
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                    Total Sessions
                  </Text>
                  <Text className="text-sm font-SoraBold text-gray-900 dark:text-white">
                    {userStats.totalSessions}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                    Success Rate
                  </Text>
                  <Text className="text-sm font-SoraBold text-gray-900 dark:text-white">
                    {userStats.completionRate.toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
              Next milestone: {getNextMilestone()} day streak
            </Text>
            <Text className="text-sm font-SoraSemiBold text-purple-600 dark:text-purple-400">
              Keep it up! 🚀
            </Text>
          </View>
        </View>

        {/* Weekly Focus Time Chart */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white">
              Weekly Focus Time
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="time" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-Sora">
                minutes
              </Text>
            </View>
          </View>

          <View className="w-full items-center">
            <View
              className="overflow-hidden rounded-2xl bg-white"
              style={{ width: chartWidth }}
            >
              <WeeklyChart data={weeklyChartData} width={chartWidth} />
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
              Best day: {bestDay}
            </Text>
            <Text className="text-sm font-SoraSemiBold text-blue-600 dark:text-blue-400">
              {totalWeeklyTime} min total
            </Text>
          </View>
        </View>

        {/* Focus Quality Trend */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white">
              Focus Quality Trend
            </Text>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
                Quality Score
              </Text>
            </View>
          </View>

          <View className="w-full items-center">
            <View
              className="overflow-hidden rounded-2xl bg-white"
              style={{ width: chartWidth }}
            >
              <FocusQualityChart
                data={focusQualityChartData}
                width={chartWidth}
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
              Trend: {productivity.focusTrend}
            </Text>
            <Text className="text-sm font-SoraSemiBold text-green-600 dark:text-green-400">
              Avg: {userStats.averageFocusQuality.toFixed(1)}/10
            </Text>
          </View>
        </View>

        {/* Focus by Session Type */}
        {sessionTypeData.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white">
                Focus by Session Type
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="pie-chart" size={16} color="#6B7280" />
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-Sora">
                  minutes
                </Text>
              </View>
            </View>

            <View className="w-full items-center">
              <View
                className="bg-white rounded-2xl p-4 items-center"
                style={{ width: "100%" }}
              >
                <PieChartComponent
                  data={sessionTypeData}
                  width={miniChartWidth}
                  accessor="totalTime"
                />
              </View>
            </View>

            <View className="mt-4 space-y-2">
              {sessionTypeData.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1 font-Sora">
                      {item.name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white">
                      {item.totalTime} min
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-Sora">
                      {item.count} sessions
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora">
                Most used: {mostUsedSessionType}
              </Text>
              <Text className="text-sm font-SoraSemiBold text-blue-600 dark:text-blue-400">
                {totalSessionTypeTime} min total
              </Text>
            </View>
          </View>
        )}

        {/* Flow Distribution */}
        {flowDistributionData.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
              Flow Distribution
            </Text>

            <View className="w-full items-center">
              <View
                className="bg-white rounded-2xl p-4 items-center"
                style={{ width: "100%" }}
              >
                <PieChartComponent
                  data={flowDistributionData}
                  width={miniChartWidth}
                  accessor="count"
                />
              </View>
            </View>

            <View className="mt-4 space-y-2">
              {flowDistributionData.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1 font-Sora">
                      {item.name}
                    </Text>
                  </View>
                  <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white">
                    {item.count}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Success Rates */}
        {successRateProgress.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
              Success Rates
            </Text>

            <View className="space-y-4">
              {successRateProgress.map((flow, index) => (
                <View key={index}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-SoraSemiBold text-gray-900 dark:text-white">
                      {flow.name}
                    </Text>
                    <Text
                      className="text-sm font-SoraBold"
                      style={{ color: flow.color }}
                    >
                      {flow.rate.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${flow.rate}%`,
                        backgroundColor: flow.color,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Flow Analytics */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
            Flow Analytics
          </Text>

          <View className="flex-row">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mb-3">
                Most Completed
              </Text>
              {mostCompletedFlows.length === 0 ? (
                <Text className="text-gray-400 text-sm font-Sora">
                  No flows yet
                </Text>
              ) : (
                mostCompletedFlows.slice(0, 3).map((f, index) => (
                  <View
                    key={f.flowId}
                    className="flex-row items-center justify-between mb-2"
                  >
                    <Text className="text-sm text-gray-900 dark:text-white flex-1 font-Sora">
                      {f.flowName.length > 15
                        ? f.flowName.substring(0, 15) + "..."
                        : f.flowName}
                    </Text>
                    <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                      <Text className="text-xs font-SoraSemiBold text-blue-600 dark:text-blue-400">
                        {f.count}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View className="flex-1">
              <Text className="text-sm font-SoraSemiBold text-gray-600 dark:text-gray-400 mb-3">
                Best Streaks
              </Text>
              {flowStreaks.length === 0 ? (
                <Text className="text-gray-400 text-sm font-Sora">
                  No streaks yet
                </Text>
              ) : (
                flowStreaks.slice(0, 3).map((f, index) => (
                  <View
                    key={f.flowId}
                    className="flex-row items-center justify-between mb-2"
                  >
                    <Text className="text-sm text-gray-900 dark:text-white flex-1 font-Sora">
                      {f.flowName.length > 15
                        ? f.flowName.substring(0, 15) + "..."
                        : f.flowName}
                    </Text>
                    <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                      <Text className="text-xs font-SoraSemiBold text-green-600 dark:text-green-400">
                        {f.streak}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-3">
              <Ionicons name="bulb" size={20} color="#3B82F6" />
            </View>
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white">
              Recommendations
            </Text>
          </View>

          <Text className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed font-Sora">
            {recommendations.reason}
          </Text>

          <TouchableOpacity className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-SoraSemiBold">
                Try this session
              </Text>
              <Text className="text-blue-100 text-sm font-Sora">
                {recommendations.recommendedSession}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
