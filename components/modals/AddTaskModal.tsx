import { TaskTag } from "@/store/taskStore";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddTaskModalProps {
  isVisible: boolean;
  onAdd: (task: { name: string; tag: TaskTag }) => void;
  onClose: () => void;
}

const TAGS: { label: string; value: TaskTag; color: string }[] = [
  { label: "Urgent", value: "urgent", color: "bg-red-500" },
  { label: "Important", value: "important", color: "bg-amber-500" },
  { label: "Deep Work", value: "deepwork", color: "bg-blue-500" },
  { label: "Quick Win", value: "quickwin", color: "bg-green-500" },
];

export default function AddTaskModal({
  isVisible,
  onAdd,
  onClose,
}: AddTaskModalProps) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState<TaskTag>("urgent");

  const handleAdd = () => {
    if (name.trim()) {
      onAdd({ name: name.trim(), tag });
      setName("");
      setTag("urgent");
    }
  };

  const handleClose = () => {
    setName("");
    setTag("urgent");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/30 justify-center items-center"
        onPress={handleClose}
      >
        <Pressable
          className="w-11/12 max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-lg font-SoraSemiBold text-text-primary mb-4">
            Add Task
          </Text>
          <TextInput
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 text-base text-text-primary bg-gray-50 dark:bg-gray-800 font-SoraSemiBold"
            placeholder="Task name..."
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={60}
          />
          <View className="flex-row flex-wrap gap-2 mb-6">
            {TAGS.map((t) => (
              <TouchableOpacity
                key={t.value}
                className={`flex-row items-center px-3 py-1.5 rounded-full border ${tag === t.value ? t.color + " border-transparent" : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"}`}
                onPress={() => setTag(t.value)}
              >
                <View className={`w-2 h-2 rounded-full mr-2 ${t.color}`} />
                <Text
                  className={`text-xs font-SoraSemiBold ${tag === t.value ? "text-white" : "text-text-primary"}`}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row justify-end gap-3 mt-2">
            <TouchableOpacity
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800"
              onPress={handleClose}
            >
              <Text className="text-text-secondary font-SoraSemiBold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 rounded-xl ${name.trim() ? "bg-blue-600" : "bg-blue-300"} `}
              onPress={handleAdd}
              disabled={!name.trim()}
            >
              <Text className="text-white font-SoraSemiBold">Add</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
