import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { useSessionStore } from "@/store/sessionState";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, Vibration, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Adaptive countdown based on session type
const getCountdownDuration = (sessionType: string) => {
  if (sessionType.includes("Break") || sessionType.includes("Mindful")) {
    return 5; // Shorter for breaks
  }
  if (sessionType.includes("Deep Focus") || sessionType.includes("Classic")) {
    return 10; // Longer for intense work sessions
  }
  return 8; // Default
};

interface FlowCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  data: {
    completedSessions: number;
    totalSessions: number;
    nextSessionType: string;
    nextSessionDuration: number;
    currentFlowName: string;
  };
  onReflect?: () => void;
  onViewInsights?: () => void;
}

const FlowCompletionModal = ({
  isVisible,
  onClose,
  data,
  onReflect,
  onViewInsights,
}: FlowCompletionModalProps) => {
  const { continueFlow, pauseFlow, endFlow } = useSessionStore();
  const [countdown, setCountdown] = useState(8);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { getProductivityInsights } = useSessionIntelligence();
  const insights = getProductivityInsights();

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  // Load sound effect
  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/chime.mp3")
      );
      setSound(sound);
    };
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Handle modal visibility
  useEffect(() => {
    if (isVisible) {
      // Play sound and haptic feedback
      if (sound) {
        sound.replayAsync();
      }
      Vibration.vibrate(100);

      // Animate modal appearance
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });

      // Animate progress bar to actual progress percentage
      const progressPercentage = Math.round(
        (data.completedSessions / data.totalSessions) * 100
      );
      progressWidth.value = withTiming(progressPercentage, { duration: 1000 });

      checkmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );

      // Animate confetti for flow completion
      const isFlowComplete = data.nextSessionType === "Flow Complete";
      if (isFlowComplete) {
        confettiScale.value = withSequence(
          withSpring(1.3, { damping: 8 }),
          withSpring(1, { damping: 15 })
        );
      }

      // Start countdown only if not flow complete
      if (!isFlowComplete) {
        const countdownDuration = getCountdownDuration(data.nextSessionType);
        setCountdown(countdownDuration);
        const interval = setInterval(() => {
          setCountdown((prev: number) => {
            if (prev <= 1) {
              clearInterval(interval);
              // Auto-continue when countdown reaches 0
              setTimeout(() => {
                continueFlow();
              }, 100);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    } else {
      // Reset animations
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      progressWidth.value = 0;
      checkmarkScale.value = 0;
      confettiScale.value = 0;
    }
  }, [
    isVisible,
    sound,
    continueFlow,
    data.nextSessionType,
    data.completedSessions,
    data.totalSessions,
  ]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const handleContinue = () => {
    Vibration.vibrate(50);
    continueFlow();
  };

  const handlePause = () => {
    Vibration.vibrate(50);
    pauseFlow();
  };

  const handleEnd = () => {
    Vibration.vibrate(50);
    endFlow();
  };

  const handleReflect = () => {
    Vibration.vibrate(50);
    onReflect?.();
  };

  const handleViewInsights = () => {
    Vibration.vibrate(50);
    onViewInsights?.();
  };

  const progressPercentage = Math.round(
    (data.completedSessions / data.totalSessions) * 100
  );
  const nextSessionMinutes = Math.floor(data.nextSessionDuration / 60);
  const isFlowComplete = data.nextSessionType === "Flow Complete";

  // Calculate total flow duration (approximate)
  const totalFlowMinutes = Math.floor((data.totalSessions * 25) / 60); // Assuming 25 min per session

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
              {/* Header with celebration */}
              <View className="items-center mb-6">
                {isFlowComplete ? (
                  // Flow completion celebration
                  <View className="items-center">
                    <Animated.View
                      className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center mb-4"
                      style={confettiStyle}
                    >
                      <Ionicons name="trophy" size={32} color="#fff" />
                    </Animated.View>
                    <Text className="text-text-primary text-2xl font-SoraBold text-center">
                      Flow Complete! 🎉
                    </Text>
                    <Text className="text-text-secondary text-base font-SoraSemiBold text-center mt-1">
                      You've completed {data.totalSessions} sessions
                    </Text>
                  </View>
                ) : (
                  // Session completion
                  <View className="items-center">
                    <Animated.View
                      className="w-16 h-16 bg-green-500 rounded-full items-center justify-center mb-4"
                      style={checkmarkStyle}
                    >
                      <Text className="text-white text-2xl font-SoraBold">
                        ✓
                      </Text>
                    </Animated.View>
                    <Text className="text-text-primary text-xl font-SoraBold text-center">
                      Session Complete!
                    </Text>
                    <Text className="text-text-secondary text-base font-SoraSemiBold text-center mt-1">
                      {data.completedSessions} of {data.totalSessions} sessions
                      done
                    </Text>
                  </View>
                )}
              </View>

              {/* Flow metrics for flow completion */}
              {isFlowComplete && (
                <View className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800/50">
                  <Text className="text-text-primary text-base font-SoraSemiBold mb-3 text-center">
                    Flow Achievement
                  </Text>
                  <View className="flex-row justify-between items-center">
                    <View className="items-center">
                      <Text className="text-text-primary text-2xl font-SoraBold">
                        {data.totalSessions}
                      </Text>
                      <Text className="text-text-secondary text-xs font-SoraSemiBold">
                        Sessions
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-text-primary text-2xl font-SoraBold">
                        ~{totalFlowMinutes}m
                      </Text>
                      <Text className="text-text-secondary text-xs font-SoraSemiBold">
                        Total Time
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-text-primary text-2xl font-SoraBold">
                        100%
                      </Text>
                      <Text className="text-text-secondary text-xs font-SoraSemiBold">
                        Complete
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Progress visualization */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-text-primary text-sm font-SoraSemiBold">
                    Flow Progress
                  </Text>
                  <Text className="text-text-secondary text-sm font-SoraSemiBold">
                    {progressPercentage}%
                  </Text>
                </View>

                {/* Progress bar */}
                <View className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
                  <Animated.View
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    style={[
                      progressStyle,
                      {
                        shadowColor: "#3B82F6",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 3,
                      },
                    ]}
                  />
                </View>

                {/* Session indicators */}
                <View className="flex-row justify-between">
                  {Array.from({ length: data.totalSessions }, (_, index) => (
                    <View key={index} className="items-center">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center mb-1 ${
                          index < data.completedSessions
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        {index < data.completedSessions ? (
                          <Text className="text-white text-xs font-SoraBold">
                            ✓
                          </Text>
                        ) : (
                          <Text className="text-gray-500 dark:text-gray-400 text-xs font-SoraBold">
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      <Text className="text-text-secondary text-xs">
                        {index + 1}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Flow insights for flow completion */}
              {isFlowComplete && (
                <View className="mb-6">
                  <Text className="text-text-secondary text-sm font-SoraSemiBold mb-2">
                    Flow Insights
                  </Text>
                  <Text className="text-text-primary text-base font-SoraSemiBold">
                    {insights.recommendations.length > 0
                      ? insights.recommendations[0]
                      : `Amazing work! You've completed an entire flow. This shows great consistency and focus.`}
                  </Text>
                </View>
              )}

              {/* Next session info for ongoing flows */}
              {!isFlowComplete && (
                <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-100 dark:border-blue-800/50">
                  <Text className="text-text-primary text-base font-SoraSemiBold mb-1">
                    Next Session
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {data.nextSessionType} • {nextSessionMinutes} min
                  </Text>
                </View>
              )}

              {/* Countdown - only show if not flow complete */}
              {!isFlowComplete && (
                <View className="items-center mb-6">
                  <Text className="text-text-secondary text-sm font-SoraSemiBold mb-2">
                    Auto-continuing in
                  </Text>
                  <Text className="text-text-primary text-3xl font-SoraBold">
                    {countdown}s
                  </Text>
                  <Text className="text-text-secondary text-xs mt-2 text-center">
                    Timer will start automatically in {countdown}s
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              <View className="gap-3">
                {!isFlowComplete ? (
                  // Ongoing flow actions
                  <>
                    <TouchableOpacity
                      onPress={handleContinue}
                      className="bg-blue-500 py-4 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-base font-SoraSemiBold">
                        Continue Flow
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handlePause}
                      className="bg-gray-100 dark:bg-gray-800 py-3 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-text-primary text-sm font-SoraSemiBold">
                        Take a Break
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleEnd}
                      className="py-3 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-red-500 text-sm font-SoraSemiBold">
                        End Flow
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Flow completion actions
                  <>
                    <TouchableOpacity
                      onPress={handleReflect}
                      className="bg-blue-500 py-4 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-base font-SoraSemiBold">
                        Reflect on Flow
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleViewInsights}
                      className="bg-gray-100 dark:bg-gray-800 py-3 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-text-primary text-sm font-SoraSemiBold">
                        View Insights
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleEnd}
                      className="py-3 rounded-xl items-center"
                      activeOpacity={0.8}
                    >
                      <Text className="text-text-secondary text-sm font-SoraSemiBold">
                        Done
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default FlowCompletionModal;
