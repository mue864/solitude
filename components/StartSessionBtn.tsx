import { useSessionStore } from "@/store/sessionState";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface StartSessionBtnProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const StartSessionBtn: React.FC<StartSessionBtnProps> = ({
  onStart,
  onPause,
  onReset,
}) => {
  const [showAlert, setShowAlert] = React.useState(false);
  const { isRunning, isPaused, missSession, reset } = useSessionStore();

  const handlePress = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  const handleLongPress = () => {
    if (!isRunning) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setShowAlert(true);
  };

  const handleCancelSession = () => {
    setShowAlert(false);
    onReset();
    missSession();
    reset();
  };

  const handleContinueSession = () => {
    setShowAlert(false);
  };

  const getButtonText = () => {
    if (isRunning) return "Pause\nSession";
    if (isPaused) return "Resume\nSession";
    return "Start\nSession";
  };

  return (
    <TouchableOpacity
      className={`rounded-full p-5 ${
        isRunning ? "bg-red-500" : isPaused ? "bg-amber-500" : "bg-blue-600"
      }`}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={showAlert}
      style={{
        shadowColor: isRunning ? "#DC2626" : isPaused ? "#D97706" : "#2563EB",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <Text className="text-white font-SoraBold text-lg text-center leading-6">
        {getButtonText()}
      </Text>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showAlert}
        onRequestClose={handleContinueSession}
      >
        <TouchableWithoutFeedback onPress={handleContinueSession}>
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
                    Cancel Session
                  </Text>
                </View>
                <Text className="text-base font-Sora text-text-secondary mb-6">
                  Are you sure you want to cancel this session? This will be
                  marked as a missed session.
                </Text>
                <View className="flex-row justify-end gap-3">
                  <TouchableOpacity
                    onPress={handleContinueSession}
                    className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <Text className="text-base font-SoraSemiBold text-text-secondary">
                      Continue
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancelSession}
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
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableOpacity>
  );
};

export default StartSessionBtn;
