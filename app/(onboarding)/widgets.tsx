import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import { Text, View } from "react-native";
import Widget from "@/assets/svg/onboarding/widgets.svg";
import Progress from "@/assets/svg/onboarding/progress2.svg";

export default function Widgets() {
  return (
    <View
      className="mt-10 flex-1 relative"
      style={{ backgroundColor: "transparent" }}
    >
      <View className="mx-8 mb-5">
        <Progress  />
      </View>
      <View className="flex-1 items-center justify-between ">
        <View className="flex">
          <Text className="text-white text-4xl font-SoraBold text-center">
            {Strings.widgetsHeading}
          </Text>
          <Text className="text-white text-xl font-SoraBold mt-4 leading-6 text-center">
            {Strings.widgetsSubHeading}
          </Text>
        </View>

        <View>
          <Widget />
        </View>

        <View className="justify-center items-center mx-4">
          <Text className="font-SoraSemiBold text-white text-lg text-center">
            {Strings.widgetsContent}
          </Text>
        </View>
        <View className="w-full mb-10">
          <Button
            buttonText={Strings.onboardingPage2Button}
            nextPage={() => router.push("/(onboarding)/personalization")}
          />
        </View>
      </View>
    </View>
  );
}
