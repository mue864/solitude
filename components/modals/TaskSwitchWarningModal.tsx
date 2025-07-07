import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface TaskSwitchWarningModalProps {
  isVisible: boolean;
  currentTaskName: string;
  newTaskName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TaskSwitchWarningModal({
  isVisible,
  currentTaskName,
  newTaskName,
  onConfirm,
  onCancel,
}: TaskSwitchWarningModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={onCancel}
      >
        <Pressable
          className="w-11/12 max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center mb-4">
            <View className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mb-3">
              <Text className="text-amber-600 dark:text-amber-400 text-2xl">
                ⚠️
              </Text>
            </View>
            <Text className="text-lg font-SoraSemiBold text-text-primary text-center">
              Task in Progress
            </Text>
          </View>

          <Text className="text-text-secondary text-center mb-6 leading-6">
            You're currently working on{" "}
            <Text className="font-SoraSemiBold text-text-primary">
              "{currentTaskName}"
            </Text>
            .{"\n\n"}
            Starting{" "}
            <Text className="font-SoraSemiBold text-text-primary">
              "{newTaskName}"
            </Text>{" "}
            will end your current session.
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800"
              onPress={onCancel}
            >
              <Text className="text-text-secondary font-SoraSemiBold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600"
              onPress={onConfirm}
            >
              <Text className="text-white font-SoraSemiBold text-center">
                Switch Tasks
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
