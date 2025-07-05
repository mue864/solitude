import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { SESSION_TYPES, SessionType, useSessionStore } from "@/store/sessionState";
import {
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChangeSessionTimeCardProps {
  isVisible: boolean;
  onClose: () => void;
  sessionType: SessionType;
}

const ChangeSessionTimeCard = ({
  isVisible,
  onClose,
  sessionType,
}: ChangeSessionTimeCardProps) => {
  const setDuration = useSessionStore((state) => state.setDuration);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("00");

  useEffect(() => {
    if (isVisible) {
      // Get duration in minutes from SESSION_TYPES (which is in seconds)
      const durationInMinutes = Math.floor(SESSION_TYPES[sessionType] / 60);
      const mins = Math.floor(durationInMinutes);
      const secs = durationInMinutes % 60;
      setMinutes(mins.toString());
      setSeconds(secs.toString().padStart(2, "0"));
    }
  }, [isVisible, sessionType]);

  const handleSave = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    if (!isNaN(totalSeconds) && totalSeconds > 0) {
      setDuration(totalSeconds);
      onClose();
    }
  };

  const formatTimeInput = (text: string, max: number) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, "");

    // Limit to 2 digits
    if (numericValue.length > 2) return;

    // Ensure the value doesn't exceed max
    if (parseInt(numericValue) > max) return max.toString();

    return numericValue;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <BlurView
          intensity={20}
          className="w-full h-full justify-center items-center"
        >
          <View className="w-[85%] bg-tab-bg rounded-2xl p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-text-primary text-xl font-SoraBold">
                Set {sessionType} Time
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center mb-8">
              <View className="items-center">
                <TextInput
                  className={`w-20 h-20 bg-text-primary rounded-xl text-white text-4xl font-SoraBold text-center ${
                    Platform.OS === "ios" ? "py-4" : ""
                  }`}
                  value={minutes}
                  onChangeText={(text) => {
                    const formatted = formatTimeInput(text, 99);
                    if (formatted !== undefined) setMinutes(formatted);
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="25"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-text-secondary text-sm mt-2 font-Sora">
                  Minutes
                </Text>
              </View>

              <Text className="text-text-primary text-4xl font-SoraBold mx-2 mb-8">
                :
              </Text>

              <View className="items-center">
                <TextInput
                  className={`w-20 h-20 bg-text-primary rounded-xl text-white text-4xl font-SoraBold text-center ${
                    Platform.OS === "ios" ? "py-4" : ""
                  }`}
                  value={seconds}
                  onChangeText={(text) => {
                    const formatted = formatTimeInput(text, 59);
                    if (formatted !== undefined) setSeconds(formatted);
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-text-secondary text-sm mt-2 font-Sora">
                  Seconds
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-onboarding-primary rounded-xl py-4 items-center"
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-SoraSemiBold">
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default ChangeSessionTimeCard;
