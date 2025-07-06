import {
  useFlowStore,
  type FlowCategory,
  type FlowStep,
} from "@/store/flowStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const STEP_TYPES = [
  { value: "focus", label: "Focus", icon: "🔴", color: "#EF4444" },
  { value: "break", label: "Break", icon: "🟢", color: "#10B981" },
  { value: "longBreak", label: "Long Break", icon: "🔵", color: "#3B82F6" },
];

const DURATION_OPTIONS = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 25, label: "25 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

export default function CreateFlow() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flowId = params.id as string;

  const { addFlow, updateFlow, customFlows } = useFlowStore();

  // Check if we're editing an existing flow
  const existingFlow = flowId ? customFlows.find((f) => f.id === flowId) : null;
  const isEditing = !!existingFlow;

  const [flowName, setFlowName] = useState(existingFlow?.name || "");
  const [steps, setSteps] = useState<FlowStep[]>(
    existingFlow?.steps || [{ type: "focus", duration: 25 * 60 }]
  );
  const [selectedCategory, setSelectedCategory] = useState<FlowCategory>(
    existingFlow?.category || "focus"
  );
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Update form when existingFlow changes (for editing)
  useEffect(() => {
    if (existingFlow) {
      setFlowName(existingFlow.name);
      setSteps(existingFlow.steps);
      setSelectedCategory(existingFlow.category);
    }
  }, [existingFlow]);

  const addStep = () => {
    setSteps([...steps, { type: "focus", duration: 25 * 60 }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof FlowStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);
    setSteps(newSteps);
  };

  const getLivePreview = () => {
    return steps
      .map((step) => {
        const stepType = STEP_TYPES.find((t) => t.value === step.type);
        const duration = Math.floor(step.duration / 60);
        return `${stepType?.label} ${duration}m`;
      })
      .join(" → ");
  };

  const totalDuration = steps.reduce((total, step) => total + step.duration, 0);
  const isValid = flowName.trim().length > 0 && steps.length > 0;

  const handleSave = () => {
    if (!isValid) return;

    if (isEditing && existingFlow) {
      // Update existing flow
      updateFlow(flowId, {
        ...existingFlow,
        name: flowName.trim(),
        category: selectedCategory,
        steps,
      });
      router.back();
    } else {
      // Create new flow
      const newFlow = {
        id: Date.now().toString(),
        name: flowName.trim(),
        category: selectedCategory,
        steps,
        isReadonly: false,
      };
      addFlow(newFlow);
      router.back();
    }
  };

  const handleCancel = () => {
    if (flowName.trim().length > 0 || steps.length > 1) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  const handleDiscardConfirm = () => {
    setShowDiscardModal(false);
    router.back();
  };

  const handleDiscardCancel = () => {
    setShowDiscardModal(false);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-6 pt-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Pressable onPress={handleCancel} className="p-2">
          <Ionicons name="close" size={24} color="#6B7280" />
        </Pressable>
        <Text className="text-text-primary text-lg font-SoraSemiBold">
          {isEditing ? "Edit Flow" : "Create New Flow"}
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={!isValid}
          className={`px-4 py-2 rounded-lg ${
            isValid ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <Text
            className={`font-SoraSemiBold ${
              isValid ? "text-white" : "text-gray-500"
            }`}
          >
            {isEditing ? "Update" : "Save"}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Flow Name */}
        <View className="mb-6">
          <Text className="text-text-primary text-lg font-SoraSemiBold mb-3">
            Flow Name
          </Text>
          <TextInput
            value={flowName}
            onChangeText={setFlowName}
            placeholder="Enter flow name..."
            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 text-text-primary"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Live Preview */}
        <View className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <Text className="text-text-primary text-sm font-SoraSemiBold mb-2">
            Preview
          </Text>
          <Text className="text-text-secondary text-base">
            {getLivePreview()}
          </Text>
          <Text className="text-text-secondary text-sm mt-2">
            Total: {Math.floor(totalDuration / 60)} minutes
          </Text>
        </View>

        {/* Steps */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-SoraSemiBold">
              Steps ({steps.length})
            </Text>
            <Pressable
              onPress={addStep}
              className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center gap-2"
            >
              <Ionicons name="add" size={16} color="white" />
              <Text className="text-white font-SoraSemiBold">Add Step</Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {steps.map((step, index) => (
              <View
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-text-secondary text-sm font-SoraSemiBold">
                    Step {index + 1}
                  </Text>
                  {steps.length > 1 && (
                    <Pressable
                      onPress={() => removeStep(index)}
                      className="p-1"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </Pressable>
                  )}
                </View>

                {/* Step Type - Fixed with flex-wrap */}
                <View className="mb-3">
                  <Text className="text-text-secondary text-sm mb-2">Type</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {STEP_TYPES.map((type) => (
                      <Pressable
                        key={type.value}
                        onPress={() => updateStep(index, "type", type.value)}
                        className={`px-4 py-3 rounded-lg border-2 flex-row items-center gap-2 ${
                          step.type === type.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Text className="text-lg">{type.icon}</Text>
                        <Text
                          className={`text-sm font-SoraSemiBold ${
                            step.type === type.value
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-text-secondary"
                          }`}
                        >
                          {type.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Duration */}
                <View>
                  <Text className="text-text-secondary text-sm mb-2">
                    Duration
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {DURATION_OPTIONS.map((duration) => (
                      <Pressable
                        key={duration.value}
                        onPress={() =>
                          updateStep(index, "duration", duration.value * 60)
                        }
                        className={`px-3 py-2 rounded-lg border ${
                          step.duration === duration.value * 60
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <Text
                          className={`text-sm font-SoraSemiBold ${
                            step.duration === duration.value * 60
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-text-secondary"
                          }`}
                        >
                          {duration.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Custom Discard Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDiscardModal}
        onRequestClose={handleDiscardCancel}
      >
        <TouchableWithoutFeedback onPress={handleDiscardCancel}>
          <View className="flex-1 bg-black/50 justify-center items-center px-4">
            <TouchableWithoutFeedback>
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-700"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  <Text className="text-2xl font-SoraBold text-text-primary">
                    Discard Changes
                  </Text>
                </View>
                <Text className="text-base font-Sora text-text-secondary mb-6">
                  Are you sure you want to discard your changes? This action
                  cannot be undone.
                </Text>
                <View className="flex-row justify-end gap-3">
                  <Pressable
                    onPress={handleDiscardCancel}
                    className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Text className="text-base font-SoraSemiBold text-text-secondary">
                      Continue
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDiscardConfirm}
                    className="bg-red-500 px-4 py-2 rounded-lg"
                    style={{
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text className="text-base font-SoraSemiBold text-white">
                      Discard
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
