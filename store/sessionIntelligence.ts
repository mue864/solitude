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

interface SessionIntelligenceState {
  // Data
  sessionRecords: SessionRecord[];
  patterns: Record<string, SessionPattern>;
  userStats: UserStats;

  // Actions
  recordSession: (session: Omit<SessionRecord, "id" | "timestamp">) => void;
  getRecommendations: () => SessionRecommendation;
  getProductivityInsights: () => ProductivityInsights;
  getWeeklyAnalytics: () => WeeklyAnalytics;
  clearAllData: () => void;
  getSessionHistory: (limit?: number) => SessionRecord[];
  getSessionTypeStats: (sessionType: string) => SessionPattern | null;
}

const calculateProductivityScore = (
  completionRate: number,
  avgFocusQuality: number,
  avgEnergyLevel: number,
  streak: number
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

  const recentRecords = records.slice(-3);
  const olderRecords = records.slice(-6, -3);

  if (olderRecords.length === 0) return "stable";

  const recentAvg =
    recentRecords.reduce((sum, r) => sum + (r.focusQuality || 5), 0) /
    recentRecords.length;
  const olderAvg =
    olderRecords.reduce((sum, r) => sum + (r.focusQuality || 5), 0) /
    olderRecords.length;

  if (recentAvg > olderAvg + 1) return "improving";
  if (recentAvg < olderAvg - 1) return "declining";
  return "stable";
};

const getPeakProductivityHours = (records: SessionRecord[]): number[] => {
  const hourStats: Record<number, { total: number; avgQuality: number }> = {};

  records.forEach((record) => {
    const hour = new Date(record.timestamp).getHours();
    if (!hourStats[hour]) {
      hourStats[hour] = { total: 0, avgQuality: 0 };
    }
    hourStats[hour].total += 1;
    hourStats[hour].avgQuality += record.focusQuality || 5;
  });

  // Calculate average quality for each hour
  Object.keys(hourStats).forEach((hour) => {
    const h = parseInt(hour);
    hourStats[h].avgQuality = hourStats[h].avgQuality / hourStats[h].total;
  });

  // Get top 3 hours by average quality
  return Object.entries(hourStats)
    .sort(([, a], [, b]) => b.avgQuality - a.avgQuality)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
};

export const useSessionIntelligence = create<SessionIntelligenceState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionRecords: [
        // Sample data for demonstration
        {
          id: "1",
          sessionType: "Classic",
          duration: 1500, // 25 minutes
          completed: true,
          focusQuality: 8,
          energyLevel: 7,
          interruptions: 1,
          timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        },
        {
          id: "2",
          sessionType: "Deep Focus",
          duration: 1800, // 30 minutes
          completed: true,
          focusQuality: 9,
          energyLevel: 8,
          interruptions: 0,
          timestamp: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
        },
        {
          id: "3",
          sessionType: "Quick Task",
          duration: 600, // 10 minutes
          completed: true,
          focusQuality: 7,
          energyLevel: 6,
          interruptions: 2,
          timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
        },
        {
          id: "4",
          sessionType: "Creative Time",
          duration: 1200, // 20 minutes
          completed: false,
          focusQuality: 5,
          energyLevel: 4,
          interruptions: 3,
          timestamp: Date.now() - 8 * 60 * 60 * 1000, // 8 hours ago
        },
        {
          id: "5",
          sessionType: "Classic",
          duration: 1500, // 25 minutes
          completed: true,
          focusQuality: 8,
          energyLevel: 7,
          interruptions: 1,
          timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
        },
      ],
      patterns: {
        Classic: {
          totalSessions: 2,
          completedSessions: 2,
          successRate: 100,
          averageFocusQuality: 8,
          averageEnergyLevel: 7,
          averageInterruptions: 1,
          bestTimeSlots: ["9:00", "14:00"],
        },
        "Deep Focus": {
          totalSessions: 1,
          completedSessions: 1,
          successRate: 100,
          averageFocusQuality: 9,
          averageEnergyLevel: 8,
          averageInterruptions: 0,
          bestTimeSlots: ["10:00"],
        },
        "Quick Task": {
          totalSessions: 1,
          completedSessions: 1,
          successRate: 100,
          averageFocusQuality: 7,
          averageEnergyLevel: 6,
          averageInterruptions: 2,
          bestTimeSlots: ["15:00"],
        },
        "Creative Time": {
          totalSessions: 1,
          completedSessions: 0,
          successRate: 0,
          averageFocusQuality: 5,
          averageEnergyLevel: 4,
          averageInterruptions: 3,
          bestTimeSlots: ["16:00"],
        },
      },
      userStats: {
        totalSessions: 5,
        completionRate: 80,
        mostSuccessfulSession: "Classic",
        productivityScore: 78,
        focusTrend: "improving",
        currentStreak: 2,
        averageFocusQuality: 7.4,
        averageEnergyLevel: 6.4,
      },

      // Record a new session
      recordSession: (session) => {
        const newRecord: SessionRecord = {
          ...session,
          id: Date.now().toString(),
          timestamp: Date.now(),
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
              (r) => r.sessionType === type
            );
            const completed = typeRecords.filter((r) => r.completed);

            patterns[type] = {
              totalSessions: typeRecords.length,
              completedSessions: completed.length,
              successRate: (completed.length / typeRecords.length) * 100,
              averageFocusQuality:
                completed.reduce((sum, r) => sum + (r.focusQuality || 5), 0) /
                completed.length,
              averageEnergyLevel:
                completed.reduce((sum, r) => sum + (r.energyLevel || 5), 0) /
                completed.length,
              averageInterruptions:
                completed.reduce((sum, r) => sum + (r.interruptions || 0), 0) /
                completed.length,
              bestTimeSlots: getPeakProductivityHours(typeRecords).map(
                (h) => `${h}:00`
              ),
            };
          });

          // Update user stats
          const totalSessions = newRecords.length;
          const completedSessions = newRecords.filter(
            (r) => r.completed
          ).length;
          const completionRate =
            totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

          const completedRecords = newRecords.filter((r) => r.completed);
          const averageFocusQuality =
            completedRecords.length > 0
              ? completedRecords.reduce(
                  (sum, r) => sum + (r.focusQuality || 5),
                  0
                ) / completedRecords.length
              : 5;
          const averageEnergyLevel =
            completedRecords.length > 0
              ? completedRecords.reduce(
                  (sum, r) => sum + (r.energyLevel || 5),
                  0
                ) / completedRecords.length
              : 5;

          // Find most successful session type
          const mostSuccessfulSession =
            Object.entries(patterns).sort(
              ([, a], [, b]) => b.successRate - a.successRate
            )[0]?.[0] || "Classic";

          // Calculate current streak
          let currentStreak = 0;
          for (let i = newRecords.length - 1; i >= 0; i--) {
            if (newRecords[i].completed) {
              currentStreak++;
            } else {
              break;
            }
          }

          const productivityScore = calculateProductivityScore(
            completionRate,
            averageFocusQuality,
            averageEnergyLevel,
            currentStreak
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
        const { patterns, userStats } = state;

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
          ([, a], [, b]) => b.successRate - a.successRate
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
          0
        );

        const recommendations: string[] = [];

        if (userStats.averageFocusQuality < 6) {
          recommendations.push(
            "Try reducing distractions during your sessions."
          );
        }
        if (userStats.averageEnergyLevel < 6) {
          recommendations.push(
            "Consider taking breaks between sessions to maintain energy."
          );
        }
        if (userStats.completionRate < 70) {
          recommendations.push(
            "Start with shorter sessions to build momentum."
          );
        }
        if (peakHours.length > 0) {
          recommendations.push(
            `Your peak productivity hours are ${peakHours.map((h) => `${h}:00`).join(", ")}.`
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

        const thisWeekRecords = sessionRecords.filter(
          (r) => r.timestamp >= oneWeekAgo
        );
        const lastWeekRecords = sessionRecords.filter(
          (r) => r.timestamp >= twoWeeksAgo && r.timestamp < oneWeekAgo
        );

        const sessionsCompleted = thisWeekRecords.filter(
          (r) => r.completed
        ).length;
        const totalFocusTime = thisWeekRecords
          .filter((r) => r.completed)
          .reduce((sum, r) => sum + r.duration, 0);
        const averageFocusQuality =
          thisWeekRecords.filter((r) => r.completed).length > 0
            ? thisWeekRecords
                .filter((r) => r.completed)
                .reduce((sum, r) => sum + (r.focusQuality || 5), 0) /
              thisWeekRecords.filter((r) => r.completed).length
            : 5;

        // Calculate improvement
        const lastWeekQuality =
          lastWeekRecords.filter((r) => r.completed).length > 0
            ? lastWeekRecords
                .filter((r) => r.completed)
                .reduce((sum, r) => sum + (r.focusQuality || 5), 0) /
              lastWeekRecords.filter((r) => r.completed).length
            : 5;
        const improvement =
          lastWeekQuality > 0
            ? ((averageFocusQuality - lastWeekQuality) / lastWeekQuality) * 100
            : 0;

        // Find most productive day
        const dayStats: Record<string, number> = {};
        thisWeekRecords
          .filter((r) => r.completed)
          .forEach((record) => {
            const day = new Date(record.timestamp).toLocaleDateString("en-US", {
              weekday: "long",
            });
            dayStats[day] = (dayStats[day] || 0) + 1;
          });
        const mostProductiveDay =
          Object.entries(dayStats).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          "No data";

        // Focus quality trend
        const recentQuality =
          thisWeekRecords
            .slice(-3)
            .filter((r) => r.completed)
            .reduce((sum, r) => sum + (r.focusQuality || 5), 0) /
          Math.max(
            thisWeekRecords.slice(-3).filter((r) => r.completed).length,
            1
          );
        const focusQualityTrend =
          recentQuality > averageFocusQuality
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
    }
  )
);
