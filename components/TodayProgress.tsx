import { useSessionStore } from "@/store/sessionState";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

const TodayProgress = () => {
  const { completedSessions, missedSessions, totalSessions } =
    useSessionStore();
  const [prevCompleted, setPrevCompleted] = useState(completedSessions);

  const completedPercentage = Math.round(
    (completedSessions / totalSessions) * 100
  );
  const missedPercentage = Math.round((missedSessions / totalSessions) * 100);
  const remainingSessions = Math.max(
    0,
    totalSessions - (completedSessions + missedSessions)
  );
  const remainingPercentage = Math.round(
    (remainingSessions / totalSessions) * 100
  );

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate when completed sessions change
  useEffect(() => {
    if (completedSessions !== prevCompleted) {
      setPrevCompleted(completedSessions);
      // Bounce animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [completedSessions, prevCompleted, scaleAnim]);

  return (
    <Animated.View
      className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2 shadow-sm border border-gray-100 dark:border-gray-700"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        opacity: fadeAnim,
        transform: [{ scale: fadeAnim }],
      }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <Text className="text-lg font-SoraSemiBold text-text-primary">
            Today&apos;s Progress
          </Text>
        </View>
        <View className="bg-green-500/10 rounded-full px-3 py-1 border border-green-500/20">
          <Text className="text-green-600 dark:text-green-400 text-sm font-SoraSemiBold">
            {completedSessions}/{totalSessions}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={{
            width: `${completedPercentage}%`,
            backgroundColor: "#10B981",
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
            transform: [{ scale: scaleAnim }],
          }}
        />
      </View>

      <View className="gap-2.5">
        <Animated.View
          className="flex-row items-center gap-3"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center border border-green-200 dark:border-green-800/50">
            <Text className="text-sm font-bold text-green-600 dark:text-green-400">
              ✓
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary font-SoraMedium text-sm">
              Completed:{" "}
              <Text className="font-SoraSemiBold text-green-600 dark:text-green-400">
                {completedSessions}
              </Text>{" "}
              ({completedPercentage}%)
            </Text>
          </View>
        </Animated.View>

        <View className="flex-row items-center gap-3">
          <View className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center border border-red-200 dark:border-red-800/50">
            <Text className="text-sm font-bold text-red-600 dark:text-red-400">
              ✕
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary font-SoraMedium text-sm">
              Missed:{" "}
              <Text className="font-SoraSemiBold text-red-600 dark:text-red-400">
                {missedSessions}
              </Text>{" "}
              ({missedPercentage}%)
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center border border-gray-200 dark:border-gray-600">
            <Text className="text-sm font-bold text-gray-600 dark:text-gray-400">
              •
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary font-SoraMedium text-sm">
              Remaining:{" "}
              <Text className="font-SoraSemiBold text-gray-600 dark:text-gray-400">
                {remainingSessions}
              </Text>{" "}
              ({remainingPercentage}%)
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default TodayProgress;
