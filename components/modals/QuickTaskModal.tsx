import { useTheme } from "@/context/ThemeContext";
import { useSessionStore } from "@/store/sessionState";
import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TAGS: {
  key: "urgent" | "important" | "quickwin" | "deepwork";
  color: string;
  label: string;
}[] = [
  { key: "urgent", color: "#E05A5A", label: "Urgent" },
  { key: "important", color: "#E8A43A", label: "Important" },
  { key: "quickwin", color: "#4CAF7D", label: "Quick win" },
  { key: "deepwork", color: "#5B8DEF", label: "Deep work" },
];

function tagColor(key: string | null | undefined): string {
  switch (key) {
    case "urgent":
      return "#E05A5A";
    case "important":
      return "#E8A43A";
    case "quickwin":
      return "#4CAF7D";
    case "deepwork":
      return "#5B8DEF";
    default:
      return "#8A8A96";
  }
}

const QuickTaskModal = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const setCurrentTask = useTaskStore((s) => s.setCurrentTask);
  const addTask = useTaskStore((s) => s.addTask);
  const currentFlow = useSessionStore((s) => s.currentFlowId);

  const [showInput, setShowInput] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [selectedTag, setSelectedTag] = useState<
    "urgent" | "important" | "quickwin" | "deepwork" | null
  >(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      // If no tasks exist, show input form directly
      // If tasks exist, show task list
      setShowInput(tasks.length === 0);
      setTaskName("");
      setSelectedTag(null);
    }
  }, [isVisible, tasks.length]);

  const handleAddTask = () => {
    if (!taskName.trim()) return;
    const id = Date.now().toString();
    const newTask = {
      id,
      name: taskName.trim(),
      tag: selectedTag,
      completed: false,
    };
    addTask(newTask);

    // If there's an active Flow, show confirmation dialog
    if (currentFlow) {
      setPendingTaskId(id);
      setShowConfirmation(true);
      setTaskName("");
      setSelectedTag(null);
      setShowInput(false);
    } else {
      // No Flow active, assign task directly
      setCurrentTask(id);
      setTaskName("");
      setSelectedTag(null);
      setShowInput(false);
      onClose();
    }
  };

  const handleAssignTask = (id: string) => {
    // If there's an active Flow, show confirmation dialog
    if (currentFlow) {
      setPendingTaskId(id);
      setShowConfirmation(true);
    } else {
      // No Flow active, assign task directly
      setCurrentTask(id);
      onClose();
    }
  };

  const handleConfirmTaskSwitch = () => {
    if (pendingTaskId) {
      setCurrentTask(pendingTaskId);
      setPendingTaskId(null);
      setShowConfirmation(false);
      onClose();
    }
  };

  const handleCancelTaskSwitch = () => {
    setPendingTaskId(null);
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setTaskName("");
    setSelectedTag(null);
    setShowInput(false);
    onClose();
  };

  const s = makeStyles(colors);

  return (
    <>
      {/* ── Main modal ─────────────────────────────────────────── */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
            onPress={onClose}
          />
          <View style={s.sheet}>
            <Text style={s.title}>
              {showInput ? "New task" : "Pick a task"}
            </Text>

            {showInput ? (
              <>
                <Text style={s.subtitle}>What do you want to focus on?</Text>
                <TextInput
                  style={s.input}
                  placeholder="Task name…"
                  placeholderTextColor={colors.textSecondary}
                  value={taskName}
                  onChangeText={setTaskName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddTask}
                />
                <Text style={s.sectionLabel}>Tag</Text>
                <View style={s.tagRow}>
                  {TAGS.map((tag) => {
                    const sel = selectedTag === tag.key;
                    return (
                      <TouchableOpacity
                        key={tag.key}
                        style={[
                          s.tagChip,
                          {
                            backgroundColor: sel
                              ? tag.color + "22"
                              : colors.surfaceMuted,
                            borderColor: sel ? tag.color : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedTag(sel ? null : tag.key)}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[s.tagDot, { backgroundColor: tag.color }]}
                        />
                        <Text
                          style={[
                            s.tagLabel,
                            { color: sel ? tag.color : colors.textSecondary },
                          ]}
                        >
                          {tag.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity
                  style={[s.primaryBtn, !taskName.trim() && { opacity: 0.45 }]}
                  onPress={handleAddTask}
                  activeOpacity={0.8}
                  disabled={!taskName.trim()}
                >
                  <Text style={s.primaryBtnText}>Start with task</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.ghostBtn}
                  onPress={handleCancel}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[s.ghostBtnText, { color: colors.textSecondary }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {tasks.length === 0 ? (
                  <View style={s.emptyState}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={36}
                      color={colors.textSecondary}
                      style={{ marginBottom: 10, opacity: 0.5 }}
                    />
                    <Text
                      style={[s.emptyText, { color: colors.textSecondary }]}
                    >
                      No tasks yet. Add one below.
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    style={{ maxHeight: 260, marginBottom: 12 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={{ gap: 8 }}>
                      {tasks.map((task) => (
                        <View
                          key={task.id}
                          style={[s.taskRow, { borderColor: colors.border }]}
                        >
                          <View
                            style={[
                              s.taskDot,
                              { backgroundColor: tagColor(task.tag) },
                            ]}
                          />
                          <Text
                            style={[
                              s.taskName,
                              { color: colors.textPrimary },
                              task.completed && s.taskNameDone,
                            ]}
                            numberOfLines={1}
                          >
                            {task.name}
                          </Text>
                          <TouchableOpacity
                            style={[
                              s.assignBtn,
                              { backgroundColor: colors.accentMuted },
                            ]}
                            onPress={() => handleAssignTask(task.id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name="play"
                              size={14}
                              color={colors.accent}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
                <TouchableOpacity
                  style={s.primaryBtn}
                  onPress={() => setShowInput(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color={colors.background} />
                  <Text style={s.primaryBtnText}>Add new task</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.ghostBtn}
                  onPress={onClose}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[s.ghostBtnText, { color: colors.textSecondary }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Flow switch confirmation ────────────────────────────── */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleCancelTaskSwitch}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View style={s.confirmSheet}>
            <View
              style={[s.confirmIcon, { backgroundColor: colors.accentMuted }]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={24}
                color={colors.accent}
              />
            </View>
            <Text style={[s.confirmTitle, { color: colors.textPrimary }]}>
              Switch task?
            </Text>
            <Text style={[s.confirmBody, { color: colors.textSecondary }]}>
              You&apos;re in a Flow. Switching task will change your focus but
              keep the Flow active.
            </Text>
            {pendingTaskId && (
              <View
                style={[
                  s.confirmCard,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[s.confirmCardLabel, { color: colors.textSecondary }]}
                >
                  New focus
                </Text>
                <Text
                  style={[s.confirmCardValue, { color: colors.textPrimary }]}
                >
                  {tasks.find((t) => t.id === pendingTaskId)?.name}
                </Text>
              </View>
            )}
            <View style={s.confirmBtnRow}>
              <TouchableOpacity
                style={[
                  s.confirmSecondary,
                  { backgroundColor: colors.surfaceMuted },
                ]}
                onPress={handleCancelTaskSwitch}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.confirmSecondaryText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Keep current
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmPrimary, { backgroundColor: colors.accent }]}
                onPress={handleConfirmTaskSwitch}
                activeOpacity={0.8}
              >
                <Text
                  style={[s.confirmPrimaryText, { color: colors.background }]}
                >
                  Switch
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default QuickTaskModal;

// ---------------------------------------------------------------------------
// Styles factory
// ---------------------------------------------------------------------------
function makeStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 36,
    },
    title: {
      fontSize: 18,
      fontFamily: "SoraBold",
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: "Sora",
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    input: {
      backgroundColor: colors.surfaceMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      fontFamily: "Sora",
      color: colors.textPrimary,
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontFamily: "SoraSemiBold",
      color: colors.textSecondary,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
    },
    tagChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      gap: 6,
    },
    tagDot: { width: 7, height: 7, borderRadius: 4 },
    tagLabel: { fontSize: 13, fontFamily: "SoraSemiBold" },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      marginBottom: 10,
      marginTop: 4,
    },
    primaryBtnText: {
      fontSize: 15,
      fontFamily: "SoraSemiBold",
      color: colors.background,
    },
    ghostBtn: { borderRadius: 14, paddingVertical: 13, alignItems: "center" },
    ghostBtnText: { fontSize: 14, fontFamily: "Sora" },
    emptyState: { alignItems: "center", paddingVertical: 32 },
    emptyText: { fontSize: 14, fontFamily: "Sora", textAlign: "center" },
    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    taskDot: { width: 8, height: 8, borderRadius: 4 },
    taskName: { flex: 1, fontSize: 14, fontFamily: "SoraSemiBold" },
    taskNameDone: { textDecorationLine: "line-through", opacity: 0.45 },
    assignBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    // Confirmation sheet
    confirmSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 40,
      alignItems: "center",
    },
    confirmIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    confirmTitle: {
      fontSize: 18,
      fontFamily: "SoraBold",
      marginBottom: 8,
      textAlign: "center",
    },
    confirmBody: {
      fontSize: 13,
      fontFamily: "Sora",
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 20,
    },
    confirmCard: {
      width: "100%",
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
      marginBottom: 24,
    },
    confirmCardLabel: { fontSize: 12, fontFamily: "Sora", marginBottom: 4 },
    confirmCardValue: { fontSize: 15, fontFamily: "SoraSemiBold" },
    confirmBtnRow: { flexDirection: "row", gap: 12, width: "100%" },
    confirmSecondary: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    confirmSecondaryText: { fontSize: 14, fontFamily: "SoraSemiBold" },
    confirmPrimary: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    confirmPrimaryText: { fontSize: 14, fontFamily: "SoraBold" },
  });
}
