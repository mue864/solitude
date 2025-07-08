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
import TodayProgress from "@/components/TodayProgress";

// Store
import FlowIndicator, { FlowDetailsModal } from "@/components/FlowIndicator";
import AddJournalModal from "@/components/modals/AddJournalModal";
import FlowsModal from "@/components/modals/FlowsModal";
import SessionCompletionModal from "@/components/modals/SessionCompletionModal";
import SessionIndicator from "@/components/SessionIndicator";
import { useFlowStore } from "@/store/flowStore";
import { useJournalStore } from "@/store/journalStore";
import { useSessionStore, type SessionType } from "@/store/sessionState";
import Toast from "react-native-toast-message";

export default function Focus() {
  const router = useRouter();
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
  const todayProgressAnim = useRef(new Animated.Value(1)).current;
  const flowContextAnim = useRef(new Animated.Value(0)).current;

  // Animation for tabs/indicator crossfade and scale
  const tabsOpacity = useRef(new Animated.Value(1)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(0.95)).current;

  // Animation for Add Task button
  const addTaskTranslateY = useRef(new Animated.Value(0)).current;
  const addTaskOpacity = useRef(new Animated.Value(1)).current;

  // Add new animated values for translateY
  const tabsTranslateY = useRef(new Animated.Value(0)).current;
  const indicatorTranslateY = useRef(new Animated.Value(32)).current;
  const todayProgressTranslateY = useRef(new Animated.Value(0)).current;

  // --- State for disappearing UI height ---
  const [disappearingUIHeight, setDisappearingUIHeight] = useState(0);

  // --- Animation values ---
  const sessionControlsTranslateY = useRef(new Animated.Value(0)).current;

  // NEW: Animation for progress expansion spacing
  const progressSpacingAnim = useRef(new Animated.Value(0)).current;

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
  }, [currentFlowId, todayProgressAnim, flowContextAnim]);

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

  // --- TodayProgress & Add Task Animation ---
  useEffect(() => {
    if (currentFlowId || isRunning || isPaused) {
      // TodayProgress: fade/scale/slide up, then Add Task: slide down to TodayProgress position
      Animated.sequence([
        Animated.parallel([
          Animated.timing(todayProgressAnim, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(todayProgressTranslateY, {
            toValue: -24,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(addTaskTranslateY, {
            toValue: 100, // Slide down to where TodayProgress was
            useNativeDriver: true,
          }),
          Animated.timing(addTaskOpacity, {
            toValue: 0.8,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Add Task: slide back up to original position, then TodayProgress: fade/scale/slide in (slide up from below)
      todayProgressTranslateY.setValue(40); // Start 40px below
      todayProgressAnim.setValue(0); // Start fully transparent/hidden
      Animated.sequence([
        Animated.parallel([
          Animated.spring(addTaskTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(addTaskOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(todayProgressAnim, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(todayProgressTranslateY, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [
    currentFlowId,
    isRunning,
    isPaused,
    todayProgressAnim,
    todayProgressTranslateY,
    addTaskTranslateY,
    addTaskOpacity,
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

  const addJournal = useJournalStore((s) => s.addEntry);

  // Call this when session completes:
  const handleSessionComplete = () => {
    setShowSessionComplete(true);
  };

  const handleReflect = () => {
    setShowSessionComplete(false);
    setTimeout(() => setShowReflect(true), 200);
  };

  const handleAddJournal = ({
    title,
    content,
  }: {
    title: string;
    content: string;
  }) => {
    addJournal({ title, content });
    setShowReflect(false);
    setShowSessionComplete(false);
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
      currentSessionId
    );
    if (
      prevIsRunning.current &&
      !isRunning &&
      currentSessionId !== prevSessionId.current
    ) {
      console.log("DEBUG: Triggering SessionCompletionModal");
      handleSessionComplete();
    }
    prevSessionId.current = currentSessionId;
    prevIsRunning.current = isRunning;
  }, [isRunning, currentSessionId]);

  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // NEW: Animate progress expansion spacing
  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: isProgressExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      // Animate the spacing between progress and session controls
      Animated.timing(progressSpacingAnim, {
        toValue: isProgressExpanded ? -150 : 0, // Adjust this value based on your expanded card height
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isProgressExpanded, progressAnim, progressSpacingAnim]);

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
                // NEW: Add the progress spacing animation
                { translateY: progressSpacingAnim },
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
                    onStart={resumeSession}
                    onPause={pauseSession}
                    onReset={reset}
                  />
                </View>
              </View>

              {/* Add Task Button */}
              <View className="w-full items-center mt-6">
                {/* Outer Animated.View for width (JS driver) */}
                <Animated.View
                  style={{
                    width: cardWidth,
                  }}
                >
                  {/* Inner Animated.View for transform/opacity (native driver) */}
                  <Animated.View
                    style={{
                      transform: [{ translateY: addTaskTranslateY }],
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