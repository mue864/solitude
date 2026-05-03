import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { useSessionStore } from "@/store/sessionState";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface FlowCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  data: {
    completedSessions: number;
    totalSessions: number;
    nextSessionType: string;
    nextSessionDuration: number;
    currentFlowName: string;
  };
  onReflect?: () => void;
  onViewInsights?: () => void;
}

const FlowCompletionModal = ({
  isVisible,
  onClose,
  data,
  onReflect,
  onViewInsights,
}: FlowCompletionModalProps) => {
  const { colors } = useTheme();
  const { continueFlow, pauseFlow, endFlow } = useSessionStore();
  const [countdown, setCountdown] = useState(8);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { getProductivityInsights } = useSessionIntelligence();
  const insights = getProductivityInsights();

  const iconScale = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  const isFlowComplete = data.nextSessionType === "Flow Complete";
  const progressPct = Math.round(
    (data.completedSessions / data.totalSessions) * 100,
  );
  const nextMin = Math.floor(data.nextSessionDuration / 60);
  const totalFlowMin = data.totalSessions * 25; // approx

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/sounds/chime.mp3"),
      );
      setSound(sound);
    };
    loadSound();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (sound) sound.replayAsync();
      Vibration.vibrate(100);

      iconScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 }),
      );
      progressWidth.value = withTiming(progressPct, { duration: 900 });

      if (!isFlowComplete) {
        setCountdown(8);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setTimeout(() => continueFlow(), 100);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      iconScale.value = withTiming(0, { duration: 150 });
      progressWidth.value = 0;
    }
  }, [isVisible, sound]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const insight =
    insights.recommendations?.length > 0
      ? insights.recommendations[0]
      : "Amazing work! You've completed an entire flow.";

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      {/* Hero */}
      <View style={s.hero}>
        <Animated.View
          style={[
            s.iconRing,
            {
              backgroundColor: isFlowComplete ? colors.accent : "#4CAF7D",
            },
            iconStyle,
          ]}
        >
          {isFlowComplete ? (
            <Ionicons name="trophy" size={26} color="#fff" />
          ) : (
            <Text style={s.checkMark}>✓</Text>
          )}
        </Animated.View>
        <Text style={[s.title, { color: colors.textPrimary }]}>
          {isFlowComplete ? "Flow Complete!" : "Session Done"}
        </Text>
        <Text style={[s.sub, { color: colors.textSecondary }]}>
          {isFlowComplete
            ? `All ${data.totalSessions} sessions completed`
            : `${data.completedSessions} of ${data.totalSessions} done`}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressSection}>
        <View style={s.progressMeta}>
          <Text style={[s.progressLabel, { color: colors.textSecondary }]}>
            Flow progress
          </Text>
          <Text style={[s.progressPct, { color: colors.accent }]}>
            {progressPct}%
          </Text>
        </View>
        <View
          style={[s.progressTrack, { backgroundColor: colors.surfaceMuted }]}
        >
          <Animated.View
            style={[
              s.progressFill,
              { backgroundColor: colors.accent },
              progressStyle,
            ]}
          />
        </View>
      </View>

      {/* Flow complete stats */}
      {isFlowComplete && (
        <View
          style={[
            s.statsRow,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={s.stat}>
            <Text style={[s.statValue, { color: colors.textPrimary }]}>
              {data.totalSessions}
            </Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>
              Sessions
            </Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <View style={s.stat}>
            <Text style={[s.statValue, { color: colors.textPrimary }]}>
              ~{totalFlowMin}m
            </Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>
              Total time
            </Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <View style={s.stat}>
            <Text style={[s.statValue, { color: colors.accent }]}>100%</Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>
              Complete
            </Text>
          </View>
        </View>
      )}

      {/* Flow complete insight */}
      {isFlowComplete && (
        <View
          style={[
            s.insightCard,
            { backgroundColor: colors.accentMuted, borderColor: colors.accent },
          ]}
        >
          <Text style={[s.insightText, { color: colors.textPrimary }]}>
            {insight}
          </Text>
        </View>
      )}

      {/* Ongoing — next session card + countdown */}
      {!isFlowComplete && (
        <>
          <View
            style={[
              s.nextCard,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <View>
              <Text style={[s.nextLabel, { color: colors.textSecondary }]}>
                Up next
              </Text>
              <Text style={[s.nextSession, { color: colors.textPrimary }]}>
                {data.nextSessionType}
              </Text>
            </View>
            <View style={[s.durationChip, { backgroundColor: colors.surface }]}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text style={[s.durationText, { color: colors.textSecondary }]}>
                {nextMin}m
              </Text>
            </View>
          </View>
          <Text style={[s.countdown, { color: colors.textSecondary }]}>
            Auto-continuing in{" "}
            <Text style={{ color: colors.accent, fontFamily: "SoraBold" }}>
              {countdown}s
            </Text>
          </Text>
        </>
      )}

      {/* Actions */}
      {!isFlowComplete ? (
        <>
          <View style={s.btnRow}>
            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(50);
                continueFlow();
              }}
              style={[s.btn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Text style={[s.btnText, { color: "#fff" }]}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(50);
                pauseFlow();
              }}
              style={[
                s.btn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[s.btnText, { color: colors.textSecondary }]}>
                Pause
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              Vibration.vibrate(50);
              endFlow();
            }}
            style={s.linkBtn}
            activeOpacity={0.6}
          >
            <Text style={[s.linkText, { color: colors.destructive }]}>
              End flow
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={s.btnRow}>
            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(50);
                onReflect?.();
              }}
              style={[s.btn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Text style={[s.btnText, { color: "#fff" }]}>Reflect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(50);
                onViewInsights?.();
              }}
              style={[
                s.btn,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[s.btnText, { color: colors.textSecondary }]}>
                Insights
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              Vibration.vibrate(50);
              endFlow();
              onClose();
            }}
            style={s.linkBtn}
            activeOpacity={0.6}
          >
            <Text style={[s.linkText, { color: colors.textSecondary }]}>
              Done
            </Text>
          </TouchableOpacity>
        </>
      )}
    </BottomSheet>
  );
};

export default FlowCompletionModal;

const s = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 20 },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  checkMark: { fontSize: 24, color: "#fff", fontFamily: "SoraBold" },
  title: { fontSize: 20, fontFamily: "SoraBold", letterSpacing: -0.3 },
  sub: { fontSize: 13, fontFamily: "Sora", marginTop: 4 },

  progressSection: { marginBottom: 16 },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 12, fontFamily: "SoraSemiBold" },
  progressPct: { fontSize: 12, fontFamily: "SoraBold" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },

  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statValue: { fontSize: 20, fontFamily: "SoraBold" },
  statLabel: { fontSize: 11, fontFamily: "Sora", marginTop: 2 },
  statDivider: { width: 1 },

  insightCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  insightText: { fontSize: 13, fontFamily: "Sora", lineHeight: 20 },

  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  nextLabel: { fontSize: 11, fontFamily: "SoraSemiBold", marginBottom: 2 },
  nextSession: { fontSize: 15, fontFamily: "SoraSemiBold" },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  durationText: { fontSize: 12, fontFamily: "SoraSemiBold" },

  countdown: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Sora",
    marginBottom: 18,
  },

  btnRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  btnText: { fontSize: 14, fontFamily: "SoraSemiBold" },

  linkBtn: { alignItems: "center", paddingVertical: 6 },
  linkText: { fontSize: 13, fontFamily: "Sora" },
});
