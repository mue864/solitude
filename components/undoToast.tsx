import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UndoToast({
  text1,
  onPress,
}: {
  text1: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between bg-red-500 rounded-2xl px-6 py-3 mt-2 mx-4 shadow-lg">
      <View className="flex-row items-center">
        <Ionicons name="trash" size={22} color="#fff" />
        <Text className="text-white font-SoraSemiBold ml-3">{text1}</Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        className="ml-6 px-3 py-1 rounded-lg bg-white/20"
      >
        <Text className="text-white font-SoraSemiBold">Undo</Text>
      </TouchableOpacity>
    </View>
  );
}
