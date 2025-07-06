import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Icons
import ChevronDown from "@/assets/svg/chevron-down.svg";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import Edit from "@/assets/svg/edit.svg";
import Streak from "@/assets/svg/streak.svg";

// Components
import ChangeSessionTimeCard from "@/components/modals/ChangeSessionTimeCard";
import QuickTaskModal from "@/components/modals/QuickTaskModal";
import QuoteCard from "@/components/modals/QuoteCard";
import FlowCompletionModal from "@/components/modals/FlowCompletionModal";
import StartSessionBtn from "@/components/StartSessionBtn";
import TodayProgress from "@/components/TodayProgress";

// Store
import {
  FlowDetailsModal,
  FlowIndicator,
  type FlowName,
} from "@/components/FlowIndicator";
import {
  SESSION_TYPES,
  useSessionStore,
  type SessionType,
} from "@/store/sessionState";

export default function Focus() {
  // Modal visibility states
  const [isQuickTaskModalVisible, setIsQuickTaskModalVisible] = useState(false);
  const [isSessionTypeModalVisible, setIsSessionTypeModalVisible] =
    useState(false);
  const [isFlowModalVisible, setIsFlowModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Get session store state and actions
  const {
    duration,
    isRunning,
    isPaused,
    setDuration,
    completeSession,
    currentStreak,
    sessionType,
    setSessionType,
    startFlow,
    currentFlow,
    currentFlowStep,
    resumeSession,
    showFlowCompletionModal,
    flowCompletionData,
    hideFlowCompletionModal,
    // completedPomodoros is available but not currently used
  } = useSessionStore();

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate duration in minutes
  const durationMinutes = Math.floor(duration / 60);

  // Track the last session ID we showed the quote for
  const lastSessionId = useRef<string | null>(null);

  // Get the current session state
  const currentSessionId = useSessionStore((state) => state.sessionId);

  // Track the last flow and step we showed a quote for
  const lastFlowContext = useRef<{
    flow: string | null;
    step: number;
    lastQuoteTime: number;
  }>({ flow: null, step: -1, lastQuoteTime: 0 });

  // Show quote modal at meaningful moments
  useEffect(() => {
    if (!isRunning || !currentSessionId) {
      return;
    }

    const now = Date.now();
    const shouldShowQuote = () => {
      // Don't show if we just showed a quote recently (within 5 minutes)
      if (now - lastFlowContext.current.lastQuoteTime < 5 * 60 * 1000) {
        return false;
      }

      // Show quote when:
      // 1. Starting a new flow (flow changed)
      // 2. First session of the day (last quote was more than 12 hours ago)
      // 3. After a long break (coming back from >1 hour of inactivity)
      return (
        currentFlow !== lastFlowContext.current.flow || // New flow
        now - lastFlowContext.current.lastQuoteTime > 12 * 60 * 60 * 1000 || // First of day
        (lastFlowContext.current.flow && !currentFlow) // Just finished a flow
      );
    };

    if (currentSessionId !== lastSessionId.current) {
      lastSessionId.current = currentSessionId;

      if (shouldShowQuote()) {
        lastFlowContext.current = {
          flow: currentFlow,
          step: currentFlowStep,
          lastQuoteTime: now,
        };

        // Small delay to ensure state is fully updated
        const showQuote = setTimeout(() => {
          setShowQuoteModal(true);

          // Auto-close the modal after 3 seconds
          const hideQuote = setTimeout(() => {
            setShowQuoteModal(false);
          }, 3000);

          return () => clearTimeout(hideQuote);
        }, 100);

        return () => clearTimeout(showQuote);
      } else {
        // Update context without showing quote
        lastFlowContext.current = {
          flow: currentFlow,
          step: currentFlowStep,
          lastQuoteTime: lastFlowContext.current.lastQuoteTime,
        };
      }
    }
  }, [isRunning, currentSessionId, currentFlow, currentFlowStep]);

  // Handle quote modal close
  const handleQuoteModalClose = useCallback(() => {
    setShowQuoteModal(false);
  }, []);

  // Handle session type selection
  const handleSessionSelect = (type: SessionType) => {
    setSessionType(type);
    setIsSessionTypeModalVisible(false);
  };

  // Handle flow selection
  const handleFlowSelect = (flowName: string) => {
    startFlow(flowName);
    setIsFlowModalVisible(false);
  };

  // Flow details modal state
  const [showFlowDetails, setShowFlowDetails] = useState(false);

  // Debug logs
  console.log("Current flow:", currentFlow);
  console.log("Current flow step:", currentFlowStep);
  console.log("Session type:", sessionType);

  // Handle timer countdown
  useEffect(() => {
    // Clear any existing interval when component unmounts or dependencies change
    const cleanup = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Only run the timer if running and not paused
    if (isRunning && !isPaused) {
      cleanup(); // Clear any existing timer to prevent duplicates

      timerRef.current = setInterval(() => {
        setDuration((currentDuration: number) => {
          // If we reach 0 or below, end the session
          if (currentDuration <= 1) {
            cleanup();
            // Use setTimeout to allow state to update before starting next session
            setTimeout(() => {
              completeSession();
            }, 0);
            return 0;
          }
          // Otherwise, just decrement the timer
          return currentDuration - 1;
        });
      }, 1000);
      
      // Clear the timer when paused or stopped
      return cleanup;
    } else if (isPaused) {
      // Clear any running timers when paused
      cleanup();
      return;
    } else if (!isRunning && currentFlow && currentFlowStep > 0 && !showFlowCompletionModal) {
      // If we're in a flow and not running, but should be, start the timer
      // This handles the case when we transition to a new session in the flow
      // But don't start if the flow completion modal is visible
      const timerId = setTimeout(() => {
        resumeSession();
      }, 0);

      return () => clearTimeout(timerId);
    }

    // Clean up on unmount or when dependencies change
    return cleanup;
  }, [
    isRunning,
    isPaused,
    setDuration,
    completeSession,
    currentFlow,
    currentFlowStep,
    resumeSession,
    showFlowCompletionModal,
  ]);

  // Update duration when session type changes - only when not running and not paused
  useEffect(() => {
    if (!isRunning && !isPaused && !currentFlow) {
      // Only update duration if not in a flow (flows manage their own durations)
      setDuration(SESSION_TYPES[sessionType] || 25 * 60);
    }
  }, [sessionType, isRunning, isPaused, setDuration, currentFlow]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-primary pb-24">
      {/* Streak and Flow Indicator */}
      <View className="flex-row justify-between items-center mx-4 mt-4">
        <View className="flex-row gap-1 items-center">
          <Streak width={23} />
          <Text className="text-text-primary text-sm font-SoraSemiBold">
            {currentStreak} day streak
          </Text>
        </View>
      </View>

      <View className="flex-1">
        {/* Main Content */}
        <View className="flex-1 items-center px-4">
          {/* Session Type and Flow Selector */}
          <View className="w-full max-w-md mt-8 mb-4">
            {currentFlow ? (
              <View className="w-full px-4">
                <FlowIndicator
                  currentFlow={currentFlow}
                  currentFlowStep={currentFlowStep}
                  sessionType={sessionType}
                  onPress={() => setShowFlowDetails(true)}
                />
              </View>
            ) : (
              <View className="flex-row items-center justify-between w-full">
                <View className="relative z-10 flex-1">
                  <Pressable
                    onPress={() => setIsSessionTypeModalVisible(true)}
                    className="flex-row items-center gap-3 bg-secondary/10 border border-primary/10 rounded-lg px-4 py-3"
                  >
                    <Text className="text-text-primary text-base font-SoraSemiBold">
                      {sessionType}
                    </Text>
                    <ChevronDown width={16} height={16} color="#2C3E50" />
                  </Pressable>

                  <Modal
                    visible={isSessionTypeModalVisible}
                    transparent={true}
                    animationType="fade"
                    statusBarTranslucent={true}
                    onRequestClose={() => setIsSessionTypeModalVisible(false)}
                  >
                    <Pressable
                      className="absolute inset-0 bg-black/50 justify-center items-center p-4"
                      onPress={() => setIsSessionTypeModalVisible(false)}
                    >
                      <View className="w-full max-w-xs bg-white rounded-xl overflow-hidden shadow-2xl">
                        <ScrollView
                          className="max-h-[60vh]"
                          showsVerticalScrollIndicator={false}
                        >
                          {Object.keys(SESSION_TYPES).map((type) => (
                            <Pressable
                              key={type}
                              onPress={() => {
                                handleSessionSelect(type as SessionType);
                                setIsSessionTypeModalVisible(false);
                              }}
                              className={`px-6 py-4 active:bg-gray-50 ${sessionType === type ? "bg-primary/5" : "bg-white"}`}
                            >
                              <Text
                                className={`text-base ${
                                  sessionType === type
                                    ? "text-text-primary font-SoraSemiBold"
                                    : "text-text-secondary font-SoraRegular"
                                }`}
                              >
                                {type}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    </Pressable>
                  </Modal>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFlowModalVisible(true)}
                  className="ml-4"
                >
                  <Text className="text-active-tab text-sm font-SoraSemiBold">
                    Flows
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Spacer to push content up */}
          <View className="flex-1 justify-center items-center w-full">
            {/* Timer Display */}
            <View className="items-center mb-8">
              <TouchableOpacity
                onPress={() =>
                  !isRunning && !currentFlow && setIsTimeModalVisible(true)
                }
                activeOpacity={currentFlow ? 1 : 0.8}
                className="items-center"
              >
                <Text className="text-text-primary text-7xl font-SoraBold mb-2">
                  {formatTime(duration)}
                </Text>
                {!currentFlow && (
                  <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-text-primary/60 text-base font-SoraSemiBold">
                      {durationMinutes} min
                    </Text>
                    <Edit width={16} height={16} color="#ffffff99" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Start/Pause Button */}
            <View className="w-full items-center">
              <View className="w-32">
                <StartSessionBtn />
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="w-full rounded-t-3xl px-6 pt-6 pb-8">
          <View className="flex-row items-center justify-end mb-4">
            <TouchableOpacity
              onPress={() => setIsQuickTaskModalVisible(true)}
              className="flex-row items-center gap-1"
            >
              <Text className="text-accent text-sm font-SoraSemiBold">
                Add Task
              </Text>
              <ChevronRight width={16} height={16} color="#5CE1E1" />
            </TouchableOpacity>
          </View>

          <TodayProgress />
        </View>
      </View>

      {/* Modals */}
      <ChangeSessionTimeCard
        isVisible={isTimeModalVisible}
        onClose={() => setIsTimeModalVisible(false)}
        sessionType={sessionType}
      />

      <QuickTaskModal
        isVisible={isQuickTaskModalVisible}
        onClose={() => setIsQuickTaskModalVisible(false)}
      />

      {currentFlow && (
        <FlowDetailsModal
          visible={showFlowDetails}
          onClose={() => setShowFlowDetails(false)}
          flowName={currentFlow as FlowName}
          currentStep={currentFlowStep}
        />
      )}

      {/* Flow Selection Modal */}
      <Modal
        visible={isFlowModalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setIsFlowModalVisible(false)}
      >
        <Pressable
          className="absolute inset-0 bg-black/50 justify-center items-center p-4"
          onPress={() => setIsFlowModalVisible(false)}
        >
          <Pressable
            className="w-full max-w-md bg-tab-bg rounded-xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-6 max-h-[80vh]">
              <Text className="text-text-primary text-xl font-SoraSemiBold mb-4">
                Select a Flow
              </Text>
              <ScrollView className="max-h-96">
                <View className="gap-4">
                  {Object.entries({
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
                  }).map(([flowName, flow]) => (
                    <TouchableOpacity
                      key={flowName}
                      onPress={() => handleFlowSelect(flowName)}
                      className="bg-secondary p-4 rounded-xl"
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
                            (total: number, session) =>
                              total + session.duration,
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Quote Modal */}
      {showQuoteModal && <QuoteCard onClose={handleQuoteModalClose} />}

      {/* Flow Completion Modal */}
      {showFlowCompletionModal && flowCompletionData && (
        <FlowCompletionModal
          isVisible={showFlowCompletionModal}
          onClose={hideFlowCompletionModal}
          data={flowCompletionData}
        />
      )}
    </View>
  );
}
