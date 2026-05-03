import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
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
  const checkmarkScale = useSharedValue(0);
  const { getProductivityInsights } = useSessionIntelligence();
  const insights = getProductivityInsights();

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
      checkmarkScale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 }),
      );
    } else {
      checkmarkScale.value = withTiming(0, { duration: 150 });
    }
  }, [isVisible, sound]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const insight =
    insights.length > 0 ? insights[0] : "Great job! Keep up the focus.";

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
