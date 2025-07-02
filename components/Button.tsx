import { Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const Button = ({
  buttonText,
  positioning,
  nextPage,
  disabled,
}: {
  buttonText: string;
  positioning?: string;
  nextPage: () => void;
  disabled?: boolean;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 8 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        className={`bg-white mx-10 h-16 justify-center rounded-sm shadow shadow-black ${positioning} `}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          handlePressOut();
          nextPage();
        }}
        disabled={disabled}
      >
        <Text className="font-SoraBold text-xl text-center text-onboarding-primary">
          {buttonText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button;
