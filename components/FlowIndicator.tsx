import { useFlowStore } from "@/store/flowStore";
import { type SessionType } from "@/store/sessionState";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

// Update FlowIndicatorProps to use currentFlowId: string | null
interface FlowIndicatorProps {
  currentFlowId: string | null;
  currentFlowStep: number;
  sessionType: SessionType;
  onPress: () => void;
}

export const FlowIndicator = ({
  currentFlowId,
  currentFlowStep,
  sessionType,
  onPress,
}: FlowIndicatorProps) => {
  const customFlows = useFlowStore((state) => state.customFlows);
  const flow = currentFlowId
    ? customFlows.find((f) => f.id === currentFlowId)
    : null;
  const totalSteps = flow?.steps.length || 1;
  const progress = flow
    ? Math.min(100, Math.max(0, (currentFlowStep / (totalSteps - 1)) * 100))
    : 0;

  // Initialize animation ref at the top level of the component
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animate progress bar when currentFlowStep changes
  useEffect(() => {
    if (!currentFlowId || !flow) return;

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [progress, progressAnim, currentFlowStep, currentFlowId, flow]);

  // Return early if no current flow
  if (!currentFlowId || !flow) return null;

  return (
    <Pressable
      onPress={onPress}
      className="w-full mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <Text className="text-text-primary text-base font-SoraSemiBold">
              {flow.name}
            </Text>
          </View>
          <View className="bg-blue-500/10 rounded-full px-3 py-1 border border-blue-500/20">
            <Text className="text-blue-600 dark:text-blue-400 text-sm font-SoraSemiBold">
              {currentFlowStep + 1}/{totalSteps}
            </Text>
          </View>
        </View>

        <Text className="text-text-secondary text-sm mb-3">
          {sessionType} •{" "}
          {Math.floor(flow.steps[currentFlowStep].duration / 60)} min
        </Text>

        <View className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <Animated.View
            className="h-full rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: "#3B82F6",
              opacity: progressAnim.interpolate({
                inputRange: [0, 5, 10, 100],
                outputRange: [0.3, 0.6, 0.9, 1],
              }),
              transform: [
                {
                  scaleX: progressAnim.interpolate({
                    inputRange: [0, 1, 100],
                    outputRange: [0.8, 0.9, 1],
                    extrapolate: "clamp",
                  }),
                },
              ],
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
};

interface FlowDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  flowName: string;
  currentStep: number;
}

export const FlowDetailsModal = ({
  visible,
  onClose,
  flowName,
  currentStep,
}: FlowDetailsModalProps) => {
  if (!flowName) return null;

  const customFlows = useFlowStore((state) => state.customFlows);
  const flow = customFlows.find((f) => f.id === flowName);
  if (!flow) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="absolute inset-0 bg-black/50 justify-center items-center p-4"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-md bg-tab-bg rounded-xl overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="p-6">
            <Text className="text-text-primary text-xl font-SoraSemiBold mb-4">
              {flow.name} Flow
            </Text>
            <ScrollView className="max-h-[60vh]">
              <View className="gap-3">
                {flow.steps.map((session, index) => (
                  <View
                    key={index}
                    className={`p-3 rounded-lg ${index === currentStep ? "bg-secondary/20" : "bg-secondary/5"}`}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text
                        className={`text-base font-SoraSemiBold ${index === currentStep ? "text-text-primary" : "text-text-secondary"}`}
                      >
                        {session.type}
                      </Text>
                      {index === currentStep && (
                        <View className="bg-accent/20 rounded-full px-2 py-0.5">
                          <Text className="text-accent text-xs font-SoraSemiBold">
                            Current
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-text-secondary/80 text-sm mt-1">
                      {Math.floor(session.duration / 60)} min
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
