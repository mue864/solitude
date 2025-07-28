# NativeWind Theming & Styling in React Native - Part 2: Dark Mode, Custom Themes & Advanced Patterns

## Table of Contents

1. [Dark Mode Support](#dark-mode-support)
2. [Custom Themes & Color Palettes](#custom-themes--color-palettes)
3. [Dynamic Theming (User/System)](#dynamic-theming-usersystem)
4. [Advanced Responsive & Conditional Styling](#advanced-responsive--conditional-styling)
5. [Theming Best Practices](#theming-best-practices)

---

## Dark Mode Support

### 1. Enabling Dark Mode in NativeWind

- NativeWind supports Tailwind's `dark:` variant for dark mode styling.
- By default, it uses the system color scheme (light/dark) via React Native's `useColorScheme`.

#### Example: Dark Mode Card

```jsx
import { View, Text } from "react-native";

const DarkModeCard = () => (
  <View className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-4">
    <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">
      Dark Mode Card
    </Text>
    <Text className="text-base text-gray-600 dark:text-gray-300">
      This card adapts to light and dark mode automatically.
    </Text>
  </View>
);
```

**Comments:**

- `dark:bg-gray-900`: Background is dark in dark mode.
- `dark:text-white`: Title text is white in dark mode.
- `dark:text-gray-300`: Description text is lighter in dark mode.

### 2. Forcing Dark/Light Mode (App-wide)

You can override the system color scheme using React Native's `Appearance` API or a context/provider.

#### Example: Manual Theme Toggle

```jsx
import { useColorScheme } from "react-native";
import { useState } from "react";
import { View, Text, Switch } from "react-native";

const ThemeToggle = () => {
  const systemScheme = useColorScheme(); // 'light' or 'dark'
  const [theme, setTheme] = useState(systemScheme);

  // This would be provided via context in a real app
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <View className={theme === "dark" ? "bg-black flex-1" : "bg-white flex-1"}>
      <View className="p-6">
        <Text className={theme === "dark" ? "text-white" : "text-gray-800"}>
          Current theme: {theme}
        </Text>
        <Switch value={theme === "dark"} onValueChange={toggleTheme} />
      </View>
    </View>
  );
};
```

**Tip:** For a real app, use a ThemeContext and wrap your app to provide theme state everywhere.

---

## Custom Themes & Color Palettes

### 1. Extending the Tailwind Theme

Edit your `tailwind.config.js` to add custom colors, fonts, spacing, etc.

```js
// tailwind.config.js
module.exports = {
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Custom primary color
        secondary: "#f59e42",
        brand: {
          light: "#e0e7ff",
          DEFAULT: "#6366f1",
          dark: "#312e81",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["WorkSans", "sans-serif"],
      },
    },
  },
};
```

### 2. Using Custom Colors in Components

```jsx
const ThemedButton = ({ label, onPress }) => (
  <TouchableOpacity
    className="bg-primary dark:bg-brand-dark px-6 py-3 rounded-lg"
    onPress={onPress}
  >
    <Text className="text-white font-bold text-lg font-display">{label}</Text>
  </TouchableOpacity>
);
```

**Comments:**

- `bg-primary`: Uses your custom color.
- `dark:bg-brand-dark`: Uses a different custom color in dark mode.
- `font-display`: Uses your custom font family.

---

## Dynamic Theming (User/System)

### 1. Theme Context for User-Selectable Themes

Create a context to manage theme state and provide a toggle function.

```jsx
import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState(systemScheme);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

#### Usage in App

```jsx
import { ThemeProvider, useTheme } from "./ThemeContext";

const App = () => (
  <ThemeProvider>
    <MainApp />
  </ThemeProvider>
);

const MainApp = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <View className={theme === "dark" ? "bg-black flex-1" : "bg-white flex-1"}>
      {/* ...rest of your app */}
      <Button onPress={toggleTheme} title="Toggle Theme" />
    </View>
  );
};
```

---

## Advanced Responsive & Conditional Styling

### 1. Responsive Classes

NativeWind supports responsive variants like `sm:`, `md:`, `lg:`, etc.

```jsx
<View className="p-4 sm:p-8 md:p-12 bg-white dark:bg-gray-900">
  <Text className="text-base sm:text-lg md:text-xl">
    Responsive text size and padding
  </Text>
</View>
```

**Comments:**

- `sm:p-8`: Padding increases on small screens.
- `md:p-12`: Even more padding on medium screens.
- `dark:bg-gray-900`: Dark mode background.

### 2. Conditional Styling with Props

```jsx
const StatusBadge = ({ status }) => (
  <View
    className={
      status === "success"
        ? "bg-green-500"
        : status === "warning"
          ? "bg-yellow-500"
          : "bg-red-500"
    }
  >
    <Text className="text-white px-3 py-1 rounded-full font-bold">
      {status}
    </Text>
  </View>
);
```

### 3. Combining Variants

```jsx
const Avatar = ({ size = "md", online }) => (
  <View
    className={`rounded-full ${
      size === "sm" ? "w-8 h-8" : size === "lg" ? "w-20 h-20" : "w-12 h-12"
    } ${online ? "ring-2 ring-green-400" : "ring-2 ring-gray-300"}`}
  />
);
```

---

## Theming Best Practices

- **Centralize theme logic:** Use a context/provider for theme state.
- **Use Tailwind tokens:** Stick to your color and font scales for consistency.
- **Test in both light and dark mode:** Ensure all screens look good in both.
- **Document your theme:** Keep a reference of your custom colors, fonts, and patterns.
- **Leverage variants:** Use `dark:`, `sm:`, `md:`, etc., for adaptive UIs.
- **Prefer utility classes:** Avoid custom StyleSheet unless necessary.

---

**Next:** In Part 3, we’ll cover advanced theming topics: theme switching animations, user-customizable themes, integrating with design systems, and troubleshooting NativeWind theming issues.
