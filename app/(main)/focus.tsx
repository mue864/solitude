import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Icons
import ChevronDown from "@/assets/svg/chevron-down.svg";
import Edit from "@/assets/svg/edit.svg";
import Streak from "@/assets/svg/streak.svg";

// Components
import ChangeSessionTimeCard from "@/components/modals/ChangeSessionTimeCard";
import FlowCompletionModal from "@/components/modals/FlowCompletionModal";
import QuickTaskModal from "@/components/modals/QuickTaskModal";
import QuoteCard from "@/components/modals/QuoteCard";
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

  // Animation for TodayProgress
  const todayProgressAnim = useRef(new Animated.Value(1)).current;
  const flowContextAnim = useRef(new Animated.Value(0)).current;

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
    startFlow(flowName as FlowName);
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
    } else if (
      !isRunning &&
      currentFlow &&
      currentFlowStep > 0 &&
      !showFlowCompletionModal
    ) {
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

  const currentTaskId = useTaskStore((s) => s.currentTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const setCurrentTask = useTaskStore((s) => s.setCurrentTask);
  const clearCurrentTask = useTaskStore((s) => s.clearCurrentTask);
  const completeCurrentTask = useTaskStore((s) => s.completeCurrentTask);
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  const [cardWidth] = useState(new Animated.Value(currentTask ? 320 : 120));

  useEffect(() => {
    Animated.timing(cardWidth, {
      toValue: currentTask ? 320 : 120,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [currentTask]);

  // Animate TodayProgress and Flow context when Flow state changes
  useEffect(() => {
    if (currentFlow) {
      // Fade out TodayProgress and fade in Flow context when Flow starts
      Animated.parallel([
        Animated.timing(todayProgressAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(flowContextAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade in TodayProgress and fade out Flow context when Flow ends
      Animated.parallel([
        Animated.timing(todayProgressAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(flowContextAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentFlow, todayProgressAnim, flowContextAnim]);

  return (
    <View className="flex-1 bg-primary pb-20">
      {/* Streak and Flow Indicator */}
      <View className="flex-row justify-between items-center mx-4 mt-4">
        <View
          className="flex-row gap-2 items-center bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center gap-2">
            <View className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            <Streak width={20} />
            <Text className="text-text-primary text-sm font-SoraSemiBold">
              {currentStreak} day streak
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1">
        {/* Main Content */}

        <View className="flex-1 items-center px-4">
          {/* Session Type and Flow Selector */}
          <View className="w-full max-w-md mt-4 mb-4">
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
                    className="flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View className="flex-row items-center  gap-2">
                      <View className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      <Text className="text-text-primary text-base font-SoraSemiBold">
                        {sessionType}
                      </Text>
                    </View>
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
                      <View
                        className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.15,
                          shadowRadius: 16,
                          elevation: 8,
                        }}
                      >
                        <View className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <Text className="text-text-primary text-lg font-SoraSemiBold text-center">
                            Session Type
                          </Text>
                        </View>
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
                              className={`px-6 py-4 active:bg-gray-50 dark:active:bg-gray-700 ${
                                sessionType === type
                                  ? "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
                                  : "bg-white dark:bg-gray-800"
                              }`}
                            >
                              <Text
                                className={`text-base ${
                                  sessionType === type
                                    ? "text-purple-600 dark:text-purple-400 font-SoraSemiBold"
                                    : "text-text-secondary dark:text-gray-300 font-SoraRegular"
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
                  className="ml-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <View className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <Text className="text-blue-600 dark:text-blue-400 text-sm font-SoraSemiBold">
                      Flows
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Spacer to push content up */}
          <View className="flex-1 justify-center items-center w-full">
            {/* Timer Display */}
            <View className="items-center mb-8">
              <View
                className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 border border-gray-100 dark:border-gray-700"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    !isRunning && !currentFlow && setIsTimeModalVisible(true)
                  }
                  activeOpacity={currentFlow ? 1 : 0.8}
                  className="items-center"
                >
                  <Text className="text-text-primary text-7xl font-SoraBold mb-3">
                    {formatTime(duration)}
                  </Text>
                  {!currentFlow && (
                    <View className="flex-row items-center justify-center gap-3">
                      <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
                        <Text className="text-text-secondary text-sm font-SoraSemiBold">
                          {durationMinutes} min
                        </Text>
                      </View>
                      <View className="bg-blue-500/10 rounded-full p-2 border border-blue-500/20">
                        <Edit width={16} height={16} color="#3B82F6" />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
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
          {/* Flow Context Label */}
          {currentFlow && currentTask && (
            <Animated.View
              className="w-full items-center mb-2"
              style={{
                opacity: flowContextAnim,
                transform: [{ scale: flowContextAnim }],
              }}
            >
              <View className="flex-row items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-full px-4 py-2 border border-blue-100 dark:border-blue-800/50">
                <View className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <Text className="text-blue-600 dark:text-blue-400 text-sm font-SoraSemiBold">
                  Current Focus
                </Text>
              </View>
            </Animated.View>
          )}

          <View className="w-full items-center mb-3">
            <Animated.View
              style={{
                width: cardWidth,
              }}
            >
              {currentTask ? (
                <TouchableOpacity
                  onPress={() => setIsQuickTaskModalVisible(true)}
                  activeOpacity={0.9}
                  className={`flex-row items-center justify-between rounded-full px-5 py-3 shadow-sm ${
                    currentFlow
                      ? "bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                  }`}
                  style={{
                    minHeight: 48,
                    shadowColor: currentFlow ? "#3B82F6" : "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: currentFlow ? 0.15 : 0.08,
                    shadowRadius: currentFlow ? 12 : 8,
                    elevation: currentFlow ? 6 : 4,
                  }}
                >
                  <View className="flex-row items-center gap-2 flex-1">
                    {!currentFlow && (
                      <View className="flex-row items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 mr-1">
                        <View className="w-1 h-1 bg-gray-500 rounded-full" />
                        <Text className="text-gray-600 dark:text-gray-400 text-xs font-SoraSemiBold">
                          Task
                        </Text>
                      </View>
                    )}
                    <View
                      className={`w-2.5 h-2.5 rounded-full ${
                        currentTask.tag === "urgent"
                          ? "bg-red-500"
                          : currentTask.tag === "important"
                            ? "bg-amber-500"
                            : currentTask.tag === "quickwin"
                              ? "bg-green-500"
                              : currentTask.tag === "deepwork"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                      }`}
                    />
                    <Text
                      className={`text-text-primary text-base font-SoraSemiBold ${currentTask.completed ? "line-through text-gray-400" : ""}`}
                    >
                      {currentTask.name}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {!currentTask.completed && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          completeCurrentTask();
                        }}
                        className="bg-green-500 rounded-full p-2"
                        accessibilityLabel="Mark as complete"
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        clearCurrentTask();
                      }}
                      className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 ml-1"
                      accessibilityLabel="Clear task"
                    >
                      <Ionicons name="close" size={18} color="#888" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsQuickTaskModalVisible(true)}
                  className="bg-white dark:bg-gray-800 border border-blue-500 flex-row items-center justify-center rounded-full px-6 py-3 shadow-sm"
                  style={{ minHeight: 48 }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={20} color="#2563EB" />
                  <Text className="text-blue-600 dark:text-blue-400 text-base font-SoraSemiBold ml-2">
                    Add Task
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          {/* Animated Today's Progress */}
          {!currentFlow && (
            <Animated.View
              style={{
                opacity: todayProgressAnim,
                transform: [{ scale: todayProgressAnim }],
              }}
            >
              <TodayProgress />
            </Animated.View>
          )}
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
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="p-6 max-h-[80vh]">
              <View className="flex-row items-center gap-2 mb-4">
                <View className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <Text className="text-text-primary text-xl font-SoraSemiBold">
                  Select a Flow
                </Text>
              </View>
              <ScrollView
                className="max-h-96"
                showsVerticalScrollIndicator={false}
              >
                <View className="gap-3">
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
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-1 h-1 bg-blue-500 rounded-full" />
                        <Text className="text-text-primary text-lg font-SoraSemiBold">
                          {flowName}
                        </Text>
                      </View>
                      <Text className="text-text-secondary text-sm mb-2">
                        {flow.map((s) => s.type).join(" → ")}
                      </Text>
                      <View className="bg-blue-500/10 rounded-full px-3 py-1 self-start">
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-SoraSemiBold">
                          {Math.floor(
                            flow.reduce(
                              (total: number, session) =>
                                total + session.duration,
                              0
                            ) / 60
                          )}{" "}
                          min total
                        </Text>
                      </View>
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
