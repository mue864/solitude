import { useTheme } from "@/context/ThemeContext";
import {
  aiApi,
  type ActivitySummaryDto,
  type ReviewResponse,
} from "@/services/api";
import { useJournalStore, type JournalBlock } from "@/store/journalStore";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Period = "weekly" | "monthly";

function extractTextContent(blocks: JournalBlock[]): string {
  return blocks
    .flatMap((b) => {
      if (b.type === "text") return [b.content];
      if (b.type === "list") return b.items;
      if (b.type === "checkbox")
        return b.items.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.text}`);
      return [];
    })
    .filter(Boolean)
    .join("\n");
}

export default function PeriodReview() {
  const { colors } = useTheme();
  const { period: rawPeriod } = useLocalSearchParams<{ period: string }>();
  const period: Period = rawPeriod === "monthly" ? "monthly" : "weekly";

  const entries = useJournalStore((s) => s.entries);
  const { sessionRecords, userStats } = useSessionIntelligence();

  const periodEntries = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "weekly") cutoff.setDate(now.getDate() - 7);
    else cutoff.setDate(now.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return entries.filter((e) => e.date >= cutoffStr);
  }, [entries, period]);

  const activitySummary = useMemo((): ActivitySummaryDto => {
    const cutoffMs =
      Date.now() - (period === "weekly" ? 7 : 30) * 24 * 60 * 60 * 1000;
    const periodSessions = sessionRecords.filter(
      (r) => r.timestamp >= cutoffMs,
    );
    const completed = periodSessions.filter((r) => r.completed);
    const totalFocusMinutes = Math.round(
      completed.reduce((sum, r) => sum + r.duration, 0) / 60,
    );
    const completionRate =
      periodSessions.length > 0
        ? Math.round((completed.length / periodSessions.length) * 100)
        : 0;
    const rated = completed.filter((r) => r.focusQuality != null);
    const avgFocusQuality =
      rated.length > 0
        ? Math.round(
            (rated.reduce((sum, r) => sum + (r.focusQuality ?? 0), 0) /
              rated.length) *
              10,
          ) / 10
        : null;
    const energyRated = completed.filter((r) => r.energyLevel != null);
    const avgEnergyLevel =
      energyRated.length > 0
        ? Math.round(
            (energyRated.reduce((sum, r) => sum + (r.energyLevel ?? 0), 0) /
              energyRated.length) *
              10,
          ) / 10
        : null;
    const typeCounts: Record<string, number> = {};
    for (const r of periodSessions) {
      typeCounts[r.sessionType] = (typeCounts[r.sessionType] ?? 0) + 1;
    }
    const mostUsedSessionType =
      Object.keys(typeCounts).length > 0
        ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;
    return {
      sessionsCompleted: completed.length,
      totalFocusMinutes,
      completionRate,
      avgFocusQuality,
      mostUsedSessionType,
      currentStreak: userStats.currentStreak,
      avgEnergyLevel,
    };
  }, [sessionRecords, userStats, period]);

  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasContent =
    periodEntries.length > 0 || activitySummary.sessionsCompleted > 0;

  useEffect(() => {
    if (!hasContent) return;
    setLoading(true);
    setError(null);
    aiApi
      .generateReview({
        period,
        entries: periodEntries.map((e) => ({
          date: e.date,
          title: e.title,
          mood: e.mood ?? null,
          tags: e.tags ?? [],
          textContent: extractTextContent(e.blocks),
        })),
        activitySummary,
      })
      .then((res) => setReview(res.data))
      .catch(() => setError("Couldn't generate review. Try again later."))
      .finally(() => setLoading(false));
  }, []);

  const periodLabel = period === "weekly" ? "Weekly Review" : "Monthly Review";
  const periodSpan = period === "weekly" ? "Last 7 days" : "Last 30 days";

  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 56,
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerText: { flex: 1 },
    title: {
      fontFamily: "SoraBold",
      fontSize: 20,
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontFamily: "Sora",
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 1,
    },
    scroll: { padding: 16, paddingBottom: 40, gap: 12 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 12,
    },
    accentCard: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    winsCard: {
      backgroundColor: colors.accentMuted,
      borderColor: colors.accent,
    },
    reflectionCard: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
    },
    reflectionText: {
      fontFamily: "SoraSemiBold",
      fontSize: 15,
      color: colors.textPrimary,
      lineHeight: 23,
      fontStyle: "italic",
    },
    cardLabel: {
      fontFamily: "SoraBold",
      fontSize: 11,
      letterSpacing: 0.8,
      color: colors.accent,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    cardText: {
      fontFamily: "Sora",
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 21,
    },
    themesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    themeChip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: colors.surfaceMuted,
    },
    themeChipText: {
      fontFamily: "Sora",
      fontSize: 12,
      color: colors.textSecondary,
    },
    focusText: {
      fontFamily: "SoraBold",
      fontSize: 14,
      color: colors.accent,
      lineHeight: 21,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      gap: 12,
    },
    emptyTitle: {
      fontFamily: "SoraBold",
      fontSize: 17,
      color: colors.textPrimary,
      textAlign: "center",
    },
    emptyBody: {
      fontFamily: "Sora",
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 21,
    },
    errorText: {
      fontFamily: "Sora",
      fontSize: 14,
      color: colors.destructive,
      textAlign: "center",
    },
    entryCount: {
      fontFamily: "Sora",
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 1,
    },
    activityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 4,
    },
    activityStat: {
      minWidth: "40%",
      flex: 1,
    },
    activityValue: {
      fontFamily: "SoraBold",
      fontSize: 20,
    },
    activityKey: {
      fontFamily: "Sora",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginTop: 1,
    },
  });

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={s.headerText}>
          <Text style={s.title}>{periodLabel}</Text>
          <Text style={s.subtitle}>
            {periodSpan} · {periodEntries.length}{" "}
            {periodEntries.length === 1 ? "entry" : "entries"} ·{" "}
            {activitySummary.sessionsCompleted}{" "}
            {activitySummary.sessionsCompleted === 1 ? "session" : "sessions"}
          </Text>
        </View>
      </View>

      {/* No entries */}
      {!hasContent && (
        <View style={s.center}>
          <Ionicons name="book-outline" size={40} color={colors.border} />
          <Text style={s.emptyTitle}>Nothing here yet</Text>
          <Text style={s.emptyBody}>
            Complete a few focus sessions or write some journal entries this{" "}
            {period === "weekly" ? "week" : "month"} and come back for your
            review.
          </Text>
        </View>
      )}

      {/* Loading */}
      {hasContent && loading && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={s.emptyBody}>Generating your review…</Text>
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={s.center}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={colors.destructive}
          />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      {/* Review content */}
      {!loading && !error && review && (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Wins — celebrate first */}
          {!!review.wins && (
            <View style={[s.card, s.winsCard]}>
              <Text style={[s.cardLabel, { color: colors.accent }]}>
                🏆 Wins
              </Text>
              <Text style={[s.cardText, { color: colors.textPrimary }]}>
                {review.wins}
              </Text>
            </View>
          )}

          {/* Activity snapshot */}
          {activitySummary.sessionsCompleted > 0 && (
            <View style={s.card}>
              <Text style={s.cardLabel}>Activity</Text>
              <View style={s.activityGrid}>
                <View style={s.activityStat}>
                  <Text
                    style={[s.activityValue, { color: colors.textPrimary }]}
                  >
                    {activitySummary.sessionsCompleted}
                  </Text>
                  <Text
                    style={[s.activityKey, { color: colors.textSecondary }]}
                  >
                    sessions
                  </Text>
                </View>
                <View style={s.activityStat}>
                  <Text
                    style={[s.activityValue, { color: colors.textPrimary }]}
                  >
                    {activitySummary.totalFocusMinutes}m
                  </Text>
                  <Text
                    style={[s.activityKey, { color: colors.textSecondary }]}
                  >
                    focus time
                  </Text>
                </View>
                <View style={s.activityStat}>
                  <Text
                    style={[s.activityValue, { color: colors.textPrimary }]}
                  >
                    {activitySummary.completionRate}%
                  </Text>
                  <Text
                    style={[s.activityKey, { color: colors.textSecondary }]}
                  >
                    completed
                  </Text>
                </View>
                {activitySummary.avgFocusQuality != null && (
                  <View style={s.activityStat}>
                    <Text
                      style={[s.activityValue, { color: colors.textPrimary }]}
                    >
                      {activitySummary.avgFocusQuality}/10
                    </Text>
                    <Text
                      style={[s.activityKey, { color: colors.textSecondary }]}
                    >
                      focus quality
                    </Text>
                  </View>
                )}
                {activitySummary.avgEnergyLevel != null && (
                  <View style={s.activityStat}>
                    <Text
                      style={[s.activityValue, { color: colors.textPrimary }]}
                    >
                      {activitySummary.avgEnergyLevel}/10
                    </Text>
                    <Text
                      style={[s.activityKey, { color: colors.textSecondary }]}
                    >
                      avg energy
                    </Text>
                  </View>
                )}
                {activitySummary.currentStreak > 0 && (
                  <View style={s.activityStat}>
                    <Text
                      style={[s.activityValue, { color: colors.textPrimary }]}
                    >
                      {activitySummary.currentStreak}d
                    </Text>
                    <Text
                      style={[s.activityKey, { color: colors.textSecondary }]}
                    >
                      streak
                    </Text>
                  </View>
                )}
              </View>
              {activitySummary.mostUsedSessionType && (
                <Text style={[s.cardText, { marginTop: 8 }]}>
                  Most used:{" "}
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontFamily: "SoraBold",
                    }}
                  >
                    {activitySummary.mostUsedSessionType}
                  </Text>
                </Text>
              )}
            </View>
          )}

          {/* Overall summary */}
          {!!review.overallSummary && (
            <View style={s.card}>
              <Text style={s.cardLabel}>
                This {period === "weekly" ? "week" : "month"}
              </Text>
              <Text style={s.cardText}>{review.overallSummary}</Text>
            </View>
          )}

          {/* Mood trend */}
          {!!review.moodTrend && (
            <View style={s.card}>
              <Text style={s.cardLabel}>Mood Trend</Text>
              <Text style={s.cardText}>{review.moodTrend}</Text>
            </View>
          )}

          {/* Recurring themes */}
          {review.recurringThemes.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardLabel}>Recurring Themes</Text>
              <View style={s.themesRow}>
                {review.recurringThemes.map((t, i) => (
                  <View key={i} style={s.themeChip}>
                    <Text style={s.themeChipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pattern observed */}
          {!!review.patternObservation && (
            <View style={s.card}>
              <Text style={s.cardLabel}>Pattern Observed</Text>
              <Text style={s.cardText}>{review.patternObservation}</Text>
            </View>
          )}

          {/* Activity highlight from AI */}
          {!!review.activityHighlight && (
            <View style={s.card}>
              <Text style={s.cardLabel}>Productivity Insight</Text>
              <Text style={s.cardText}>{review.activityHighlight}</Text>
            </View>
          )}

          {/* Reflection prompt — carry into next period */}
          {!!review.reflectionPrompt && (
            <View style={[s.card, s.reflectionCard]}>
              <Text style={s.cardLabel}>Reflect On This</Text>
              <Text style={[s.cardText, s.reflectionText]}>
                {review.reflectionPrompt}
              </Text>
            </View>
          )}

          {/* Suggested focus */}
          {!!review.suggestedFocus && (
            <View style={[s.card, s.accentCard]}>
              <Text style={s.cardLabel}>Focus Next</Text>
              <Text style={s.focusText}>{review.suggestedFocus}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
