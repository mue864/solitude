import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useSessionStore } from "@/store/sessionState";

const StartSessionBtn = () => {
  const { isRunning, isPaused, pauseSession, resumeSession } = useSessionStore();

  const handlePress = () => {
    if (isRunning) {
      pauseSession();
    } else {
      resumeSession();
    }
  };

  const getButtonText = () => {
    if (isRunning) return 'Pause\nSession';
    if (isPaused) return 'Resume\nSession';
    return 'Start\nSession';
  };

  return (
    <TouchableOpacity 
      className={`rounded-full ${isRunning ? 'bg-red-500' : 'bg-onboarding-primary'} p-5`}
      onPress={handlePress}
    >
      <Text className="text-white font-SoraBold text-lg text-center">
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};

export default StartSessionBtn;
