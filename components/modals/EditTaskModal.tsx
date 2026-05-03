import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { Task, TaskTag } from "@/store/taskStore";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditTaskModalProps {
  isVisible: boolean;
  task: Task | null;
  onSave: (task: { name: string; tag: TaskTag }) => void;
  onClose: () => void;
}

const TAGS: { label: string; value: TaskTag; color: string }[] = [
  { label: "Urgent", value: "urgent", color: "#E05A5A" },
  { label: "Important", value: "important", color: "#E8A43A" },
  { label: "Deep Work", value: "deepwork", color: "#5B8DEF" },
  { label: "Quick Win", value: "quickwin", color: "#4CAF7D" },
];

export default function EditTaskModal({
  isVisible,
  task,
  onSave,
  onClose,
}: EditTaskModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [tag, setTag] = useState<TaskTag>("urgent");

  useEffect(() => {
    if (task) {
      setName(task.name);
      setTag(task.tag ?? "urgent");
    }
  }, [task, isVisible]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), tag });
    }
  };

  const handleClose = () => {
    setName("");
    setTag("urgent");
    onClose();
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={handleClose} title="Edit task">
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
            color: colors.textPrimary,
          },
        ]}
        placeholder="Task name..."
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        autoFocus
        maxLength={60}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>Tag</Text>
      <View style={styles.tagRow}>
        {TAGS.map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => setTag(t.value)}
            style={[
              styles.tagChip,
              {
                backgroundColor:
                  tag === t.value ? t.color + "22" : colors.surfaceMuted,
                borderColor: tag === t.value ? t.color : colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: t.color }]} />
            <Text
              style={[
                styles.tagLabel,
                { color: tag === t.value ? t.color : colors.textSecondary },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
          onPress={handleSave}
          disabled={!name.trim()}
          style={[
            styles.btn,
            {
              backgroundColor: colors.accent,
              opacity: !name.trim() ? 0.45 : 1,
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
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "Sora",
  },
  label: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  tagLabel: { fontSize: 13, fontFamily: "SoraSemiBold" },
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center" },
  btnText: { fontSize: 14, fontFamily: "SoraSemiBold" },
});
