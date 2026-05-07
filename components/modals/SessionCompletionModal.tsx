import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
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

interface SessionCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  session: {
    taskName: string;
    duration: number; // seconds
    streak: number;
    tasksStaged?: number;
    tasksCompleted?: number;
    tasksOnTime?: number; // tasks completed within their set target
  };
  onReflect: () => void;
  onViewInsights: () => void;
}

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m${sec > 0 ? ` ${sec}s` : ""}`;
};

export default function SessionCompletionModal({
  isVisible,
  onClose,
  session,
  onReflect,
  onViewInsights,
}: SessionCompletionModalProps) {
  const { colors } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [selectedStars, setSelectedStars] = useState(0);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkmarkScale = useSharedValue(0);
  const { getProductivityInsights, rateLastSession } = useSessionIntelligence();
  const insights = getProductivityInsights();
  const workType = useOnboardingStore((state) => state.workType);

  const BREAK_TIPS = {
    screen: "Look 20 feet away for 20 seconds. Your eyes need the reset.",
    reading: "Stand up and roll your shoulders. Physical rest matters too.",
    writing: "Shake out your hands and wrists — they worked hard.",
    creative: "Step away and look at something natural. Let ideas settle.",
    other: "Take a short walk. Movement helps consolidate what you just did.",
  };

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
      setSelectedStars(0);
      setSaved(false);
      if (sound) sound.replayAsync();
      Vibration.vibrate(100);
      checkmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 }),
      );
    } else {
      checkmarkScale.value = withTiming(0, { duration: 150 });
    }
  }, [isVisible, sound]);

  const handleStarPress = (stars: number) => {
    setSelectedStars(stars);
    // Store as 1-10 scale (1 star = 2, 5 stars = 10)
    rateLastSession(stars * 2);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1800);
  };

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const breakTip = workType ? BREAK_TIPS[workType] : null;
  const insight =
    breakTip ??
    (insights.recommendations.length > 0
      ? insights.recommendations[0]
      : "Great job! Keep up the focus.");

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      {/* Checkmark + title */}
      <View style={s.hero}>
        <Animated.View
          style={[s.check, { backgroundColor: "#4CAF7D" }, checkmarkStyle]}
        >
          <Text style={s.checkMark}>✓</Text>
        </Animated.View>
        <Text style={[s.title, { color: colors.textPrimary }]}>
          Session Complete
        </Text>
        {session.taskName ? (
          <Text
            style={[s.taskName, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {session.taskName}
          </Text>
        ) : null}
      </View>

      {/* Stats row */}
      <View
        style={[
          s.statsRow,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
        ]}
      >
        <View style={s.stat}>
          <Text style={[s.statValue, { color: colors.textPrimary }]}>
            {formatDuration(session.duration)}
          </Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>
            Duration
          </Text>
        </View>
        <View style={[s.statDivider, { backgroundColor: colors.border }]} />
        <View style={s.stat}>
          <Text style={[s.statValue, { color: colors.accent }]}>
            {session.streak}
          </Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>
            Day streak
          </Text>
        </View>
        {(session.tasksStaged ?? 0) > 0 && (
          <>
            <View style={[s.statDivider, { backgroundColor: colors.border }]} />
            <View style={s.stat}>
              <Text style={[s.statValue, { color: "#4CAF7D" }]}>
                {session.tasksCompleted ?? 0}/{session.tasksStaged}
              </Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>
                Tasks done
              </Text>
            </View>
            {(session.tasksOnTime ?? 0) > 0 && (
              <>
                <View
                  style={[s.statDivider, { backgroundColor: colors.border }]}
                />
                <View style={s.stat}>
                  <Text style={[s.statValue, { color: "#4CAF7D" }]}>
                    {session.tasksOnTime}
                  </Text>
                  <Text style={[s.statLabel, { color: colors.textSecondary }]}>
                    On time
                  </Text>
                </View>
              </>
            )}
          </>
        )}
      </View>

      {/* Focus quality rating */}
      <View style={s.ratingContainer}>
        <Text style={[s.ratingLabel, { color: colors.textSecondary }]}>
          How was your focus?
        </Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons
                name={star <= selectedStars ? "star" : "star-outline"}
                size={28}
                color={star <= selectedStars ? colors.accent : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        {saved && (
          <Text style={[s.savedText, { color: colors.accent }]}>Saved ✓</Text>
        )}
        {!saved && selectedStars === 0 && (
          <Text style={[s.ratingHint, { color: colors.textSecondary }]}>
            Optional — helps improve your insights
          </Text>
        )}
      </View>

      {/* Insight */}
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

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          onPress={onReflect}
          style={[
            s.btn,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.75}
        >
          <Text style={[s.btnText, { color: colors.textSecondary }]}>
            Reflect
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onViewInsights}
          style={[s.btn, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Text style={[s.btnText, { color: "#fff" }]}>Insights</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onClose} style={s.skipBtn} activeOpacity={0.6}>
        <Text style={[s.skipText, { color: colors.textSecondary }]}>
          Continue
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: "center", marginBottom: 20 },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  checkMark: { fontSize: 24, color: "#fff", fontFamily: "SoraBold" },
  title: { fontSize: 20, fontFamily: "SoraBold", letterSpacing: -0.3 },
  taskName: { fontSize: 13, fontFamily: "Sora", marginTop: 4 },

  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statValue: { fontSize: 22, fontFamily: "SoraBold" },
  statLabel: { fontSize: 12, fontFamily: "Sora", marginTop: 2 },
  statDivider: { width: 1 },

  ratingContainer: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
    fontFamily: "Sora",
  },
  starsRow: {
    flexDirection: "row",
    gap: 6,
  },
  savedText: {
    fontSize: 12,
    fontFamily: "SoraSemiBold",
  },
  ratingHint: {
    fontSize: 11,
    fontFamily: "Sora",
    opacity: 0.6,
  },

  insightCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  insightText: { fontSize: 13, fontFamily: "Sora", lineHeight: 20 },

  actions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  btnText: { fontSize: 14, fontFamily: "SoraSemiBold" },

  skipBtn: { alignItems: "center", paddingVertical: 6 },
  skipText: { fontSize: 13, fontFamily: "Sora" },
});
