import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { JournalInsight } from "@/store/journalStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface JournalInsightModalProps {
  isVisible: boolean;
  loading: boolean;
  insight: JournalInsight | null;
  error: string | null;
  /** True when the error is a daily rate-limit hit, not a network failure. */
  isLimitError?: boolean;
  onDismiss: () => void;
}

const MOOD_LABELS = [
  "",
  "Low",
  "Below avg",
  "Neutral",
  "Good",
  "Great",
  "Excellent",
  "Excellent",
  "Excellent",
  "Excellent",
  "Peak",
];

export default function JournalInsightModal({
  isVisible,
  loading,
  insight,
  error,
  isLimitError = false,
  onDismiss,
}: JournalInsightModalProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet isVisible={isVisible} onClose={onDismiss} title="AI Insight">
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Analysing your entry…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons
            name={isLimitError ? "hourglass-outline" : "cloud-offline-outline"}
            size={40}
            color={isLimitError ? colors.accent : colors.textSecondary}
          />
          <Text
            style={[
              styles.errorText,
              {
                color: isLimitError ? colors.textPrimary : colors.textSecondary,
              },
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.dismissBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={onDismiss}
          >
            <Text
              style={[styles.dismissBtnText, { color: colors.textPrimary }]}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      ) : insight ? (
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Summary */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={colors.accent}
              />
              <Text style={[styles.cardLabel, { color: colors.accent }]}>
                Summary
              </Text>
            </View>
            <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
              {insight.summary}
            </Text>
          </View>

          {/* Follow-up question */}
          <View
            style={[
              styles.card,
              styles.questionCard,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accent + "40",
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={colors.accent}
              />
              <Text style={[styles.cardLabel, { color: colors.accent }]}>
                Reflect on this
              </Text>
            </View>
            <Text style={[styles.questionText, { color: colors.textPrimary }]}>
              {insight.followUpQuestion}
            </Text>
          </View>

          {/* Mood score */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="pulse-outline" size={16} color={colors.accent} />
              <Text style={[styles.cardLabel, { color: colors.accent }]}>
                Mood read
              </Text>
            </View>
            <View style={styles.moodRow}>
              <View
                style={[
                  styles.moodTrack,
                  { backgroundColor: colors.surfaceMuted },
                ]}
              >
                <View
                  style={[
                    styles.moodFill,
                    {
                      backgroundColor: moodColor(insight.moodScore, colors),
                      width: `${insight.moodScore * 10}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.moodLabel, { color: colors.textPrimary }]}>
                {insight.moodScore}/10 · {MOOD_LABELS[insight.moodScore] ?? ""}
              </Text>
            </View>
          </View>

          {/* Themes */}
          {insight.themes.length > 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name="pricetags-outline"
                  size={16}
                  color={colors.accent}
                />
                <Text style={[styles.cardLabel, { color: colors.accent }]}>
                  Themes
                </Text>
              </View>
              <View style={styles.tagsRow}>
                {insight.themes.map((theme) => (
                  <View
                    key={theme}
                    style={[
                      styles.tag,
                      { backgroundColor: colors.accentMuted },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.accent }]}>
                      {theme}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.dismissBtn, { backgroundColor: colors.accent }]}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={[styles.dismissBtnText, { color: colors.background }]}>
              Got it
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
}

function moodColor(score: number, colors: any): string {
  if (score >= 8) return "#4ade80"; // green
  if (score >= 6) return "#a3e635"; // lime
  if (score >= 4) return "#facc15"; // yellow
  if (score >= 2) return "#fb923c"; // orange
  return "#f87171"; // red
}

const styles = StyleSheet.create({
  centerContent: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "SoraRegular",
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "SoraRegular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  questionCard: {
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: "SoraBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "SoraRegular",
    lineHeight: 22,
  },
  questionText: {
    fontSize: 15,
    fontFamily: "SoraMedium",
    lineHeight: 23,
    fontStyle: "italic",
  },
  moodRow: {
    gap: 8,
  },
  moodTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  moodFill: {
    height: "100%",
    borderRadius: 4,
  },
  moodLabel: {
    fontSize: 13,
    fontFamily: "SoraMedium",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "SoraMedium",
  },
  dismissBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dismissBtnText: {
    fontSize: 15,
    fontFamily: "SoraBold",
  },
});
