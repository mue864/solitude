import { useSessionStore } from "@/store/sessionState";
import React from "react";
import { Text, TouchableOpacity, Vibration, Modal, View, TouchableWithoutFeedback } from "react-native";

const StartSessionBtn = () => {
  const [showAlert, setShowAlert] = React.useState(false);
  const { isRunning, isPaused, pauseSession, resumeSession, missSession, reset } =
    useSessionStore();

  const handlePress = () => {
    if (isRunning) {
      pauseSession();
    } else {
      resumeSession();
    }
  };
  const handleLongPress = () => {
    if (!isRunning) return;
    Vibration.vibrate(50);
    setShowAlert(true);
  };

  const handleCancelSession = () => {
    setShowAlert(false);
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
      className={`rounded-full ${isRunning ? "bg-red-500" : "bg-onboarding-primary"} p-5`}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={showAlert}
    >
      <Text className="text-white font-SoraBold text-lg text-center">
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
              <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <Text className="text-2xl font-SoraBold text-[#2C3E50] mb-2">Cancel Session</Text>
                <Text className="text-base font-Sora text-[#506070] mb-6">
                  Are you sure you want to cancel this session? This will be marked as a missed session.
                </Text>
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity 
                    onPress={handleContinueSession}
                    className="px-4 py-2"
                  >
                    <Text className="text-base font-SoraSemiBold text-[#506070]">No, Continue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCancelSession}
                    className="bg-[#FF3B30] px-4 py-2 rounded-lg"
                  >
                    <Text className="text-base font-SoraSemiBold text-white">Yes, Cancel</Text>
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
