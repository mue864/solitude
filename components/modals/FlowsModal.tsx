// FlowsModal.tsx
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

  const getCategoryColor = (category: FlowCategory) =>
    FLOW_CATEGORIES[category].color;

  const handleFlowSelect = (flowId: string) => {
    onSelectFlow(flowId);
    onClose();
  };

  const toggleCategory = (category: FlowCategory) => {
    const updated = new Set(expandedCategories);
    if (updated.has(category)) {
      updated.delete(category);
    } else {
      updated.add(category);
    }
    setExpandedCategories(updated);
  };

  const { orderedCategories } = useMemo(() => {
    const builtInFlows = customFlows.reduce(
      (acc, flow) => {
        if (flow.readonly) {
          if (!acc[flow.category]) acc[flow.category] = [];
          acc[flow.category].push(flow);
        }
        return acc;
      },
      {} as Record<FlowCategory, typeof customFlows>
    );

    const customOnly = customFlows.filter((f) => !f.readonly);
    const hasCustom = customOnly.length > 0;
    const all = {
      ...builtInFlows,
      ...(hasCustom ? { custom: customOnly } : {}),
    };
    return {
      orderedCategories: hasCustom
        ? { custom: customOnly, ...builtInFlows }
        : all,
    };
  }, [customFlows]);

  const handleDeleteFlow = (id: string, name: string) => {
    setFlowToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (flowToDelete) deleteFlow(flowToDelete.id);
    setFlowToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setFlowToDelete(null);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl m-4 max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xl">
          {/* Header */}
          <View className="relative">
            <View
              className="absolute inset-0 bg-blue-600"
              style={{ opacity: 0.95 }}
            />
            <View className="px-6 py-8 relative flex-row items-center justify-between">
              <Text className="text-white text-2xl font-SoraBold">
                Choose Your Flow
              </Text>
              <Pressable
                onPress={onClose}
                className="w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 items-center justify-center border border-white/40 dark:border-gray-700"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>
            <Text className="px-6 pb-4 text-white/80 text-sm font-Sora">
              Select a flow to begin your session
            </Text>
          </View>

          {/* Content */}
          <View className="p-6 pt-2">
            {/* Create Flow Button */}
            <Pressable
              onPress={onCreateFlow}
              className="mb-6 rounded-2xl flex-row items-center justify-center gap-3"
              style={{
                backgroundColor: "#2563EB", // blue-600
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
                paddingVertical: 16,
              }}
            >
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="add" size={18} color="white" />
              </View>
              <Text className="text-white text-lg font-SoraBold">
                Create New Flow
              </Text>
            </Pressable>

            {/* Flow List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="gap-4">
                {Object.entries(orderedCategories).map(([category, flows]) => {
                  const isCustom = category === "custom";
                  const catInfo = isCustom
                    ? { name: "Custom", icon: "⚙️", color: "#8B5CF6" }
                    : FLOW_CATEGORIES[category as FlowCategory];
                  const catColor = isCustom
                    ? "#8B5CF6"
                    : getCategoryColor(category as FlowCategory);
                  const isExpanded = expandedCategories.has(
                    category as FlowCategory
                  );

                  return (
                    <View
                      key={category}
                      className="bg-gray-50/80 dark:bg-gray-800/60 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      {/* Category Header */}
                      <Pressable
                        onPress={() => toggleCategory(category as FlowCategory)}
                        className="p-5 flex-row items-center justify-between bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700"
                      >
                        <View className="flex-row items-center gap-3 flex-1">
                          <View
                            className="w-12 h-12 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: `${catColor}20` }}
                          >
                            <Text className="text-2xl">{catInfo.icon}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-text-primary text-lg font-SoraBold">
                              {catInfo.name}
                            </Text>
                            <Text className="text-text-secondary text-sm font-Sora">
                              {flows.length}{" "}
                              {flows.length === 1 ? "flow" : "flows"}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <View
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: catColor }}
                          />
                          <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
                            <Ionicons
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={16}
                              color="#6B7280"
                            />
                          </View>
                        </View>
                      </Pressable>

                      {/* Flows */}
                      {isExpanded && (
                        <View className="px-3 pb-3 gap-3">
                          {flows.map((flow) => {
                            const totalDuration = flow.steps.reduce(
                              (acc, s) => acc + s.duration,
                              0
                            );

                            return (
                              <Pressable
                                key={flow.id}
                                onPress={() => handleFlowSelect(flow.id)}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mt-4"
                                style={{
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: 0.05,
                                  shadowRadius: 4,
                                  elevation: 2,
                                }}
                              >
                                <View className="p-4">
                                  <View className="flex-row items-start justify-between mb-3">
                                    <View className="flex-1">
                                      <Text className="text-text-primary text-lg font-SoraBold mb-1">
                                        {flow.name}
                                      </Text>
                                      <Text className="text-text-secondary text-sm font-Sora">
                                        {flow.steps
                                          .map((s) => s.type)
                                          .join(" → ")}
                                      </Text>
                                    </View>
                                    {!flow.readonly && (
                                      <View className="flex-row items-center gap-2">
                                        <Pressable
                                          onPress={(e) => {
                                            e.stopPropagation();
                                            onEditFlow(flow.id);
                                          }}
                                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                                        >
                                          <Ionicons
                                            name="pencil"
                                            size={14}
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
                                          className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 items-center justify-center"
                                        >
                                          <Ionicons
                                            name="trash-outline"
                                            size={14}
                                            color="#EF4444"
                                          />
                                        </Pressable>
                                      </View>
                                    )}
                                  </View>

                                  {/* Stats */}
                                  <View className="flex-row items-center gap-2 mt-2">
                                    <View className="bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                                      <Ionicons
                                        name="time-outline"
                                        size={12}
                                        color="#6B7280"
                                      />
                                      <Text className="text-text-secondary text-xs font-SoraBold">
                                        {Math.floor(totalDuration / 60)} min
                                      </Text>
                                    </View>
                                    <View className="bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                                      <Ionicons
                                        name="list-outline"
                                        size={12}
                                        color="#6B7280"
                                      />
                                      <Text className="text-text-secondary text-xs font-SoraBold">
                                        {flow.steps.length} steps
                                      </Text>
                                    </View>
                                    <View className="bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1.5 flex-row items-center gap-1">
                                      <View
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: catColor }}
                                      />
                                      <Text className="text-text-secondary text-xs font-SoraBold"
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                      style={{width: 70}}
                                      >
                                        {catInfo.name}
                                      </Text>
                                    </View>
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
                <View className="items-center py-12">
                  <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-4">
                    <Ionicons name="flower-outline" size={32} color="#6B7280" />
                  </View>
                  <Text className="text-text-primary text-xl font-SoraBold mb-2">
                    No flows available
                  </Text>
                  <Text className="text-text-secondary text-sm text-center px-8 leading-5">
                    Create your first flow to get started
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Delete Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={showDeleteModal}
        onRequestClose={handleDeleteCancel}
      >
        <TouchableWithoutFeedback onPress={handleDeleteCancel}>
          <View className="flex-1 bg-black/60 justify-center items-center px-4">
            <TouchableWithoutFeedback>
              <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-700">
                <View className="w-full h-1 bg-gradient-to-r from-red-500 to-red-600 -mx-6 -mt-6 mb-6" />
                <View className="items-center mb-6">
                  <View className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 items-center justify-center mb-4">
                    <Ionicons name="warning" size={32} color="#EF4444" />
                  </View>
                  <Text className="text-xl font-SoraBold text-text-primary text-center mb-2">
                    Delete Flow
                  </Text>
                  <Text className="text-base font-Sora text-text-secondary text-center leading-6">
                    Are you sure you want to delete{" "}
                    <Text className="font-SoraBold text-text-primary">
                      &quot;{flowToDelete?.name}&quot;
                    </Text>
                    ? This action cannot be undone.
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleDeleteCancel}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 py-3 rounded-xl items-center justify-center"
                  >
                    <Text className="text-base font-SoraBold text-text-secondary">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDeleteConfirm}
                    className="flex-1 bg-red-500 py-3 rounded-xl items-center justify-center"
                  >
                    <Text className="text-base font-SoraBold text-white">
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
