import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
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
import SessionIntelligenceModal from "@/components/modals/SessionIntelligenceModal";
import StartSessionBtn from "@/components/StartSessionBtn";

// Store
import { FlowDetailsModal, FlowIndicator } from "@/components/FlowIndicator";
import AddJournalModal from "@/components/modals/AddJournalModal";
import FlowsModal from "@/components/modals/FlowsModal";
import SessionCompletionModal from "@/components/modals/SessionCompletionModal";
import SessionIndicator from "@/components/SessionIndicator";
import { useFlowStore } from "@/store/flowStore";
import { useJournalStore } from "@/store/journalStore";
import { useSessionStore, type SessionType } from "@/store/sessionState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

// notifications
import { useNotifications } from "@/hooks/useNotifications";

export default function Focus() {
  const router = useRouter();
  const notifications = useNotifications();

  // Modal visibility states
  const [isQuickTaskModalVisible, setIsQuickTaskModalVisible] = useState(false);
  const [isSessionTypeModalVisible, setIsSessionTypeModalVisible] =
    useState(false);
  const [isFlowModalVisible, setIsFlowModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [showReflect, setShowReflect] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Animation for TodayProgress
  const flowContextAnim = useRef(new Animated.Value(0)).current;

  // Animation for tabs/indicator crossfade and scale
  const tabsOpacity = useRef(new Animated.Value(1)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(0.95)).current;

  // Animation for Add Task button
  const addTaskOpacity = useRef(new Animated.Value(1)).current;

  // Add new animated values for translateY
  const tabsTranslateY = useRef(new Animated.Value(0)).current;
  const indicatorTranslateY = useRef(new Animated.Value(32)).current;

  // --- State for disappearing UI height ---
  const [disappearingUIHeight, setDisappearingUIHeight] = useState(0);

  // --- Animation values ---
  const sessionControlsTranslateY = useRef(new Animated.Value(0)).current;

  // --- State for reflection save toast ---

  // Get session store state and actions
  const {
    duration,
    isRunning,
    isPaused,
    currentStreak,
    sessionType,
    setSessionType,
    startFlow,
    currentFlowId,
    currentFlowStep,
    resumeSession,
    pauseSession,
    reset,
    showFlowCompletionModal,
    flowCompletionData,
    hideFlowCompletionModal,
    isNewSession,
  } = useSessionStore();

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

  // Track previous sessionId and isRunning
  const prevSessionId = useRef(currentSessionId);
  const prevIsRunning = useRef(isRunning);

  // Initialize notifications and handle pending actions
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log("Initializing notifications in focus component...");
        await notifications.initialize();
        console.log(
          "Notifications initialized successfully in focus component"
        );

        // Check for pending actions from background notifications
        const pendingAction = await AsyncStorage.getItem("pendingAction");
        if (pendingAction) {
          console.log("Found pending action:", pendingAction);
          switch (pendingAction) {
            case "background-session-reminder":
              // Navigate to focus screen (already here, so just clear the action)
              console.log("🎯 Background session reminder action handled");
              break;
            case "start-session":
              resumeSession();
              break;
            case "pause-session":
              pauseSession();
              break;
            case "end-session":
              reset();
              break;
          }
          await AsyncStorage.removeItem("pendingAction");
        }

        // Test notification after initialization
        setTimeout(async () => {
          try {
            await notifications.showTestNotification();
            console.log("✅ Test notification sent after initialization");
          } catch (error) {
            console.error("❌ Failed to send test notification:", error);
          }
        }, 2000);
      } catch (error) {
        console.error(
          "Failed to initialize notifications in focus component:",
          error
        );
      }
    };

    initializeNotifications();
  }, []);

  const handleSessionStart = async () => {
    resumeSession();

    // Schedule session end notification
    await notifications.scheduleSessionEndNotification(
      sessionType,
      durationMinutes
    );

    // Schedule break reminder
    // await notifications.scheduleBreakReminder(durationMinutes);
  };

  const handleSessionEnd = async () => {
    await notifications.cancelAllNotifications();

    // Check for current streak milestones
    await notifications.showStreakMilestoneNotification(currentStreak);
  };

  // Handle session pause/resume notifications
  useEffect(() => {
    if (isPaused && !prevIsRunning.current) {
      // Session was just paused
      notifications.showSessionPauseNotification();
      notifications.updateSessionState(false, true);
    } else if (isRunning && prevIsRunning.current === false) {
      // Session was just resumed
      if (!isNewSession) {
        notifications.showSessionResumeNotification();
        console.log("In here");
      }
      notifications.updateSessionState(true, false);
    } else if (!isRunning && prevIsRunning.current) {
      // Session ended
      notifications.updateSessionState(false, false);
    }
  }, [isRunning, isPaused, isNewSession]);

  // Handle session start notification for new sessions
  useEffect(() => {

    if (isRunning && isNewSession) {
      notifications.showSessionStartNotification(sessionType, durationMinutes);
    }
  }, [isRunning, isNewSession, sessionType, durationMinutes]);

  // Session pause/resume notifications are now handled by the notification hook

  useEffect(() => {
    // Show quote modal at meaningful moments
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
        currentFlowId !== lastFlowContext.current.flow || // New flow
        now - lastFlowContext.current.lastQuoteTime > 12 * 60 * 60 * 1000 || // First of day
        (lastFlowContext.current.flow && !currentFlowId) // Just finished a flow
      );
    };

    if (currentSessionId !== lastSessionId.current) {
      lastSessionId.current = currentSessionId;

      if (shouldShowQuote()) {
        lastFlowContext.current = {
          flow: currentFlowId,
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
          flow: currentFlowId,
          step: currentFlowStep,
          lastQuoteTime: lastFlowContext.current.lastQuoteTime,
        };
      }
    }
  }, [isRunning, currentSessionId, currentFlowId, currentFlowStep]);

  // Handle quote modal close
  const handleQuoteModalClose = useCallback(() => {
    setShowQuoteModal(false);
  }, []);

  // Handle session type selection
  const handleSessionSelect = (type: SessionType) => {
    setSessionType(type);
    setIsSessionTypeModalVisible(false);
  };

  // Flow details modal state
  const [showFlowDetails, setShowFlowDetails] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTaskId = useTaskStore((s) => s.currentTaskId);
  const tasks = useTaskStore((s) => s.tasks);
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
    if (currentFlowId) {
      // Fade out TodayProgress and fade in Flow context when Flow starts
      Animated.parallel([
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
        Animated.timing(flowContextAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentFlowId, flowContextAnim]);

  const customFlows = useFlowStore((state) => state.customFlows);

  // Restore handleFlowSelect function
  const handleFlowSelect = (flowId: string) => {
    startFlow(flowId);
    setIsFlowModalVisible(false);
  };

  // Add handleCreateFlow function
  const handleCreateFlow = () => {
    setIsFlowModalVisible(false);
    // Add a small delay to ensure modal closes before navigation
    setTimeout(() => {
      router.push("/create-flow");
    }, 100);
  };

  // Add handleEditFlow function
  const handleEditFlow = (flowId: string) => {
    setIsFlowModalVisible(false);
    // Add a small delay to ensure modal closes before navigation
    setTimeout(() => {
      router.push(`/create-flow?id=${flowId}`);
    }, 100);
  };

  // --- Tabs/Indicator Animation ---
  useEffect(() => {
    if (currentFlowId || isRunning || isPaused) {
      // Hide tabs (fade/slide up), show indicator (fade/slide in)
      Animated.stagger(60, [
        Animated.parallel([
          Animated.timing(tabsOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(tabsTranslateY, {
            toValue: -24,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(indicatorOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(indicatorScale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(indicatorTranslateY, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Show tabs (fade/slide in), hide indicator (fade/slide down)
      Animated.stagger(60, [
        Animated.parallel([
          Animated.timing(indicatorOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(indicatorScale, {
            toValue: 0.95,
            useNativeDriver: true,
          }),
          Animated.timing(indicatorTranslateY, {
            toValue: 32,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(tabsOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(tabsTranslateY, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [
    currentFlowId,
    isRunning,
    isPaused,
    tabsOpacity,
    indicatorOpacity,
    indicatorScale,
    tabsTranslateY,
    indicatorTranslateY,
  ]);

  // --- Session Controls Animation ---
  useEffect(() => {
    // Only animate if we have a measured height
    if (disappearingUIHeight === 0) return;
    if (currentFlowId || isRunning || isPaused) {
      // Slide session controls down by the height of the entire disappearing UI
      Animated.timing(sessionControlsTranslateY, {
        toValue: disappearingUIHeight,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      // Slide session controls up to original position
      Animated.timing(sessionControlsTranslateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [
    currentFlowId,
    isRunning,
    isPaused,
    disappearingUIHeight,
    sessionControlsTranslateY,
  ]);

  const addJournalEntry = useJournalStore((s) => s.addEntry);

  // Call this when session completes:
  const handleSessionComplete = () => {
    setShowSessionComplete(true);
  };

  const handleReflect = () => {
    setShowSessionComplete(false);
    hideFlowCompletionModal();
    setTimeout(() => setShowReflect(true), 200);
  };

  const handleAddJournal = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    addJournalEntry({
      title,
      blocks: [{ type: "text", content }],
    });
    setShowReflect(false);
    Toast.show({
      type: "reflectionSaveToast",
      text1: "Reflection",
      position: "top",
      topOffset: 60,
    });
  };

  const handleViewInsights = () => {
    setShowInsights(true);
  };

  useEffect(() => {
    console.log(
      "DEBUG: prevIsRunning",
      prevIsRunning.current,
      "isRunning",
      isRunning,
      "prevSessionId",
      prevSessionId.current,
      "currentSessionId",
      currentSessionId,
      "currentFlowId",
      currentFlowId
    );
    if (
      prevIsRunning.current &&
      !isRunning &&
      currentSessionId !== prevSessionId.current &&
      !currentFlowId // Only trigger session completion modal for non-flow sessions
    ) {
      console.log("DEBUG: Triggering SessionCompletionModal");
      handleSessionComplete();
    }
    prevSessionId.current = currentSessionId;
    prevIsRunning.current = isRunning;
  }, [isRunning, currentSessionId, currentFlowId]);

  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: isProgressExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isProgressExpanded]);

  // --- Add Task Button Animation ---
  useEffect(() => {
    if (currentFlowId || isRunning || isPaused) {
      // Animate Add Task button opacity for flow state
      Animated.timing(addTaskOpacity, {
        toValue: 0.8,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate Add Task button opacity for default state
      Animated.timing(addTaskOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [currentFlowId, isRunning, isPaused, addTaskOpacity]);

  return (
    <View className="flex-1 bg-primary pb-20">
      {/* Toast for reflection save */}
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
          {/* Session Type and Flow Selector (original position) */}
          <View className="w-full max-w-md mt-4 mb-4">
            <Animated.View
              style={{
                opacity: tabsOpacity,
                transform: [{ translateY: tabsTranslateY }],
                position: "absolute",
                width: "100%",
                zIndex: 2,
                pointerEvents:
                  currentFlowId || isRunning || isPaused ? "none" : "auto",
              }}
            >
              <View className="flex-row items-center justify-between w-full">
                {/* Session Intelligence Tab */}
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
                        Session Intelligence
                      </Text>
                    </View>
                    <ChevronDown width={16} height={16} color="#2C3E50" />
                  </Pressable>
                </View>
                {/* Flows Tab */}
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
            </Animated.View>
            <Animated.View
              style={{
                opacity: indicatorOpacity,
                transform: [
                  { scale: indicatorScale },
                  { translateY: indicatorTranslateY },
                ],
                width: "100%",
                zIndex: 3,
                position: "absolute",
                pointerEvents:
                  !currentFlowId && !isRunning && !isPaused ? "none" : "auto",
              }}
            >
              {currentFlowId ? (
                <View className="w-full px-4">
                  <FlowIndicator
                    currentFlowId={currentFlowId}
                    currentFlowStep={currentFlowStep}
                    sessionType={sessionType}
                    onPress={() => setShowFlowDetails(true)}
                  />
                </View>
              ) : (
                <View className="w-full px-4">
                  <View className="w-full max-w-md">
                    <SessionIndicator
                      sessionType={sessionType}
                      duration={duration}
                      isRunning={isRunning}
                      isPaused={isPaused}
                      onPress={() => setIsSessionTypeModalVisible(true)}
                    />
                  </View>
                </View>
              )}
            </Animated.View>
          </View>

          {/* Spacer to push content up */}
          <Animated.View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              transform: [
                {
                  translateY: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
              ],
            }}
          >
            {/* Timer Display & Controls with animation */}
            <Animated.View
              style={{
                transform: [{ translateY: sessionControlsTranslateY }],
                width: "100%",
                alignItems: "center",
              }}
            >
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
                      !isRunning &&
                      !isPaused &&
                      !currentFlowId &&
                      setIsTimeModalVisible(true)
                    }
                    activeOpacity={
                      currentFlowId || isRunning || isPaused ? 1 : 0.8
                    }
                    className="items-center"
                  >
                    <Text className="text-text-primary text-7xl font-SoraBold mb-3">
                      {formatTime(duration)}
                    </Text>
                    {!currentFlowId && !isRunning && !isPaused && (
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
                  <StartSessionBtn
                    onStart={handleSessionStart}
                    onPause={pauseSession}
                    onReset={handleSessionEnd}
                  />
                </View>
              </View>

              {/* Add Task Button */}
              <View className="w-full items-center mt-6">
                {/* Outer Animated.View for width (JS driver) */}
                <Animated.View
                  style={{
                    width: currentTask ? 320 : 120,
                    transform: [{ translateY: 65 }],
                    opacity: addTaskOpacity,
                  }}
                >
                  {/* Inner Animated.View for opacity (native driver) */}
                  <Animated.View
                    style={{
                      opacity: addTaskOpacity,
                    }}
                  >
                    {currentTask ? (
                      <TouchableOpacity
                        onPress={() => setIsQuickTaskModalVisible(true)}
                        activeOpacity={0.9}
                        className={`flex-row items-center justify-between rounded-full px-5 py-3 shadow-sm ${
                          currentFlowId
                            ? "bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                        }`}
                        style={{
                          minHeight: 48,
                          shadowColor: currentFlowId ? "#3B82F6" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: currentFlowId ? 0.15 : 0.08,
                          shadowRadius: currentFlowId ? 12 : 8,
                          elevation: currentFlowId ? 6 : 4,
                        }}
                      >
                        <View className="flex-row items-center gap-2 flex-1">
                          {!currentFlowId && (
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
                              <Ionicons
                                name="checkmark"
                                size={18}
                                color="#fff"
                              />
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
                        className={`flex-row items-center justify-center rounded-full px-6 py-3 shadow-sm ${
                          isRunning && !isPaused
                            ? "bg-blue-600 border-2 border-blue-700"
                            : "bg-white dark:bg-gray-800 border border-blue-500"
                        }`}
                        style={{ minHeight: 48 }}
                        activeOpacity={0.85}
                        disabled={isRunning && !isPaused}
                      >
                        {isRunning && !isPaused ? (
                          <>
                            <Ionicons
                              name="lock-closed"
                              size={20}
                              color="#fff"
                            />
                            <Text className="text-white text-base font-SoraSemiBold ml-2">
                              Focus
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="add" size={20} color="#2563EB" />
                            <Text className="text-blue-600 dark:text-blue-400 text-base font-SoraSemiBold ml-2">
                              Add Task
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                </Animated.View>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <View className="w-full rounded-t-3xl px-6 pt-6 pb-8">
          {/* Flow Context Label */}
          {currentFlowId && currentTask && (
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

      <SessionIntelligenceModal
        isVisible={isSessionTypeModalVisible}
        onClose={() => setIsSessionTypeModalVisible(false)}
        onSelectSession={handleSessionSelect}
      />

      {currentFlowId && (
        <FlowDetailsModal
          visible={showFlowDetails}
          onClose={() => setShowFlowDetails(false)}
          flowName={currentFlowId}
          currentStep={currentFlowStep}
        />
      )}

      {/* Quote Modal */}
      {showQuoteModal && <QuoteCard onClose={handleQuoteModalClose} />}

      {/* Flow Completion Modal */}
      {showFlowCompletionModal && flowCompletionData && (
        <FlowCompletionModal
          isVisible={showFlowCompletionModal}
          onClose={() => {}} // Empty function since modal handles its own actions
          data={flowCompletionData}
          onReflect={handleReflect}
          onViewInsights={handleViewInsights}
        />
      )}

      {/* Flow Selection Modal */}
      <FlowsModal
        isVisible={isFlowModalVisible}
        onClose={() => setIsFlowModalVisible(false)}
        onSelectFlow={handleFlowSelect}
        onCreateFlow={handleCreateFlow}
        onEditFlow={handleEditFlow}
      />

      <SessionCompletionModal
        isVisible={showSessionComplete}
        onClose={() => setShowSessionComplete(false)}
        session={{
          taskName: currentTask?.name || "",
          duration: duration || 0,
          streak: currentStreak || 0,
        }}
        onReflect={handleReflect}
        onViewInsights={handleViewInsights}
      />
      <AddJournalModal
        isVisible={showReflect}
        onAdd={handleAddJournal}
        onClose={() => setShowReflect(false)}
      />
      <SessionIntelligenceModal
        isVisible={showInsights}
        onClose={() => setShowInsights(false)}
        onSelectSession={() => setShowInsights(false)}
      />
    </View>
  );
}
