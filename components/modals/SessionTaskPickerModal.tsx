import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useSessionStore } from "@/store/sessionState";
import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TAG_COLORS: Record<string, string> = {
  urgent: "#E05A5A",
  important: "#E8A43A",
  quickwin: "#4CAF7D",
  deepwork: "#5B8DEF",
};

function tagColor(tag: string | null | undefined): string {
  return tag ? (TAG_COLORS[tag] ?? "#8A8A96") : "#8A8A96";
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function SessionTaskPickerModal({ isVisible, onClose }: Props) {
  const { colors } = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const sessionTasks = useSessionStore((s) => s.sessionTasks);
  const addSessionTask = useSessionStore((s) => s.addSessionTask);
  const removeSessionTask = useSessionStore((s) => s.removeSessionTask);
  const sessionTaskTargets = useSessionStore((s) => s.sessionTaskTargets);
  const setSessionTaskTarget = useSessionStore((s) => s.setSessionTaskTarget);

  const TARGET_OPTIONS = [
    { label: "None", value: 0 },
    { label: "5m", value: 5 * 60 },
    { label: "10m", value: 10 * 60 },
    { label: "15m", value: 15 * 60 },
    { label: "20m", value: 20 * 60 },
    { label: "30m", value: 30 * 60 },
  ] as const;

  const activeTasks = tasks.filter((t) => !t.completed);
  const atLimit = sessionTasks.length >= 5;

  const handleToggle = (id: string) => {
    if (sessionTasks.includes(id)) {
      removeSessionTask(id);
    } else {
      addSessionTask(id);
    }
  };

  const s = makeStyles(colors);

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      <Text style={s.title}>Stage tasks</Text>
      <Text style={s.subtitle}>
        Pick up to 5 tasks to focus on this session
      </Text>

      {activeTasks.length === 0 ? (
        <View style={s.empty}>
          <Ionicons
            name="checkmark-done-outline"
            size={32}
            color={colors.textSecondary}
          />
          <Text style={s.emptyTitle}>No tasks yet</Text>
          <Text style={s.emptyBody}>
            Add tasks in the Plan tab first, then stage them here.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={s.list}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTasks.map((task) => {
            const selected = sessionTasks.includes(task.id);
            const disabled = !selected && atLimit;
            return (
              <View key={task.id} style={s.itemWrap}>
                <TouchableOpacity
                  onPress={() => handleToggle(task.id)}
                  disabled={disabled}
                  activeOpacity={0.75}
                  style={[
                    s.row,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceMuted,
                    },
                    selected && {
                      borderColor: colors.accent,
                      backgroundColor: colors.accentMuted,
                      ...(selected && {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        borderBottomWidth: 0,
                      }),
                    },
                    disabled && { opacity: 0.4 },
                  ]}
                >
                  <View
                    style={[s.dot, { backgroundColor: tagColor(task.tag) }]}
                  />
                  <Text
                    style={[
                      s.taskName,
                      {
                        color: selected
                          ? colors.textPrimary
                          : colors.textSecondary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {task.name}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.accent}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={20}
                      color={colors.border}
                    />
                  )}
                </TouchableOpacity>
                {selected && (
                  <View style={[s.targetRow, { borderColor: colors.border }]}>
                    <Text
                      style={[s.targetLabel, { color: colors.textSecondary }]}
                    >
                      Target
                    </Text>
                    {TARGET_OPTIONS.map((opt) => {
                      const active =
                        opt.value === 0
                          ? !sessionTaskTargets[task.id]
                          : sessionTaskTargets[task.id] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() =>
                            setSessionTaskTarget(task.id, opt.value)
                          }
                          style={[
                            s.targetChip,
                            {
                              backgroundColor: active
                                ? colors.accentMuted
                                : "transparent",
                              borderColor: active
                                ? colors.accent
                                : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.targetChipText,
                              {
                                color: active
                                  ? colors.accent
                                  : colors.textSecondary,
                              },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {atLimit && (
        <Text style={[s.limitHint, { color: colors.textSecondary }]}>
          5 task limit reached — remove one to add another
        </Text>
      )}

      <TouchableOpacity
        onPress={onClose}
        style={[s.doneBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.8}
      >
        <Text style={s.doneBtnText}>
          {sessionTasks.length === 0
            ? "Skip"
            : `Done  (${sessionTasks.length} staged)`}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    title: {
      fontSize: 18,
      fontFamily: "SoraBold",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      fontFamily: "Sora",
      color: colors.textSecondary,
      marginBottom: 16,
    },
    list: {
      maxHeight: 280,
    },
    listContent: {
      gap: 8,
      paddingBottom: 8,
    },
    itemWrap: {
      gap: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 13,
      gap: 10,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    taskName: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Sora",
    },
    taskRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    targetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      marginTop: -2,
    },
    targetLabel: {
      fontSize: 11,
      fontFamily: "SoraSemiBold",
      letterSpacing: 0.4,
      textTransform: "uppercase",
      marginRight: 2,
    },
    targetChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    targetChipText: {
      fontSize: 12,
      fontFamily: "SoraSemiBold",
    },
    empty: {
      alignItems: "center",
      paddingVertical: 28,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 15,
      fontFamily: "SoraSemiBold",
      color: colors.textPrimary,
    },
    emptyBody: {
      fontSize: 13,
      fontFamily: "Sora",
      color: colors.textSecondary,
      textAlign: "center",
    },
    limitHint: {
      fontSize: 12,
      fontFamily: "Sora",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 4,
    },
    doneBtn: {
      marginTop: 16,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    doneBtnText: {
      fontSize: 15,
      fontFamily: "SoraSemiBold",
      color: "#fff",
    },
  });
}
