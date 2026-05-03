import AddTaskModal from "@/components/modals/AddTaskModal";
import EditTaskModal from "@/components/modals/EditTaskModal";
import TaskSwitchWarningModal from "@/components/modals/TaskSwitchWarningModal";
import { TAG_COLOR } from "@/components/TaskCard";
import TaskGroup from "@/components/TaskGroup";
import { useTheme } from "@/context/ThemeContext";
import { Task, TaskTag, useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const GROUPS: { label: string; tag: Exclude<TaskTag, null> }[] = [
  { label: "Urgent", tag: "urgent" },
  { label: "Important", tag: "important" },
  { label: "Deep Work", tag: "deepwork" },
  { label: "Quick Win", tag: "quickwin" },
];

export default function Plan() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    addTask,
    updateTask,
    deleteTask,
    setCurrentTask,
    completeCurrentTask,
    getCompletedTasks,
    getActiveTasks,
    currentTaskId,
    getCurrentTask,
  } = useTaskStore();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [pendingTaskSwitch, setPendingTaskSwitch] = useState<Task | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);

  const activeTasks = getActiveTasks();
  const completedTasks = getCompletedTasks();
  const currentTask = getCurrentTask();

  // Group active non-pinned tasks by tag
  const groupedTasks: Record<Exclude<TaskTag, null> | "default", Task[]> = {
    urgent: [],
    important: [],
    deepwork: [],
    quickwin: [],
    default: [],
  };
  activeTasks.forEach((task) => {
    if (task.id === currentTaskId) return;
    const key = (
      ["urgent", "important", "deepwork", "quickwin"] as const
    ).includes(task.tag as Exclude<TaskTag, null>)
      ? (task.tag as Exclude<TaskTag, null>)
      : "default";
    groupedTasks[key].push(task);
  });

  const remainingCount = activeTasks.filter(
    (t) => t.id !== currentTaskId,
  ).length;

  const handleAddTask = (data: { name: string; tag: TaskTag }) => {
    addTask({
      id: Date.now().toString(),
      name: data.name,
      tag: data.tag,
      completed: false,
    });
    setAddModalVisible(false);
  };

  const handleEditTask = (task: Task) => {
    if (task.id === currentTaskId) {
      Toast.show({
        type: "warningToast",
        text1: "Cannot Edit Active Task",
        text2: "Complete or switch tasks first",
        position: "top",
        topOffset: 60,
        props: { onPress: () => Toast.hide() },
      });
      return;
    }
    setEditTask(task);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (data: { name: string; tag: TaskTag }) => {
    if (editTask) updateTask({ ...editTask, name: data.name, tag: data.tag });
    setEditModalVisible(false);
    setEditTask(null);
  };

  const handleDeleteTask = (task: Task) => {
    if (task.id === currentTaskId) {
      Toast.show({
        type: "warningToast",
        position: "top",
        topOffset: 60,
        props: {
          text1: "Cannot Delete Active Task",
          text2: "Complete or switch tasks first",
          onPress: () => Toast.hide(),
        },
      });
      return;
    }
    setDeletedTask(task);
    deleteTask(task.id);
    Toast.show({
      type: "undoToast",
      text1: "Task Deleted",
      props: { onPress: handleUndoDelete },
      position: "top",
      autoHide: false,
      topOffset: 60,
      onHide: () => setDeletedTask(null),
    });
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(() => {
      Toast.hide();
      setDeletedTask(null);
    }, 4000);
  };

  const handleUndoDelete = () => {
    if (deletedTask) {
      addTask({ ...deletedTask, id: Date.now().toString() });
      setDeletedTask(null);
      Toast.hide();
    }
  };

  const handleCompleteTask = (task: Task) => {
    setCurrentTask(task.id);
    completeCurrentTask();
  };

  const handlePlayTask = (task: Task) => {
    const current = getCurrentTask();
    if (current && current.id !== task.id) {
      setPendingTaskSwitch(task);
      setWarningModalVisible(true);
    } else {
      setCurrentTask(task.id);
      router.push("/focus");
    }
  };

  const handleConfirmTaskSwitch = () => {
    if (pendingTaskSwitch) {
      setCurrentTask(pendingTaskSwitch.id);
      setWarningModalVisible(false);
      setPendingTaskSwitch(null);
      router.push("/focus");
    }
  };

  const handleCancelTaskSwitch = () => {
    setWarningModalVisible(false);
    setPendingTaskSwitch(null);
  };

  const pinnedDotColor = TAG_COLOR[currentTask?.tag ?? "default"];

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.title, { color: colors.textPrimary }]}>
            Today's Plan
          </Text>
          <Text style={[s.subtitle, { color: colors.textSecondary }]}>
            {activeTasks.length === 0
              ? "No tasks yet — add one below"
              : `${activeTasks.length} task${activeTasks.length !== 1 ? "s" : ""} remaining`}
          </Text>
        </View>

        {/* Pinned current task */}
        {currentTask && !currentTask.completed && (
          <View style={s.section}>
            <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
              Now Focused
            </Text>
            <View
              style={[
                s.pinnedCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.accent,
                },
              ]}
            >
              <View style={s.pinnedRow}>
                <View
                  style={[s.pinnedDot, { backgroundColor: pinnedDotColor }]}
                />
                <Text
                  style={[s.pinnedName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {currentTask.name}
                </Text>
              </View>
              <View style={s.pinnedMeta}>
                <View
                  style={[
                    s.activeBadge,
                    { backgroundColor: colors.accentMuted },
                  ]}
                >
                  <Text style={[s.activeBadgeText, { color: colors.accent }]}>
                    Active
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.focusBtn, { backgroundColor: colors.accent }]}
                  onPress={() => router.push("/focus")}
                >
                  <Ionicons name="play" size={12} color="#fff" />
                  <Text style={s.focusBtnText}>Go to focus</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Task groups */}
        {remainingCount > 0 && (
          <View style={s.section}>
            {currentTask && !currentTask.completed && (
              <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                Up Next
              </Text>
            )}
            {GROUPS.map(({ label, tag }) => (
              <TaskGroup
                key={tag}
                label={label}
                tag={tag}
                tasks={groupedTasks[tag]}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                onComplete={handleCompleteTask}
                onPlay={handlePlayTask}
              />
            ))}
            {groupedTasks.default.length > 0 && (
              <TaskGroup
                label="Other"
                tag={null}
                tasks={groupedTasks.default}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                onComplete={handleCompleteTask}
                onPlay={handlePlayTask}
              />
            )}
          </View>
        )}

        {/* Empty state */}
        {activeTasks.length === 0 && (
          <View style={s.emptyWrap}>
            <Ionicons name="calendar-outline" size={40} color={colors.border} />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No tasks for today
            </Text>
            <Text style={[s.emptyHint, { color: colors.textSecondary }]}>
              Tap the button below to add your first task
            </Text>
          </View>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <View style={[s.section, { marginTop: 8 }]}>
            <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
              Completed · {completedTasks.length}
            </Text>
            {completedTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  s.completedCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.accent}
                />
                <Text
                  style={[s.completedName, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {task.name}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[
          s.fab,
          { backgroundColor: colors.accent, shadowColor: colors.accent },
        ]}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={s.fabText}>Add Task</Text>
      </TouchableOpacity>

      <AddTaskModal
        isVisible={addModalVisible}
        onAdd={handleAddTask}
        onClose={() => setAddModalVisible(false)}
      />
      <EditTaskModal
        isVisible={editModalVisible}
        task={editTask}
        onSave={handleSaveEdit}
        onClose={() => setEditModalVisible(false)}
      />
      <TaskSwitchWarningModal
        isVisible={warningModalVisible}
        currentTaskName={getCurrentTask()?.name ?? ""}
        newTaskName={pendingTaskSwitch?.name ?? ""}
        onConfirm={handleConfirmTaskSwitch}
        onCancel={handleCancelTaskSwitch}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 180 },
  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: "SoraBold", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontFamily: "Sora", marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  // Pinned card
  pinnedCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
  },
  pinnedRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pinnedDot: { width: 8, height: 8, borderRadius: 4 },
  pinnedName: { flex: 1, fontSize: 16, fontFamily: "SoraSemiBold" },
  pinnedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeBadgeText: { fontSize: 11, fontFamily: "SoraSemiBold" },
  focusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  focusBtnText: { fontSize: 12, fontFamily: "SoraBold", color: "#fff" },
  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "SoraSemiBold",
    textAlign: "center",
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: "Sora",
    textAlign: "center",
    marginTop: 6,
    opacity: 0.7,
  },
  // Completed
  completedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    opacity: 0.65,
    gap: 10,
  },
  completedName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "SoraSemiBold",
    textDecorationLine: "line-through",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 110,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    paddingVertical: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { fontSize: 15, fontFamily: "SoraBold", color: "#fff" },
});
