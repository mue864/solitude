import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
export default function PlantGrow() {
  return (
    <View
      className="mt-10 flex-1 relative"
      style={{ backgroundColor: "transparent" }}
    >
      <View className="flex-1 items-center justify-between ">
        <View className="">
          <Text className="text-white text-4xl font-SoraBold">
            {Strings.welcomeHeading}
          </Text>
          <Text className="text-white text-4xl font-SoraBold text-center">
            {Strings.appName}
          </Text>
        </View>

        <LottieView
          source={require("@/assets/lottie/plant.json")}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
        />

        <View className="justify-center items-center mx-4">
          <Text className="font-SoraSemiBold text-white text-lg text-center leading-6">
            {Strings.welcomeContent}
          </Text>
        </View>
        <View className="w-full mb-10">
          <Button
            buttonText={Strings.onboadingPage1Button}
            nextPage={() => router.push("/(onboarding)/pomodoro")}
          />
        </View>
      </View>
    </View>
  );
}
