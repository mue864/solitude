import {
  FLOW_CATEGORIES,
  useFlowStore,
  type FlowCategory,
} from "@/store/flowStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface FlowsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: () => void;
  onEditFlow: (flowId: string) => void;
}

export default function FlowsModal({
  isVisible,
  onClose,
  onSelectFlow,
  onCreateFlow,
  onEditFlow,
}: FlowsModalProps) {
  const customFlows = useFlowStore((state) => state.customFlows);
  const { deleteFlow } = useFlowStore();
  const [expandedCategories, setExpandedCategories] = useState<
    Set<FlowCategory>
  >(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const getCategoryColor = (category: FlowCategory) => {
    return FLOW_CATEGORIES[category].color;
  };

  const handleFlowSelect = (flowId: string) => {
    onSelectFlow(flowId);
    onClose();
  };

  const toggleCategory = (category: FlowCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Memoize the flow processing to avoid recalculating on every render
  const { orderedCategories, hasCustomFlows } = useMemo(() => {
    // Group flows by category - separate built-in and custom
    const builtInFlowsByCategory = customFlows.reduce(
      (acc, flow) => {
        if (flow.readonly) {
          // Built-in flows go to their original categories
          if (!acc[flow.category]) {
            acc[flow.category] = [];
          }
          acc[flow.category].push(flow);
        }
        return acc;
      },
      {} as Record<FlowCategory, typeof customFlows>
    );

    // Custom flows go to their own category
    const customFlowsOnly = customFlows.filter((flow) => !flow.readonly);
    const hasCustomFlows = customFlowsOnly.length > 0;

    // Combine built-in categories and custom category for rendering
    const allCategories = { ...builtInFlowsByCategory };
    if (hasCustomFlows) {
      allCategories.custom = customFlowsOnly;
    }

    // Reorder categories to put Custom first
    const orderedCategories = hasCustomFlows
      ? { custom: allCategories.custom, ...builtInFlowsByCategory }
      : allCategories;

    return { orderedCategories, hasCustomFlows };
  }, [customFlows]); // Only recalculate when customFlows changes

  const handleDeleteFlow = (flowId: string, flowName: string) => {
    setFlowToDelete({ id: flowId, name: flowName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (flowToDelete) {
      deleteFlow(flowToDelete.id);
    }
    setShowDeleteModal(false);
    setFlowToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setFlowToDelete(null);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl m-4 max-h-[80vh]">
          <View className="p-6">
            <Text className="text-text-primary text-xl font-SoraSemiBold mb-6 text-center">
              Choose Your Flow
            </Text>

            {/* Create Flow Button */}
            <Pressable
              onPress={onCreateFlow}
              className="bg-blue-500 mb-6 p-4 rounded-xl flex-row items-center justify-center gap-3 border-2 border-blue-600"
            >
              <Ionicons name="add" size={24} color="white" />
              <Text className="text-white text-lg font-SoraSemiBold">
                Create New Flow
              </Text>
            </Pressable>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="gap-4">
                {Object.entries(orderedCategories).map(([category, flows]) => {
                  const isCustomCategory = category === "custom";
                  const categoryInfo = isCustomCategory
                    ? { name: "Custom", icon: "⚙️", color: "#8B5CF6" }
                    : FLOW_CATEGORIES[category as FlowCategory];
                  const categoryColor = isCustomCategory
                    ? "#8B5CF6"
                    : getCategoryColor(category as FlowCategory);
                  const isExpanded = expandedCategories.has(
                    category as FlowCategory
                  );

                  return (
                    <View
                      key={category}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                    >
                      {/* Collapsible Category Header */}
                      <Pressable
                        onPress={() => toggleCategory(category as FlowCategory)}
                        className="flex-row items-center justify-between mb-3"
                      >
                        <View className="flex-row items-center gap-3 flex-1">
                          <Text className="text-2xl">{categoryInfo.icon}</Text>
                          <Text className="text-text-primary text-lg font-SoraSemiBold">
                            {categoryInfo.name}
                          </Text>
                          <View className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1">
                            <Text className="text-text-secondary text-xs font-SoraSemiBold">
                              {flows.length}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#6B7280"
                          />
                        </View>
                      </Pressable>

                      {/* Flows in this category - Collapsible */}
                      {isExpanded && (
                        <View className="gap-3">
                          {flows.map((flow) => {
                            const totalDuration = flow.steps.reduce(
                              (total, step) => total + step.duration,
                              0
                            );

                            return (
                              <Pressable
                                key={flow.id}
                                onPress={() => handleFlowSelect(flow.id)}
                                className="bg-white dark:bg-gray-600 p-4 rounded-xl border border-gray-200 dark:border-gray-500"
                              >
                                <View className="flex-row items-start justify-between mb-2">
                                  <View className="flex-1">
                                    <Text className="text-text-primary text-lg font-SoraSemiBold mb-1">
                                      {flow.name}
                                    </Text>
                                    <Text className="text-text-secondary text-sm">
                                      {flow.steps
                                        .map((s) => s.type)
                                        .join(" → ")}
                                    </Text>
                                  </View>
                                  <View className="flex-row items-center gap-2">
                                    <View
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: categoryColor,
                                      }}
                                    />
                                    {/* Edit/Delete buttons for custom flows */}
                                    {!flow.readonly && (
                                      <>
                                        <Pressable
                                          onPress={(e) => {
                                            e.stopPropagation();
                                            onEditFlow(flow.id);
                                          }}
                                          className="p-1"
                                        >
                                          <Ionicons
                                            name="pencil"
                                            size={16}
                                            color="#6B7280"
                                          />
                                        </Pressable>
                                        <Pressable
                                          onPress={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFlow(
                                              flow.id,
                                              flow.name
                                            );
                                          }}
                                          className="p-1"
                                        >
                                          <Ionicons
                                            name="trash-outline"
                                            size={16}
                                            color="#EF4444"
                                          />
                                        </Pressable>
                                      </>
                                    )}
                                  </View>
                                </View>

                                <View className="flex-row items-center gap-3">
                                  <View className="bg-gray-100 dark:bg-gray-500 rounded-full px-3 py-1">
                                    <Text className="text-text-secondary text-xs font-SoraSemiBold">
                                      {Math.floor(totalDuration / 60)} min
                                    </Text>
                                  </View>
                                  <View className="bg-gray-100 dark:bg-gray-500 rounded-full px-3 py-1">
                                    <Text className="text-text-secondary text-xs font-SoraSemiBold">
                                      {flow.steps.length} steps
                                    </Text>
                                  </View>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Empty State */}
              {Object.values(orderedCategories).flat().length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-text-secondary text-lg font-SoraSemiBold mb-2">
                    No flows available
                  </Text>
                  <Text className="text-text-secondary text-sm text-center">
                    Try refreshing the app or check the flow store
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Custom Delete Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={handleDeleteCancel}
      >
        <TouchableWithoutFeedback onPress={handleDeleteCancel}>
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
                    Delete Flow
                  </Text>
                </View>
                <Text className="text-base font-Sora text-text-secondary mb-6">
                  Are you sure you want to delete "{flowToDelete?.name}"? This
                  action cannot be undone.
                </Text>
                <View className="flex-row justify-end gap-3">
                  <Pressable
                    onPress={handleDeleteCancel}
                    className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Text className="text-base font-SoraSemiBold text-text-secondary">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDeleteConfirm}
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
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
}
