import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import React, { useState } from "react";
import {
  StyleSheet,
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
  const { colors } = useTheme();
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
    <BottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      title="Reflect on your session"
    >
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
            color: colors.textPrimary,
          },
        ]}
        placeholder="Title..."
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
        maxLength={60}
        autoFocus
      />
      <TextInput
        style={[
          styles.input,
          styles.textarea,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
            color: colors.textPrimary,
          },
        ]}
        placeholder="Write your thoughts, feelings, or what you accomplished..."
        placeholderTextColor={colors.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={500}
        textAlignVertical="top"
      />
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleClose}
          style={[
            styles.btn,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.btnText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAdd}
          disabled={!title.trim() || !content.trim()}
          style={[
            styles.btn,
            {
              backgroundColor: colors.accent,
              opacity: !title.trim() || !content.trim() ? 0.45 : 1,
            },
          ]}
        >
          <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: "Sora",
  },
  textarea: { minHeight: 96 },
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center" },
  btnText: { fontSize: 14, fontFamily: "SoraSemiBold" },
});
