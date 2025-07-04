import AppIcon from "@/assets/svg/onboarding/app-icon.svg";
import { Strings } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import "../global.css";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function Index() {
  const isOnboardingComplete = useOnboardingStore((state) => state.isOnboardingFinished)
  const [animationLoaded, setAnimationLoaded] = useState(false);

  const iconSlideUp = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const animatedIcon = useAnimatedStyle(() => ({
    transform: [{ translateY: iconSlideUp.value }],
  }));

  const animatedText = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    const timeout = setTimeout(() => {
      iconSlideUp.value = withTiming(-15, { duration: 1000 }, (finished) => {
        if (finished) {
          textOpacity.value = withTiming(1, { duration: 1000 }, (finished2) => {
            if (finished2) {
              runOnJS(setAnimationLoaded)(true);
            }
          });
        }
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // must change on condition
  useEffect(() => {
    if (animationLoaded) {
      if (isOnboardingComplete) {
        const switchPage = setTimeout(() => {
          router.replace("/(main)/focus");
        }, 500);
        return () => clearTimeout(switchPage);
      } else {
        const switchPage = setTimeout(() => {
          router.replace("/(onboarding)/welcome");
        }, 500);
         return () => clearTimeout(switchPage);
      }
     
    }
  }, [animationLoaded, isOnboardingComplete]);

  return (
    <LinearGradient
      colors={["#2764A1", "#2A77C4", "#318CE7"]}
      className="flex-1 justify-center items-center relative"
    >
      <Animated.View style={animatedIcon}>
        <AppIcon width={150} height={150} />
      </Animated.View>

      <Animated.View style={animatedText}>
        <Text className="text-white text-3xl font-Courgete">
          {Strings.appName}
        </Text>
      </Animated.View>

      <View className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Text className="text-white text-2xl font-Sora">
          {Strings.companyName}
        </Text>
      </View>
    </LinearGradient>
  );
}
