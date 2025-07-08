import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, Vibration, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SessionCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  session: {
    taskName: string;
    duration: number; // seconds
    streak: number;
  };
  onReflect: () => void;
  onViewInsights: () => void;
}

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m${sec > 0 ? ` ${sec}s` : ""}`;
};

export default function SessionCompletionModal({
  isVisible,
  onClose,
  session,
  onReflect,
  onViewInsights,
}: SessionCompletionModalProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const { getProductivityInsights } = useSessionIntelligence();
  const insights = getProductivityInsights();

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/chime.mp3")
      );
      setSound(sound);
    };
    loadSound();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (sound) sound.replayAsync();
      Vibration.vibrate(100);
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      checkmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      checkmarkScale.value = 0;
    }
  }, [isVisible, sound]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <BlurView
          intensity={20}
          className="w-full h-full justify-center items-center"
        >
          <Animated.View
            className="w-[90%] max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
            style={modalStyle}
          >
            <View className="p-6">
              {/* Header with checkmark */}
              <View className="items-center mb-6">
                <Animated.View
                  className="w-16 h-16 bg-green-500 rounded-full items-center justify-center mb-4"
                  style={checkmarkStyle}
                >
                  <Text className="text-white text-2xl font-SoraBold">✓</Text>
                </Animated.View>
                <Text className="text-text-primary text-xl font-SoraBold text-center">
                  Session Complete!
                </Text>
              </View>
              {/* Session summary */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-text-secondary text-base font-SoraSemiBold">
                    Task
                  </Text>
                  <Text className="text-text-primary text-base font-SoraSemiBold">
                    {session.taskName}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-text-secondary text-base font-SoraSemiBold">
                    Duration
                  </Text>
                  <Text className="text-text-primary text-base font-SoraSemiBold">
                    {formatDuration(session.duration)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-text-secondary text-base font-SoraSemiBold">
                    Streak
                  </Text>
                  <Text className="text-text-primary text-base font-SoraSemiBold">
                    {session.streak} days
                  </Text>
                </View>
              </View>
              {/* Insights */}
              <View className="mb-6">
                <Text className="text-text-secondary text-sm font-SoraSemiBold mb-1">
                  Insights
                </Text>
                <Text className="text-text-primary text-base font-SoraSemiBold">
                  {insights.length > 0
                    ? insights[0]
                    : "Great job! Keep up the focus."}
                </Text>
              </View>
              {/* Actions */}
              <View className="flex-row justify-end gap-3 mt-2">
                <TouchableOpacity
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
                  onPress={onReflect}
                >
                  <Text className="text-text-secondary font-SoraSemiBold">
                    Reflect
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 rounded-xl bg-blue-600"
                  onPress={onViewInsights}
                >
                  <Text className="text-white font-SoraSemiBold">
                    View Insights
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
                  onPress={onClose}
                >
                  <Text className="text-text-secondary font-SoraSemiBold">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
}
