import { useSessionStore } from "@/store/sessionState";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Add from "@/assets/svg/Add_ring_white.svg";

type ChangeSessionTimeCardProps = {
  isVisible: boolean;
  onClose: () => void;
  sessionType: "Work" | "Study" | "Break";
};

const QuickTaskModal = ({
  isVisible,
  onClose,
  sessionType,
}: ChangeSessionTimeCardProps) => {
  const duration = useSessionStore((state) => state.duration);
  const setDuration = useSessionStore((state) => state.setDuration);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("00");


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
          <View className="w-[85%] bg-tab-bg h-[50%] rounded-2xl shadow-xl overflow-hidden">
            <View className="flex-1 justify-between p-6">
              <View className="flex-row justify-between items-start">
                <Text className="text-text-primary font-SoraBold text-center flex-1 pr-2">
                  Pick from your plan or add something new
                </Text>
                <TouchableOpacity 
                  onPress={onClose} 
                  className="absolute -right-6 -top-4 p-4"
                  hitSlop={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Temp text */}

              <View className="items-center">
                <Text className="text-text-primary font-Sora text-center">
                  Looks like your list is empty.
                </Text>
                <Text className="text-text-primary font-Sora text-center">
                  What&apos;s on your mind?
                </Text>
              </View>

              <TouchableOpacity
                className="bg-onboarding-primary rounded-xl py-4 items-center flex-row gap-2 justify-center"
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <Add />
                <Text className="text-white text-base font-SoraSemiBold">
                  Add New Task
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default QuickTaskModal;
