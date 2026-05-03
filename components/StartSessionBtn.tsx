import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface StartSessionBtnProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const StartSessionBtn: React.FC<StartSessionBtnProps> = ({ onStart }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 12 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={() => {
          handlePressOut();
          onStart();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.btn,
          { backgroundColor: colors.accent, shadowColor: colors.accent },
        ]}
      >
        <Ionicons name="play" size={18} color="#fff" />
        <Text style={styles.label}>Start Session</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    width: "100%",
  },
  label: {
    color: "#fff",
    fontFamily: "SoraBold",
    fontSize: 16,
  },
});

export default StartSessionBtn;
