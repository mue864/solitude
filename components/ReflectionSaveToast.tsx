import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReflectionSaveToast({
  text1,
}: {
  text1: string;
}) {
  return (
    <View className="flex-row items-center justify-between bg-green-500 rounded-2xl px-6 py-3 mt-2 mx-4 shadow-lg">
      <View className="flex-row items-center">
        <Ionicons name="checkmark" size={22} color="#fff" />
        <Text className="text-white font-SoraSemiBold ml-3">{text1} Saved</Text>
      </View>
    </View>
  );
}
