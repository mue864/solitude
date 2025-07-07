import { Task, TaskTag } from "@/store/taskStore";
import React from "react";
import { Text, View } from "react-native";
import TaskCard from "./TaskCard";

interface TaskGroupProps {
  label: string;
  tag: TaskTag;
  tasks: Task[];
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onPlay: (task: Task) => void;
}

const labelColor: Record<Exclude<TaskTag, null> | "default", string> = {
  urgent: "text-red-500",
  important: "text-amber-500",
  quickwin: "text-green-500",
  deepwork: "text-blue-500",
  default: "text-gray-400",
};

export default function TaskGroup({
  label,
  tag,
  tasks,
  onDelete,
  onEdit,
  onComplete,
  onPlay,
}: TaskGroupProps) {
  if (!tasks || tasks.length === 0) return null;
  return (
    <View className="mb-2">
      <Text
        className={`text-base font-SoraSemiBold mb-2 ${labelColor[tag ?? "default"]}`}
      >
        {label}
      </Text>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onComplete={onComplete}
          onPlay={onPlay}
        />
      ))}
    </View>
  );
}
