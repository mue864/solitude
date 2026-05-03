import { useTheme } from "@/context/ThemeContext";
import { Task, TaskTag, useTaskStore } from "@/store/taskStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TaskCard, { TAG_COLOR } from "./TaskCard";

interface TaskGroupProps {
  label: string;
  tag: TaskTag;
  tasks: Task[];
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onPlay: (task: Task) => void;
}

export default function TaskGroup({
  label,
  tag,
  tasks,
  onDelete,
  onEdit,
  onComplete,
  onPlay,
}: TaskGroupProps) {
  const { colors } = useTheme();
  const currentTaskId = useTaskStore((state) => state.currentTaskId);
  const dotColor = TAG_COLOR[tag ?? "default"];

  if (!tasks || tasks.length === 0) return null;

  return (
    <View style={s.group}>
      <View style={s.header}>
        <View style={[s.labelDot, { backgroundColor: dotColor }]} />
        <Text style={[s.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onComplete={onComplete}
          onPlay={onPlay}
          isActive={task.id === currentTaskId}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  group: { marginBottom: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  labelDot: { width: 6, height: 6, borderRadius: 3 },
  label: {
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
