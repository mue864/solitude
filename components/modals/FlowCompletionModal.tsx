import { useSessionStore } from "@/store/sessionState";
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
}

const FlowCompletionModal = ({
  isVisible,
  onClose,
  data,
}: FlowCompletionModalProps) => {
  const { continueFlow, pauseFlow, endFlow } = useSessionStore();
  const [countdown, setCountdown] = useState(8);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

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

      // Start countdown only if not flow complete
      const isFlowComplete = data.nextSessionType === "Flow Complete";
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

  const progressPercentage = Math.round(
    (data.completedSessions / data.totalSessions) * 100
  );
  const nextSessionMinutes = Math.floor(data.nextSessionDuration / 60);
  const isFlowComplete = data.nextSessionType === "Flow Complete";

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
            className="w-[90%] max-w-md bg-tab-bg rounded-2xl shadow-xl overflow-hidden"
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
                <Text className="text-text-secondary text-base font-SoraSemiBold text-center mt-1">
                  {data.completedSessions} of {data.totalSessions} sessions done
                </Text>
              </View>

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
                <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                  <Animated.View
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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
                            : "bg-gray-300"
                        }`}
                      >
                        {index < data.completedSessions ? (
                          <Text className="text-white text-xs font-SoraBold">
                            ✓
                          </Text>
                        ) : (
                          <Text className="text-gray-500 text-xs font-SoraBold">
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

              {/* Next session info */}
              <View className="bg-primary/20 rounded-xl p-4 mb-6">
                <Text className="text-text-primary text-base font-SoraSemiBold mb-1">
                  {isFlowComplete ? "Flow Status" : "Next Session"}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {isFlowComplete
                    ? "Flow Complete! 🎉"
                    : `${data.nextSessionType} • ${nextSessionMinutes} min`}
                </Text>
              </View>

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
                      className="bg-gray-100 py-3 rounded-xl items-center"
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
                  <TouchableOpacity
                    onPress={handleEnd}
                    className="bg-blue-500 py-4 rounded-xl items-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-base font-SoraSemiBold">
                      Done
                    </Text>
                  </TouchableOpacity>
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
