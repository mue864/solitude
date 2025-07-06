import { useSessionStore } from "@/store/sessionState";
import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const TAGS = [
  { key: "urgent", color: "bg-red-500", label: "urgent" },
  { key: "important", color: "bg-amber-500", label: "important" },
  { key: "quickwin", color: "bg-green-500", label: "quickwin" },
  { key: "deepwork", color: "bg-blue-500", label: "deepwork" },
];

const QuickTaskModal = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const tasks = useTaskStore((s) => s.tasks);
  const setCurrentTask = useTaskStore((s) => s.setCurrentTask);
  const addTask = useTaskStore((s) => s.addTask);
  const currentFlow = useSessionStore((s) => s.currentFlow);
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
    // Reset form
    setTaskName("");
    setSelectedTag(null);

    // If no tasks exist, close the modal entirely
    // If tasks exist, return to task list
    if (tasks.length === 0) {
      onClose();
    } else {
      setShowInput(false);
    }
  };

  const handleAddNewTask = () => {
    setShowInput(true);
  };

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          {/* Remove the TouchableWithoutFeedback overlay that was interfering */}

          {/* Modal content with BlurView as background only */}
          <View className="w-[90%] max-w-md">
            <BlurView intensity={20} className="rounded-2xl overflow-hidden">
              <View className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700">
                <View className="p-6">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-text-primary text-lg font-SoraBold flex-1 text-center">
                      {showInput
                        ? "New Task"
                        : "Pick from your plan or add something new"}
                    </Text>
                  </View>

                  {showInput ? (
                    <>
                      <Text className="text-text-secondary text-sm font-SoraSemiBold text-center mb-5">
                        Keep it fresh!
                      </Text>
                      <Text className="text-text-primary font-Sora text-sm mb-2">
                        What do you want to focus on?
                      </Text>
                      <TextInput
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mb-4 text-base text-text-primary bg-gray-50 dark:bg-gray-700"
                        placeholder="Enter task..."
                        value={taskName}
                        onChangeText={setTaskName}
                        autoFocus
                      />
                      <Text className="text-text-secondary text-sm mb-2 font-SoraSemiBold">
                        Tags
                      </Text>
                      <View className="flex-row flex-wrap gap-2 mb-6">
                        {TAGS.map((tag) => (
                          <TouchableOpacity
                            key={tag.key}
                            onPress={() =>
                              setSelectedTag(
                                tag.key as
                                  | "urgent"
                                  | "important"
                                  | "quickwin"
                                  | "deepwork"
                              )
                            }
                            className={`flex-row items-center px-3 py-1 rounded-full border ${selectedTag === tag.key ? "border-2 border-black dark:border-white" : "border-transparent"}`}
                            style={{
                              backgroundColor:
                                selectedTag === tag.key
                                  ? tag.key === "urgent"
                                    ? "#EF4444"
                                    : tag.key === "important"
                                      ? "#F59E0B"
                                      : tag.key === "quickwin"
                                        ? "#10B981"
                                        : tag.key === "deepwork"
                                          ? "#3B82F6"
                                          : "#F3F4F6"
                                  : "#F3F4F6",
                            }}
                          >
                            <View
                              className={`w-2 h-2 rounded-full mr-2 ${tag.color}`}
                            />
                            <Text
                              className="text-xs font-SoraSemiBold capitalize"
                              style={{
                                color:
                                  selectedTag === tag.key ? "#fff" : "#222",
                              }}
                            >
                              {tag.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity
                        className="bg-blue-600 rounded-xl py-3 items-center mb-2"
                        onPress={handleAddTask}
                        activeOpacity={0.85}
                      >
                        <Text className="text-white text-base font-SoraSemiBold">
                          Start with Task
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-100 dark:bg-gray-700 rounded-xl py-3 items-center"
                        onPress={handleCancel}
                      >
                        <Text className="text-text-secondary text-base font-SoraSemiBold">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {tasks.length === 0 ? (
                        <View className="items-center my-8">
                          <Text className="text-text-secondary text-center mb-2">
                            Looks like your list is empty.
                          </Text>
                          <Text className="text-text-primary text-center">
                            What's on your mind?
                          </Text>
                        </View>
                      ) : (
                        <ScrollView
                          className="max-h-64 mb-4"
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled={true}
                        >
                          <View className="gap-3">
                            {tasks.map((task) => (
                              <View
                                key={task.id}
                                className="flex-row items-center justify-between bg-tab-bg dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm"
                                style={{
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.08,
                                  shadowRadius: 8,
                                }}
                              >
                                <View className="flex-row items-center gap-2 flex-1">
                                  <View
                                    className={`w-2.5 h-2.5 rounded-full ${
                                      task.tag === "urgent"
                                        ? "bg-red-500"
                                        : task.tag === "important"
                                          ? "bg-amber-500"
                                          : task.tag === "quickwin"
                                            ? "bg-green-500"
                                            : task.tag === "deepwork"
                                              ? "bg-blue-500"
                                              : "bg-gray-300"
                                    }`}
                                  />
                                  <Text
                                    className={`text-text-primary text-base font-SoraSemiBold ${task.completed ? "line-through text-gray-400" : ""}`}
                                  >
                                    {task.name}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  onPress={() => handleAssignTask(task.id)}
                                  className="bg-blue-600 rounded-full p-2 ml-2"
                                  accessibilityLabel="Assign task"
                                >
                                  <Ionicons
                                    name="play"
                                    size={18}
                                    color="#fff"
                                  />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        </ScrollView>
                      )}
                      <TouchableOpacity
                        className="bg-blue-600 rounded-xl py-3 items-center flex-row justify-center gap-2 mb-2"
                        onPress={handleAddNewTask}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text className="text-white text-base font-SoraSemiBold">
                          Add New Task
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-100 dark:bg-gray-700 rounded-xl py-3 items-center"
                        onPress={onClose}
                        activeOpacity={0.85}
                      >
                        <Text className="text-text-secondary text-base font-SoraSemiBold">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </BlurView>
          </View>

          {/* Overlay for closing modal - positioned behind the modal content */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="absolute inset-0 -z-10" />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

      {/* Task Switch Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleCancelTaskSwitch}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] max-w-sm">
            <BlurView intensity={20} className="rounded-2xl overflow-hidden">
              <View className="bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700">
                <View className="p-6">
                  <View className="items-center mb-4">
                    <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-3">
                      <Ionicons
                        name="swap-horizontal"
                        size={24}
                        color="#3B82F6"
                      />
                    </View>
                    <Text className="text-text-primary text-lg font-SoraBold text-center mb-2">
                      Switch Focus?
                    </Text>
                    <Text className="text-text-secondary text-sm text-center">
                      You&apos;re currently in a Flow. Switching tasks will
                      change your focus but keep the Flow active.
                    </Text>
                  </View>

                  {pendingTaskId && (
                    <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                      <Text className="text-text-secondary text-sm mb-1">
                        New focus:
                      </Text>
                      <Text className="text-text-primary font-SoraSemiBold">
                        {tasks.find((t) => t.id === pendingTaskId)?.name}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl py-3 items-center"
                      onPress={handleCancelTaskSwitch}
                      activeOpacity={0.85}
                    >
                      <Text className="text-text-secondary text-base font-SoraSemiBold">
                        Keep Current
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
                      onPress={handleConfirmTaskSwitch}
                      activeOpacity={0.85}
                    >
                      <Text className="text-white text-base font-SoraSemiBold">
                        Switch Focus
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default QuickTaskModal;
