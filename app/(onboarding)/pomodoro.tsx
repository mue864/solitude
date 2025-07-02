import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import { Text, View } from "react-native";
import Clock from "@/assets/svg/onboarding/clock.svg";
import Progress from "@/assets/svg/onboarding/progress1.svg";

export default function Pomodoro() {


  return (
    <View
      className="mt-10 flex-1 relative"
      style={{ backgroundColor: "transparent" }}
    >
    <View className="mx-8 mb-5">
        <Progress width={60} />
    </View>
      <View className="flex-1 items-center justify-between ">
        <View className="flex">
          <Text className="text-white text-4xl font-SoraBold text-center">{Strings.onboardingPage2Title}</Text>

        </View>

        <View>
            <Clock />
        </View>

        <View className="justify-center items-center mx-4">
          <Text className="font-SoraSemiBold text-white text-lg text-center">
            {Strings.onboardingPage2}
          </Text>
        </View>
        <View className="w-full mb-10">
          <Button
            buttonText={Strings.onboardingPage2Button}
            nextPage={() => router.push("/(onboarding)/widgets")}
          />
        </View>
      </View>
    </View>
  );
}
