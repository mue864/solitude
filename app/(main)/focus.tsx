import { useTheme } from "@/context/ThemeContext";
import { BUILTIN_FLOWS, useFlowStore } from "@/store/flowStore";
import { useJournalStore } from "@/store/journalStore";
import { useSessionStore, type SessionType } from "@/store/sessionState";
import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

import Streak from "@/assets/svg/streak.svg";
import { FlowDetailsModal } from "@/components/FlowIndicator";
import StartSessionBtn from "@/components/StartSessionBtn";
import AddJournalModal from "@/components/modals/AddJournalModal";
import ChangeSessionTimeCard from "@/components/modals/ChangeSessionTimeCard";
import FlowCompletionModal from "@/components/modals/FlowCompletionModal";
import FlowsModal from "@/components/modals/FlowsModal";
import QuickTaskModal from "@/components/modals/QuickTaskModal";
import QuoteCard from "@/components/modals/QuoteCard";
import SessionCompletionModal from "@/components/modals/SessionCompletionModal";
import SessionIntelligenceModal from "@/components/modals/SessionIntelligenceModal";
import { useNotifications } from "@/hooks/useNotifications";

// ---------------------------------------------------------------------------
// Session metadata
// ---------------------------------------------------------------------------
const SESSION_META: Record<SessionType, { icon: string; label: string }> = {
  Classic: { icon: "timer-outline", label: "Classic" },
  "Deep Focus": { icon: "eye-outline", label: "Deep Focus" },
  "Quick Task": { icon: "flash-outline", label: "Quick Task" },
  "Creative Time": { icon: "color-palette-outline", label: "Creative" },
  "Review Mode": { icon: "document-text-outline", label: "Review" },
  "Course Time": { icon: "school-outline", label: "Course" },
  "Short Break": { icon: "cafe-outline", label: "Short Break" },
  "Long Break": { icon: "leaf-outline", label: "Long Break" },
  "Reset Session": { icon: "refresh-outline", label: "Reset" },
  "Mindful Moment": { icon: "moon-outline", label: "Mindful" },
};

const SESSION_CHIP_ORDER: SessionType[] = [
  "Classic",
  "Deep Focus",
  "Quick Task",
  "Creative Time",
  "Review Mode",
  "Short Break",
  "Mindful Moment",
];

function getSessionBg(type: SessionType, isDarkMode: boolean): string {
  const breakTypes: SessionType[] = [
    "Short Break",
    "Long Break",
    "Mindful Moment",
    "Reset Session",
  ];
  const creativeTypes: SessionType[] = ["Creative Time"];
  const deepTypes: SessionType[] = ["Deep Focus", "Course Time"];
  if (breakTypes.includes(type)) return isDarkMode ? "#1A1408" : "#FDF8EE";
  if (creativeTypes.includes(type)) return isDarkMode ? "#150D1A" : "#F5EEF8";
  if (deepTypes.includes(type)) return isDarkMode ? "#0D1520" : "#EEF3FA";
  return isDarkMode ? "#111318" : "#FAF8F5";
}

function taskTagColor(tag: string | null | undefined): string {
  switch (tag) {
    case "urgent":
      return "#E05A5A";
    case "important":
      return "#E8A43A";
    case "quickwin":
      return "#4CAF7D";
    case "deepwork":
      return "#5B8DEF";
    default:
      return "#8A8A96";
  }
}

// ---------------------------------------------------------------------------
// Focus screen
// ---------------------------------------------------------------------------
export default function Focus() {
  const router = useRouter();
  const notifications = useNotifications();
  const { colors, isDarkMode } = useTheme();

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [isQuickTaskModalVisible, setIsQuickTaskModalVisible] = useState(false);
  const [isSessionTypeModalVisible, setIsSessionTypeModalVisible] =
    useState(false);
  const [isFlowModalVisible, setIsFlowModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [showReflect, setShowReflect] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showFlowDetails, setShowFlowDetails] = useState(false);

  // ── Session store ─────────────────────────────────────────────────────────
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

  const currentSessionId = useSessionStore((s) => s.sessionId);
  const durationMinutes = Math.floor(duration / 60);

  // ── Task store ────────────────────────────────────────────────────────────
  const currentTaskId = useTaskStore((s) => s.currentTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const clearCurrentTask = useTaskStore((s) => s.clearCurrentTask);
  const completeCurrentTask = useTaskStore((s) => s.completeCurrentTask);
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  // ── Journal store ─────────────────────────────────────────────────────────
  const addJournalEntry = useJournalStore((s) => s.addEntry);

  // ── Flow store (for progress bar) ─────────────────────────────────────────
  const customFlows = useFlowStore((s) => s.customFlows);

  const currentFlowSteps = useMemo(() => {
    if (!currentFlowId) return 0;
    const builtin = BUILTIN_FLOWS.find((f) => f.id === currentFlowId);
    if (builtin) return builtin.steps.length;
    return customFlows.find((f) => f.id === currentFlowId)?.steps.length ?? 0;
  }, [currentFlowId, customFlows]);

  const flowProgress =
    currentFlowSteps > 0 ? (currentFlowStep + 1) / currentFlowSteps : 0;

  // ── Refs ──────────────────────────────────────────────────────────────────
  const lastSessionId = useRef<string | null>(null);
  const lastFlowContext = useRef<{
    flow: string | null;
    step: number;
    lastQuoteTime: number;
  }>({ flow: null, step: -1, lastQuoteTime: 0 });
  const prevSessionId = useRef(currentSessionId);
  const prevIsRunning = useRef(isRunning);

  // ── Animations ────────────────────────────────────────────────────────────
  const isActive = isRunning || isPaused;

  const idleOpacity = useSharedValue(isActive ? 0 : 1);
  const idleTranslateY = useSharedValue(isActive ? -14 : 0);
  const activeOpacity = useSharedValue(isActive ? 1 : 0);
  const timerScale = useSharedValue(isActive ? 1.08 : 1);
  const timerAreaOpacity = useSharedValue(1);

  useEffect(() => {
    const toActive = isRunning || isPaused;
    if (toActive) {
      // idle out first, then active in
      idleOpacity.value = withTiming(0, { duration: 160 });
      idleTranslateY.value = withTiming(-14, { duration: 160 });
      activeOpacity.value = withDelay(140, withTiming(1, { duration: 220 }));
    } else {
      // active out first, then idle in
      activeOpacity.value = withTiming(0, { duration: 160 });
      idleOpacity.value = withDelay(140, withTiming(1, { duration: 220 }));
      idleTranslateY.value = withDelay(140, withTiming(0, { duration: 220 }));
    }
    timerScale.value = withSpring(toActive ? 1.08 : 1, {
      damping: 20,
      stiffness: 120,
    });
  }, [isRunning, isPaused]);

  const prevSessionType = useRef<SessionType>(sessionType);
  useEffect(() => {
    if (prevSessionType.current === sessionType) return;
    prevSessionType.current = sessionType;
    // pure fade: out then in
    timerAreaOpacity.value = withSequence(
      withTiming(0, { duration: 110 }),
      withTiming(1, { duration: 190 }),
    );
  }, [sessionType]);

  const idleStyle = useAnimatedStyle(() => ({
    opacity: idleOpacity.value,
    transform: [{ translateY: idleTranslateY.value }],
  }));

  const activeControlStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
  }));

  const idleControlStyle = useAnimatedStyle(() => ({
    opacity: idleOpacity.value,
  }));

  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const timerAreaStyle = useAnimatedStyle(() => ({
    opacity: timerAreaOpacity.value,
  }));

  // ── Quote logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning || !currentSessionId) return;
    const now = Date.now();
    const shouldShowQuote = () => {
      if (now - lastFlowContext.current.lastQuoteTime < 5 * 60 * 1000)
        return false;
      return (
        currentFlowId !== lastFlowContext.current.flow ||
        now - lastFlowContext.current.lastQuoteTime > 12 * 60 * 60 * 1000 ||
        (lastFlowContext.current.flow && !currentFlowId)
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
        const t1 = setTimeout(() => {
          setShowQuoteModal(true);
          const t2 = setTimeout(() => setShowQuoteModal(false), 3000);
          return () => clearTimeout(t2);
        }, 100);
        return () => clearTimeout(t1);
      } else {
        lastFlowContext.current = {
          ...lastFlowContext.current,
          flow: currentFlowId,
          step: currentFlowStep,
        };
      }
    }
  }, [isRunning, currentSessionId, currentFlowId, currentFlowStep]);

  const handleQuoteModalClose = useCallback(() => setShowQuoteModal(false), []);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await notifications.initialize();
        const pendingAction = await AsyncStorage.getItem("pendingAction");
        if (pendingAction) {
          switch (pendingAction) {
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
      } catch (_) {}
    };
    init();
  }, []);

  useEffect(() => {
    if (!isRunning && !isPaused) {
      notifications.updateSessionState(false, false);
    } else if (isRunning) {
      notifications.updateSessionState(true, false);
    }
  }, [isRunning, isPaused, isNewSession]);

  useEffect(() => {
    if (isRunning && isNewSession) {
      const mins = Math.floor(duration / 60);
      notifications.showSessionStartNotification(sessionType, mins);
      notifications.scheduleSessionEndNotification(sessionType, mins);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isNewSession]);

  // ── Session completion tracking ───────────────────────────────────────────
  useEffect(() => {
    if (
      prevIsRunning.current &&
      !isRunning &&
      currentSessionId !== prevSessionId.current &&
      !currentFlowId &&
      !showFlowCompletionModal
    ) {
      setShowSessionComplete(true);
    }
    prevSessionId.current = currentSessionId;
    prevIsRunning.current = isRunning;
  }, [isRunning, currentSessionId, currentFlowId, showFlowCompletionModal]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSessionStart = async () => {
    resumeSession();
  };

  const handleSessionEnd = async () => {
    await notifications.cancelAllNotifications();
    await notifications.showStreakMilestoneNotification(currentStreak);
    reset();
  };

  const handleSessionSelect = (type: SessionType) => {
    setSessionType(type);
    setIsSessionTypeModalVisible(false);
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
    addJournalEntry({ title, blocks: [{ type: "text", content }] });
    setShowReflect(false);
    Toast.show({
      type: "reflectionSaveToast",
      text1: "Reflection",
      position: "top",
      topOffset: 60,
    });
  };

  const handleFlowSelect = (flowId: string) => {
    startFlow(flowId);
    setIsFlowModalVisible(false);
  };

  const handleCreateFlow = () => {
    setIsFlowModalVisible(false);
    setTimeout(() => router.push("/create-flow"), 100);
  };

  const handleEditFlow = (flowId: string) => {
    setIsFlowModalVisible(false);
    setTimeout(() => router.push(`/create-flow?id=${flowId}`), 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const bgColor = isActive
    ? getSessionBg(sessionType, isDarkMode)
    : colors.background;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Flow progress bar */}
      <View style={styles.progressTrack}>
        {currentFlowId && (
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
                width: `${Math.round(flowProgress * 100)}%`,
              },
            ]}
          />
        )}
      </View>

      {/* Header — idle only */}
      <Animated.View
        style={[styles.header, idleStyle]}
        pointerEvents={isActive ? "none" : "auto"}
      >
        <View
          style={[
            styles.streakChip,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
            },
          ]}
        >
          <Streak width={14} height={14} />
          <Text style={[styles.streakText, { color: colors.textSecondary }]}>
            {currentStreak}d streak
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsFlowModalVisible(true)}
          style={[
            styles.flowsChip,
            {
              backgroundColor: colors.accentMuted,
              borderColor: colors.accent + "60",
            },
          ]}
        >
          <Text style={[styles.flowsChipText, { color: colors.accent }]}>
            Flows
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Timer */}
      <Animated.View style={[styles.timerArea, timerAreaStyle]}>
        <View style={styles.sessionLabelRow}>
          <Ionicons
            name={SESSION_META[sessionType]?.icon as any}
            size={13}
            color={colors.textSecondary}
          />
          <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
            {SESSION_META[sessionType]?.label}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            !isRunning && !isPaused && !currentFlowId
              ? setIsTimeModalVisible(true)
              : null
          }
          activeOpacity={isRunning || isPaused ? 1 : 0.7}
        >
          <Animated.View style={timerStyle}>
            <Text style={[styles.timer, { color: colors.textPrimary }]}>
              {formatTime(duration)}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        <Animated.View style={idleStyle} pointerEvents="none">
          <Text style={[styles.durationHint, { color: colors.textSecondary }]}>
            {durationMinutes} min · tap to adjust
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controlsWrap}>
        {/* IDLE */}
        <Animated.View
          style={[styles.controls, idleControlStyle]}
          pointerEvents={isActive ? "none" : "auto"}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {SESSION_CHIP_ORDER.map((type) => {
              const sel = sessionType === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSessionType(type)}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: sel ? colors.accentMuted : "transparent",
                      borderColor: sel
                        ? colors.accent + "40"
                        : colors.border + "60",
                    },
                  ]}
                >
                  <Ionicons
                    name={SESSION_META[type].icon as any}
                    size={13}
                    color={sel ? colors.accent : colors.textSecondary}
                    style={!sel ? { opacity: 0.55 } : undefined}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: sel ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {SESSION_META[type].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {currentTask ? (
            <TouchableOpacity
              onPress={() => setIsQuickTaskModalVisible(true)}
              style={[
                styles.taskStrip,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: taskTagColor(currentTask.tag) },
                ]}
              />
              <Text
                style={[styles.taskName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {currentTask.name}
              </Text>
              <TouchableOpacity onPress={clearCurrentTask} hitSlop={10}>
                <Ionicons name="close" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsQuickTaskModalVisible(true)}
              style={[styles.addTaskBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="add" size={16} color={colors.textSecondary} />
              <Text
                style={[styles.addTaskText, { color: colors.textSecondary }]}
              >
                Add task
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.startWrap}>
            <StartSessionBtn
              onStart={handleSessionStart}
              onPause={pauseSession}
              onReset={handleSessionEnd}
            />
          </View>

          <TouchableOpacity
            onPress={() => setIsSessionTypeModalVisible(true)}
            style={styles.intelLink}
          >
            <Text
              style={[styles.intelLinkText, { color: colors.textSecondary }]}
            >
              ✦ Session Intelligence
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ACTIVE */}
        <Animated.View
          style={[styles.controls, styles.activeControls, activeControlStyle]}
          pointerEvents={!isActive ? "none" : "auto"}
        >
          <View style={styles.activeBtnRow}>
            <TouchableOpacity
              onPress={isPaused ? handleSessionStart : pauseSession}
              style={[
                styles.activeBtn,
                styles.activeBtnPrimary,
                { backgroundColor: colors.accent },
              ]}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={20}
                color="#fff"
              />
              <Text style={styles.activeBtnLabel}>
                {isPaused ? "Resume" : "Pause"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSessionEnd}
              style={[
                styles.activeBtn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons name="stop" size={20} color={colors.textSecondary} />
              <Text
                style={[styles.activeBtnMuted, { color: colors.textSecondary }]}
              >
                Stop
              </Text>
            </TouchableOpacity>
          </View>

          {currentTask && (
            <View
              style={[styles.activeTaskRow, { borderTopColor: colors.border }]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: taskTagColor(currentTask.tag) },
                ]}
              />
              <Text
                style={[styles.taskName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {currentTask.name}
              </Text>
              <TouchableOpacity onPress={completeCurrentTask} hitSlop={10}>
                <Ionicons name="checkmark" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
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
      {showQuoteModal && <QuoteCard onClose={handleQuoteModalClose} />}
      {showFlowCompletionModal && flowCompletionData && (
        <FlowCompletionModal
          isVisible={showFlowCompletionModal}
          onClose={() => {}}
          data={flowCompletionData}
          onReflect={handleReflect}
          onViewInsights={() => setShowInsights(true)}
        />
      )}
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
        onViewInsights={() => setShowInsights(true)}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  progressTrack: { height: 4, width: "100%" },
  progressFill: { height: 4, borderRadius: 2 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  streakChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: { fontSize: 12, fontFamily: "SoraSemiBold" },
  flowsChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  flowsChipText: { fontSize: 12, fontFamily: "SoraSemiBold" },
  timerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sessionLabel: {
    fontSize: 15,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.4,
  },
  timer: {
    fontSize: 88,
    fontFamily: "SoraBold",
    letterSpacing: -3,
    includeFontPadding: false,
    lineHeight: 96,
    textAlign: "center",
  },
  durationHint: {
    fontSize: 13,
    fontFamily: "Sora",
    marginTop: 12,
    letterSpacing: 0.2,
  },
  controlsWrap: { height: 250, marginBottom: 104 },
  controls: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 14,
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  activeControls: { justifyContent: "center" },
  chipRow: { gap: 6, alignItems: "center", paddingHorizontal: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sessionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 16,
    justifyContent: "center",
    textAlign: "center",
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: "Sora",
    letterSpacing: 0.1,
  },
  taskStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  taskName: { flex: 1, fontSize: 14, fontFamily: "SoraSemiBold" },
  addTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    opacity: 0.85,
  },
  addTaskText: { fontSize: 12, fontFamily: "Sora" },
  startWrap: { width: "100%", maxWidth: 280, marginTop: 2 },
  intelLink: { paddingVertical: 4 },
  intelLinkText: { fontSize: 13, fontFamily: "Sora", letterSpacing: 0.3 },
  activeBtnRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 8,
  },
  activeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 32,
    minWidth: 130,
    justifyContent: "center",
  },
  activeBtnPrimary: {},
  activeBtnLabel: { color: "#fff", fontSize: 15, fontFamily: "SoraSemiBold" },
  activeBtnMuted: { fontSize: 15, fontFamily: "SoraSemiBold" },
  activeTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
