import BottomSheet from "@/components/BottomSheet";
import { useTheme } from "@/context/ThemeContext";
import { useSessionIntelligence } from "@/store/sessionIntelligence";
import { type SessionType } from "@/store/sessionState";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SessionIntelligenceModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectSession: (sessionType: SessionType) => void;
}

const SESSION_ICONS: Record<SessionType, string> = {
  Classic: "timer-outline",
  "Deep Focus": "leaf",
  "Quick Task": "flash-outline",
  "Creative Time": "color-palette-outline",
  "Review Mode": "document-text-outline",
  "Course Time": "school-outline",
  "Short Break": "cafe-outline",
  "Long Break": "bed-outline",
  "Reset Session": "refresh-outline",
  "Mindful Moment": "leaf-outline",
};

export default function SessionIntelligenceModal({
  isVisible,
  onClose,
  onSelectSession,
}: SessionIntelligenceModalProps) {
  const { colors } = useTheme();
  const {
    getRecommendations,
    getProductivityInsights,
    getWeeklyAnalytics,
    getSessionTypeStats,
  } = useSessionIntelligence();

  const recommendations = getRecommendations();
  const insights = getProductivityInsights();
  const weeklyAnalytics = getWeeklyAnalytics();
  const [showAll, setShowAll] = useState(false);

  const score = insights.productivityScore ?? 0;
  const scoreColor =
    score >= 80 ? "#4CAF7D" : score >= 50 ? colors.accent : "#E05A5A";

  const allTypes = Object.keys(SESSION_ICONS) as SessionType[];
  const recommended = recommendations.recommendedSession as SessionType;
  const others = allTypes.filter((t) => t !== recommended);
  const visibleOthers = showAll ? others : others.slice(0, 3);

  const renderCard = (type: SessionType, isRec = false) => {
    const stats = getSessionTypeStats(type);
    const icon = SESSION_ICONS[type];
    if (!icon) return null;

    return (
      <TouchableOpacity
        key={type}
        onPress={() => {
          onSelectSession(type);
          onClose();
        }}
        style={[
          s.card,
          {
            backgroundColor: isRec ? colors.accentMuted : colors.surfaceMuted,
            borderColor: isRec ? colors.accent : colors.border,
          },
        ]}
        activeOpacity={0.75}
      >
        <View style={[s.iconWrap, { backgroundColor: colors.surface }]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={isRec ? colors.accent : colors.textSecondary}
          />
        </View>
        <View style={s.cardInfo}>
          <Text
            style={[s.cardName, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {type}
          </Text>
          {stats && (
            <Text style={[s.cardStat, { color: colors.textSecondary }]}>
              {stats.totalSessions} sessions ·{" "}
              {(stats.successRate ?? 0).toFixed(0)}% success
            </Text>
          )}
        </View>
        {isRec && (
          <View style={[s.recBadge, { backgroundColor: colors.accent }]}>
            <Text style={s.recBadgeText}>Best</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Session Intelligence"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Productivity score + weekly row */}
        <View style={s.statsRow}>
          <View
            style={[
              s.statCard,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[s.statValue, { color: scoreColor }]}>
              {score.toFixed(0)}
            </Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>
              Score
            </Text>
          </View>
          <View
            style={[
              s.statCard,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[s.statValue, { color: colors.textPrimary }]}>
              {weeklyAnalytics.sessionsCompleted}
            </Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>
              This week
            </Text>
          </View>
          <View
            style={[
              s.statCard,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[s.statValue, { color: colors.textPrimary }]}>
              {Math.round(weeklyAnalytics.totalFocusTime / 60)}m
            </Text>
            <Text style={[s.statLabel, { color: colors.textSecondary }]}>
              Focus time
            </Text>
          </View>
        </View>

        {/* Recommendation card */}
        <View
          style={[
            s.recCard,
            { backgroundColor: colors.accentMuted, borderColor: colors.accent },
          ]}
        >
          <View style={s.recHeader}>
            <Ionicons name="bulb-outline" size={15} color={colors.accent} />
            <Text style={[s.recTitle, { color: colors.accent }]}>
              Recommendation
            </Text>
          </View>
          <Text style={[s.recSession, { color: colors.textPrimary }]}>
            {recommendations.recommendedSession}
          </Text>
          <Text style={[s.recReason, { color: colors.textSecondary }]}>
            {recommendations.reason}
          </Text>
        </View>

        {/* Session type list */}
        <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>
          SESSION TYPES
        </Text>
        {renderCard(recommended, true)}
        {visibleOthers.map((t) => renderCard(t))}

        {others.length > 3 && (
          <TouchableOpacity
            onPress={() => setShowAll((v) => !v)}
            style={[s.showAllBtn, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[s.showAllText, { color: colors.textSecondary }]}>
              {showAll ? "Show less" : `Show all ${others.length} types`}
            </Text>
            <Ionicons
              name={showAll ? "chevron-up" : "chevron-down"}
              size={14}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  scroll: { paddingBottom: 12 },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statValue: { fontSize: 18, fontFamily: "SoraBold" },
  statLabel: { fontSize: 11, fontFamily: "Sora", marginTop: 2 },

  recCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    gap: 4,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  recTitle: { fontSize: 11, fontFamily: "SoraSemiBold", letterSpacing: 0.5 },
  recSession: { fontSize: 15, fontFamily: "SoraBold" },
  recReason: { fontSize: 13, fontFamily: "Sora", lineHeight: 18 },

  sectionTitle: {
    fontSize: 11,
    fontFamily: "SoraSemiBold",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontFamily: "SoraSemiBold" },
  cardStat: { fontSize: 12, fontFamily: "Sora", marginTop: 2 },
  recBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  recBadgeText: { fontSize: 10, fontFamily: "SoraBold", color: "#fff" },

  showAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  showAllText: { fontSize: 13, fontFamily: "SoraSemiBold" },
});
