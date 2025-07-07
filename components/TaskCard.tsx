import { Task, TaskTag } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface TaskCardProps {
  task: Task;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onPlay: (task: Task) => void;
  disabled?: boolean;
}

const tagColor: Record<Exclude<TaskTag, null> | "default", string> = {
  urgent: "#EF4444", // red
  important: "#F59E42", // orange
  quickwin: "#22C55E", // green
  deepwork: "#2563EB", // blue
  default: "#E5E7EB", // gray
};

export default function TaskCard({
  task,
  onDelete,
  onEdit,
  onComplete,
  onPlay,
  disabled,
}: TaskCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  // Render left (delete) action - iPhone Messages style
  const renderLeftActions = (
    progress: Animated.AnimatedAddition,
    dragX: Animated.AnimatedAddition
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1],
      extrapolate: "clamp",
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });

    return (
      <View
        className="flex-row items-center justify-start"
        style={{ width: 100 }}
      >
        <Animated.View
          style={{
            transform: [{ translateX: trans }, { scale }],
            width: 80,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#EF4444",
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            marginRight: 4,
          }}
        >
          <TouchableOpacity
            className="flex-1 items-center justify-center w-full"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              onDelete(task);
              swipeableRef.current?.close();
            }}
            accessibilityLabel="Delete task"
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text className="text-white text-xs font-SoraSemiBold mt-1">
              Delete
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Render right (edit) action - iPhone Messages style
  const renderRightActions = (
    progress: Animated.AnimatedAddition,
    dragX: Animated.AnimatedAddition
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-101, -100, -50, 0],
      outputRange: [-1, 0, 0, 20],
      extrapolate: "clamp",
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });

    return (
      <View
        className="flex-row items-center justify-end"
        style={{ width: 100 }}
      >
        <Animated.View
          style={{
            transform: [{ translateX: trans }, { scale }],
            width: 80,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#2563EB",
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            marginLeft: 4,
          }}
        >
          <TouchableOpacity
            className="flex-1 items-center justify-center w-full"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onEdit(task);
              swipeableRef.current?.close();
            }}
            accessibilityLabel="Edit task"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text className="text-white text-xs font-SoraSemiBold mt-1">
              Edit
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View className="mb-4">
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={40}
        rightThreshold={40}
        friction={2}
        enableTrackpadTwoFingerGesture
        containerStyle={{
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <View
          className={`flex-row items-center bg-white dark:bg-gray-800 rounded-2xl py-5 px-4 shadow-sm ${task.completed ? "opacity-60" : ""}`}
          style={{
            borderRightColor: tagColor[task.tag ?? "default"],
            borderRightWidth: 6,
            minHeight: 72,
          }}
        >
          <TouchableOpacity
            className="mr-3"
            onPress={() => onComplete(task)}
            disabled={task.completed}
            accessibilityLabel={
              task.completed ? "Task completed" : "Mark as complete"
            }
          >
            {task.completed ? (
              <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
            ) : (
              <Ionicons name="ellipse-outline" size={28} color="#CBD5E1" />
            )}
          </TouchableOpacity>
          <Text
            className={`flex-1 text-lg font-SoraSemiBold text-text-primary ${task.completed ? "line-through text-gray-400" : ""}`}
            numberOfLines={1}
          >
            {task.name}
          </Text>
          <TouchableOpacity
            className="ml-3 p-2 rounded-full"
            onPress={() => onPlay(task)}
            disabled={task.completed || disabled}
            accessibilityLabel="Focus on task"
          >
            <Ionicons
              name="play"
              size={24}
              color={
                task.completed || disabled
                  ? "#CBD5E1"
                  : tagColor[task.tag ?? "default"]
              }
            />
          </TouchableOpacity>
        </View>
      </Swipeable>
    </View>
  );
}
