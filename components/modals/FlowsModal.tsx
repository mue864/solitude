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
  Animated,
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
      <View className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View 
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl m-4 max-h-[85vh] overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 20,
          }}
        >
          {/* Header with gradient background */}
          <View className="relative">
            <View 
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              }}
            />
            <View className="px-6 py-8 relative">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white text-2xl font-SoraBold">
                  Choose Your Flow
                </Text>
                <Pressable
                  onPress={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="white" />
                </Pressable>
              </View>
              <Text className="text-white/80 text-sm font-Sora">
                Select a breathing flow to begin your session
              </Text>
            </View>
          </View>

          <View className="p-6">
            {/* Create Flow Button - Enhanced */}
            <Pressable
              onPress={onCreateFlow}
              className="mb-6 p-4 rounded-2xl flex-row items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 active:from-blue-600 active:to-blue-700"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="add" size={18} color="white" />
              </View>
              <Text className="text-white text-lg font-SoraBold">
                Create New Flow
              </Text>
            </Pressable>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
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
                      className="bg-gray-50/80 dark:bg-gray-700/50 rounded-2xl overflow-hidden"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      {/* Enhanced Category Header */}
                      <Pressable
                        onPress={() => toggleCategory(category as FlowCategory)}
                        className="p-5 flex-row items-center justify-between bg-white/60 dark:bg-gray-600/60 backdrop-blur-sm"
                      >
                        <View className="flex-row items-center gap-3 flex-1">
                          <View 
                            className="w-12 h-12 rounded-2xl items-center justify-center"
                            style={{ backgroundColor: `${categoryColor}20` }}
                          >
                            <Text className="text-2xl">{categoryInfo.icon}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-text-primary text-lg font-SoraBold">
                              {categoryInfo.name}
                            </Text>
                            <Text className="text-text-secondary text-sm font-Sora">
                              {flows.length} {flows.length === 1 ? 'flow' : 'flows'}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <View
                            className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: categoryColor,
                              shadowColor: categoryColor,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 4,
                            }}
                          />
                          <View 
                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-500 items-center justify-center"
                          >
                            <Ionicons
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={16}
                              color="#6B7280"
                            />
                          </View>
                        </View>
                      </Pressable>

                      {/* Enhanced Flow Cards */}
                      {isExpanded && (
                        <View className="px-3 pb-3 gap-3">
                          {flows.map((flow, index) => {
                            const totalDuration = flow.steps.reduce(
                              (total, step) => total + step.duration,
                              0
                            );

                            return (
                              <Pressable
                                key={flow.id}
                                onPress={() => handleFlowSelect(flow.id)}
                                className="bg-white dark:bg-gray-600 rounded-2xl border border-gray-100 dark:border-gray-500 overflow-hidden active:scale-[0.98]"
                                style={{
                                  shadowColor: "#000",
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.08,
                                  shadowRadius: 8,
                                  elevation: 3,
                                }}
                              >
                                {/* Flow card header with gradient accent */}
                                <View 
                                  className="h-1"
                                  style={{ backgroundColor: categoryColor }}
                                />
                                
                                <View className="p-4">
                                  <View className="flex-row items-start justify-between mb-3">
                                    <View className="flex-1">
                                      <Text className="text-text-primary text-lg font-SoraBold mb-1">
                                        {flow.name}
                                      </Text>
                                      <Text className="text-text-secondary text-sm font-Sora">
                                        {flow.steps.map((s) => s.type).join(" → ")}
                                      </Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                      {!flow.readonly && (
                                        <>
                                          <Pressable
                                            onPress={(e) => {
                                              e.stopPropagation();
                                              onEditFlow(flow.id);
                                            }}
                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-500 items-center justify-center"
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
                                              handleDeleteFlow(flow.id, flow.name);
                                            }}
                                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 items-center justify-center"
                                          >
                                            <Ionicons
                                              name="trash-outline"
                                              size={14}
                                              color="#EF4444"
                                            />
                                          </Pressable>
                                        </>
                                      )}
                                    </View>
                                  </View>

                                  {/* Enhanced flow stats */}
                                  <View className="flex-row items-center gap-2">
                                    <View 
                                      className="bg-gray-50 dark:bg-gray-500 rounded-full px-3 py-1.5 flex-row items-center gap-1"
                                    >
                                      <Ionicons name="time-outline" size={12} color="#6B7280" />
                                      <Text className="text-text-secondary text-xs font-SoraBold">
                                        {Math.floor(totalDuration / 60)} min
                                      </Text>
                                    </View>
                                    <View 
                                      className="bg-gray-50 dark:bg-gray-500 rounded-full px-3 py-1.5 flex-row items-center gap-1"
                                    >
                                      <Ionicons name="list-outline" size={12} color="#6B7280" />
                                      <Text className="text-text-secondary text-xs font-SoraBold">
                                        {flow.steps.length} steps
                                      </Text>
                                    </View>
                                    <View 
                                      className="bg-gray-50 dark:bg-gray-500 rounded-full px-3 py-1.5 flex-row items-center gap-1"
                                    >
                                      <View 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: categoryColor }}
                                      />
                                      <Text className="text-text-secondary text-xs font-SoraBold">
                                        {categoryInfo.name}
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

              {/* Enhanced Empty State */}
              {Object.values(orderedCategories).flat().length === 0 && (
                <View className="items-center py-12">
                  <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-4">
                    <Ionicons name="flower-outline" size={32} color="#6B7280" />
                  </View>
                  <Text className="text-text-primary text-xl font-SoraBold mb-2">
                    No flows available
                  </Text>
                  <Text className="text-text-secondary text-sm text-center px-8 leading-5">
                    Create your first breathing flow to get started on your mindfulness journey
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Enhanced Delete Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={handleDeleteCancel}
      >
        <TouchableWithoutFeedback onPress={handleDeleteCancel}>
          <View className="flex-1 bg-black/60 justify-center items-center px-4">
            <TouchableWithoutFeedback>
              <View
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 20 },
                  shadowOpacity: 0.25,
                  shadowRadius: 25,
                  elevation: 20,
                }}
              >
                {/* Warning accent */}
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
                      "{flowToDelete?.name}"
                    </Text>
                    ? This action cannot be undone.
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleDeleteCancel}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 py-3 rounded-xl border border-gray-200 dark:border-gray-600 items-center justify-center"
                  >
                    <Text className="text-base font-SoraBold text-text-secondary">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDeleteConfirm}
                    className="flex-1 bg-red-500 py-3 rounded-xl items-center justify-center"
                    style={{
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
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