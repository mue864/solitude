import {
  REVENUECAT_ANNUAL_PRODUCT_ID,
  REVENUECAT_MONTHLY_PRODUCT_ID,
} from "@/constants/env";
import { useTheme } from "@/context/ThemeContext";
import { billingApi } from "@/services/api";
import type { ProductPriceDetails } from "@/services/revenuecatService";
import { revenuecatService } from "@/services/revenuecatService";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Prices — swap with RevenueCat product IDs later
const MONTHLY_PRICE = 2.99;
const ANNUAL_PRICE = 19.99;
const ANNUAL_MONTHLY_EQUIV = (ANNUAL_PRICE / 12).toFixed(2);

const PRO_FEATURES = [
  {
    icon: "sparkles-outline",
    label: "AI journal insights",
    sub: "Mood scores, themes & follow-up questions per entry",
  },
  {
    icon: "mic-outline",
    label: "AI audio note analysis",
    sub: "Transcription + personalised insights from voice recordings",
  },
  {
    icon: "cloud-upload-outline",
    label: "Cloud backup & sync",
    sub: "Never lose your data",
  },
  {
    icon: "color-palette-outline",
    label: "Custom color themes",
    sub: "Make it truly yours",
  },
  {
    icon: "notifications-outline",
    label: "Scheduled reminders",
    sub: "Custom times & days",
  },
  {
    icon: "download-outline",
    label: "Data export",
    sub: "Sessions, journal & tasks as CSV",
  },
  {
    icon: "timer-outline",
    label: "Custom session durations",
    sub: "Break the defaults",
  },
  {
    icon: "musical-notes-outline",
    label: "Background focus sounds",
    sub: "Rain, noise, ambience",
  },
] as const;

export default function PaywallScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const authUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const upgradeToPro = useSettingsStore((s) => s.upgradeToPro);
  const setProFromServer = useSettingsStore((s) => s.setProFromServer);
  const { feature } = useLocalSearchParams<{ feature?: string }>();

  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [productPriceDetails, setProductPriceDetails] = useState<
    Record<string, ProductPriceDetails>
  >({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  const productIds = useMemo(
    () =>
      [REVENUECAT_MONTHLY_PRODUCT_ID, REVENUECAT_ANNUAL_PRODUCT_ID].filter(
        Boolean,
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const loadLocalizedPrices = async () => {
      if (!productIds.length) return;
      setLoadingPrices(true);

      try {
        const prices =
          await revenuecatService.getProductPriceDetailsForProductIds(
            productIds,
          );
        if (!cancelled) {
          setProductPriceDetails(prices);
        }
      } catch {
        if (!cancelled) {
          setProductPriceDetails({});
        }
      } finally {
        if (!cancelled) {
          setLoadingPrices(false);
        }
      }
    };

    loadLocalizedPrices();

    return () => {
      cancelled = true;
    };
  }, [productIds]);

  async function syncProStatusFromServer() {
    const res = await billingApi.refreshRevenueCatEntitlement();
    const user = res.data;
    const isPro = Boolean(user?.isPro);
    setProFromServer(isPro);
    await updateUser({ isPro });
    return isPro;
  }

  async function handleUpgrade() {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (authUser?.id) {
        await revenuecatService.logIn(authUser.id);
      }

      const productId =
        plan === "monthly"
          ? REVENUECAT_MONTHLY_PRODUCT_ID
          : REVENUECAT_ANNUAL_PRODUCT_ID;

      const purchase = await revenuecatService.purchaseProduct(productId);
      if (!purchase.purchased) {
        return;
      }

      const syncedIsPro = await syncProStatusFromServer();
      if (!syncedIsPro) {
        const snapshot = await revenuecatService.getCustomerSnapshot();
        if (snapshot.hasActiveEntitlement) {
          // Temporary local unlock while backend sync catches up.
          upgradeToPro();
          await updateUser({ isPro: true });
          setProFromServer(true);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      const msg =
        e?.message ||
        "Please try again. If this keeps happening, restore purchases.";
      Alert.alert("Purchase failed", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      if (authUser?.id) {
        await revenuecatService.logIn(authUser.id);
      }
      await revenuecatService.restorePurchases();
      await syncProStatusFromServer();
      Alert.alert(
        "Restore complete",
        "Your subscription status has been updated.",
      );
    } catch (e: any) {
      Alert.alert(
        "Restore failed",
        e?.message || "Unable to restore purchases right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  const s = styles(colors);

  const monthlyLocalizedPrice =
    productPriceDetails[REVENUECAT_MONTHLY_PRODUCT_ID]?.localizedPrice;
  const annualLocalizedPrice =
    productPriceDetails[REVENUECAT_ANNUAL_PRODUCT_ID]?.localizedPrice;
  const monthlyNumericPrice =
    productPriceDetails[REVENUECAT_MONTHLY_PRODUCT_ID]?.numericPrice;
  const annualNumericPrice =
    productPriceDetails[REVENUECAT_ANNUAL_PRODUCT_ID]?.numericPrice;

  const annualSavingsPercent = useMemo(() => {
    if (
      typeof monthlyNumericPrice !== "number" ||
      typeof annualNumericPrice !== "number" ||
      !Number.isFinite(monthlyNumericPrice) ||
      !Number.isFinite(annualNumericPrice) ||
      monthlyNumericPrice <= 0 ||
      annualNumericPrice <= 0
    ) {
      return null;
    }

    const monthlyYearCost = monthlyNumericPrice * 12;
    if (annualNumericPrice >= monthlyYearCost) {
      return null;
    }

    const percent = Math.round(
      ((monthlyYearCost - annualNumericPrice) / monthlyYearCost) * 100,
    );

    return percent > 0 ? percent : null;
  }, [monthlyNumericPrice, annualNumericPrice]);

  const priceLabel =
    plan === "monthly"
      ? monthlyLocalizedPrice
        ? `${monthlyLocalizedPrice} / month`
        : loadingPrices && REVENUECAT_MONTHLY_PRODUCT_ID
          ? "Loading price... / month"
          : `$${MONTHLY_PRICE.toFixed(2)} / month`
      : annualLocalizedPrice
        ? `${annualLocalizedPrice} / year`
        : loadingPrices && REVENUECAT_ANNUAL_PRODUCT_ID
          ? "Loading price... / year"
          : `$${ANNUAL_PRICE.toFixed(2)} / year  ·  $${ANNUAL_MONTHLY_EQUIV}/mo`;

  const ctaLabel =
    plan === "monthly"
      ? monthlyLocalizedPrice
        ? `Start Pro · ${monthlyLocalizedPrice}/mo`
        : loadingPrices && REVENUECAT_MONTHLY_PRODUCT_ID
          ? "Start Pro · Loading price..."
          : `Start Pro · $${MONTHLY_PRICE.toFixed(2)}/mo`
      : annualLocalizedPrice
        ? `Start Annual · ${annualLocalizedPrice}/yr`
        : loadingPrices && REVENUECAT_ANNUAL_PRODUCT_ID
          ? "Start Annual · Loading price..."
          : `Start Annual · $${ANNUAL_PRICE.toFixed(2)}/yr`;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Close / back */}
      <View style={s.topBar}>
        <View style={{ width: 34 }} />
        <Text style={s.topTitle}>Solitude Pro</Text>
        <Pressable
          onPress={() => router.back()}
          style={s.closeBtn}
          hitSlop={12}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.heroWrap}>
          <View style={s.iconCircle}>
            <Ionicons name="diamond" size={32} color={colors.accent} />
          </View>
          <Text style={s.heading}>Unlock your{"\n"}full potential</Text>
          {feature ? (
            <View style={s.contextBadge}>
              <Ionicons
                name="lock-closed-outline"
                size={13}
                color={colors.accent}
              />
              <Text style={s.contextText}>
                <Text style={{ color: colors.accent }}>{feature}</Text> is a Pro
                feature
              </Text>
            </View>
          ) : (
            <Text style={s.sub}>
              AI-powered insights on every journal entry and voice note — plus
              the tools to focus deeply, reflect meaningfully, and grow
              consistently.
            </Text>
          )}
        </View>

        {/* Plan toggle */}
        <View style={s.toggleWrap}>
          <View style={[s.toggle, { backgroundColor: colors.surfaceMuted }]}>
            <Pressable
              style={[
                s.toggleOption,
                plan === "monthly" && {
                  backgroundColor: colors.surface,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => setPlan("monthly")}
            >
              <Text
                style={[
                  s.toggleText,
                  {
                    color:
                      plan === "monthly"
                        ? colors.textPrimary
                        : colors.textSecondary,
                  },
                ]}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              style={[
                s.toggleOption,
                plan === "annual" && {
                  backgroundColor: colors.surface,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => setPlan("annual")}
            >
              <Text
                style={[
                  s.toggleText,
                  {
                    color:
                      plan === "annual"
                        ? colors.textPrimary
                        : colors.textSecondary,
                  },
                ]}
              >
                Annual
              </Text>
              {plan === "annual" && annualSavingsPercent !== null && (
                <View
                  style={[
                    s.savingsBadge,
                    { backgroundColor: colors.accentMuted },
                  ]}
                >
                  <Text style={[s.savingsText, { color: colors.accent }]}>
                    Save {annualSavingsPercent}%
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          {plan === "annual" && annualSavingsPercent !== null && (
            <View
              style={[
                s.savingsBadgeRow,
                { backgroundColor: colors.accentMuted },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={13}
                color={colors.accent}
              />
              <Text style={[s.savingsBadgeText, { color: colors.accent }]}>
                Save {annualSavingsPercent}% vs monthly - best value
              </Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={[s.card, { borderColor: colors.border }]}>
          {PRO_FEATURES.map((f, i) => (
            <View key={f.label}>
              <View style={s.featureRow}>
                <View
                  style={[
                    s.featureIcon,
                    { backgroundColor: colors.accentMuted },
                  ]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.featureLabel, { color: colors.textPrimary }]}>
                    {f.label}
                  </Text>
                  <Text style={[s.featureSub, { color: colors.textSecondary }]}>
                    {f.sub}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.accent}
                />
              </View>
              {i < PRO_FEATURES.length - 1 && (
                <View style={[s.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Price + CTA */}
        <Text style={[s.priceLabel, { color: colors.textSecondary }]}>
          {priceLabel}
        </Text>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: colors.accent }]}
          onPress={handleUpgrade}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={s.btnText}>{loading ? "Processing…" : ctaLabel}</Text>
        </TouchableOpacity>

        <Pressable style={s.restoreBtn} onPress={handleRestore}>
          <Text style={[s.restoreText, { color: colors.textSecondary }]}>
            Restore purchases
          </Text>
        </Pressable>

        <Text style={[s.disclaimer, { color: colors.textSecondary }]}>
          Payment is charged to your account at confirmation. Subscription
          auto-renews unless cancelled at least 24 hours before the end of the
          current period. Manage in your account settings.
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
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    topTitle: {
      fontFamily: "SoraSemiBold",
      fontSize: 15,
      color: colors.textPrimary,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { paddingHorizontal: 20 },
    heroWrap: { alignItems: "center", paddingTop: 16, paddingBottom: 28 },
    iconCircle: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.accentMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heading: {
      fontFamily: "SoraBold",
      fontSize: 28,
      color: colors.textPrimary,
      textAlign: "center",
      lineHeight: 36,
      marginBottom: 12,
    },
    sub: {
      fontFamily: "Sora",
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    contextBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.accentMuted,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 4,
    },
    contextText: {
      fontFamily: "Sora",
      fontSize: 13,
      color: colors.textSecondary,
    },
    toggleWrap: { marginBottom: 20 },
    toggle: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 4,
      marginBottom: 10,
    },
    toggleOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    toggleText: { fontFamily: "SoraSemiBold", fontSize: 14 },
    savingsBadge: {
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    savingsText: { fontFamily: "SoraSemiBold", fontSize: 10 },
    savingsBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 12,
    },
    savingsBadgeText: { fontFamily: "SoraSemiBold", fontSize: 12 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      padding: 4,
      marginBottom: 20,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 13,
    },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    featureLabel: { fontFamily: "SoraSemiBold", fontSize: 14 },
    featureSub: { fontFamily: "Sora", fontSize: 12, marginTop: 1 },
    divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },
    priceLabel: {
      fontFamily: "Sora",
      fontSize: 13,
      textAlign: "center",
      marginBottom: 12,
    },
    btn: {
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    btnText: { fontFamily: "SoraSemiBold", fontSize: 16, color: "#fff" },
    restoreBtn: { alignItems: "center", paddingVertical: 10, marginBottom: 8 },
    restoreText: { fontFamily: "Sora", fontSize: 14 },
    disclaimer: {
      fontFamily: "Sora",
      fontSize: 11,
      textAlign: "center",
      lineHeight: 17,
    },
  });
}
