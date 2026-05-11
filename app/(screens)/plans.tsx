import { useTheme } from "@/context/ThemeContext";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Plan = "free" | "pro";

type Feature = {
  icon: string;
  label: string;
  sub: string;
  proOnly: boolean;
};

const MONTHLY_PRICE = 2.99;
const ANNUAL_PRICE = 19.99;
const ANNUAL_SAVINGS = 44;

const FEATURES: Feature[] = [
  {
    icon: "timer-outline",
    label: "Pomodoro timer & sessions",
    sub: "Focus, break, long break & flow modes",
    proOnly: false,
  },
  {
    icon: "git-branch-outline",
    label: "Pre-built flows",
    sub: "12 ready-made focus templates",
    proOnly: false,
  },
  {
    icon: "book-outline",
    label: "Journal",
    sub: "Unlimited reflections with rich blocks",
    proOnly: false,
  },
  {
    icon: "bar-chart-outline",
    label: "Weekly insights",
    sub: "See your focus patterns at a glance",
    proOnly: false,
  },
  {
    icon: "checkmark-circle-outline",
    label: "Task management",
    sub: "Groups, priorities & quick capture",
    proOnly: false,
  },
  {
    icon: "flame-outline",
    label: "Streak tracking",
    sub: "Keep momentum with daily streaks",
    proOnly: false,
  },
  {
    icon: "sparkles-outline",
    label: "AI insights",
    sub: "Personalised analysis of your focus patterns, mood, and productivity habits",
    proOnly: true,
  },
  {
    icon: "cloud-upload-outline",
    label: "Cloud backup & sync",
    sub: "Your data on every device, always safe",
    proOnly: true,
  },
  {
    icon: "color-palette-outline",
    label: "Custom themes",
    sub: "Build a colour palette that's yours",
    proOnly: true,
  },
  {
    icon: "notifications-outline",
    label: "Scheduled reminders",
    sub: "Custom times and days to stay on track",
    proOnly: true,
  },
  {
    icon: "download-outline",
    label: "CSV data export",
    sub: "Export sessions, journal & tasks anytime",
    proOnly: true,
  },
  {
    icon: "musical-notes-outline",
    label: "Focus sounds",
    sub: "Rain, white noise & ambient tracks",
    proOnly: true,
  },
];

export default function PlansScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isPro = useAuthStore((st) => st.user?.isPro ?? false);
  const [tab, setTab] = useState<Plan>("pro");

  const s = styles(colors);
  const freeItems = FEATURES.filter((f) => !f.proOnly);
  const proItems = FEATURES.filter((f) => f.proOnly);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>Plans</Text>
        <View style={s.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab switcher */}
        <View style={[s.segWrap, { backgroundColor: colors.surfaceMuted }]}>
          <Pressable
            style={[
              s.segBtn,
              tab === "free" && [
                s.segBtnActive,
                { backgroundColor: colors.surface },
              ],
            ]}
            onPress={() => setTab("free")}
          >
            <Text
              style={[
                s.segText,
                {
                  color:
                    tab === "free" ? colors.textPrimary : colors.textSecondary,
                },
              ]}
            >
              Free
            </Text>
          </Pressable>
          <Pressable
            style={[
              s.segBtn,
              tab === "pro" && [
                s.segBtnActive,
                { backgroundColor: colors.surface },
              ],
            ]}
            onPress={() => setTab("pro")}
          >
            <Ionicons
              name="diamond"
              size={12}
              color={tab === "pro" ? colors.accent : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                s.segText,
                { color: tab === "pro" ? colors.accent : colors.textSecondary },
              ]}
            >
              Pro
            </Text>
          </Pressable>
        </View>

        {/* Price hero */}
        {tab === "pro" ? (
          <View
            style={[
              s.priceCard,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}
          >
            <View style={[s.proBadge, { backgroundColor: colors.accentMuted }]}>
              <Ionicons name="diamond" size={11} color={colors.accent} />
              <Text style={[s.proBadgeText, { color: colors.accent }]}>
                PRO
              </Text>
            </View>
            <Text style={[s.planName, { color: colors.accent }]}>Pro</Text>
            <Text style={[s.bigPrice, { color: colors.textPrimary }]}>
              ${MONTHLY_PRICE.toFixed(2)}
            </Text>
            <Text style={[s.priceSub, { color: colors.textSecondary }]}>
              per month
            </Text>
            <View
              style={[s.annualPill, { backgroundColor: colors.accentMuted }]}
            >
              <Ionicons
                name="calendar-outline"
                size={13}
                color={colors.accent}
              />
              <Text style={[s.annualPillText, { color: colors.accent }]}>
                Annual ${ANNUAL_PRICE.toFixed(2)}/yr · save {ANNUAL_SAVINGS}%
              </Text>
            </View>
            {isPro ? (
              <View
                style={[s.activePill, { backgroundColor: colors.accentMuted }]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.accent}
                />
                <Text style={[s.activePillText, { color: colors.accent }]}>
                  Your current plan
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[s.ctaBtn, { backgroundColor: colors.accent }]}
                onPress={() => router.push("/(screens)/paywall" as any)}
              >
                <Text style={s.ctaBtnText}>View Pro options</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View
            style={[
              s.priceCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[s.planName, { color: colors.textSecondary }]}>
              Free
            </Text>
            <Text style={[s.bigPrice, { color: colors.textPrimary }]}>$0</Text>
            <Text style={[s.priceSub, { color: colors.textSecondary }]}>
              forever
            </Text>
            {!isPro && (
              <View
                style={[s.activePill, { backgroundColor: colors.surfaceMuted }]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[s.activePillText, { color: colors.textSecondary }]}
                >
                  Your current plan
                </Text>
              </View>
            )}
          </View>
        )}

        {/* AI spotlight card — Pro tab only */}
        {tab === "pro" && (
          <View
            style={[
              s.aiCard,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}
          >
            <View
              style={[s.aiIconCircle, { backgroundColor: colors.accentMuted }]}
            >
              <Ionicons name="sparkles" size={22} color={colors.accent} />
            </View>
            <View style={s.aiTextWrap}>
              <View style={s.aiTitleRow}>
                <Text style={[s.aiTitle, { color: colors.textPrimary }]}>
                  AI Insights
                </Text>
                <View
                  style={[
                    s.aiNewBadge,
                    { backgroundColor: colors.accentMuted },
                  ]}
                >
                  <Text style={[s.aiNewBadgeText, { color: colors.accent }]}>
                    Key feature
                  </Text>
                </View>
              </View>
              <Text style={[s.aiDesc, { color: colors.textSecondary }]}>
                After each session, Solitude analyses your focus depth, mood
                trends, and task completion to surface patterns you{"\u0027"}d
                never notice yourself{" \u2014 "}and gives you actionable nudges
                to improve.
              </Text>
              <View style={s.aiChipRow}>
                {[
                  "Session analysis",
                  "Mood trends",
                  "Weekly digest",
                  "Nudges",
                ].map((chip) => (
                  <View
                    key={chip}
                    style={[s.aiChip, { backgroundColor: colors.accentMuted }]}
                  >
                    <Text style={[s.aiChipText, { color: colors.accent }]}>
                      {chip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Feature lists */}
        <Text style={[s.sectionLabel, { color: colors.textSecondary }]}>
          {tab === "pro" ? "Everything included" : "What's included"}
        </Text>

        {tab === "free" && (
          <View
            style={[
              s.featureCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {freeItems.map((item, i) => (
              <View key={item.label}>
                <View style={s.featureRow}>
                  <View
                    style={[
                      s.iconWrap,
                      { backgroundColor: colors.surfaceMuted },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={17}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={s.featureText}>
                    <Text
                      style={[s.featureLabel, { color: colors.textPrimary }]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[s.featureSub, { color: colors.textSecondary }]}
                    >
                      {item.sub}
                    </Text>
                  </View>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
                {i < freeItems.length - 1 && (
                  <View
                    style={[s.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {tab === "pro" && (
          <>
            <Text style={[s.groupLabel, { color: colors.textSecondary }]}>
              Core features
            </Text>
            <View
              style={[
                s.featureCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {freeItems.map((item, i) => (
                <View key={item.label}>
                  <View style={s.featureRow}>
                    <View
                      style={[
                        s.iconWrap,
                        { backgroundColor: colors.surfaceMuted },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={17}
                        color={colors.textSecondary}
                      />
                    </View>
                    <View style={s.featureText}>
                      <Text
                        style={[s.featureLabel, { color: colors.textPrimary }]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[s.featureSub, { color: colors.textSecondary }]}
                      >
                        {item.sub}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </View>
                  {i < freeItems.length - 1 && (
                    <View
                      style={[s.divider, { backgroundColor: colors.border }]}
                    />
                  )}
                </View>
              ))}
            </View>

            <Text style={[s.groupLabel, { color: colors.accent }]}>
              Pro exclusives
            </Text>
            <View
              style={[
                s.featureCard,
                s.proFeatureCard,
                { backgroundColor: colors.surface, borderColor: colors.accent },
              ]}
            >
              {proItems.map((item, i) => (
                <View key={item.label}>
                  <View style={s.featureRow}>
                    <View
                      style={[
                        s.iconWrap,
                        { backgroundColor: colors.accentMuted },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={17}
                        color={colors.accent}
                      />
                    </View>
                    <View style={s.featureText}>
                      <Text
                        style={[s.featureLabel, { color: colors.textPrimary }]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[s.featureSub, { color: colors.textSecondary }]}
                      >
                        {item.sub}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={17}
                      color={colors.accent}
                    />
                  </View>
                  {i < proItems.length - 1 && (
                    <View
                      style={[s.divider, { backgroundColor: colors.border }]}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Free tab upsell */}
        {tab === "free" && !isPro && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              s.upsell,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accent,
              },
            ]}
            onPress={() => router.push("/(screens)/paywall" as any)}
          >
            <Ionicons name="diamond" size={18} color={colors.accent} />
            <View style={s.upsellText}>
              <Text style={[s.upsellTitle, { color: colors.textPrimary }]}>
                Unlock everything with Pro
              </Text>
              <Text style={[s.upsellSub, { color: colors.textSecondary }]}>
                AI insights, sync, themes, reminders & more
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}

        <Text style={[s.footer, { color: colors.textSecondary }]}>
          Subscriptions managed through the App Store / Google Play. Cancel any
          time from your store account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

function styles(
  colors: ReturnType<
    typeof import("@/context/ThemeContext").useTheme
  >["colors"],
) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: "SoraSemiBold",
      fontSize: 17,
      color: colors.textPrimary,
    },
    headerSpacer: { width: 34 },
    scroll: { paddingHorizontal: 16, paddingTop: 4 },

    segWrap: {
      flexDirection: "row",
      borderRadius: 14,
      padding: 4,
      marginBottom: 18,
    },
    segBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 11,
      borderRadius: 10,
    },
    segBtnActive: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    segText: { fontFamily: "SoraSemiBold", fontSize: 14 },

    priceCard: {
      borderRadius: 20,
      borderWidth: 1.5,
      padding: 20,
      marginBottom: 24,
    },
    proBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 10,
    },
    proBadgeText: { fontFamily: "SoraSemiBold", fontSize: 11 },
    planName: { fontFamily: "SoraSemiBold", fontSize: 14, marginBottom: 4 },
    bigPrice: { fontFamily: "SoraBold", fontSize: 44, lineHeight: 50 },
    priceSub: {
      fontFamily: "Sora",
      fontSize: 14,
      marginTop: 2,
      marginBottom: 12,
    },
    annualPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 14,
    },
    annualPillText: { fontFamily: "SoraSemiBold", fontSize: 12 },
    activePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    activePillText: { fontFamily: "SoraSemiBold", fontSize: 13 },
    ctaBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    ctaBtnText: { fontFamily: "SoraSemiBold", fontSize: 15, color: "#fff" },

    sectionLabel: {
      fontFamily: "SoraSemiBold",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    groupLabel: {
      fontFamily: "SoraSemiBold",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 8,
      marginTop: 4,
    },
    featureCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
      marginBottom: 18,
    },
    proFeatureCard: { borderWidth: 1.5 },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    featureText: { flex: 1 },
    featureLabel: { fontFamily: "SoraSemiBold", fontSize: 14, marginBottom: 2 },
    featureSub: { fontFamily: "Sora", fontSize: 12, lineHeight: 17 },
    divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },

    aiCard: {
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 16,
      marginBottom: 20,
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start",
    },
    aiIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    aiTextWrap: { flex: 1 },
    aiTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    aiTitle: { fontFamily: "SoraBold", fontSize: 16 },
    aiNewBadge: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    aiNewBadgeText: { fontFamily: "SoraSemiBold", fontSize: 10 },
    aiDesc: {
      fontFamily: "Sora",
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 10,
    },
    aiChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    aiChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
    aiChipText: { fontFamily: "SoraSemiBold", fontSize: 11 },

    upsell: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 18,
    },
    upsellText: { flex: 1 },
    upsellTitle: { fontFamily: "SoraSemiBold", fontSize: 14, marginBottom: 2 },
    upsellSub: { fontFamily: "Sora", fontSize: 12, lineHeight: 17 },

    footer: {
      fontFamily: "Sora",
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
    },
  });
}
