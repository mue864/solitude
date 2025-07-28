# React Native Testing UI and Styles with NativeWind - Comprehensive Guide

## Table of Contents

1. [Testing Fundamentals](#testing-fundamentals)
2. [Snapshot Testing](#snapshot-testing)
3. [Visual Regression Testing](#visual-regression-testing)
4. [Testing NativeWind Styles](#testing-nativewind-styles)
5. [Testing Theming](#testing-theming)
6. [Testing Responsive Styles](#testing-responsive-styles)
7. [Component Testing](#component-testing)
8. [Integration Testing](#integration-testing)
9. [Performance Testing](#performance-testing)
10. [Best Practices](#best-practices)

## Testing Fundamentals

### Why Test UI and Styles?

Testing UI and styles ensures:

- **Visual consistency** across your app
- **Regression prevention** when making changes
- **Cross-platform compatibility** (iOS/Android)
- **Accessibility compliance**
- **Theme and responsive design** accuracy

### Testing Stack for React Native

```javascript
// package.json testing dependencies
{
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.0.0",
    "jest": "^29.0.0",
    "jest-snapshot": "^29.0.0",
    "react-test-renderer": "^18.0.0",
    "detox": "^20.0.0"
  }
}
```

## Snapshot Testing

### 1. Basic Snapshot Testing

```javascript
// __tests__/Button.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import Button from "../components/ui/Button";

describe("Button Component", () => {
  it("renders primary button correctly", () => {
    const { toJSON } = render(
      <Button variant="primary" onPress={() => {}}>
        Primary Button
      </Button>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it("renders secondary button correctly", () => {
    const { toJSON } = render(
      <Button variant="secondary" onPress={() => {}}>
        Secondary Button
      </Button>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it("renders disabled button correctly", () => {
    const { toJSON } = render(
      <Button variant="primary" disabled onPress={() => {}}>
        Disabled Button
      </Button>
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
```

### 2. Snapshot Testing with Different Props

```javascript
// __tests__/Card.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import Card from "../components/ui/Card";

describe("Card Component", () => {
  const defaultProps = {
    children: <Text>Card Content</Text>,
  };

  it("renders default card correctly", () => {
    const { toJSON } = render(<Card {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders elevated card correctly", () => {
    const { toJSON } = render(<Card variant="elevated" {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders outlined card correctly", () => {
    const { toJSON } = render(<Card variant="outlined" {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders card with different padding correctly", () => {
    const { toJSON } = render(<Card padding="lg" {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
```

### 3. Snapshot Testing with Theme Context

```javascript
// __tests__/ThemedComponent.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "../context/ThemeContext";
import ThemedCard from "../components/ui/ThemedCard";

const renderWithTheme = (component, theme = "light") => {
  return render(
    <ThemeProvider defaultTheme={theme}>{component}</ThemeProvider>
  );
};

describe("ThemedCard Component", () => {
  it("renders light theme correctly", () => {
    const { toJSON } = renderWithTheme(
      <ThemedCard>
        <Text>Light Theme Content</Text>
      </ThemedCard>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders dark theme correctly", () => {
    const { toJSON } = renderWithTheme(
      <ThemedCard>
        <Text>Dark Theme Content</Text>
      </ThemedCard>,
      "dark"
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
```

## Visual Regression Testing

### 1. Setting Up Visual Regression Testing

```javascript
// utils/visualRegressionTest.ts
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';

interface VisualTestConfig {
  platform: 'ios' | 'android';
  theme: 'light' | 'dark';
  screenSize: 'small' | 'medium' | 'large';
}

export class VisualRegressionTest {
  private static instance: VisualRegressionTest;
  private testResults: Map<string, any> = new Map();

  static getInstance(): VisualRegressionTest {
    if (!VisualRegressionTest.instance) {
      VisualRegressionTest.instance = new VisualRegressionTest();
    }
    return VisualRegressionTest.instance;
  }

  async captureComponent(
    component: React.ReactElement,
    testName: string,
    config: VisualTestConfig
  ): Promise<void> {
    const { toJSON } = render(component);
    const snapshot = toJSON();

    const testKey = `${testName}_${config.platform}_${config.theme}_${config.screenSize}`;
    this.testResults.set(testKey, {
      snapshot,
      config,
      timestamp: Date.now(),
    });
  }

  compareSnapshots(testName: string): boolean {
    // Compare current snapshot with baseline
    const currentSnapshot = this.testResults.get(testName);
    const baselineSnapshot = this.loadBaselineSnapshot(testName);

    return this.deepCompare(currentSnapshot, baselineSnapshot);
  }

  private loadBaselineSnapshot(testName: string): any {
    // Load baseline snapshot from file system
    try {
      return require(`../__snapshots__/baseline/${testName}.json`);
    } catch {
      return null;
    }
  }

  private deepCompare(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  generateReport(): string {
    const report = {
      totalTests: this.testResults.size,
      passed: 0,
      failed: 0,
      details: [],
    };

    for (const [testName, result] of this.testResults) {
      const passed = this.compareSnapshots(testName);
      if (passed) {
        report.passed++;
      } else {
        report.failed++;
        report.details.push({
          testName,
          status: 'failed',
          timestamp: result.timestamp,
        });
      }
    }

    return JSON.stringify(report, null, 2);
  }
}

export const visualRegressionTest = VisualRegressionTest.getInstance();
```

### 2. Visual Regression Test Examples

```javascript
// __tests__/visual/ButtonVisual.test.tsx
import React from "react";
import { visualRegressionTest } from "../../utils/visualRegressionTest";
import Button from "../../components/ui/Button";

describe("Button Visual Regression Tests", () => {
  const buttonVariants = ["primary", "secondary", "outline", "danger"];
  const platforms = ["ios", "android"];
  const themes = ["light", "dark"];

  buttonVariants.forEach((variant) => {
    platforms.forEach((platform) => {
      themes.forEach((theme) => {
        it(`renders ${variant} button on ${platform} with ${theme} theme`, async () => {
          const component = (
            <Button variant={variant} onPress={() => {}}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)} Button
            </Button>
          );

          await visualRegressionTest.captureComponent(
            component,
            `button_${variant}_${platform}_${theme}`,
            { platform, theme, screenSize: "medium" }
          );
        });
      });
    });
  });
});
```

### 3. Automated Visual Testing Pipeline

```javascript
// scripts/visualTesting.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class VisualTestingPipeline {
  constructor() {
    this.resultsDir = path.join(__dirname, "../__snapshots__/visual");
    this.baselineDir = path.join(__dirname, "../__snapshots__/baseline");
  }

  async runVisualTests() {
    console.log("🚀 Starting visual regression tests...");

    try {
      // Run Jest with visual testing configuration
      execSync("npm test -- --testPathPattern=visual --updateSnapshot", {
        stdio: "inherit",
      });

      console.log("✅ Visual tests completed successfully");

      // Generate visual test report
      this.generateReport();
    } catch (error) {
      console.error("❌ Visual tests failed:", error);
      process.exit(1);
    }
  }

  generateReport() {
    const reportPath = path.join(this.resultsDir, "report.json");
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
      details: [],
    };

    // Generate report from test results
    if (fs.existsSync(reportPath)) {
      const results = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      report.summary = results.summary;
      report.details = results.details;
    }

    console.log("📊 Visual Test Report:");
    console.log(`Total: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
  }

  updateBaseline() {
    console.log("🔄 Updating baseline snapshots...");

    try {
      execSync("npm test -- --testPathPattern=visual --updateSnapshot", {
        stdio: "inherit",
      });

      console.log("✅ Baseline snapshots updated");
    } catch (error) {
      console.error("❌ Failed to update baseline:", error);
      process.exit(1);
    }
  }
}

const pipeline = new VisualTestingPipeline();

if (process.argv.includes("--update-baseline")) {
  pipeline.updateBaseline();
} else {
  pipeline.runVisualTests();
}
```

## Testing NativeWind Styles

### 1. Testing Class Names

```javascript
// __tests__/NativeWindStyles.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";
import Button from "../components/ui/Button";

describe("NativeWind Styles", () => {
  it("applies correct class names to button", () => {
    const { getByText } = render(
      <Button variant="primary" onPress={() => {}}>
        Test Button
      </Button>
    );

    const button = getByText("Test Button").parent;

    // Test that NativeWind classes are applied
    expect(button.props.className).toContain("bg-primary-500");
    expect(button.props.className).toContain("rounded-lg");
    expect(button.props.className).toContain("flex-row");
  });

  it("applies variant-specific styles correctly", () => {
    const { getByText } = render(
      <Button variant="danger" onPress={() => {}}>
        Danger Button
      </Button>
    );

    const button = getByText("Danger Button").parent;
    const text = getByText("Danger Button");

    expect(button.props.className).toContain("bg-error");
    expect(text.props.className).toContain("text-white");
  });

  it("applies size-specific styles correctly", () => {
    const { getByText } = render(
      <Button size="lg" onPress={() => {}}>
        Large Button
      </Button>
    );

    const button = getByText("Large Button").parent;

    expect(button.props.className).toContain("px-6");
    expect(button.props.className).toContain("py-4");
  });
});
```

### 2. Testing Dynamic Styles

```javascript
// __tests__/DynamicStyles.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { View } from "react-native";

const DynamicComponent = ({ isActive, variant, size }) => {
  const getClassName = () => {
    const baseClass = "rounded-lg p-4";
    const variantClass =
      {
        primary: "bg-primary-500",
        secondary: "bg-secondary-500",
      }[variant] || "bg-gray-500";
    const activeClass = isActive ? "opacity-100" : "opacity-50";
    const sizeClass = size === "lg" ? "text-lg" : "text-base";

    return `${baseClass} ${variantClass} ${activeClass} ${sizeClass}`;
  };

  return (
    <View className={getClassName()}>
      <Text>Dynamic Content</Text>
    </View>
  );
};

describe("Dynamic Styles", () => {
  it("applies correct styles for different variants", () => {
    const { getByText } = render(
      <DynamicComponent variant="primary" isActive={true} size="lg" />
    );

    const container = getByText("Dynamic Content").parent;
    const className = container.props.className;

    expect(className).toContain("bg-primary-500");
    expect(className).toContain("opacity-100");
    expect(className).toContain("text-lg");
  });

  it("applies correct styles for inactive state", () => {
    const { getByText } = render(
      <DynamicComponent variant="secondary" isActive={false} size="base" />
    );

    const container = getByText("Dynamic Content").parent;
    const className = container.props.className;

    expect(className).toContain("bg-secondary-500");
    expect(className).toContain("opacity-50");
    expect(className).toContain("text-base");
  });
});
```

### 3. Testing Style Combinations

```javascript
// __tests__/StyleCombinations.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import Card from "../components/ui/Card";

describe("Style Combinations", () => {
  const testCases = [
    {
      name: "default card",
      props: {},
      expectedClasses: ["bg-white", "rounded-lg", "p-4"],
    },
    {
      name: "elevated card",
      props: { variant: "elevated" },
      expectedClasses: ["bg-white", "rounded-lg", "p-4", "shadow-lg"],
    },
    {
      name: "outlined card with large padding",
      props: { variant: "outlined", padding: "lg" },
      expectedClasses: [
        "bg-white",
        "rounded-lg",
        "p-6",
        "border",
        "border-gray-200",
      ],
    },
  ];

  testCases.forEach(({ name, props, expectedClasses }) => {
    it(`renders ${name} with correct styles`, () => {
      const { getByText } = render(
        <Card {...props}>
          <Text>Card Content</Text>
        </Card>
      );

      const card = getByText("Card Content").parent;
      const className = card.props.className;

      expectedClasses.forEach((expectedClass) => {
        expect(className).toContain(expectedClass);
      });
    });
  });
});
```

## Testing Theming

### 1. Testing Theme Context

```javascript
// __tests__/ThemeContext.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const TestComponent = () => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <View>
      <Text testID="theme-display">{theme}</Text>
      <Text testID="is-dark">{isDark.toString()}</Text>
      <TouchableOpacity testID="toggle-theme" onPress={() => setTheme("dark")}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
};

describe("Theme Context", () => {
  it("provides default theme", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId("theme-display")).toHaveTextContent("system");
  });

  it("allows theme switching", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId("toggle-theme"));

    expect(getByTestId("theme-display")).toHaveTextContent("dark");
    expect(getByTestId("is-dark")).toHaveTextContent("true");
  });

  it("respects system theme", () => {
    // Mock system color scheme
    jest
      .spyOn(require("react-native"), "useColorScheme")
      .mockReturnValue("dark");

    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(getByTestId("is-dark")).toHaveTextContent("true");
  });
});
```

### 2. Testing Theme-Aware Components

```javascript
// __tests__/ThemedComponents.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "../context/ThemeContext";
import ThemedCard from "../components/ui/ThemedCard";

const renderWithTheme = (component, theme = "system") => {
  return render(
    <ThemeProvider defaultTheme={theme}>{component}</ThemeProvider>
  );
};

describe("Themed Components", () => {
  it("applies light theme styles correctly", () => {
    const { getByText } = renderWithTheme(
      <ThemedCard>
        <Text>Light Theme Content</Text>
      </ThemedCard>,
      "light"
    );

    const card = getByText("Light Theme Content").parent;
    const className = card.props.className;

    expect(className).toContain("bg-white");
    expect(className).toContain("border-gray-200");
  });

  it("applies dark theme styles correctly", () => {
    const { getByText } = renderWithTheme(
      <ThemedCard>
        <Text>Dark Theme Content</Text>
      </ThemedCard>,
      "dark"
    );

    const card = getByText("Dark Theme Content").parent;
    const className = card.props.className;

    expect(className).toContain("bg-gray-800");
    expect(className).toContain("border-gray-700");
  });

  it("applies different variants with theme", () => {
    const { getByText } = renderWithTheme(
      <ThemedCard variant="elevated">
        <Text>Elevated Card</Text>
      </ThemedCard>,
      "dark"
    );

    const card = getByText("Elevated Card").parent;
    const className = card.props.className;

    expect(className).toContain("bg-gray-800");
    expect(className).toContain("shadow-lg");
  });
});
```

## Testing Responsive Styles

### 1. Testing Breakpoint Styles

```javascript
// __tests__/ResponsiveStyles.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

const ResponsiveComponent = ({ screenSize = "md" }) => {
  const getResponsiveClasses = () => {
    const baseClasses = "p-4 bg-white";

    const responsiveClasses = {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
      lg: "text-lg px-6 py-3",
      xl: "text-xl px-8 py-4",
    };

    return `${baseClasses} ${responsiveClasses[screenSize]}`;
  };

  return (
    <View className={getResponsiveClasses()}>
      <Text>Responsive Content</Text>
    </View>
  );
};

describe("Responsive Styles", () => {
  const screenSizes = ["sm", "md", "lg", "xl"];

  screenSizes.forEach((size) => {
    it(`applies correct styles for ${size} screen`, () => {
      const { getByText } = render(<ResponsiveComponent screenSize={size} />);

      const container = getByText("Responsive Content").parent;
      const className = container.props.className;

      expect(className).toContain("p-4");
      expect(className).toContain("bg-white");

      // Test responsive text size
      expect(className).toContain(
        `text-${size === "sm" ? "sm" : size === "md" ? "base" : size === "lg" ? "lg" : "xl"}`
      );

      // Test responsive padding
      const paddingMap = {
        sm: "px-2 py-1",
        md: "px-4 py-2",
        lg: "px-6 py-3",
        xl: "px-8 py-4",
      };
      expect(className).toContain(paddingMap[size]);
    });
  });
});
```

### 2. Testing Platform-Specific Styles

```javascript
// __tests__/PlatformStyles.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { Platform, View, Text } from "react-native";

const PlatformComponent = () => {
  const getPlatformClasses = () => {
    const baseClasses = "p-4 rounded-lg";

    const platformClasses = Platform.select({
      ios: "shadow-sm",
      android: "elevation-2",
    });

    return `${baseClasses} ${platformClasses}`;
  };

  return (
    <View className={getPlatformClasses()}>
      <Text>Platform Content</Text>
    </View>
  );
};

describe("Platform-Specific Styles", () => {
  it("applies iOS-specific styles", () => {
    Platform.OS = "ios";

    const { getByText } = render(<PlatformComponent />);
    const container = getByText("Platform Content").parent;
    const className = container.props.className;

    expect(className).toContain("shadow-sm");
    expect(className).not.toContain("elevation-2");
  });

  it("applies Android-specific styles", () => {
    Platform.OS = "android";

    const { getByText } = render(<PlatformComponent />);
    const container = getByText("Platform Content").parent;
    const className = container.props.className;

    expect(className).toContain("elevation-2");
    expect(className).not.toContain("shadow-sm");
  });
});
```

## Component Testing

### 1. Testing Component Interactions

```javascript
// __tests__/ComponentInteractions.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "../components/ui/Button";

describe("Button Interactions", () => {
  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Test Button</Button>
    );

    fireEvent.press(getByText("Test Button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>
        Disabled Button
      </Button>
    );

    fireEvent.press(getByText("Disabled Button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows loading state correctly", () => {
    const { getByText, queryByText } = render(
      <Button loading onPress={() => {}}>
        Loading Button
      </Button>
    );

    // Button text should still be visible
    expect(getByText("Loading Button")).toBeTruthy();

    // Activity indicator should be present
    const button = getByText("Loading Button").parent;
    expect(button.props.disabled).toBe(true);
  });
});
```

### 2. Testing Component State Changes

```javascript
// __tests__/ComponentState.test.tsx
import React, { useState } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View, Text, TouchableOpacity } from "react-native";

const StatefulComponent = () => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  return (
    <View>
      <Text testID="count">{count}</Text>
      <TouchableOpacity
        testID="increment"
        onPress={() => setCount(count + 1)}
        className={`p-4 rounded-lg ${isActive ? "bg-blue-500" : "bg-gray-500"}`}
      >
        <Text>Increment</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="toggle" onPress={() => setIsActive(!isActive)}>
        <Text>Toggle Active</Text>
      </TouchableOpacity>
    </View>
  );
};

describe("Component State Changes", () => {
  it("updates count when increment button is pressed", () => {
    const { getByTestId } = render(<StatefulComponent />);

    expect(getByTestId("count")).toHaveTextContent("0");

    fireEvent.press(getByTestId("increment"));
    expect(getByTestId("count")).toHaveTextContent("1");

    fireEvent.press(getByTestId("increment"));
    expect(getByTestId("count")).toHaveTextContent("2");
  });

  it("toggles active state and updates styles", () => {
    const { getByTestId } = render(<StatefulComponent />);

    const button = getByTestId("increment");
    expect(button.props.className).toContain("bg-gray-500");

    fireEvent.press(getByTestId("toggle"));
    expect(button.props.className).toContain("bg-blue-500");

    fireEvent.press(getByTestId("toggle"));
    expect(button.props.className).toContain("bg-gray-500");
  });
});
```

## Integration Testing

### 1. Testing Component Composition

```javascript
// __tests__/ComponentComposition.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemeProvider } from "../context/ThemeContext";
import { Button, Card, Input } from "../components/ui";

const ContactForm = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
  });

  const handleSubmit = jest.fn();

  return (
    <ThemeProvider>
      <Card className="p-6">
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          placeholder="Enter your name"
        />
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, email: text }))
          }
          placeholder="Enter your email"
        />
        <Button onPress={handleSubmit} className="mt-4">
          Submit
        </Button>
      </Card>
    </ThemeProvider>
  );
};

describe("Component Composition", () => {
  it("renders form with all components", () => {
    const { getByText, getByPlaceholderText } = render(<ContactForm />);

    expect(getByText("Name")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your name")).toBeTruthy();
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByText("Submit")).toBeTruthy();
  });

  it("handles form interactions correctly", () => {
    const { getByPlaceholderText, getByText } = render(<ContactForm />);

    const nameInput = getByPlaceholderText("Enter your name");
    const emailInput = getByPlaceholderText("Enter your email");
    const submitButton = getByText("Submit");

    fireEvent.changeText(nameInput, "John Doe");
    fireEvent.changeText(emailInput, "john@example.com");
    fireEvent.press(submitButton);

    expect(nameInput.props.value).toBe("John Doe");
    expect(emailInput.props.value).toBe("john@example.com");
  });
});
```

### 2. Testing Modal Interactions

```javascript
// __tests__/ModalIntegration.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Modal from "../components/ui/Modal";

const TestModal = () => {
  return (
    <Modal defaultOpen={false}>
      <Modal.Trigger>
        <Text>Open Modal</Text>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>
          <Text>Modal content goes here</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onPress={() => {}}>
            Cancel
          </Button>
          <Button onPress={() => {}}>Confirm</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

describe("Modal Integration", () => {
  it("opens modal when trigger is pressed", () => {
    const { getByText, queryByText } = render(<TestModal />);

    // Modal content should not be visible initially
    expect(queryByText("Test Modal")).toBeNull();

    // Press trigger to open modal
    fireEvent.press(getByText("Open Modal"));

    // Modal content should now be visible
    expect(getByText("Test Modal")).toBeTruthy();
    expect(getByText("Modal content goes here")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();
  });

  it("closes modal when close button is pressed", () => {
    const { getByText, queryByText } = render(<TestModal />);

    // Open modal
    fireEvent.press(getByText("Open Modal"));
    expect(getByText("Test Modal")).toBeTruthy();

    // Close modal
    fireEvent.press(getByText("×"));
    expect(queryByText("Test Modal")).toBeNull();
  });
});
```

## Performance Testing

### 1. Testing Render Performance

```javascript
// __tests__/Performance.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { performance } from 'perf_hooks';

const measureRenderTime = (component: React.ReactElement): number => {
  const startTime = performance.now();
  render(component);
  const endTime = performance.now();
  return endTime - startTime;
};

describe('Component Performance', () => {
  it('renders button within acceptable time', () => {
    const renderTime = measureRenderTime(
      <Button variant="primary" onPress={() => {}}>
        Test Button
      </Button>
    );

    expect(renderTime).toBeLessThan(16); // 60 FPS = 16ms per frame
  });

  it('renders complex component within acceptable time', () => {
    const renderTime = measureRenderTime(
      <Card>
        <Text>Complex content</Text>
        <Button onPress={() => {}}>Action</Button>
        <Input placeholder="Enter text" />
      </Card>
    );

    expect(renderTime).toBeLessThan(50); // Allow more time for complex components
  });

  it('handles large lists efficiently', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
    }));

    const renderTime = measureRenderTime(
      <FlatList
        data={largeData}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    );

    expect(renderTime).toBeLessThan(100); // Allow more time for large lists
  });
});
```

### 2. Testing Memory Usage

```javascript
// __tests__/MemoryUsage.test.tsx
import React from 'react';
import { render, unmountComponentAtNode } from '@testing-library/react-native';

const measureMemoryUsage = (component: React.ReactElement): number => {
  const startMemory = (global as any).performance?.memory?.usedJSHeapSize || 0;

  const { unmount } = render(component);
  unmount();

  const endMemory = (global as any).performance?.memory?.usedJSHeapSize || 0;
  return endMemory - startMemory;
};

describe('Memory Usage', () => {
  it('does not leak memory on component unmount', () => {
    const memoryIncrease = measureMemoryUsage(
      <Button variant="primary" onPress={() => {}}>
        Test Button
      </Button>
    );

    expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
  });

  it('handles theme switching without memory leaks', () => {
    const memoryIncrease = measureMemoryUsage(
      <ThemeProvider>
        <ThemedCard>
          <Text>Theme content</Text>
        </ThemedCard>
      </ThemeProvider>
    );

    expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024); // Less than 2MB
  });
});
```

## Best Practices

### 1. Test Organization

```javascript
// __tests__/index.ts - Test organization
export * from "./components/Button.test";
export * from "./components/Card.test";
export * from "./components/Input.test";
export * from "./theming/ThemeContext.test";
export * from "./styles/NativeWindStyles.test";
export * from "./visual/ButtonVisual.test";
```

### 2. Test Utilities

```javascript
// utils/testUtils.ts
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system';
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { theme = 'system', ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider defaultTheme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from '@testing-library/react-native';
export { customRender as render };
```

### 3. Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}"],
  snapshotSerializers: ["@testing-library/jest-native/extend-expect"],
};
```

### 4. Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run visual regression tests
        run: npm run test:visual

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

This comprehensive testing guide covers all aspects of testing UI and styles in React Native with NativeWind. The key is to establish a robust testing strategy that covers visual regression, component behavior, and performance while maintaining good test organization and CI/CD integration.
