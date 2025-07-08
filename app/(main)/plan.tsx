import TaskGroup from "@/components/TaskGroup";
import AddTaskModal from "@/components/modals/AddTaskModal";
import EditTaskModal from "@/components/modals/EditTaskModal";
import TaskSwitchWarningModal from "@/components/modals/TaskSwitchWarningModal";
import { Task, TaskTag, useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const GROUPS: { label: string; tag: TaskTag }[] = [
  { label: "Urgent", tag: "urgent" },
  { label: "Important", tag: "important" },
  { label: "Deep Work", tag: "deepwork" },
  { label: "Quick Win", tag: "quickwin" },
];

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Plan() {
  const router = useRouter();
  const {
    tasks,
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

  // Group active tasks by tag
  const activeTasks = getActiveTasks();
  const groupedTasks: Record<Exclude<TaskTag, null> | "default", Task[]> = {
    urgent: [],
    important: [],
    deepwork: [],
    quickwin: [],
    default: [],
  };
  activeTasks.forEach((task) => {
    let groupKey: Exclude<TaskTag, null> | "default" = "default";
    if (
      task.tag === "urgent" ||
      task.tag === "important" ||
      task.tag === "deepwork" ||
      task.tag === "quickwin"
    ) {
      groupKey = task.tag;
    }
    groupedTasks[groupKey].push(task);
  });

  // Completed tasks
  const completedTasks = getCompletedTasks();

  // Handlers
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
    // Don't allow editing the currently active task
    if (task.id === currentTaskId) {
      Toast.show({
        type: "warningToast",
        text1: "Cannot Edit Active Task",
        text2: "Please complete or switch tasks first",
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
    if (editTask) {
      updateTask({ ...editTask, name: data.name, tag: data.tag });
    }
    setEditModalVisible(false);
    setEditTask(null);
  };

  const handleDeleteTask = (task: Task) => {
    // Don't allow deleting the currently active task
    if (task.id === currentTaskId) {
      Toast.show({
        type: "warningToast",
        position: "top",
        topOffset: 60,
        props: {
          text1: "Cannot Delete Active Task",
          text2: "Please complete or switch tasks first",
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
    // Hide toast after 4s
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentTask(task.id);
    completeCurrentTask();
  };

  const handlePlayTask = (task: Task) => {
    const currentTask = getCurrentTask();

    // If there's already an active task and it's different from the one being clicked
    if (currentTask && currentTask.id !== task.id) {
      setPendingTaskSwitch(task);
      setWarningModalVisible(true);
    } else {
      // No active task or same task, proceed normally
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

  const handleRemoveCompleted = (task: Task) => {
    deleteTask(task.id);
  };

  return (
    <View className="flex-1 bg-primary relative">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-center items-center mx-4 mt-4 mb-2">
          <Text className="text-text-primary text-center text-2xl font-SoraSemiBold">
            Plan your day, one {"\n"} task at a time.
          </Text>
        </View>
        <View className="px-4 mt-2">
          {GROUPS.map(({ label, tag }) => (
            <TaskGroup
              key={tag}
              label={label}
              tag={tag}
              tasks={groupedTasks[tag || "default"]}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onComplete={handleCompleteTask}
              onPlay={handlePlayTask}
            />
          ))}
        </View>
        {/* Completed Tasks */}
        <View className="px-4 mt-6">
          <Text className="text-center text-lg font-SoraSemiBold text-text-secondary mb-2">
            Completed Tasks
          </Text>
          {completedTasks.length === 0 ? (
            <Text className="text-center text-gray-400 font-SoraSemiBold py-6">
              No completed tasks yet.
            </Text>
          ) : (
            completedTasks.map((task) => (
              <View
                key={task.id}
                className="flex-row items-center bg-white dark:bg-gray-800 rounded-2xl py-3.5 px-4 mb-3 shadow-sm"
              >
                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                <Text className="flex-1 text-base font-SoraSemiBold text-text-primary ml-3 line-through">
                  {task.name}
                </Text>
                <TouchableOpacity
                  className="ml-3 p-1.5 rounded-full"
                  onPress={() => handleRemoveCompleted(task)}
                  accessibilityLabel="Remove completed task"
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Absolutely positioned Add Task button above tab bar */}
      <View className="absolute bottom-32 left-0 right-0 px-6">
        <TouchableOpacity
          className="w-full bg-blue-600 rounded-xl py-4 flex-row items-center justify-center shadow-lg"
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.92}
          style={{
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text className="text-white font-SoraSemiBold text-base ml-2">
            Add Task
          </Text>
        </TouchableOpacity>
      </View>

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
        currentTaskName={getCurrentTask()?.name || ""}
        newTaskName={pendingTaskSwitch?.name || ""}
        onConfirm={handleConfirmTaskSwitch}
        onCancel={handleCancelTaskSwitch}
      />
    </View>
  );
}
