import { useSessionStore } from "@/store/sessionState";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface TodayProgressProps {
  isExpanded: boolean;
  onToggle: () => void;
  anim: Animated.Value;
}

const TodayProgress = ({ isExpanded, onToggle, anim }: TodayProgressProps) => {
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

  // Animation for progress bar bounce
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (completedSessions !== prevCompleted) {
      setPrevCompleted(completedSessions);
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

  // Animated height and details opacity
  const minHeight = 56;
  const maxHeight = 170;
  const cardHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [minHeight, maxHeight],
  });
  const detailsOpacity = anim;
  const chevronRotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onToggle}>
      <Animated.View
        className="bg-white dark:bg-gray-800 rounded-xl p-4 my-2 shadow-sm border border-gray-100 dark:border-gray-700"
        style={{
          height: cardHeight,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <Text className="text-lg font-SoraSemiBold text-text-primary">
              Today&apos;s Progress
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="bg-green-500/10 rounded-full px-3 py-1 border border-green-500/20">
              <Text className="text-green-600 dark:text-green-400 text-sm font-SoraSemiBold">
                {completedSessions}/{totalSessions}
              </Text>
            </View>
            <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Animated.View>
          </View>
        </View>
        {/* Progress bar (always visible) */}
        <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 mb-2 overflow-hidden">
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
        {/* Details (only in expanded state) */}
        <Animated.View
          style={{
            opacity: detailsOpacity,
            height: detailsOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 80],
            }),
            overflow: "hidden",
          }}
        >
          <View className="gap-2.5">
            <Animated.View
              className="flex-row items-center gap-3"
              style={{ transform: [{ scale: scaleAnim }] }}
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
      </Animated.View>
    </TouchableOpacity>
  );
};

export default TodayProgress;
