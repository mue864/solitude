# NativeWind Theming & Styling in React Native - Part 3: Advanced Theming, Customization & Troubleshooting

## Table of Contents

1. [Theme Switching Animations](#theme-switching-animations)
2. [User-Customizable Themes](#user-customizable-themes)
3. [Integrating with Design Systems](#integrating-with-design-systems)
4. [Troubleshooting NativeWind Theming](#troubleshooting-nativewind-theming)
5. [Real-World Theming Patterns](#real-world-theming-patterns)

---

## Theme Switching Animations

### 1. Animating Theme Changes

- By default, theme changes are instant. For a polished UX, you can animate background, text, or accent color transitions.
- Use React Native's `Animated` API or Reanimated for smooth transitions.

#### Example: Animated Theme Switcher

```jsx
import { useTheme } from "./ThemeContext";
import { useRef, useEffect } from "react";
import { Animated, View, Text, TouchableOpacity } from "react-native";

const AnimatedThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const bgAnim = useRef(new Animated.Value(theme === "dark" ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: theme === "dark" ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [theme]);

  // Interpolate background color between light and dark
  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fff", "#18181b"],
  });

  return (
    <Animated.View style={{ flex: 1, backgroundColor }}>
      <View className="p-6">
        <Text className={theme === "dark" ? "text-white" : "text-gray-800"}>
          Animated Theme: {theme}
        </Text>
        <TouchableOpacity
          onPress={toggleTheme}
          className="mt-4 bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Toggle Theme</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
```

**Comments:**

- Uses `Animated.Value` to interpolate background color.
- Triggers animation on theme change.
- You can animate other properties (text color, border, etc.) similarly.

---

## User-Customizable Themes

### 1. Color Picker for Custom Accent

- Allow users to pick their own accent color and apply it throughout the app.
- Store the color in context or state, and use Tailwind's `style` prop for dynamic colors.

#### Example: Accent Color Picker

```jsx
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "./ThemeContext";

const ACCENT_COLORS = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#f472b6"];

const AccentColorPicker = () => {
  const [accent, setAccent] = useState(ACCENT_COLORS[0]);
  const { theme } = useTheme();

  return (
    <View className="p-6">
      <Text className={theme === "dark" ? "text-white" : "text-gray-800"}>
        Choose your accent color:
      </Text>
      <View className="flex-row mt-4 space-x-3">
        {ACCENT_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setAccent(color)}
            style={{ backgroundColor: color }}
            className={`w-10 h-10 rounded-full border-2 ${accent === color ? "border-black" : "border-transparent"}`}
          />
        ))}
      </View>
      <View className="mt-6">
        <TouchableOpacity
          style={{ backgroundColor: accent }}
          className="px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Accent Button</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

**Comments:**

- Uses inline `style` for dynamic background color.
- You can pass the accent color via context for global use.

### 2. Font Selector

- Let users pick a font family for headings or body text.
- Update the context and use Tailwind's `font-` classes or inline styles.

#### Example: Font Selector

```jsx
const FONTS = [
  { label: "Sora", className: "font-display" },
  { label: "WorkSans", className: "font-body" },
  { label: "System", className: "" },
];

const FontSelector = ({ font, setFont }) => (
  <View className="flex-row space-x-3 mt-4">
    {FONTS.map((f) => (
      <TouchableOpacity
        key={f.label}
        onPress={() => setFont(f.className)}
        className={`px-4 py-2 rounded-lg border ${font === f.className ? "border-primary" : "border-gray-300"}`}
      >
        <Text className={f.className}>{f.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);
```

---

## Integrating with Design Systems

### 1. Mapping Design Tokens to Tailwind

- If you have a Figma/Sketch design system, map your color, spacing, and font tokens to Tailwind config.
- Use consistent naming for colors, spacing, and typography.

#### Example: tailwind.config.js

```js
module.exports = {
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        accent: "#f59e42",
        background: "#f9fafb",
        surface: "#fff",
        error: "#ef4444",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["WorkSans", "sans-serif"],
      },
    },
  },
};
```

### 2. Creating Reusable Themed Components

```jsx
const ThemedCard = ({ title, children }) => (
  <View className="bg-surface dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-4">
    <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2 font-display">
      {title}
    </Text>
    <View>{children}</View>
  </View>
);
```

---

## Troubleshooting NativeWind Theming

### 1. Common Issues & Fixes

- **Classes not applying:**
  - Ensure your `content` array in `tailwind.config.js` includes all relevant folders/files.
  - Restart Metro bundler after config changes.
- **Dark mode not working:**
  - Make sure you use `dark:` variants and your app is wrapped with a provider if using custom theme logic.
- **Custom colors not available:**
  - Add them to `theme.extend.colors` in `tailwind.config.js`.
  - Rebuild your app after changes.
- **Fonts not applying:**
  - Add custom fonts to your project and link them in `tailwind.config.js`.
  - Use the correct `font-` class in your components.
- **Dynamic styles not working:**
  - Use inline `style` for truly dynamic values (e.g., user-picked colors).

### 2. Debugging Tips

- Use the [NativeWind VSCode extension](https://marketplace.visualstudio.com/items?itemName=marklawlor.nativewind) for class name autocompletion and linting.
- Use React Native Debugger or Flipper to inspect styles at runtime.
- Log your theme/context state to ensure it updates as expected.

---

## Real-World Theming Patterns

### 1. Theme-Aware Navigation

```jsx
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

const AppNavigation = () => {
  const { theme } = useTheme();
  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      {/* ...your navigators */}
    </NavigationContainer>
  );
};
```

### 2. Theme Persistence (AsyncStorage)

- Save the user's theme choice and restore it on app launch.

```jsx
import AsyncStorage from "@react-native-async-storage/async-storage";

// In your ThemeProvider
useEffect(() => {
  AsyncStorage.getItem("userTheme").then((savedTheme) => {
    if (savedTheme) setTheme(savedTheme);
  });
}, []);

const toggleTheme = () => {
  const newTheme = theme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  AsyncStorage.setItem("userTheme", newTheme);
};
```

### 3. User-Editable Theme Settings Screen

```jsx
const ThemeSettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const [accent, setAccent] = useState("#6366f1");
  const [font, setFont] = useState("font-display");

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black p-6">
      <Text className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Theme Settings
      </Text>
      <View className="mb-6">
        <Text className="mb-2 text-gray-700 dark:text-gray-300">
          Theme Mode
        </Text>
        <TouchableOpacity
          onPress={toggleTheme}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-bold">Toggle Theme</Text>
        </TouchableOpacity>
      </View>
      <View className="mb-6">
        <Text className="mb-2 text-gray-700 dark:text-gray-300">
          Accent Color
        </Text>
        <AccentColorPicker accent={accent} setAccent={setAccent} />
      </View>
      <View className="mb-6">
        <Text className="mb-2 text-gray-700 dark:text-gray-300">Font</Text>
        <FontSelector font={font} setFont={setFont} />
      </View>
    </ScrollView>
  );
};
```

---

**You now have a complete, advanced guide to theming and styling in React Native with NativeWind!**

- For even more, see the [NativeWind docs](https://www.nativewind.dev/) and [Tailwind docs](https://tailwindcss.com/docs/theme).
- Experiment, iterate, and make your app beautiful and consistent!
