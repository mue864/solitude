import { useTheme } from "@/context/ThemeContext";
import { useSessionStore } from "@/store/sessionState";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const SPRING = { damping: 22, stiffness: 200, mass: 0.8 };

export default function SessionMiniBar() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isRunning = useSessionStore((s) => s.isRunning);
  const isPaused = useSessionStore((s) => s.isPaused);
  const sessionType = useSessionStore((s) => s.sessionType);
  const duration = useSessionStore((s) => s.duration);

  const isOnFocus = pathname.includes("focus");
  const isVisible = (isRunning || isPaused) && !isOnFocus;

  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, SPRING);
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withSpring(-16, SPRING);
      opacity.value = withTiming(0, { duration: 160 });
    }
  }, [isVisible, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.wrapper, { top: insets.top + 10 }, animStyle]}
      pointerEvents={isVisible ? "box-none" : "none"}
    >
      <View
        style={[
          styles.pillClip,
          { borderColor: isPaused ? colors.accent + "60" : "#4CAF7D60" },
        ]}
      >
        <BlurView
          intensity={isDarkMode ? 65 : 55}
          tint={isDarkMode ? "dark" : "light"}
          style={[
            styles.blurFill,
            {
              backgroundColor: isDarkMode
                ? "rgba(26,26,31,0.88)"
                : "rgba(255,255,255,0.88)",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.inner}
            activeOpacity={0.75}
            onPress={() => router.navigate("/(main)/focus")}
          >
            {/* Pulsing status dot */}
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isPaused ? colors.accent : "#4CAF7D",
                },
              ]}
            />

            {/* Session name */}
            <Text
              style={[styles.sessionName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {sessionType}
            </Text>

            {/* Divider */}
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            {/* Live countdown */}
            <Text style={[styles.countdown, { color: colors.accent }]}>
              {formatTime(duration)}
            </Text>

            {/* Paused label */}
            {isPaused && (
              <Text style={[styles.pausedLabel, { color: colors.accent }]}>
                paused
              </Text>
            )}

            {/* Return arrow */}
            <Ionicons
              name="arrow-forward-circle-outline"
              size={18}
              color={colors.textSecondary}
              style={styles.arrow}
            />
          </TouchableOpacity>
        </BlurView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0, // overridden inline with insets.top + 10
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99,
  },
  pillClip: {
    borderRadius: 40,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
    }),
  },
  blurFill: {
    flexDirection: "row",
    alignItems: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 9,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  sessionName: {
    fontSize: 13,
    fontFamily: "SoraSemiBold",
    maxWidth: 140,
  },
  divider: {
    width: 1,
    height: 14,
    borderRadius: 1,
  },
  countdown: {
    fontSize: 13,
    fontFamily: "SoraSemiBold",
    minWidth: 38,
    textAlign: "right",
  },
  pausedLabel: {
    fontSize: 11,
    fontFamily: "Sora",
  },
  arrow: {
    marginLeft: 2,
  },
});
