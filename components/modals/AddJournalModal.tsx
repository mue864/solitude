import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddJournalModalProps {
  isVisible: boolean;
  onAdd: (entry: { title: string; content: string }) => void;
  onClose: () => void;
}

export default function AddJournalModal({
  isVisible,
  onAdd,
  onClose,
}: AddJournalModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (title.trim() && content.trim()) {
      onAdd({ title: title.trim(), content: content.trim() });
      setTitle("");
      setContent("");
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
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
            Reflect on your session
          </Text>
          <TextInput
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-3 text-base text-text-primary bg-gray-50 dark:bg-gray-800 font-SoraSemiBold"
            placeholder="Title..."
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            autoFocus
          />
          <TextInput
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 text-base text-text-primary bg-gray-50 dark:bg-gray-800 font-SoraSemiBold min-h-[80px]"
            placeholder="Write your thoughts, feelings, or what you accomplished..."
            placeholderTextColor="#94A3B8"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
          />
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
              className={`px-4 py-2 rounded-xl ${title.trim() && content.trim() ? "bg-blue-600" : "bg-blue-300"}`}
              onPress={handleAdd}
              disabled={!title.trim() || !content.trim()}
            >
              <Text className="text-white font-SoraSemiBold">Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
