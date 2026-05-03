import { useTheme } from "@/context/ThemeContext";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const Button = ({
  buttonText,
  nextPage,
  disabled,
  variant = "primary",
}: {
  buttonText: string;
  nextPage: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const bg = variant === "ghost" ? "transparent" : colors.accent;
  const border =
    variant === "ghost" ? { borderWidth: 1, borderColor: colors.border } : {};
  const textColor = variant === "ghost" ? colors.textSecondary : "#FFFFFF";

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          {
            backgroundColor: disabled ? bg + "80" : bg,
            marginHorizontal: 40,
            height: 56,
            justifyContent: "center",
            borderRadius: 16,
          },
          border,
        ]}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          handlePressOut();
          nextPage();
        }}
        disabled={disabled}
      >
        <Text
          style={{
            color: textColor,
            fontFamily: "SoraBold",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;
