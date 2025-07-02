import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import { Text, View } from "react-native";
import Book from "@/assets/svg/onboarding/book.svg";
import Progress from "@/assets/svg/onboarding/progress3.svg";

export default function Personalization() {
  return (
    <View
      className="mt-10 flex-1 relative"
      style={{ backgroundColor: "transparent" }}
    >
      <View className="mx-8 mb-5">
        <Progress />
      </View>
      <View className="flex-1 items-center justify-between ">
        <View className="flex">
          <Text className="text-white text-4xl font-SoraBold text-center">
            {Strings.personalizationHeading}
          </Text>
          <Text className="text-white text-xl leading-6 font-SoraSemiBold text-center mt-4">
            {Strings.personalizationSubHeading}
          </Text>
        </View>

        <View>
          <Book />
        </View>

        <View className="justify-center items-center mx-4">
         
        </View>
        <View className="w-full mb-10">
          <View>
            <Button
              buttonText={Strings.personalizationBtn1}
              nextPage={() => router.push("/(onboarding)/workType")}
            />
          </View>
          <View className="mt-3">
            <Button
              buttonText={Strings.personalizationBtn2}
              nextPage={() => router.push("/(onboarding)/notifications")}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
