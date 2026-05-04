import { useTheme } from "@/context/ThemeContext";
import {
  getDateString,
  getDayNameShort,
  useSessionIntelligence,
} from "@/store/sessionIntelligence";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");
const SCORE_R = 52;
const SCORE_STROKE = 10;
const SCORE_SIZE = (SCORE_R + SCORE_STROKE) * 2 + 4;
const CIRCUMFERENCE = 2 * Math.PI * SCORE_R;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const BAR_MAX_H = 90;
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Insights() {
  const { colors } = useTheme();
  const {
    userStats,
    getProductivityInsights,
    getRecommendations,
    sessionRecords,
  } = useSessionIntelligence();

  const productivity = useMemo(
    () => getProductivityInsights(),
    [getProductivityInsights],
  );
  const recommendations = useMemo(
    () => getRecommendations(),
    [getRecommendations],
  );
  const score = Math.min(productivity.productivityScore, 100);

  // insights.tsx no longer needs cleanup — durations are recorded correctly now

  // Animate score ring dashoffset
  const dashOffset = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  useEffect(() => {
    Animated.timing(dashOffset, {
      toValue: CIRCUMFERENCE * (1 - score / 100),
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  // Weekly bar data (last 7 days)
  const weekData = useMemo(() => {
    const now = new Date();
    return Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const dateStr = getDateString(d.getTime());
        const dayRecords = sessionRecords.filter(
          (r) => getDateString(r.timestamp) === dateStr && r.completed,
        );
        const totalMin = Math.round(
          dayRecords.reduce((sum, r) => sum + (r.duration || 0), 0) / 60,
        );
        return { day: getDayNameShort(d.getTime()), minutes: totalMin };
      });
  }, [sessionRecords]);

  const maxMin = useMemo(
    () => Math.max(...weekData.map((d) => d.minutes), 1),
    [weekData],
  );
  const totalWeekMin = useMemo(
    () => weekData.reduce((s, d) => s + d.minutes, 0),
    [weekData],
  );
  const bestDay = useMemo(
    () => weekData.reduce((a, b) => (a.minutes >= b.minutes ? a : b)).day,
    [weekData],
  );

  // Recent completed sessions
  const recentSessions = useMemo(
    () =>
      [...sessionRecords]
        .filter((r) => r.completed && r.duration > 0)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8),
    [sessionRecords],
  );

  const scoreColor =
    score >= 80 ? "#4CAF7D" : score >= 50 ? colors.accent : colors.destructive;

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.title, { color: colors.textPrimary }]}>Insights</Text>
          <Text style={[s.subtitle, { color: colors.textSecondary }]}>
            Your focus patterns at a glance
          </Text>
        </View>

        {/* Score hero card */}
        <View
          style={[
            s.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={s.scoreRow}>
            {/* SVG ring */}
            <View style={s.ringWrap}>
              <Svg width={SCORE_SIZE} height={SCORE_SIZE}>
                <Circle
                  cx={SCORE_SIZE / 2}
                  cy={SCORE_SIZE / 2}
                  r={SCORE_R}
                  stroke={colors.surfaceMuted}
                  strokeWidth={SCORE_STROKE}
                  fill="none"
                />
                <AnimatedCircle
                  cx={SCORE_SIZE / 2}
                  cy={SCORE_SIZE / 2}
                  r={SCORE_R}
                  stroke={scoreColor}
                  strokeWidth={SCORE_STROKE}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  originX={SCORE_SIZE / 2}
                  originY={SCORE_SIZE / 2}
                />
              </Svg>
              <View style={s.ringCenter}>
                <Text style={[s.scoreNum, { color: scoreColor }]}>
                  {score.toFixed(0)}
                </Text>
                <Text style={[s.scoreUnit, { color: colors.textSecondary }]}>
                  score
                </Text>
              </View>
            </View>

            {/* Stat chips */}
            <View style={s.statGrid}>
              <StatChip
                icon="checkmark-done"
                label="Sessions"
                value={String(userStats.totalSessions)}
                colors={colors}
              />
              <StatChip
                icon="flame"
                label="Streak"
                value={`${userStats.currentStreak}d`}
                colors={colors}
              />
              <StatChip
                icon="star"
                label="Quality"
                value={`${userStats.averageFocusQuality.toFixed(1)}`}
                colors={colors}
              />
              <StatChip
                icon="trophy"
                label="Rate"
                value={`${userStats.completionRate.toFixed(0)}%`}
                colors={colors}
              />
            </View>
          </View>
        </View>

        {/* Weekly focus bar chart */}
        <View
          style={[
            s.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
              Weekly Focus
            </Text>
            <Text style={[s.cardMeta, { color: colors.textSecondary }]}>
              {totalWeekMin} min · best: {bestDay}
            </Text>
          </View>
          <View style={s.barChart}>
            {weekData.map((d, i) => {
              const barH = maxMin > 0 ? (d.minutes / maxMin) * BAR_MAX_H : 0;
              const isToday = i === 6;
              return (
                <View key={i} style={s.barCol}>
                  <View
                    style={[
                      s.barTrack,
                      {
                        height: BAR_MAX_H,
                        backgroundColor: colors.surfaceMuted,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.barFill,
                        {
                          height: barH,
                          backgroundColor: isToday
                            ? colors.accent
                            : `${colors.accent}99`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      s.barLabel,
                      { color: isToday ? colors.accent : colors.textSecondary },
                    ]}
                  >
                    {d.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <View
            style={[
              s.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={s.cardHeader}>
              <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
                Recent Sessions
              </Text>
              <Text style={[s.cardMeta, { color: colors.textSecondary }]}>
                {recentSessions.length} shown
              </Text>
            </View>
            {recentSessions.map((r, i) => {
              const mins = Math.round(r.duration / 60);
              const date = new Date(r.timestamp);
              const dateStr = `${WEEK_DAYS[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
              return (
                <View
                  key={r.id}
                  style={[
                    s.sessionRow,
                    i > 0 && {
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      s.sessionIcon,
                      { backgroundColor: colors.accentMuted },
                    ]}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={14}
                      color={colors.accent}
                    />
                  </View>
                  <View style={s.sessionInfo}>
                    <Text
                      style={[s.sessionType, { color: colors.textPrimary }]}
                      numberOfLines={1}
                    >
                      {r.sessionType}
                    </Text>
                    <Text
                      style={[s.sessionDate, { color: colors.textSecondary }]}
                    >
                      {dateStr}
                    </Text>
                  </View>
                  <View style={s.sessionRight}>
                    <Text
                      style={[s.sessionMins, { color: colors.textPrimary }]}
                    >
                      {mins} min
                    </Text>
                    {r.focusQuality !== undefined && (
                      <View style={s.qualityRow}>
                        <Ionicons name="star" size={10} color={colors.accent} />
                        <Text
                          style={[
                            s.qualityText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {r.focusQuality}/10
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
        {recentSessions.length === 0 && (
          <View
            style={[
              s.card,
              s.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="analytics-outline"
              size={36}
              color={colors.border}
            />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>
              No sessions recorded yet
            </Text>
            <Text style={[s.emptyHint, { color: colors.textSecondary }]}>
              Complete your first focus session to see insights here
            </Text>
          </View>
        )}

        {/* Insight / recommendation */}
        <View
          style={[
            s.card,
            s.insightCard,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
        >
          <View style={s.insightHeader}>
            <View
              style={[
                s.insightIconWrap,
                { backgroundColor: colors.accentMuted },
              ]}
            >
              <Ionicons name="bulb" size={16} color={colors.accent} />
            </View>
            <Text style={[s.cardTitle, { color: colors.textPrimary }]}>
              Insight
            </Text>
          </View>
          <Text style={[s.insightBody, { color: colors.textSecondary }]}>
            {recommendations.reason ||
              "Keep building your streak — consistency is the key to deep focus."}
          </Text>
          {!!recommendations.recommendedSession && (
            <View
              style={[s.insightChip, { backgroundColor: colors.accentMuted }]}
            >
              <Text style={[s.insightChipText, { color: colors.accent }]}>
                Try: {recommendations.recommendedSession}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ---- StatChip sub-component ----
function StatChip({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[s.statChip, { backgroundColor: colors.surfaceMuted }]}>
      <Ionicons name={icon as any} size={13} color={colors.accent} />
      <Text style={[s.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[s.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 180 },
  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: "SoraBold", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontFamily: "Sora", marginTop: 4 },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontFamily: "SoraSemiBold" },
  cardMeta: { fontSize: 12, fontFamily: "Sora" },

  // Score ring
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 18 },
  ringWrap: { alignItems: "center", justifyContent: "center" },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 24, fontFamily: "SoraBold", lineHeight: 28 },
  scoreUnit: { fontSize: 10, fontFamily: "Sora" },

  // Stat chips
  statGrid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statChip: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  statValue: { fontSize: 13, fontFamily: "SoraBold" },
  statLabel: { fontSize: 10, fontFamily: "Sora" },

  // Bar chart
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 5,
  },
  barCol: { flex: 1, alignItems: "center", gap: 5 },
  barTrack: {
    width: "100%",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 9, fontFamily: "SoraSemiBold" },

  // Session rows
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 12,
  },
  sessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionInfo: { flex: 1 },
  sessionType: { fontSize: 14, fontFamily: "SoraSemiBold" },
  sessionDate: { fontSize: 11, fontFamily: "Sora", marginTop: 2 },
  sessionRight: { alignItems: "flex-end" },
  sessionMins: { fontSize: 13, fontFamily: "SoraBold" },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  qualityText: { fontSize: 11, fontFamily: "Sora" },

  // Empty
  emptyCard: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontFamily: "SoraSemiBold", textAlign: "center" },
  emptyHint: {
    fontSize: 13,
    fontFamily: "Sora",
    textAlign: "center",
    opacity: 0.7,
  },

  // Insight card
  insightCard: { borderWidth: 1.5, gap: 10 },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  insightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  insightBody: { fontSize: 14, fontFamily: "Sora", lineHeight: 22 },
  insightChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  insightChipText: { fontSize: 13, fontFamily: "SoraSemiBold" },
});
