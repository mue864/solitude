import { BUILTIN_THEMES } from "@/constants/themes";
import { useSettingsStore } from "@/store/settingsStore";
import { deriveAccentTokens } from "@/utils/colorUtils";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------

export const darkColors = {
  background: "#111318",
  surface: "#1A1A1F",
  surfaceMuted: "#22222A",
  border: "#2A2A35",
  textPrimary: "#F5F1EB",
  textSecondary: "#8A8A96",
  accent: "#E8A43A",
  accentDim: "#B8812E",
  accentMuted: "rgba(232, 164, 58, 0.15)",
  destructive: "#E05A5A",
  // Session background tints
  tintDeepFocus: "#0D1520",
  tintBreak: "#1A1408",
  tintCreative: "#150D1A",
  tintClassic: "#111318",
} as const;

export const lightColors = {
  background: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceMuted: "#F2F0ED",
  border: "#E5E3E0",
  textPrimary: "#1A1A1F",
  textSecondary: "#7A7A86",
  accent: "#E8A43A",
  accentDim: "#B8812E",
  accentMuted: "rgba(232, 164, 58, 0.15)",
  destructive: "#E05A5A",
  // Session background tints
  tintDeepFocus: "#EEF3FA",
  tintBreak: "#FDF8EE",
  tintCreative: "#F5EEF8",
  tintClassic: "#FAF8F5",
} as const;

export type ColorTokens = typeof darkColors;
export type ThemePreference = "light" | "dark" | "auto";

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

type ThemeContextType = {
  isDarkMode: boolean;
  themePreference: ThemePreference;
  colors: ColorTokens;
  toggleTheme: () => void;
  setThemePreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveIsDark(pref: ThemePreference): boolean {
  if (pref === "auto") return Appearance.getColorScheme() === "dark";
  return pref === "dark";
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useSettingsStore((s) => s.theme);
  const updateTheme = useSettingsStore((s) => s.updateTheme);
  const activeThemeId = useSettingsStore((s) => s.activeThemeId);
  const customThemes = useSettingsStore((s) => s.proFeatures.customThemes);
  const isPro = useSettingsStore((s) => s.isPro);

  const [isDarkMode, setIsDarkMode] = useState(() => resolveIsDark(theme));

  // Sync whenever persisted preference loads or changes
  useEffect(() => {
    setIsDarkMode(resolveIsDark(theme));
  }, [theme]);

  // System appearance listener — only when preference is "auto"
  useEffect(() => {
    if (theme !== "auto") return;
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === "dark");
    });
    return () => sub?.remove();
  }, [theme]);

  const setThemePreference = (pref: ThemePreference) => updateTheme(pref);

  const toggleTheme = () => updateTheme(isDarkMode ? "light" : "dark");

  // Resolve the accent hex for the currently active theme
  const activeAccentHex = useMemo(() => {
    if (!isPro || activeThemeId === "solitude") return null;
    const builtin = BUILTIN_THEMES.find((t) => t.id === activeThemeId);
    if (builtin) return builtin.accentColor;
    const custom = customThemes.find((t) => t.id === activeThemeId);
    return custom?.accentColor ?? null;
  }, [isPro, activeThemeId, customThemes]);

  const colors: ColorTokens = useMemo(() => {
    const base = isDarkMode ? darkColors : lightColors;
    if (!activeAccentHex) return base;
    return { ...base, ...deriveAccentTokens(activeAccentHex) } as ColorTokens;
  }, [isDarkMode, activeAccentHex]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        themePreference: theme,
        colors,
        toggleTheme,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
