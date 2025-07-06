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

// Define FLOWS constant and its type
export type FlowName = keyof typeof FLOWS;

export const FLOWS = {
  "Classic Focus": [
    { type: "Classic", duration: 25 * 60 },
    { type: "Short Break", duration: 5 * 60 },
  ],
  "Solo Study": [
    { type: "Deep Focus", duration: 50 * 60 },
    { type: "Short Break", duration: 5 * 60 },
  ],
  "Creative Rhythm": [
    { type: "Creative Time", duration: 30 * 60 },
    { type: "Mindful Moment", duration: 10 * 60 },
  ],
  "Debug Flow": [
    { type: "Session 1", duration: 60 },
    { type: "Session 2", duration: 60 },
    { type: "Session 3", duration: 60 },
  ],
} as const satisfies Record<string, { type: string; duration: number }[]>;

interface FlowIndicatorProps {
  currentFlow: string | null;
  currentFlowStep: number;
  sessionType: SessionType;
  onPress: () => void;
}

export const FlowIndicator = ({
  currentFlow,
  currentFlowStep,
  sessionType,
  onPress,
}: FlowIndicatorProps) => {
  // Initialize animation ref at the top level of the component
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate progress based on current state
  const flow = currentFlow ? FLOWS[currentFlow as keyof typeof FLOWS] : null;
  const totalSteps = flow?.length || 1;
  const progress = flow
    ? Math.min(100, Math.max(0, (currentFlowStep / (totalSteps - 1)) * 100))
    : 0;

  // Animate progress bar when currentFlowStep changes
  useEffect(() => {
    if (!currentFlow || !flow) return;

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [progress, progressAnim, currentFlowStep, currentFlow, flow]);

  // Return early if no current flow
  if (!currentFlow || !flow) return null;

    return (
    <Pressable
      onPress={onPress}
      className="w-full mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      style={{
        shadowColor: '#000',
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
              {currentFlow}
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
          {Math.floor(
            FLOWS[currentFlow as keyof typeof FLOWS][currentFlowStep].duration /
              60
          )}{" "}
          min
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
              shadowColor: '#3B82F6',
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
  flowName: keyof typeof FLOWS | "";
  currentStep: number;
}

export const FlowDetailsModal = ({
  visible,
  onClose,
  flowName,
  currentStep,
}: FlowDetailsModalProps) => {
  if (!flowName) return null;

  const flow = FLOWS[flowName];
  if (!flow) return null;

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
              {flowName} Flow
            </Text>
            <ScrollView className="max-h-[60vh]">
              <View className="gap-3">
                {flow.map((session, index) => (
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
