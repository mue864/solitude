import { useTheme } from "@/context/ThemeContext";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React, { useCallback, useEffect } from "react";
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
} from "react-native-reanimated";
import { TabIcon } from "./TabIcon";

type TabName = "focus" | "plan" | "journal" | "insights" | "settings";

// Map route name → icon name
const ROUTE_ICON_MAP: Record<string, TabName> = {
  focus: "focus",
  plan: "plan",
  journal: "journal",
  insights: "insights",
  settings: "settings",
};

const SPRING = {
  damping: 22,
  stiffness: 260,
  mass: 0.7,
  overshootClamping: true,
};
const SPRING_SCALE = { damping: 18, stiffness: 160, mass: 0.8 };

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ---------------------------------------------------------------------------
// Single tab button
// ---------------------------------------------------------------------------
interface TabButtonProps {
  routeName: string;
  isFocused: boolean;
  label: string;
  onPress: () => void;
}

const TabButton = React.memo(
  ({ routeName, isFocused, label, onPress }: TabButtonProps) => {
    const { colors } = useTheme();
    const iconName = ROUTE_ICON_MAP[routeName] ?? ("focus" as TabName);

    const scaleAnim = useSharedValue(isFocused ? 1.05 : 1);

    useEffect(() => {
      scaleAnim.value = withSpring(isFocused ? 1.05 : 1, SPRING_SCALE);
    }, [isFocused, scaleAnim]);

    const pillStyle = useAnimatedStyle(() => ({
      backgroundColor: isFocused ? colors.accentMuted : "transparent",
      paddingHorizontal: withSpring(isFocused ? 14 : 10, SPRING),
      paddingVertical: 8,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      transform: [{ scale: scaleAnim.value }],
    }));

    const labelStyle = useAnimatedStyle(() => ({
      maxWidth: withSpring(isFocused ? 60 : 0, SPRING),
      marginLeft: withSpring(isFocused ? 6 : 0, SPRING),
      opacity: withSpring(isFocused ? 1 : 0, SPRING),
      overflow: "hidden",
    }));

    return (
      <AnimatedTouchable
        onPress={onPress}
        activeOpacity={0.75}
        style={pillStyle}
      >
        <TabIcon
          name={iconName}
          focused={isFocused}
          color={isFocused ? colors.accent : colors.textSecondary}
        />
        <Animated.View style={labelStyle}>
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              { color: colors.accent, fontFamily: "SoraSemiBold" },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </AnimatedTouchable>
    );
  },
);

TabButton.displayName = "TabButton";

// ---------------------------------------------------------------------------
// Tab bar container
// ---------------------------------------------------------------------------
const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { colors, isDarkMode } = useTheme();

  const handlePress = useCallback(
    (routeName: string, isFocused: boolean) => {
      if (!isFocused) navigation.navigate(routeName);
    },
    [navigation],
  );

  // Only render routes that have an icon mapping
  const visibleRoutes = state.routes.filter(
    (r) => ROUTE_ICON_MAP[r.name] !== undefined,
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Outer view clips the BlurView to the pill shape on Android */}
      <View
        style={[
          styles.pillClip,
          {
            borderColor: colors.border,
          },
        ]}
      >
        <BlurView
          intensity={isDarkMode ? 60 : 50}
          tint={isDarkMode ? "dark" : "light"}
          style={[
            styles.pill,
            {
              backgroundColor: isDarkMode
                ? "rgba(26, 26, 31, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
            },
          ]}
        >
          {visibleRoutes.map((route) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : route.name.charAt(0).toUpperCase() + route.name.slice(1);
            const isFocused = state.index === state.routes.indexOf(route);

            return (
              <TabButton
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                label={label}
                onPress={() => handlePress(route.name, isFocused)}
              />
            );
          })}
        </BlurView>
      </View>
    </View>
  );
};

export default React.memo(CustomTabBar);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  // Outer clip view — enforces border radius and clips the BlurView on Android
  pillClip: {
    borderRadius: 40,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
    }),
  },
  // Inner BlurView — no border radius needed, clipped by parent
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  label: {
    fontSize: 13,
    includeFontPadding: false,
  },
  radius: {
    borderRadius: 20,
  },
});
