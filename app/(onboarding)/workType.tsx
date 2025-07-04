import Progress from "@/assets/svg/onboarding/progress4.svg";
import Button from "@/components/Button";
import { Strings } from "@/constants";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type WorkTypeOption = "screen" | "reading" | "writing" | "creative" | "other";

export default function WorkType() {
  const [selectedType, setSelectedType] = useState<WorkTypeOption | null>(null);

  const workTypes = [
    { id: "screen", label: Strings.workType1 },
    { id: "reading", label: Strings.workType2 },
    { id: "writing", label: Strings.workType3 },
    { id: "creative", label: Strings.workType4 },
    { id: "other", label: Strings.workTypeOther },
  ] as const;

  return (
    <View className="flex-1 pt-10">
      <View className="mx-8 mb-5">
        <Progress />
      </View>

      <Text className="text-white text-4xl font-SoraBold text-center mb-10 leading-11">
        {Strings.workTypeHeading}
      </Text>
      <View></View>
      <View className="flex-1 w-full">
        {workTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            className={`flex-row items-center bg-white rounded-xl p-6 mb-3 border border-white/50 mx-10 ${
              selectedType === type.id ? "border-2 border-white" : ""
            }`}
            onPress={() => setSelectedType(type.id as WorkTypeOption)}
          >
            <View className="h-5 w-5 rounded-full border-2 border-blue-500 items-center justify-center mr-3">
              {selectedType === type.id && (
                <View className="h-3 w-3 rounded-full bg-blue-500" />
              )}
            </View>
            <Text className="text-base text-gray-800 font-Sora">
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="w-full mb-10">
        <Button
          buttonText={Strings.onboardingPage2Button}
          nextPage={() => router.push("/(onboarding)/notifications")}
          positioning={!selectedType ? "opacity-70" : ""}
          disabled={!selectedType}
        />
      </View>
    </View>
  );
}
