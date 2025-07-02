import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import { Text, View } from "react-native";
import Progress from "@/assets/svg/onboarding/progress5.svg";
import Lottieview from "lottie-react-native";

export default function CompleteSetup() {
  return (
    <View
      className="mt-10 flex-1 relative"
      style={{ backgroundColor: "transparent" }}
    >
      <View className="items-center mb-8">
        <Progress />
      </View>
      <View className="flex-1 items-center justify-between ">
        <View className="flex">
          <Text className="text-white text-4xl font-SoraBold text-center">
            {Strings.completeSetupHeading}
          </Text>
        </View>

        <View>
          <Lottieview
            source={require("@/assets/lottie/checkmark.json")}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>

        <View className="justify-center items-center mx-4">
          <Text className="font-SoraSemiBold text-white text-lg text-center ">
            {Strings.completeSetupContent}
          </Text>
        </View>
        <View className="w-full mb-10">
          <Button
            buttonText={Strings.completeSetupBtn}
            nextPage={() => router.push("/(onboarding)/workType")}
          />
        </View>
      </View>
    </View>
  );
}
