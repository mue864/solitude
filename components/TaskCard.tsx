import { useTheme } from "@/context/ThemeContext";
import { Task, TaskTag } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface TaskCardProps {
  task: Task;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onPlay: (task: Task) => void;
  disabled?: boolean;
  isActive?: boolean;
}

export const TAG_COLOR: Record<Exclude<TaskTag, null> | "default", string> = {
  urgent: "#E05A5A",
  important: "#E8A43A",
  deepwork: "#5B8DEF",
  quickwin: "#4CAF7D",
  default: "#8A8A96",
};

export default function TaskCard({
  task,
  onDelete,
  onEdit,
  onComplete,
  onPlay,
  disabled,
  isActive,
}: TaskCardProps) {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const dotColor = TAG_COLOR[task.tag ?? "default"];

  const renderLeftActions = (
    progress: Animated.Value,
    dragX: Animated.Value,
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
      <View style={{ width: 80, justifyContent: "center" }}>
        <Animated.View
          style={[
            s.swipeAction,
            {
              transform: [{ translateX: trans }, { scale }],
              backgroundColor: colors.destructive,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
            },
          ]}
        >
          <TouchableOpacity
            style={s.swipeBtn}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              onDelete(task);
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={s.swipeLabelWhite}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (
    progress: Animated.Value,
    dragX: Animated.Value,
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
        style={{ width: 80, justifyContent: "center", alignItems: "flex-end" }}
      >
        <Animated.View
          style={[
            s.swipeAction,
            {
              transform: [{ translateX: trans }, { scale }],
              backgroundColor: colors.surfaceMuted,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
            },
          ]}
        >
          <TouchableOpacity
            style={s.swipeBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onEdit(task);
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="pencil" size={18} color={colors.textSecondary} />
            <Text style={[s.swipeLabel, { color: colors.textSecondary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={s.wrap}>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={40}
        rightThreshold={40}
        friction={2}
        containerStyle={{ borderRadius: 16, overflow: "hidden" }}
      >
        <View
          style={[
            s.card,
            {
              backgroundColor: colors.surface,
              borderColor: isActive ? colors.accent : colors.border,
              opacity: task.completed ? 0.55 : 1,
            },
          ]}
        >
          {/* Tag color dot */}
          <View style={[s.dot, { backgroundColor: dotColor }]} />

          {/* Complete toggle */}
          <TouchableOpacity
            style={s.checkBtn}
            onPress={() => onComplete(task)}
            disabled={task.completed}
          >
            {task.completed ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.accent}
              />
            ) : (
              <Ionicons
                name="ellipse-outline"
                size={22}
                color={colors.border}
              />
            )}
          </TouchableOpacity>

          {/* Name + active badge */}
          <View style={s.nameWrap}>
            <Text
              style={[
                s.name,
                {
                  color: task.completed
                    ? colors.textSecondary
                    : colors.textPrimary,
                  textDecorationLine: task.completed ? "line-through" : "none",
                },
              ]}
              numberOfLines={1}
            >
              {task.name}
            </Text>
            {isActive && (
              <View
                style={[s.activeBadge, { backgroundColor: colors.accentMuted }]}
              >
                <Text style={[s.activeBadgeText, { color: colors.accent }]}>
                  Active
                </Text>
              </View>
            )}
          </View>

          {/* Play button */}
          <TouchableOpacity
            style={s.playBtn}
            onPress={() => onPlay(task)}
            disabled={task.completed || disabled}
          >
            <Ionicons
              name="play"
              size={18}
              color={task.completed || disabled ? colors.border : dotColor}
            />
          </TouchableOpacity>
        </View>
      </Swipeable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 62,
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  checkBtn: { padding: 2 },
  nameWrap: { flex: 1 },
  name: { fontSize: 15, fontFamily: "SoraSemiBold", lineHeight: 20 },
  activeBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  activeBadgeText: { fontSize: 11, fontFamily: "SoraSemiBold" },
  playBtn: { padding: 6, borderRadius: 20 },
  swipeAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 76,
  },
  swipeBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 4,
  },
  swipeLabelWhite: { color: "#fff", fontSize: 11, fontFamily: "SoraSemiBold" },
  swipeLabel: { fontSize: 11, fontFamily: "SoraSemiBold" },
});
