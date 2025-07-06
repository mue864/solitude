import { SessionType } from "@/store/sessionState";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FlowsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFlow: (flowName: string) => void;
  flows: Record<string, { type: SessionType; duration: number }[]>;
}

export default function FlowsModal({
  isVisible,
  onClose,
  onSelectFlow,
  flows,
}: FlowsModalProps) {
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
        <View className="w-full max-w-md" style={{ zIndex: 10 }}>
          <View className="bg-tab-bg rounded-2xl shadow-xl overflow-hidden m-4">
            <View className="p-6 max-h-[80vh]">
              <Text className="text-text-primary text-xl font-SoraSemiBold mb-4">
                Select a Flow
              </Text>
              <ScrollView className="max-h-96">
                <View className="gap-4">
                  {Object.entries(flows).map(([flowName, flow]) => (
                    <TouchableOpacity
                      key={flowName}
                      onPress={() => onSelectFlow(flowName)}
                      className="bg-secondary p-4 rounded-xl active:opacity-80"
                    >
                      <Text className="text-text-primary text-lg font-SoraSemiBold mb-1">
                        {flowName}
                      </Text>
                      <Text className="text-text-secondary text-sm">
                        {flow.map((s) => s.type).join(" → ")}
                      </Text>
                      <Text className="text-text-secondary text-xs mt-2">
                        {Math.floor(
                          flow.reduce(
                            (total, session) => total + session.duration,
                            0
                          ) / 60
                        )}{" "}
                        min total
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
