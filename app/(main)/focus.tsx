import { useTheme } from "@/context/ThemeContext";
import { BUILTIN_FLOWS, useFlowStore } from "@/store/flowStore";
import { useJournalStore } from "@/store/journalStore";
import { useSessionStore, type SessionType } from "@/store/sessionState";
import { useSettingsStore } from "@/store/settingsStore";
import { useTaskStore } from "@/store/taskStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AppState,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
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
import SessionTaskPickerModal from "@/components/modals/SessionTaskPickerModal";
import FocusSoundSheet from "@/components/modals/FocusSoundSheet";
import { useNotifications } from "@/hooks/useNotifications";
import { focusAudioService } from "@/services/focusAudioService";
import { useFocusAudioStore } from "@/store/focusAudioStore";

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

// Premium easing curves
const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_IN = Easing.bezier(0.55, 0, 0.6, 0.2);

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
// Sound playing indicator
// ---------------------------------------------------------------------------
function SoundBars({
  isRunning,
  color,
}: {
  isRunning: boolean;
  color: string;
}) {
  const h1 = useSharedValue(8);
  const h2 = useSharedValue(20);
  const h3 = useSharedValue(12);
  const h4 = useSharedValue(24);
  const h5 = useSharedValue(6);

  useEffect(() => {
    if (isRunning) {
      h1.value = withRepeat(
        withSequence(
          withTiming(14, { duration: 460 }),
          withTiming(4, { duration: 460 }),
        ),
        -1,
        true,
      );
      h2.value = withRepeat(
        withSequence(
          withTiming(26, { duration: 310 }),
          withTiming(4, { duration: 310 }),
        ),
        -1,
        true,
      );
      h3.value = withRepeat(
        withSequence(
          withTiming(18, { duration: 380 }),
          withTiming(4, { duration: 380 }),
        ),
        -1,
        true,
      );
      h4.value = withRepeat(
        withSequence(
          withTiming(22, { duration: 340 }),
          withTiming(4, { duration: 340 }),
        ),
        -1,
        true,
      );
      h5.value = withRepeat(
        withSequence(
          withTiming(12, { duration: 500 }),
          withTiming(4, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      h1.value = withTiming(4, { duration: 350 });
      h2.value = withTiming(4, { duration: 350 });
      h3.value = withTiming(4, { duration: 350 });
      h4.value = withTiming(4, { duration: 350 });
      h5.value = withTiming(4, { duration: 350 });
    }
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const s1 = useAnimatedStyle(() => ({ height: h1.value }));
  const s2 = useAnimatedStyle(() => ({ height: h2.value }));
  const s3 = useAnimatedStyle(() => ({ height: h3.value }));
  const s4 = useAnimatedStyle(() => ({ height: h4.value }));
  const s5 = useAnimatedStyle(() => ({ height: h5.value }));

  const bar = { width: 3, borderRadius: 2, backgroundColor: color };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 4,
        height: 30,
      }}
    >
      <Animated.View style={[bar, s1]} />
      <Animated.View style={[bar, s2]} />
      <Animated.View style={[bar, s3]} />
      <Animated.View style={[bar, s4]} />
      <Animated.View style={[bar, s5]} />
    </View>
  );
}

function SoundPlayingIndicator({
  trackName,
  category,
  isRunning,
  colors,
}: {
  trackName: string;
  category?: string;
  isRunning: boolean;
  colors: ReturnType<
    typeof import("@/context/ThemeContext").useTheme
  >["colors"];
}) {
  return (
    <View style={{ alignItems: "center", marginBottom: 30, gap: 10 }}>
      <SoundBars isRunning={isRunning} color={colors.accent} />
      <Text
        style={{
          fontSize: 15,
          fontFamily: "SoraSemiBold",
          color: colors.textPrimary,
          letterSpacing: 0.2,
        }}
      >
        {trackName}
      </Text>
      {category && (
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Sora",
            color: colors.textSecondary,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            opacity: 0.6,
            marginTop: -4,
          }}
        >
          {category}
        </Text>
      )}
    </View>
  );
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
  const [isTaskPickerVisible, setIsTaskPickerVisible] = useState(false);
  const [isSessionTypeModalVisible, setIsSessionTypeModalVisible] =
    useState(false);
  const [isFlowModalVisible, setIsFlowModalVisible] = useState(false);
  const [isSoundSheetVisible, setIsSoundSheetVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [showReflect, setShowReflect] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showFlowDetails, setShowFlowDetails] = useState(false);
  const [lastSessionContext, setLastSessionContext] = useState<{
    sessionType: string;
    durationSeconds: number;
    tasksCompleted: number;
  } | null>(null);

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
  const sessionTasks = useSessionStore((s) => s.sessionTasks);
  const sessionTaskTargets = useSessionStore((s) => s.sessionTaskTargets);
  const sessionInitialDuration = useSessionStore(
    (s) => s.sessionInitialDuration,
  );
  const completeSessionTask = useSessionStore((s) => s.completeSessionTask);
  const durationMinutes = Math.floor(duration / 60);

  // ── Settings ──────────────────────────────────────────────────────────────
  const autoStartNext = useSettingsStore((s) => s.autoStartNext);
  const breakReminderEnabled = useSettingsStore(
    (s) => s.notifications.breakReminder,
  );
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const isPro = useSettingsStore((s) => s.isPro);
  const strictMode = useSettingsStore((s) => s.strictMode);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);

  // ── Task store ────────────────────────────────────────────────────────────
  const currentTaskId = useTaskStore((s) => s.currentTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const clearCurrentTask = useTaskStore((s) => s.clearCurrentTask);
  const completeCurrentTask = useTaskStore((s) => s.completeCurrentTask);
  const currentTask = tasks.find((t) => t.id === currentTaskId);

  // Staged session tasks (resolved objects, filter out any deleted)
  const PRIORITY_ORDER: Record<string, number> = {
    urgent: 0,
    important: 1,
    deepwork: 2,
    quickwin: 3,
  };
  const stagedTasks = sessionTasks
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean)
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a!.tag ?? ""] ?? 4) -
        (PRIORITY_ORDER[b!.tag ?? ""] ?? 4),
    ) as typeof tasks;
  const stagedCompletedCount = stagedTasks.filter((t) => t.completed).length;

  // ── Journal store ─────────────────────────────────────────────────────────
  const addJournalEntry = useJournalStore((s) => s.addEntry);
  const focusAudioCatalog = useFocusAudioStore((s) => s.catalog);
  const focusAudioCache = useFocusAudioStore((s) => s.cache);
  const preferredTrackId = useFocusAudioStore((s) => s.preferredTrackId);
  const setPreferredTrackId = useFocusAudioStore((s) => s.setPreferredTrackId);

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
  const quoteHalfwayShown = useRef(false);
  const prevSessionId = useRef(currentSessionId);
  const prevIsRunning = useRef(isRunning);
  const focusSoundRef = useRef<Audio.Sound | null>(null);

  // ── Animations ────────────────────────────────────────────────────────────
  const isActive = isRunning || isPaused;

  // ── Per-task timers ───────────────────────────────────────────────────────
  // duration counts DOWN, so elapsed = sessionInitialDuration - currentDuration
  const sessionStartDurationRef = useRef<number>(
    isActive ? sessionInitialDuration : 0,
  );
  const [taskCompletedAt, setTaskCompletedAt] = useState<
    Record<string, number>
  >({});
  const prevIsActiveRef = useRef(isActive);
  const warnedRef = useRef<Set<string>>(new Set());
  const overdueRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isActive && !prevIsActiveRef.current) {
      // Fresh session start: capture initial duration and reset all task timer state
      sessionStartDurationRef.current = sessionInitialDuration;
      setTaskCompletedAt({});
      warnedRef.current = new Set();
      overdueRef.current = new Set();
    }
    prevIsActiveRef.current = isActive;
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const sessionElapsed = isActive
    ? Math.max(0, sessionStartDurationRef.current - duration)
    : 0;

  // Threshold vibrations: 60s warning + overtime pulse per task
  useEffect(() => {
    if (!isRunning) return;
    stagedTasks.forEach((task) => {
      const target = sessionTaskTargets[task.id];
      if (!target || task.completed) return;
      const remaining = target - sessionElapsed;
      if (remaining <= 60 && remaining > 0 && !warnedRef.current.has(task.id)) {
        warnedRef.current.add(task.id);
        Vibration.vibrate(80);
      }
      if (remaining <= 0 && !overdueRef.current.has(task.id)) {
        overdueRef.current.add(task.id);
        Vibration.vibrate([0, 80, 80, 80]);
      }
    });
  }, [sessionElapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  const idleOpacity = useSharedValue(isActive ? 0 : 1);
  const idleTranslateY = useSharedValue(isActive ? -14 : 0);
  const activeOpacity = useSharedValue(isActive ? 1 : 0);
  const timerScale = useSharedValue(isActive ? 1.08 : 1);
  const timerAreaOpacity = useSharedValue(1);
  const timerAreaTranslateY = useSharedValue(0);

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
    // Premium cross-fade: gentle ease-in out, then ease-out in with subtle lift
    timerAreaOpacity.value = withSequence(
      withTiming(0, { duration: 220, easing: EASE_IN }),
      withTiming(1, { duration: 340, easing: EASE_OUT }),
    );
    timerAreaTranslateY.value = withSequence(
      withTiming(-6, { duration: 220, easing: EASE_IN }),
      withTiming(0, { duration: 340, easing: EASE_OUT }),
    );
  }, [sessionType]); // eslint-disable-line react-hooks/exhaustive-deps

  const soundIndicatorStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
  }));

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleStrictModeTap = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    if (vibrationEnabled) Vibration.vibrate([0, 40, 30, 40]);
  };

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
    transform: [{ translateY: timerAreaTranslateY.value }],
  }));

  // ── Quote logic ───────────────────────────────────────────────────────────
  // Trigger 1: show on every new session start
  useEffect(() => {
    if (!isRunning || !currentSessionId) return;
    if (currentSessionId === lastSessionId.current) return;
    lastSessionId.current = currentSessionId;
    quoteHalfwayShown.current = false;
    const t = setTimeout(() => setShowQuoteModal(true), 1500);
    return () => clearTimeout(t);
  }, [isRunning, currentSessionId]);

  // Trigger 2: show once when timer crosses the halfway point
  useEffect(() => {
    if (!isRunning || !sessionInitialDuration || quoteHalfwayShown.current)
      return;
    if (duration <= sessionInitialDuration / 2) {
      quoteHalfwayShown.current = true;
      setShowQuoteModal(true);
    }
  }, [duration, isRunning, sessionInitialDuration]);

  const handleQuoteModalClose = useCallback(() => setShowQuoteModal(false), []);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const hydrateFocusAudio = async () => {
      const catalog = await focusAudioService.syncCatalog();
      if (cancelled) return;

      const selectedTrackId = preferredTrackId || catalog[0]?.id || null;
      if (selectedTrackId && !preferredTrackId) {
        setPreferredTrackId(selectedTrackId);
      }
      if (!selectedTrackId) return;

      await focusAudioService.ensureTrackDownloaded(selectedTrackId);
    };

    hydrateFocusAudio();

    return () => {
      cancelled = true;
    };
  }, [preferredTrackId, setPreferredTrackId]);

  useEffect(() => {
    let cancelled = false;

    const stopFocusTrack = async () => {
      if (focusSoundRef.current) {
        try {
          await focusSoundRef.current.unloadAsync();
        } catch {}
        focusSoundRef.current = null;
      }
    };

    const maybePlayFocusTrack = async () => {
      if (!isRunning || isPaused || !soundEnabled || !preferredTrackId) {
        await stopFocusTrack();
        return;
      }

      const localUri = await focusAudioService.getPlayableUri(preferredTrackId);
      if (cancelled || !localUri) {
        return;
      }

      try {
        await stopFocusTrack();
        const { sound } = await Audio.Sound.createAsync(
          { uri: localUri },
          { isLooping: true, shouldPlay: true, volume: 0.5 },
        );
        if (cancelled) {
          await sound.unloadAsync();
          return;
        }
        focusSoundRef.current = sound;
      } catch {
        // Ignore playback failures and leave ambient audio disabled for this run.
      }
    };

    maybePlayFocusTrack();

    return () => {
      cancelled = true;
      void stopFocusTrack();
    };
  }, [isRunning, isPaused, soundEnabled, preferredTrackId]);

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
      notifications.scheduleSessionEndNotification(sessionType, mins);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isNewSession]);

  // ── Background session notification ───────────────────────────────────────
  // Shows a persistent (non-dismissible) notification only while minimized
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "background" && isRunning) {
          await notifications.showBackgroundSessionNotification(
            sessionType,
            duration,
          );
        } else if (nextState === "active") {
          await notifications.cancelBackgroundSessionNotification();
        }
      },
    );
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, sessionType]);

  // ── Session completion tracking ───────────────────────────────────────────
  useEffect(() => {
    if (
      prevIsRunning.current &&
      !isRunning &&
      currentSessionId !== prevSessionId.current &&
      !currentFlowId &&
      !showFlowCompletionModal
    ) {
      setLastSessionContext({
        sessionType,
        durationSeconds: sessionInitialDuration,
        tasksCompleted: stagedCompletedCount,
      });
      // Schedule a break reminder ~2 min after a focus session ends (not for breaks)
      const BREAK_TYPES = [
        "Short Break",
        "Long Break",
        "Mindful Moment",
        "Reset Session",
      ];
      if (breakReminderEnabled && !BREAK_TYPES.includes(sessionType)) {
        notifications.scheduleBreakReminder(2 * 60);
      }
      if (autoStartNext) {
        // Skip the completion modal and immediately restart the same session type
        setTimeout(() => resumeSession(), 400);
      } else {
        setShowSessionComplete(true);
      }
    }
    prevSessionId.current = currentSessionId;
    prevIsRunning.current = isRunning;
  }, [isRunning, currentSessionId, currentFlowId, showFlowCompletionModal]); // eslint-disable-line react-hooks/exhaustive-deps

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
    mood,
    sessionContext,
  }: {
    title: string;
    content: string;
    mood?: import("@/store/journalStore").JournalMood;
    sessionContext?: import("@/store/journalStore").JournalSessionContext;
  }) => {
    addJournalEntry({
      title,
      blocks: [{ type: "text", content }],
      mood,
      sessionContext,
    });
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

  const handleSelectFocusTrack = (trackId: string) => {
    setPreferredTrackId(trackId);
    setIsSoundSheetVisible(false);
    void focusAudioService.ensureTrackDownloaded(trackId);
  };

  const handleSelectNoSound = () => {
    setPreferredTrackId(null);
    setIsSoundSheetVisible(false);
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

  const formatTaskTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const bgColor = isActive
    ? getSessionBg(sessionType, isDarkMode)
    : colors.background;
  const selectedTrackCacheStatus = preferredTrackId
    ? focusAudioCache[preferredTrackId]?.status
    : null;
  const hasSelectedFocusTrack = Boolean(preferredTrackId);
  const isSelectedTrackReady = selectedTrackCacheStatus === "ready";
  const selectedTrack = preferredTrackId
    ? focusAudioCatalog.find((t) => t.id === preferredTrackId)
    : null;

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
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsSoundSheetVisible(true)}
            style={[
              styles.soundChip,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="headset-outline"
              size={14}
              color={
                hasSelectedFocusTrack && soundEnabled
                  ? colors.accent
                  : colors.textSecondary
              }
            />
            {hasSelectedFocusTrack && (
              <View
                style={[
                  styles.soundChipBadge,
                  {
                    backgroundColor: isSelectedTrackReady
                      ? colors.accent
                      : "#E8A43A",
                  },
                ]}
              />
            )}
          </TouchableOpacity>
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
        </View>
      </Animated.View>

      {/* Timer */}
      <Animated.View style={[styles.timerArea, timerAreaStyle]}>
        {/* Sound playing indicator — active sessions only */}
        {isActive && selectedTrack && soundEnabled && (
          <Animated.View style={soundIndicatorStyle} pointerEvents="none">
            <SoundPlayingIndicator
              trackName={selectedTrack.name}
              category={selectedTrack.category}
              isRunning={isRunning}
              colors={colors}
            />
          </Animated.View>
        )}
        <TouchableOpacity
          onPress={() =>
            !isRunning && !isPaused ? setIsSessionTypeModalVisible(true) : null
          }
          activeOpacity={isRunning || isPaused ? 1 : 0.65}
          style={[
            styles.sessionLabelRow,
            !isRunning &&
              !isPaused && {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
                borderWidth: StyleSheet.hairlineWidth,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              },
          ]}
        >
          <Ionicons
            name={SESSION_META[sessionType]?.icon as any}
            size={13}
            color={colors.textSecondary}
          />
          <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
            {SESSION_META[sessionType]?.label}
          </Text>
          {!isRunning && !isPaused && (
            <Ionicons
              name="sparkles-outline"
              size={12}
              color={colors.accent}
              style={{ marginLeft: 2 }}
            />
          )}
        </TouchableOpacity>
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
            style={{ flexShrink: 0 }}
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

          {/* Session task staging */}
          <View
            style={[
              styles.stagingCard,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.stagingHeader}>
              <Text
                style={[styles.stagingTitle, { color: colors.textSecondary }]}
              >
                Session tasks
              </Text>
              <TouchableOpacity
                onPress={() => setIsTaskPickerVisible(true)}
                hitSlop={8}
              >
                <Text style={[styles.stagingEdit, { color: colors.accent }]}>
                  {stagedTasks.length === 0 ? "Add" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            {stagedTasks.length === 0 ? (
              <TouchableOpacity
                onPress={() => setIsTaskPickerVisible(true)}
                activeOpacity={0.7}
                style={styles.stagingEmpty}
              >
                <Ionicons
                  name="list-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.stagingEmptyText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Stage tasks from your plan
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stagingRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: taskTagColor(stagedTasks[0].tag) },
                  ]}
                />
                <Text
                  style={[
                    styles.stagingTaskName,
                    { color: colors.textSecondary, flex: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {stagedTasks[0].name}
                </Text>
                {stagedTasks.length > 1 && (
                  <Text
                    style={[
                      styles.stagingMore,
                      { color: colors.textSecondary },
                    ]}
                  >
                    +{stagedTasks.length - 1} more
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.startWrap}>
            <StartSessionBtn
              onStart={handleSessionStart}
              onPause={pauseSession}
              onReset={handleSessionEnd}
            />
          </View>
        </Animated.View>

        {/* ACTIVE */}
        <Animated.View
          style={[styles.controls, styles.activeControls, activeControlStyle]}
          pointerEvents={!isActive ? "none" : "auto"}
        >
          <Animated.View style={[styles.activeBtnRow, shakeStyle]}>
            <TouchableOpacity
              onPress={
                strictMode
                  ? handleStrictModeTap
                  : isPaused
                    ? handleSessionStart
                    : pauseSession
              }
              style={[
                styles.activeBtn,
                styles.activeBtnPrimary,
                {
                  backgroundColor:
                    strictMode && !isPaused
                      ? colors.surfaceMuted
                      : colors.accent,
                },
              ]}
            >
              <Ionicons
                name={
                  strictMode && !isPaused
                    ? "lock-closed"
                    : isPaused
                      ? "play"
                      : "pause"
                }
                size={20}
                color={strictMode && !isPaused ? colors.textSecondary : "#fff"}
              />
              <Text
                style={[
                  styles.activeBtnLabel,
                  strictMode && !isPaused && { color: colors.textSecondary },
                ]}
              >
                {isPaused ? "Resume" : strictMode ? "Locked" : "Pause"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={strictMode ? handleStrictModeTap : handleSessionEnd}
              style={[
                styles.activeBtn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: strictMode
                    ? colors.border + "40"
                    : colors.border,
                  borderWidth: 1,
                  opacity: strictMode ? 0.45 : 1,
                },
              ]}
            >
              <Ionicons
                name={strictMode ? "lock-closed-outline" : "stop"}
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.activeBtnMuted, { color: colors.textSecondary }]}
              >
                Stop
              </Text>
            </TouchableOpacity>
          </Animated.View>

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
              <TouchableOpacity
                onPress={() => {
                  completeCurrentTask();
                  Toast.show({
                    type: "successToast",
                    position: "top",
                    topOffset: 60,
                    visibilityTime: 1800,
                    props: { text1: "Task marked as done" },
                  });
                }}
                hitSlop={10}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>
            </View>
          )}

          {stagedTasks.length > 0 && (
            <View
              style={[styles.activeTaskList, { borderTopColor: colors.border }]}
            >
              <View style={styles.activeTaskListHeader}>
                <Text
                  style={[
                    styles.activeTaskListLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  {stagedCompletedCount}/{stagedTasks.length} tasks done
                </Text>
              </View>
              {stagedTasks.map((task) => {
                const done = task.completed;
                const target = sessionTaskTargets[task.id];
                const isOverdue = !done && !!target && sessionElapsed > target;

                // Determine badge text + color
                let timerText: string;
                let timerColor: string;
                if (done) {
                  timerText = formatTaskTime(taskCompletedAt[task.id] ?? 0);
                  timerColor = colors.textSecondary;
                } else if (target) {
                  const rem = target - sessionElapsed;
                  if (rem > 0) {
                    timerText = formatTaskTime(rem);
                    timerColor = rem <= 60 ? "#E8A43A" : colors.textSecondary;
                  } else {
                    timerText = `+${formatTaskTime(-rem)}`;
                    timerColor = "#E05A5A";
                  }
                } else {
                  timerText = formatTaskTime(sessionElapsed);
                  timerColor = colors.textSecondary;
                }

                return (
                  <TouchableOpacity
                    key={task.id}
                    onPress={
                      done
                        ? undefined
                        : () => {
                            completeSessionTask(task.id);
                            const onTime = target
                              ? sessionElapsed <= target
                              : undefined;
                            useTaskStore
                              .getState()
                              .updateTask({ ...task, completed: true, onTime });
                            setTaskCompletedAt((prev) => ({
                              ...prev,
                              [task.id]: sessionElapsed,
                            }));
                            Toast.show({
                              type: "successToast",
                              position: "top",
                              topOffset: 60,
                              visibilityTime: 1800,
                              props: { text1: "Task done!" },
                            });
                            setTimeout(() => setShowQuoteModal(true), 800);
                          }
                    }
                    activeOpacity={done ? 1 : 0.6}
                    style={[
                      styles.activeTaskListRow,
                      done && { opacity: 0.45 },
                      isOverdue && {
                        borderLeftWidth: 2,
                        borderLeftColor: "#E05A5A",
                        paddingLeft: 6,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: taskTagColor(task.tag) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.taskName,
                        {
                          color: colors.textSecondary,
                          textDecorationLine: done ? "line-through" : "none",
                          flex: 1,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {task.name}
                    </Text>
                    <Text style={[styles.taskTimer, { color: timerColor }]}>
                      {timerText}
                    </Text>
                    {!done ? (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color={colors.accent}
                      />
                    ) : (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#4CAF7D"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
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
      <SessionTaskPickerModal
        isVisible={isTaskPickerVisible}
        onClose={() => setIsTaskPickerVisible(false)}
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
          tasksStaged: stagedTasks.length,
          tasksCompleted: stagedCompletedCount,
          tasksOnTime: stagedTasks.filter((t) => {
            const target = sessionTaskTargets[t.id];
            return (
              target && t.completed && (taskCompletedAt[t.id] ?? 0) <= target
            );
          }).length,
        }}
        onReflect={handleReflect}
        onViewInsights={() => setShowInsights(true)}
      />
      <AddJournalModal
        isVisible={showReflect}
        onAdd={handleAddJournal}
        onClose={() => setShowReflect(false)}
        sessionContext={lastSessionContext ?? undefined}
      />
      <SessionIntelligenceModal
        isVisible={showInsights}
        onClose={() => setShowInsights(false)}
        onSelectSession={() => setShowInsights(false)}
      />
      <FocusSoundSheet
        visible={isSoundSheetVisible}
        onClose={() => setIsSoundSheetVisible(false)}
        tracks={focusAudioCatalog}
        preferredTrackId={preferredTrackId}
        cache={focusAudioCache}
        soundEnabled={soundEnabled}
        isPro={isPro}
        onSelectTrack={handleSelectFocusTrack}
        onSelectNone={handleSelectNoSound}
        onUpgrade={() => {
          setIsSoundSheetVisible(false);
          router.push("/(screens)/paywall");
        }}
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
    borderWidth: StyleSheet.hairlineWidth,
  },
  streakText: { fontSize: 12, fontFamily: "SoraSemiBold", letterSpacing: 0.2 },
  flowsChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  soundChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  soundChipBadge: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    right: 7,
    top: 7,
  },
  flowsChipText: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.3,
  },
  timerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sessionLabel: {
    fontSize: 14,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.5,
  },
  timer: {
    fontSize: 92,
    fontFamily: "SoraBold",
    letterSpacing: -3.5,
    includeFontPadding: false,
    lineHeight: 100,
    textAlign: "center",
  },
  durationHint: {
    fontSize: 12,
    fontFamily: "Sora",
    marginTop: 14,
    letterSpacing: 0.4,
    opacity: 0.85,
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
    alignSelf: "center",
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

  // Staged task list (active state)
  activeTaskList: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  activeTaskListHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  activeTaskListLabel: {
    fontSize: 11,
    fontFamily: "Sora",
  },
  activeTaskListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskTimer: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    minWidth: 32,
    textAlign: "right",
  },

  // Idle staging card
  stagingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    width: "100%",
    gap: 6,
  },
  stagingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  stagingTitle: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  stagingEdit: {
    fontSize: 13,
    fontFamily: "SoraSemiBold",
  },
  stagingEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  stagingEmptyText: {
    fontSize: 13,
    fontFamily: "Sora",
  },
  stagingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  stagingTaskName: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Sora",
  },
  stagingMore: {
    fontSize: 12,
    fontFamily: "Sora",
    marginTop: 2,
  },
});
