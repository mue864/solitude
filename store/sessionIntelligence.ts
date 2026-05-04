import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionRecord {
  id: string;
  sessionType: string;
  duration: number; // in seconds
  completed: boolean;
  focusQuality?: number; // 1-10 rating
  energyLevel?: number; // 1-10 rating
  interruptions?: number;
  timestamp: number;
  flowId?: string | null; // NEW: flow association
}

export interface SessionPattern {
  totalSessions: number;
  completedSessions: number;
  successRate: number;
  averageFocusQuality: number;
  averageEnergyLevel: number;
  averageInterruptions: number;
  bestTimeSlots: string[];
}

export interface UserStats {
  totalSessions: number;
  completionRate: number;
  mostSuccessfulSession: string;
  productivityScore: number; // 0-100
  focusTrend: string; // "improving", "declining", "stable"
  currentStreak: number;
  averageFocusQuality: number;
  averageEnergyLevel: number;
}

export interface SessionRecommendation {
  recommendedSession: string;
  reason: string;
  successRate: number;
  expectedFocusQuality: number;
}

export interface ProductivityInsights {
  productivityScore: number; // 0-100
  focusTrend: string;
  bestSessionStreak: number;
  peakProductivityHours: number[];
  recommendations: string[];
}

export interface WeeklyAnalytics {
  sessionsCompleted: number;
  totalFocusTime: number; // in seconds
  averageFocusQuality: number;
  improvement: number; // percentage change from previous week
  mostProductiveDay: string;
  focusQualityTrend: string;
}

export interface FlowCompletionRecord {
  flowId: string;
  flowName: string;
  steps: number;
  completedAt: number;
  success: boolean;
}

interface SessionIntelligenceState {
  // Data
  sessionRecords: SessionRecord[];
  patterns: Record<string, SessionPattern>;
  userStats: UserStats;
  flowCompletions: FlowCompletionRecord[];

  // Actions
  recordSession: (session: Omit<SessionRecord, "id" | "timestamp">) => void;
  getRecommendations: () => SessionRecommendation;
  getProductivityInsights: () => ProductivityInsights;
  getWeeklyAnalytics: () => WeeklyAnalytics;
  clearAllData: () => void;
  getSessionHistory: (limit?: number) => SessionRecord[];
  getSessionTypeStats: (sessionType: string) => SessionPattern | null;
  recordFlowCompletion: (completion: FlowCompletionRecord) => void;
  getMostCompletedFlows: (
    topN?: number,
  ) => { flowId: string; flowName: string; count: number }[];
  getFlowStreaks: () => { flowId: string; flowName: string; streak: number }[];
  getFlowSuccessRates: () => {
    flowId: string;
    flowName: string;
    successRate: number;
  }[];
  // Milestone functions
  getNextMilestone: () => number;
  getMilestoneProgress: () => {
    current: number;
    next: number;
    progress: number;
  };
  // Data cleanup function
  cleanupSessionData: () => void;
}

const calculateProductivityScore = (
  completionRate: number,
  avgFocusQuality: number,
  avgEnergyLevel: number,
  streak: number,
): number => {
  const completionWeight = 0.4;
  const focusWeight = 0.3;
  const energyWeight = 0.2;
  const streakWeight = 0.1;

  const completionScore = (completionRate / 100) * 100;
  const focusScore = (avgFocusQuality / 10) * 100;
  const energyScore = (avgEnergyLevel / 10) * 100;
  const streakScore = Math.min(streak * 10, 100); // Cap at 100

  return (
    completionScore * completionWeight +
    focusScore * focusWeight +
    energyScore * energyWeight +
    streakScore * streakWeight
  );
};

const analyzeFocusTrend = (records: SessionRecord[]): string => {
  if (records.length < 3) return "stable";

  const recentRecords = records
    .slice(-3)
    .filter((r) => r.completed && r.focusQuality !== undefined);
  const olderRecords = records
    .slice(-6, -3)
    .filter((r) => r.completed && r.focusQuality !== undefined);

  if (olderRecords.length === 0 || recentRecords.length === 0) return "stable";

  const recentAvg =
    recentRecords.reduce((sum, r) => sum + r.focusQuality!, 0) /
    recentRecords.length;
  const olderAvg =
    olderRecords.reduce((sum, r) => sum + r.focusQuality!, 0) /
    olderRecords.length;

  if (recentAvg > olderAvg + 1) return "improving";
  if (recentAvg < olderAvg - 1) return "declining";
  return "stable";
};

const getPeakProductivityHours = (records: SessionRecord[]): number[] => {
  const hourCounts: Record<number, number> = {};

  records
    .filter((r) => r.completed)
    .forEach((record) => {
      const hour = new Date(record.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

  return Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
};

// Date utility functions for consistent date handling
export const getDateString = (timestamp: number): string => {
  return new Date(timestamp).toDateString();
};

export const getDayName = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", { weekday: "long" });
};

export const getDayNameShort = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("en-US", { weekday: "short" });
};

export const getStartOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const getEndOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
};

// Improved session filtering functions
const getSessionsInDateRange = (
  records: SessionRecord[],
  startTime: number,
  endTime: number,
): SessionRecord[] => {
  return records.filter(
    (r) => r.timestamp >= startTime && r.timestamp < endTime,
  );
};

// Milestone calculation utilities
const MILESTONE_THRESHOLDS = [5, 10, 15, 30, 50, 75, 100, 150, 200, 365];

const getNextMilestone = (currentStreak: number): number => {
  return (
    MILESTONE_THRESHOLDS.find((threshold) => threshold > currentStreak) ||
    currentStreak + 50
  );
};

const getMilestoneProgress = (
  currentStreak: number,
): {
  current: number;
  next: number;
  progress: number;
} => {
  const nextMilestone = getNextMilestone(currentStreak);
  const previousMilestone =
    MILESTONE_THRESHOLDS.find((threshold) => threshold <= currentStreak) || 0;
  const progress =
    previousMilestone === nextMilestone
      ? 100
      : ((currentStreak - previousMilestone) /
          (nextMilestone - previousMilestone)) *
        100;

  return {
    current: currentStreak,
    next: nextMilestone,
    progress: Math.min(progress, 100),
  };
};

export const useSessionIntelligence = create<SessionIntelligenceState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionRecords: [],
      patterns: {},
      userStats: {
        totalSessions: 0,
        completionRate: 0,
        mostSuccessfulSession: "",
        productivityScore: 0,
        focusTrend: "",
        currentStreak: 0,
        averageFocusQuality: 0,
        averageEnergyLevel: 0,
      },
      flowCompletions: [],

      // Record a new session
      recordSession: (session) => {
        if (session.duration < 0) return;

        const newRecord: SessionRecord = {
          ...session,
          id: Date.now().toString(),
          timestamp: Date.now(),
          duration:
            session.completed && session.duration <= 0 ? 1 : session.duration,
        };

        set((state) => {
          const newRecords = [...state.sessionRecords, newRecord];

          // Update patterns
          const patterns: Record<string, SessionPattern> = {};
          const sessionTypes = [
            ...new Set(newRecords.map((r) => r.sessionType)),
          ];

          sessionTypes.forEach((type) => {
            const typeRecords = newRecords.filter(
              (r) => r.sessionType === type,
            );
            const completed = typeRecords.filter((r) => r.completed);
            const ratedCompleted = completed.filter(
              (r) => r.focusQuality !== undefined,
            );
            const ratedEnergy = completed.filter(
              (r) => r.energyLevel !== undefined,
            );

            patterns[type] = {
              totalSessions: typeRecords.length,
              completedSessions: completed.length,
              successRate: (completed.length / typeRecords.length) * 100,
              averageFocusQuality:
                ratedCompleted.length > 0
                  ? ratedCompleted.reduce(
                      (sum, r) => sum + r.focusQuality!,
                      0,
                    ) / ratedCompleted.length
                  : 0,
              averageEnergyLevel:
                ratedEnergy.length > 0
                  ? ratedEnergy.reduce((sum, r) => sum + r.energyLevel!, 0) /
                    ratedEnergy.length
                  : 0,
              averageInterruptions:
                completed.length > 0
                  ? completed.reduce(
                      (sum, r) => sum + (r.interruptions || 0),
                      0,
                    ) / completed.length
                  : 0,
              bestTimeSlots: getPeakProductivityHours(typeRecords).map(
                (h) => `${h}:00`,
              ),
            };
          });

          // Update user stats
          const totalSessions = newRecords.length;
          const completedSessions = newRecords.filter(
            (r) => r.completed,
          ).length;
          const completionRate =
            totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

          const completedRecords = newRecords.filter((r) => r.completed);
          const ratedFocusRecords = completedRecords.filter(
            (r) => r.focusQuality !== undefined,
          );
          const ratedEnergyRecords = completedRecords.filter(
            (r) => r.energyLevel !== undefined,
          );

          const averageFocusQuality =
            ratedFocusRecords.length > 0
              ? ratedFocusRecords.reduce((sum, r) => sum + r.focusQuality!, 0) /
                ratedFocusRecords.length
              : 0;
          const averageEnergyLevel =
            ratedEnergyRecords.length > 0
              ? ratedEnergyRecords.reduce((sum, r) => sum + r.energyLevel!, 0) /
                ratedEnergyRecords.length
              : 0;

          // Find most successful session type
          const mostSuccessfulSession =
            Object.entries(patterns).sort(
              ([, a], [, b]) => b.successRate - a.successRate,
            )[0]?.[0] || "Classic";

          // Calculate current streak: consecutive days with at least one completed session
          let currentStreak = 0;
          const today = getStartOfDay(Date.now());
          const msPerDay = 24 * 60 * 60 * 1000;
          for (let i = 0; i <= 365; i++) {
            const dayStart = today - i * msPerDay;
            const dayEnd = dayStart + msPerDay;
            const hadSession = newRecords.some(
              (r) =>
                r.completed && r.timestamp >= dayStart && r.timestamp < dayEnd,
            );
            if (hadSession) {
              currentStreak++;
            } else if (i > 0) {
              // Allow today to have no session yet without breaking streak
              break;
            }
          }

          const productivityScore = calculateProductivityScore(
            completionRate,
            averageFocusQuality || 5,
            averageEnergyLevel || 5,
            currentStreak,
          );

          const focusTrend = analyzeFocusTrend(newRecords);

          return {
            sessionRecords: newRecords,
            patterns,
            userStats: {
              totalSessions,
              completionRate,
              mostSuccessfulSession,
              productivityScore,
              focusTrend,
              currentStreak,
              averageFocusQuality,
              averageEnergyLevel,
            },
          };
        });
      },

      // Get session recommendations
      getRecommendations: () => {
        const state = get();
        const { patterns } = state;

        if (Object.keys(patterns).length === 0) {
          return {
            recommendedSession: "Classic",
            reason:
              "No session history available. Starting with a classic session.",
            successRate: 0,
            expectedFocusQuality: 5,
          };
        }

        // Find the session type with the highest success rate
        const bestSession = Object.entries(patterns).sort(
          ([, a], [, b]) => b.successRate - a.successRate,
        )[0];

        if (!bestSession) {
          return {
            recommendedSession: "Classic",
            reason: "Unable to determine best session type.",
            successRate: 0,
            expectedFocusQuality: 5,
          };
        }

        const [sessionType, pattern] = bestSession;
        const reason =
          pattern.successRate > 80
            ? `You have a ${pattern.successRate.toFixed(1)}% success rate with ${sessionType} sessions.`
            : pattern.successRate > 60
              ? `${sessionType} sessions work well for you (${pattern.successRate.toFixed(1)}% success rate).`
              : `Try ${sessionType} sessions to improve your productivity.`;

        return {
          recommendedSession: sessionType,
          reason,
          successRate: pattern.successRate,
          expectedFocusQuality: pattern.averageFocusQuality,
        };
      },

      // Get productivity insights
      getProductivityInsights: () => {
        const state = get();
        const { sessionRecords, userStats } = state;

        const peakHours = getPeakProductivityHours(sessionRecords);
        const bestSessionStreak = Math.max(
          ...Object.values(state.patterns).map((p) => p.completedSessions),
          0,
        );

        const recommendations: string[] = [];

        if (
          userStats.averageFocusQuality > 0 &&
          userStats.averageFocusQuality < 6
        ) {
          recommendations.push(
            "Try reducing distractions during your sessions.",
          );
        }
        if (
          userStats.averageEnergyLevel > 0 &&
          userStats.averageEnergyLevel < 6
        ) {
          recommendations.push(
            "Consider taking breaks between sessions to maintain energy.",
          );
        }
        if (userStats.completionRate < 70) {
          recommendations.push(
            "Start with shorter sessions to build momentum.",
          );
        }
        if (peakHours.length > 0) {
          recommendations.push(
            `Your peak productivity hours are ${peakHours.map((h) => `${h}:00`).join(", ")}.`,
          );
        }

        return {
          productivityScore: userStats.productivityScore,
          focusTrend: userStats.focusTrend,
          bestSessionStreak,
          peakProductivityHours: peakHours,
          recommendations,
        };
      },

      // Get weekly analytics
      getWeeklyAnalytics: () => {
        const state = get();
        const { sessionRecords } = state;

        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

        // Use improved session filtering for more accurate results
        const thisWeekRecords = getSessionsInDateRange(
          sessionRecords,
          oneWeekAgo,
          now,
        );
        const lastWeekRecords = getSessionsInDateRange(
          sessionRecords,
          twoWeeksAgo,
          oneWeekAgo,
        );

        const sessionsCompleted = thisWeekRecords.filter(
          (r) => r.completed,
        ).length;
        const totalFocusTime = thisWeekRecords
          .filter((r) => r.completed)
          .reduce((sum, r) => sum + r.duration, 0);
        const completedThisWeek = thisWeekRecords.filter((r) => r.completed);
        const ratedThisWeek = completedThisWeek.filter(
          (r) => r.focusQuality !== undefined,
        );
        const averageFocusQuality =
          ratedThisWeek.length > 0
            ? ratedThisWeek.reduce((sum, r) => sum + r.focusQuality!, 0) /
              ratedThisWeek.length
            : 0;

        // Calculate improvement
        const completedLastWeek = lastWeekRecords.filter((r) => r.completed);
        const ratedLastWeek = completedLastWeek.filter(
          (r) => r.focusQuality !== undefined,
        );
        const lastWeekQuality =
          ratedLastWeek.length > 0
            ? ratedLastWeek.reduce((sum, r) => sum + r.focusQuality!, 0) /
              ratedLastWeek.length
            : 0;
        const improvement =
          lastWeekQuality > 0 && averageFocusQuality > 0
            ? ((averageFocusQuality - lastWeekQuality) / lastWeekQuality) * 100
            : 0;

        // Find most productive day using improved utility functions
        const dayStats: Record<string, number> = {};
        thisWeekRecords
          .filter((r) => r.completed)
          .forEach((record) => {
            const day = getDayName(record.timestamp);
            dayStats[day] = (dayStats[day] || 0) + 1;
          });
        const mostProductiveDay =
          Object.entries(dayStats).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          "No data";

        // Focus quality trend
        const recentRated = thisWeekRecords
          .slice(-3)
          .filter((r) => r.completed && r.focusQuality !== undefined);
        const recentQuality =
          recentRated.length > 0
            ? recentRated.reduce((sum, r) => sum + r.focusQuality!, 0) /
              recentRated.length
            : averageFocusQuality;
        const focusQualityTrend =
          averageFocusQuality === 0
            ? "stable"
            : recentQuality > averageFocusQuality
              ? "improving"
              : recentQuality < averageFocusQuality
                ? "declining"
                : "stable";

        return {
          sessionsCompleted,
          totalFocusTime,
          averageFocusQuality,
          improvement,
          mostProductiveDay,
          focusQualityTrend,
        };
      },

      // Clear all data
      clearAllData: () => {
        set({
          sessionRecords: [],
          patterns: {},
          userStats: {
            totalSessions: 0,
            completionRate: 0,
            mostSuccessfulSession: "Classic",
            productivityScore: 0,
            focusTrend: "stable",
            currentStreak: 0,
            averageFocusQuality: 5,
            averageEnergyLevel: 5,
          },
          flowCompletions: [],
        });
      },

      // Get session history
      getSessionHistory: (limit = 10) => {
        const state = get();
        return state.sessionRecords.slice(-limit).reverse();
      },

      // Get session type stats
      getSessionTypeStats: (sessionType: string) => {
        const state = get();
        return state.patterns[sessionType] || null;
      },

      recordFlowCompletion: (completion) => {
        set((state) => ({
          flowCompletions: [...state.flowCompletions, completion],
        }));
      },
      getMostCompletedFlows: (topN = 3) => {
        const completions = get().flowCompletions;
        const counts: Record<string, { flowName: string; count: number }> = {};
        completions.forEach((c) => {
          if (!counts[c.flowId])
            counts[c.flowId] = { flowName: c.flowName, count: 0 };
          counts[c.flowId].count++;
        });
        return Object.entries(counts)
          .map(([flowId, { flowName, count }]) => ({ flowId, flowName, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, topN);
      },
      getFlowStreaks: () => {
        const completions = get().flowCompletions;
        const streaks: Record<string, { flowName: string; streak: number }> =
          {};
        completions.forEach((c) => {
          if (!streaks[c.flowId])
            streaks[c.flowId] = { flowName: c.flowName, streak: 0 };
          if (c.success) streaks[c.flowId].streak++;
          else streaks[c.flowId].streak = 0;
        });
        return Object.entries(streaks).map(
          ([flowId, { flowName, streak }]) => ({ flowId, flowName, streak }),
        );
      },
      getFlowSuccessRates: () => {
        const completions = get().flowCompletions;
        const stats: Record<
          string,
          { flowName: string; total: number; success: number }
        > = {};
        completions.forEach((c) => {
          if (!stats[c.flowId])
            stats[c.flowId] = { flowName: c.flowName, total: 0, success: 0 };
          stats[c.flowId].total++;
          if (c.success) stats[c.flowId].success++;
        });
        return Object.entries(stats).map(
          ([flowId, { flowName, total, success }]) => ({
            flowId,
            flowName,
            successRate: total > 0 ? (success / total) * 100 : 0,
          }),
        );
      },

      // Milestone functions
      getNextMilestone: () => {
        const state = get();
        return getNextMilestone(state.userStats.currentStreak);
      },

      getMilestoneProgress: () => {
        const state = get();
        return getMilestoneProgress(state.userStats.currentStreak);
      },

      // Data cleanup function (no-op — kept for interface compat)
      cleanupSessionData: () => {},
    }),
    {
      name: "session-intelligence-store",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);
