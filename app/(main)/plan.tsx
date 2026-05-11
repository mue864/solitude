import AddTaskModal from "@/components/modals/AddTaskModal";
import EditTaskModal from "@/components/modals/EditTaskModal";
import TaskSwitchWarningModal from "@/components/modals/TaskSwitchWarningModal";
import { TAG_COLOR } from "@/components/TaskCard";
import TaskGroup from "@/components/TaskGroup";
import { useTheme } from "@/context/ThemeContext";
import { useSessionStore } from "@/store/sessionState";
import { Task, TaskTag, useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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
  const isSessionActive = useSessionStore((s) => s.isRunning || s.isPaused);
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
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const totalCount = activeTasks.length + completedTasks.length;
  const progressPct =
    totalCount === 0
      ? 0
      : Math.round((completedTasks.length / totalCount) * 100);

  const dateLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

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
          <Text style={[s.dateLabel, { color: colors.textSecondary }]}>
            {dateLabel}
          </Text>
          <Text style={[s.title, { color: colors.textPrimary }]}>Today</Text>

          {/* Summary strip */}
          {totalCount > 0 ? (
            <View style={s.summaryRow}>
              <View
                style={[
                  s.statChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[s.statDot, { backgroundColor: colors.accent }]} />
                <Text style={[s.statValue, { color: colors.textPrimary }]}>
                  {activeTasks.length}
                </Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>
                  active
                </Text>
              </View>
              <View
                style={[
                  s.statChip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={[s.statValue, { color: colors.textPrimary }]}>
                  {completedTasks.length}
                </Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>
                  done
                </Text>
              </View>
              <View style={s.progressWrap}>
                <View
                  style={[
                    s.progressTrack,
                    { backgroundColor: colors.surfaceMuted },
                  ]}
                >
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${progressPct}%`,
                        backgroundColor: colors.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={[s.progressText, { color: colors.textSecondary }]}>
                  {progressPct}%
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[s.subtitle, { color: colors.textSecondary }]}>
              A calm space to plan your day
            </Text>
          )}
        </View>

        {/* Pinned current task */}
        {currentTask && !currentTask.completed && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.liveDot, { backgroundColor: colors.accent }]} />
              <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                Now Focused
              </Text>
            </View>
            <View
              style={[
                s.pinnedCard,
                {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.accent + "33",
                },
              ]}
            >
              <View
                style={[s.pinnedAccentBar, { backgroundColor: colors.accent }]}
              />
              <View style={s.pinnedBody}>
                <View style={s.pinnedTopRow}>
                  <View
                    style={[s.pinnedDot, { backgroundColor: pinnedDotColor }]}
                  />
                  <Text style={[s.pinnedKicker, { color: colors.accent }]}>
                    ACTIVE
                  </Text>
                </View>
                <Text
                  style={[s.pinnedName, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {currentTask.name}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.pinnedCta, { backgroundColor: colors.accent }]}
                onPress={() => router.push("/focus")}
                activeOpacity={0.85}
              >
                <Ionicons name="play" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Task groups */}
        {remainingCount > 0 && (
          <View style={s.section}>
            {currentTask && !currentTask.completed && (
              <View style={s.sectionHeader}>
                <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                  Up Next
                </Text>
                <Text style={[s.sectionCount, { color: colors.textSecondary }]}>
                  {remainingCount}
                </Text>
              </View>
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
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <View style={s.emptyWrap}>
            <View
              style={[
                s.emptyIconWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={28}
                color={colors.textSecondary}
              />
            </View>
            <Text style={[s.emptyText, { color: colors.textPrimary }]}>
              Your day is a blank canvas
            </Text>
            <Text style={[s.emptyHint, { color: colors.textSecondary }]}>
              Add a task to start planning a focused day
            </Text>
          </View>
        )}

        {/* Completed tasks (collapsible) */}
        {completedTasks.length > 0 && (
          <View style={[s.section, { marginTop: 4 }]}>
            <TouchableOpacity
              style={s.sectionHeader}
              onPress={() => setCompletedExpanded((v) => !v)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
                Completed
              </Text>
              <Text style={[s.sectionCount, { color: colors.textSecondary }]}>
                {completedTasks.length}
              </Text>
              <Ionicons
                name={completedExpanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {completedExpanded && (
              <View
                style={[
                  s.completedList,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                {completedTasks.map((task, idx) => (
                  <View
                    key={task.id}
                    style={[
                      s.completedRow,
                      idx !== completedTasks.length - 1 && {
                        borderBottomColor: colors.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
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
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[
          s.fab,
          {
            backgroundColor: isSessionActive
              ? colors.surfaceMuted
              : colors.accent,
            shadowColor: isSessionActive ? "transparent" : colors.accent,
          },
        ]}
        onPress={() => !isSessionActive && setAddModalVisible(true)}
        activeOpacity={isSessionActive ? 1 : 0.88}
      >
        <Ionicons
          name="add"
          size={20}
          color={isSessionActive ? colors.textSecondary : "#fff"}
        />
        <Text
          style={[
            s.fabText,
            { color: isSessionActive ? colors.textSecondary : "#fff" },
          ]}
        >
          {isSessionActive ? "Session in progress" : "Add Task"}
        </Text>
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
  scrollContent: { paddingBottom: 200 },
  // Header
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  dateLabel: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    opacity: 0.7,
  },
  title: {
    fontSize: 32,
    fontFamily: "SoraBold",
    letterSpacing: -0.6,
    marginTop: 4,
  },
  subtitle: { fontSize: 14, fontFamily: "Sora", marginTop: 8 },
  // Summary strip
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statValue: { fontSize: 13, fontFamily: "SoraBold" },
  statLabel: { fontSize: 12, fontFamily: "Sora" },
  progressWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: {
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    minWidth: 32,
    textAlign: "right",
  },
  // Sections
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    opacity: 0.65,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  // Pinned card
  pinnedCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 22,
    gap: 12,
  },
  pinnedAccentBar: {
    width: 3,
    borderRadius: 2,
  },
  pinnedBody: { flex: 1, justifyContent: "center", gap: 6 },
  pinnedTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pinnedDot: { width: 6, height: 6, borderRadius: 3 },
  pinnedKicker: {
    fontSize: 10,
    fontFamily: "SoraBold",
    letterSpacing: 1.2,
  },
  pinnedName: { fontSize: 17, fontFamily: "SoraSemiBold", lineHeight: 22 },
  pinnedCta: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: "SoraSemiBold",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: "Sora",
    textAlign: "center",
    marginTop: 6,
    opacity: 0.8,
  },
  // Completed
  completedList: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  completedName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Sora",
    textDecorationLine: "line-through",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 110,
    left: 32,
    right: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    paddingVertical: 15,
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  fabText: { fontSize: 15, fontFamily: "SoraBold", color: "#fff" },
});
