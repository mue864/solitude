# NativeWind Theming & Styling in React Native - Part 1: Fundamentals & Utility-First Patterns

## Table of Contents

1. [What is NativeWind?](#what-is-nativewind)
2. [Why Use NativeWind?](#why-use-nativewind)
3. [Setting Up NativeWind](#setting-up-nativewind)
4. [Basic Usage & Utility-First Styling](#basic-usage--utility-first-styling)
5. [Composing Layouts with NativeWind](#composing-layouts-with-nativewind)
6. [Best Practices](#best-practices)

---

## What is NativeWind?

**NativeWind** brings the power of Tailwind CSS utility classes to React Native. It allows you to style your components using concise, expressive class names, just like you would with Tailwind on the web.

- **Utility-first:** Use classes like `bg-blue-500`, `p-4`, `rounded-lg` directly in your components.
- **Consistent:** Ensures a consistent design system across your app.
- **Responsive:** Supports responsive and conditional styling.
- **Theming:** Integrates with dark mode and custom themes.

---

## Why Use NativeWind?

- **Faster development:** No need to write custom StyleSheet objects for every component.
- **Readability:** Styles are visible at a glance in your JSX.
- **Maintainability:** Easy to update and refactor styles.
- **Scalability:** Works well for both small and large projects.
- **Community:** Leverages the Tailwind ecosystem and design patterns.

---

## Setting Up NativeWind

### 1. Install Dependencies

```bash
npm install nativewind tailwindcss
# or
yarn add nativewind tailwindcss
```

If using Expo:

```bash
npx expo install nativewind tailwindcss
```

### 2. Initialize Tailwind Config

```bash
npx tailwindcss init
```

This creates a `tailwind.config.js` file in your project root.

### 3. Configure NativeWind

- In your `tailwind.config.js`, you can customize your theme, colors, and more.
- Make sure to include the NativeWind preset:

```js
// tailwind.config.js
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    // Add other folders as needed
  ],
  theme: {
    extend: {
      // You can add custom colors, spacing, etc. here
    },
  },
};
```

### 4. Babel Plugin (if needed)

Add to your `babel.config.js`:

```js
module.exports = {
  presets: ["babel-preset-expo"],
  plugins: ["nativewind/babel"],
};
```

### 5. Import NativeWind Styles

In your entry file (e.g., `App.js` or `index.js`):

```js
import "nativewind/tailwind.css";
```

---

## Basic Usage & Utility-First Styling

### Example: Button Component

```jsx
import { TouchableOpacity, Text } from "react-native";

const MyButton = ({ label, onPress }) => (
  <TouchableOpacity
    className="bg-blue-500 px-6 py-3 rounded-lg shadow-md active:bg-blue-600"
    onPress={onPress}
  >
    <Text className="text-white font-semibold text-lg text-center">
      {label}
    </Text>
  </TouchableOpacity>
);

// Usage:
<MyButton label="Get Started" onPress={() => {}} />;
```

#### Comments:

- `bg-blue-500`: Sets background color.
- `px-6 py-3`: Horizontal and vertical padding.
- `rounded-lg`: Large border radius.
- `shadow-md`: Medium shadow.
- `active:bg-blue-600`: Changes background on press (if supported).
- `text-white font-semibold text-lg`: Text color, weight, and size.

### Example: Card Layout

```jsx
import { View, Text } from "react-native";

const Card = ({ title, description }) => (
  <View className="bg-white rounded-xl p-6 shadow-lg mb-4">
    <Text className="text-xl font-bold text-gray-800 mb-2">{title}</Text>
    <Text className="text-base text-gray-600">{description}</Text>
  </View>
);

// Usage:
<Card title="Welcome" description="This is a NativeWind card." />;
```

#### Comments:

- `bg-white`: White background.
- `rounded-xl`: Extra large border radius.
- `p-6`: Padding.
- `shadow-lg`: Large shadow.
- `mb-4`: Margin bottom.
- `text-xl font-bold text-gray-800`: Title styling.
- `text-base text-gray-600`: Description styling.

---

## Composing Layouts with NativeWind

### Example: Responsive Flex Layout

```jsx
import { View, Text } from "react-native";

const Row = () => (
  <View className="flex-row items-center justify-between p-4 bg-gray-100 rounded-lg">
    <Text className="text-gray-700">Left</Text>
    <Text className="text-gray-700">Right</Text>
  </View>
);

// Usage:
<Row />;
```

#### Comments:

- `flex-row`: Horizontal flex layout.
- `items-center`: Vertically center items.
- `justify-between`: Space between items.
- `p-4 bg-gray-100 rounded-lg`: Padding, background, and rounded corners.

### Example: Stacked Layout with Spacing

```jsx
import { View, Text } from "react-native";

const Stack = () => (
  <View className="space-y-4">
    <Text className="text-lg">Item 1</Text>
    <Text className="text-lg">Item 2</Text>
    <Text className="text-lg">Item 3</Text>
  </View>
);

// Usage:
<Stack />;
```

#### Comments:

- `space-y-4`: Adds vertical spacing between children.

---

## Best Practices

- **Keep styles in the className:** Avoid mixing with StyleSheet unless necessary.
- **Use Tailwind’s design tokens:** Stick to the color, spacing, and font scales for consistency.
- **Leverage responsive and conditional classes:** Use `sm:`, `md:`, `dark:`, etc., for adaptive UIs.
- **Extract reusable components:** For repeated patterns, create your own components with NativeWind classes.
- **Document your design system:** Keep a reference of your most-used classes and patterns.

---

**Next:** In Part 2, we’ll cover dark mode, custom themes, dynamic theming, and advanced responsive/conditional styling with NativeWind.
