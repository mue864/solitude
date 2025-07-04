import React from "react";
import { Text, TouchableOpacity } from "react-native";

const StartSessionBtn = () => {
  return (
    <TouchableOpacity className="rounded-full bg-onboarding-primary p-5">
      <Text className="text-white font-SoraBold text-lg text-center">
        Start {"\n"} Session
      </Text>
    </TouchableOpacity>
  );
};

export default StartSessionBtn;
