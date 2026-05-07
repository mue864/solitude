import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { JournalMood, JournalSessionContext } from "@/store/journalStore";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MOODS: { value: JournalMood; emoji: string; label: string }[] = [
  { value: 1, emoji: "😩", label: "Drained" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🔥", label: "In zone" },
];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

interface AddJournalModalProps {
  isVisible: boolean;
  onAdd: (entry: {
    title: string;
    content: string;
    mood?: JournalMood;
    sessionContext?: JournalSessionContext;
  }) => void;
  onClose: () => void;
  sessionContext?: JournalSessionContext;
}

export default function AddJournalModal({
  isVisible,
  onAdd,
  onClose,
  sessionContext,
}: AddJournalModalProps) {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalMood | undefined>(undefined);

  const handleAdd = () => {
    if (title.trim() && content.trim()) {
      onAdd({
        title: title.trim(),
        content: content.trim(),
        mood,
        sessionContext,
      });
      setTitle("");
      setContent("");
      setMood(undefined);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setMood(undefined);
    onClose();
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      title="Reflect on your session"
    >
      {/* Session context chip */}
      {sessionContext && (
        <View
          style={[
            styles.contextChip,
            {
              backgroundColor: colors.accentMuted,
              borderColor: colors.accent + "40",
            },
          ]}
        >
          <Text style={[styles.contextText, { color: colors.accent }]}>
            {sessionContext.sessionType} ·{" "}
            {formatDuration(sessionContext.durationSeconds)}
            {sessionContext.tasksCompleted > 0
              ? ` · ${sessionContext.tasksCompleted} task${sessionContext.tasksCompleted === 1 ? "" : "s"} done`
              : ""}
          </Text>
        </View>
      )}

      {/* Mood picker */}
      <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>
        How are you feeling?
      </Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => (
          <TouchableOpacity
            key={m.value}
            onPress={() =>
              setMood((prev) => (prev === m.value ? undefined : m.value))
            }
            style={[
              styles.moodBtn,
              mood === m.value && {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accent,
              },
              mood !== m.value && {
                backgroundColor: colors.surfaceMuted,
                borderColor: "transparent",
              },
            ]}
            activeOpacity={0.75}
          >
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text
              style={[
                styles.moodBtnLabel,
                {
                  color:
                    mood === m.value ? colors.accent : colors.textSecondary,
                },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  contextChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  contextText: { fontSize: 12, fontFamily: "SoraSemiBold" },
  moodLabel: {
    fontSize: 13,
    fontFamily: "SoraSemiBold",
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  moodBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 2,
  },
  moodEmoji: { fontSize: 18 },
  moodBtnLabel: { fontSize: 9, fontFamily: "SoraSemiBold" },
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
