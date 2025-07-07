import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface WarningToastProps {
  text1: string;
  text2?: string;
  onPress?: () => void;
}

export default function WarningToast({
  text1,
  text2,
  onPress,
}: WarningToastProps) {
  return (
    <View className="flex-row items-center justify-between bg-amber-500 rounded-2xl px-6 py-3 mt-2 mx-4 shadow-lg">
      <View className="flex-row items-center">
        <Ionicons name="warning" size={22} color="#fff" />
        <Text className="text-white font-SoraSemiBold ml-3">{text1}</Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        className="ml-6 px-3 py-1 rounded-lg bg-white/20"
      >
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
