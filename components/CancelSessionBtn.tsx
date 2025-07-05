import { useSessionStore } from "@/store/sessionState";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CancelSessionBtnProps {
  isRunning: boolean;
}

const CancelSessionBtn = ({ isRunning }: CancelSessionBtnProps) => {
  const { missSession, setSessionType, sessionType } = useSessionStore();

  const handleCancel = () => {
    if (!isRunning) return;

    // Mark the session as missed
    missSession();

    // Reset session state
    useSessionStore.setState({
      isRunning: false,
      isPaused: false,
      duration:
        sessionType === "Work"
          ? 25 * 60
          : sessionType === "Study"
            ? 50 * 60
            : 5 * 60,
    });

    // Reset to default session type
    setSessionType("Work");
  };

  const buttonStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isRunning ? 1 : 0, {
        damping: 15,
        stiffness: 120,
      }),
      transform: [
        {
          scale: withSpring(isRunning ? 1 : 0.9, {
            damping: 15,
            stiffness: 120,
          }),
        },
      ],
    };
  });

  return (
    <AnimatedTouchable
      style={[buttonStyle, { width: 80, height: 80 }]}
      className="rounded-full bg-red-500/10 border-2 border-red-500 items-center justify-center"
      activeOpacity={0.8}
      onPress={handleCancel}
    >
      <Text className="text-red-500 font-SoraBold text-sm text-center">
        Cancel
      </Text>
    </AnimatedTouchable>
  );
};

export default CancelSessionBtn;
