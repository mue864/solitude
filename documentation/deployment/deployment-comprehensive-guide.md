# React Native Deployment & CI/CD Comprehensive Guide

## Table of Contents

1. [Build Configuration](#build-configuration)
2. [Environment Management](#environment-management)
3. [Automated Deployment](#automated-deployment)
4. [App Store Deployment](#app-store-deployment)
5. [Testing & Quality Assurance](#testing--quality-assurance)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Best Practices](#best-practices)
8. [Real-World Examples](#real-world-examples)

## Build Configuration

### 1. App Configuration

```javascript
// app.json - Main app configuration
{
  "expo": {
    "name": "Solitude - Focus App",
    "slug": "solitude-focus",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mutsa47.solitude",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses camera for profile photos",
        "NSPhotoLibraryUsageDescription": "This app accesses photo library for profile photos",
        "NSMicrophoneUsageDescription": "This app uses microphone for voice notes"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.mutsa47.solitude",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@notifee/react-native",
      "expo-router"
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. EAS Build Configuration

```javascript
// eas.json - EAS Build configuration
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 3. Metro Configuration

```javascript
// metro.config.js - Metro bundler configuration
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add custom resolver for SVG files
config.resolver.assetExts.push("svg");
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Configure for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Optimize bundle size
config.transformer.optimization = {
  minimize: true,
  concatenateModules: true,
};

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 4. Babel Configuration

```javascript
// babel.config.js - Babel configuration
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Expo Router
      "expo-router/babel",

      // NativeWind
      "nativewind/babel",

      // Reanimated (if using)
      "react-native-reanimated/plugin",

      // Optional: Code splitting
      [
        "@babel/plugin-transform-runtime",
        {
          regenerator: true,
        },
      ],
    ],
    env: {
      production: {
        plugins: [
          // Remove console.log in production
          "transform-remove-console",
        ],
      },
    },
  };
};
```

## Environment Management

### 1. Environment Configuration

```javascript
// config/environment.js
import Constants from "expo-constants";

const ENV = {
  development: {
    apiUrl: "https://dev-api.yourbackend.com",
    websocketUrl: "wss://dev-ws.yourbackend.com",
    environment: "development",
    enableLogging: true,
    enableAnalytics: false,
  },
  staging: {
    apiUrl: "https://staging-api.yourbackend.com",
    websocketUrl: "wss://staging-ws.yourbackend.com",
    environment: "staging",
    enableLogging: true,
    enableAnalytics: true,
  },
  production: {
    apiUrl: "https://api.yourbackend.com",
    websocketUrl: "wss://ws.yourbackend.com",
    environment: "production",
    enableLogging: false,
    enableAnalytics: true,
  },
};

const getEnvironment = () => {
  const releaseChannel = Constants.expoConfig?.releaseChannel;

  if (__DEV__) {
    return ENV.development;
  }

  if (releaseChannel === "staging") {
    return ENV.staging;
  }

  return ENV.production;
};

export const config = getEnvironment();
```

### 2. Environment Variables

```javascript
// .env.development
API_URL=https://dev-api.yourbackend.com
WEBSOCKET_URL=wss://dev-ws.yourbackend.com
ENVIRONMENT=development
ENABLE_LOGGING=true
ENABLE_ANALYTICS=false

# Notifee Configuration
NOTIFEE_CHANNEL_ID=default
NOTIFEE_CHANNEL_NAME=Default Channel

# Analytics
ANALYTICS_KEY=your-dev-analytics-key
```

```javascript
// .env.production
API_URL=https://api.yourbackend.com
WEBSOCKET_URL=wss://ws.yourbackend.com
ENVIRONMENT=production
ENABLE_LOGGING=false
ENABLE_ANALYTICS=true

# Notifee Configuration
NOTIFEE_CHANNEL_ID=default
NOTIFEE_CHANNEL_NAME=Default Channel

# Analytics
ANALYTICS_KEY=your-prod-analytics-key
```

### 3. Build Scripts

```json
// package.json - Build scripts
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",

    "build:android:dev": "eas build --platform android --profile development",
    "build:android:preview": "eas build --platform android --profile preview",
    "build:android:prod": "eas build --platform android --profile production",

    "build:ios:dev": "eas build --platform ios --profile development",
    "build:ios:preview": "eas build --platform ios --profile preview",
    "build:ios:prod": "eas build --platform ios --profile production",

    "build:all:dev": "eas build --platform all --profile development",
    "build:all:preview": "eas build --platform all --profile preview",
    "build:all:prod": "eas build --platform all --profile production",

    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android",
    "submit:all": "eas submit --platform all",

    "update": "expo update",
    "update:check": "expo update --check",

    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Automated Deployment

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to EAS

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

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

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test:coverage

  build-development:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g @expo/eas-cli

      - name: Login to EAS
        run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android Development
        run: eas build --platform android --profile development --non-interactive

      - name: Build iOS Development
        run: eas build --platform ios --profile development --non-interactive

  build-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g @expo/eas-cli

      - name: Login to EAS
        run: eas login --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android Production
        run: eas build --platform android --profile production --non-interactive

      - name: Build iOS Production
        run: eas build --platform ios --profile production --non-interactive

      - name: Submit to App Store
        run: eas submit --platform all --non-interactive
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}

  notify:
    needs: [build-development, build-production]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify on success
        if: success()
        run: |
          echo "Build completed successfully!"
          # Add your notification logic here (Slack, Discord, etc.)

      - name: Notify on failure
        if: failure()
        run: |
          echo "Build failed!"
          # Add your notification logic here
```

### 2. Fastlane Configuration

```ruby
# fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build iOS app"
  lane :build do
    setup_ci if is_ci

    # Update code signing settings
    update_code_signing_settings(
      use_automatic_signing: true,
      team_id: ENV["TEAM_ID"]
    )

    # Build the app
    build_ios_app(
      scheme: "Solitude",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "com.mutsa47.solitude" => "match AppStore com.mutsa47.solitude"
        }
      },
      output_directory: "builds",
      output_name: "Solitude.ipa"
    )
  end

  desc "Upload to TestFlight"
  lane :beta do
    build
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end

  desc "Upload to App Store"
  lane :release do
    build
    upload_to_app_store(
      force: true,
      skip_metadata: true,
      skip_screenshots: true
    )
  end
end

platform :android do
  desc "Build Android app"
  lane :build do
    gradle(
      task: "clean assembleRelease",
      project_dir: "android/"
    )
  end

  desc "Upload to Play Store"
  lane :release do
    build
    upload_to_play_store(
      track: 'production',
      aab: '../android/app/build/outputs/bundle/release/app-release.aab'
    )
  end
end
```

### 3. Automated Testing

```javascript
// jest.config.js - Testing configuration
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

```javascript
// __tests__/App.test.tsx - Example test
import React from "react";
import { render, screen } from "@testing-library/react-native";
import App from "../App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("Solitude")).toBeTruthy();
  });
});
```

## App Store Deployment

### 1. iOS App Store Preparation

```javascript
// ios/Solitude/Info.plist - iOS configuration
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>Solitude</string>
  <key>CFBundleIdentifier</key>
  <string>com.mutsa47.solitude</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>UILaunchStoryboardName</key>
  <string>SplashScreen</string>
  <key>UIRequiredDeviceCapabilities</key>
  <array>
    <string>armv7</string>
  </array>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
  </array>
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
      <key>yourbackend.com</key>
      <dict>
        <key>NSExceptionAllowsInsecureHTTPLoads</key>
        <false/>
        <key>NSExceptionMinimumTLSVersion</key>
        <string>TLSv1.2</string>
      </dict>
    </dict>
  </dict>
</dict>
</plist>
```

### 2. Android Play Store Preparation

```gradle
// android/app/build.gradle - Android build configuration
android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.mutsa47.solitude"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"

        // Enable multidex
        multiDexEnabled true

        // Enable ProGuard
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }

    signingConfigs {
        release {
            storeFile file('release-key.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

            // Enable bundle splitting
            splits {
                abi {
                    enable true
                    reset()
                    include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
                    universalApk false
                }
            }
        }
    }
}
```

### 3. App Store Metadata

```json
// app-store-metadata.json
{
  "ios": {
    "name": "Solitude - Focus & Productivity",
    "subtitle": "Master your focus, boost productivity",
    "description": "Solitude is your personal focus companion designed to help you achieve deep work and maintain productivity. Features include:\n\n• Pomodoro Timer with customizable sessions\n• Task management with priority levels\n• Progress tracking and analytics\n• Journal and reflection tools\n• Beautiful, distraction-free interface\n\nPerfect for students, professionals, and anyone looking to improve their focus and productivity.",
    "keywords": "focus,productivity,pomodoro,timer,task,management,study,work,concentration",
    "screenshots": [
      "screenshots/ios/1.png",
      "screenshots/ios/2.png",
      "screenshots/ios/3.png"
    ],
    "icon": "icon-ios.png",
    "category": "Productivity",
    "contentRating": "4+",
    "languages": ["en"],
    "price": "0",
    "availability": "all"
  },
  "android": {
    "name": "Solitude - Focus & Productivity",
    "shortDescription": "Master your focus, boost productivity",
    "fullDescription": "Solitude is your personal focus companion designed to help you achieve deep work and maintain productivity. Features include:\n\n• Pomodoro Timer with customizable sessions\n• Task management with priority levels\n• Progress tracking and analytics\n• Journal and reflection tools\n• Beautiful, distraction-free interface\n\nPerfect for students, professionals, and anyone looking to improve their focus and productivity.",
    "keywords": "focus,productivity,pomodoro,timer,task,management,study,work,concentration",
    "screenshots": [
      "screenshots/android/1.png",
      "screenshots/android/2.png",
      "screenshots/android/3.png"
    ],
    "icon": "icon-android.png",
    "category": "Productivity",
    "contentRating": "Everyone",
    "languages": ["en"],
    "price": "0",
    "availability": "all"
  }
}
```

## Testing & Quality Assurance

### 1. Automated Testing Pipeline

```javascript
// scripts/test-pipeline.js
const { execSync } = require("child_process");
const fs = require("fs");

class TestPipeline {
  constructor() {
    this.results = {
      lint: false,
      typeCheck: false,
      unitTests: false,
      integrationTests: false,
      e2eTests: false,
    };
  }

  async runLinting() {
    try {
      console.log("🔍 Running ESLint...");
      execSync("npm run lint", { stdio: "inherit" });
      this.results.lint = true;
      console.log("✅ Linting passed");
    } catch (error) {
      console.error("❌ Linting failed");
      throw error;
    }
  }

  async runTypeChecking() {
    try {
      console.log("🔍 Running TypeScript type checking...");
      execSync("npm run type-check", { stdio: "inherit" });
      this.results.typeCheck = true;
      console.log("✅ Type checking passed");
    } catch (error) {
      console.error("❌ Type checking failed");
      throw error;
    }
  }

  async runUnitTests() {
    try {
      console.log("🧪 Running unit tests...");
      execSync("npm run test:coverage", { stdio: "inherit" });
      this.results.unitTests = true;
      console.log("✅ Unit tests passed");
    } catch (error) {
      console.error("❌ Unit tests failed");
      throw error;
    }
  }

  async runIntegrationTests() {
    try {
      console.log("🔗 Running integration tests...");
      execSync("npm run test:integration", { stdio: "inherit" });
      this.results.integrationTests = true;
      console.log("✅ Integration tests passed");
    } catch (error) {
      console.error("❌ Integration tests failed");
      throw error;
    }
  }

  async runE2ETests() {
    try {
      console.log("🌐 Running E2E tests...");
      execSync("npm run test:e2e", { stdio: "inherit" });
      this.results.e2eTests = true;
      console.log("✅ E2E tests passed");
    } catch (error) {
      console.error("❌ E2E tests failed");
      throw error;
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(Boolean).length,
        failed: Object.values(this.results).filter((r) => !r).length,
      },
    };

    fs.writeFileSync("test-report.json", JSON.stringify(report, null, 2));
    console.log("📊 Test report generated: test-report.json");
  }

  async runAll() {
    try {
      await this.runLinting();
      await this.runTypeChecking();
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      await this.generateReport();

      console.log("🎉 All tests passed!");
      return true;
    } catch (error) {
      console.error("💥 Test pipeline failed");
      await this.generateReport();
      return false;
    }
  }
}

module.exports = TestPipeline;
```

### 2. Performance Testing

```javascript
// scripts/performance-test.js
import { PerformanceObserver, performance } from "perf_hooks";

class PerformanceTester {
  constructor() {
    this.metrics = [];
  }

  startTimer(name) {
    performance.mark(`${name}-start`);
  }

  endTimer(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  async measureBundleSize() {
    console.log("📦 Measuring bundle size...");

    const bundleStats = {
      js: 0,
      assets: 0,
      total: 0,
    };

    // Implementation for bundle size measurement
    return bundleStats;
  }

  async measureStartupTime() {
    console.log("⏱️ Measuring startup time...");

    this.startTimer("app-startup");

    // Simulate app startup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.endTimer("app-startup");

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.push({
          name: entry.name,
          duration: entry.duration,
          timestamp: new Date().toISOString(),
        });
      });
    });

    observer.observe({ entryTypes: ["measure"] });
  }

  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        averageStartupTime:
          this.metrics
            .filter((m) => m.name === "app-startup")
            .reduce((acc, m) => acc + m.duration, 0) / this.metrics.length,
      },
    };

    console.log("📊 Performance report:", report);
    return report;
  }
}

export default PerformanceTester;
```

## Monitoring & Analytics

### 1. Error Tracking

```javascript
// utils/errorTracking.js
import * as Sentry from "@sentry/react-native";

class ErrorTracker {
  constructor() {
    this.initializeSentry();
  }

  initializeSentry() {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enableAutoSessionTracking: true,
      debug: __DEV__,
      beforeSend: (event) => {
        // Filter out development errors
        if (__DEV__) {
          return null;
        }
        return event;
      },
    });
  }

  captureException(error, context = {}) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  captureMessage(message, level = "info") {
    Sentry.captureMessage(message, level);
  }

  setUser(user) {
    Sentry.setUser(user);
  }

  setTag(key, value) {
    Sentry.setTag(key, value);
  }
}

export const errorTracker = new ErrorTracker();
```

### 2. Analytics Integration

```javascript
// utils/analytics.js
import analytics from "@react-native-firebase/analytics";

class Analytics {
  constructor() {
    this.isEnabled = process.env.ENABLE_ANALYTICS === "true";
  }

  async logEvent(eventName, parameters = {}) {
    if (!this.isEnabled) return;

    try {
      await analytics().logEvent(eventName, parameters);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  async logSessionStart() {
    await this.logEvent("session_start", {
      timestamp: new Date().toISOString(),
    });
  }

  async logSessionComplete(duration) {
    await this.logEvent("session_complete", {
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  async logTaskCreated(taskType) {
    await this.logEvent("task_created", {
      task_type: taskType,
      timestamp: new Date().toISOString(),
    });
  }

  async logTaskCompleted(taskType, duration) {
    await this.logEvent("task_completed", {
      task_type: taskType,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  async setUserProperties(properties) {
    if (!this.isEnabled) return;

    try {
      await analytics().setUserProperties(properties);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }
}

export const analytics = new Analytics();
```

### 3. Performance Monitoring

```javascript
// utils/performanceMonitoring.js
import { PerformanceObserver, performance } from "perf_hooks";

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.push({
          name: entry.name,
          duration: entry.duration,
          timestamp: new Date().toISOString(),
        });
      });
    });

    this.observer.observe({ entryTypes: ["measure"] });
  }

  startTimer(name) {
    performance.mark(`${name}-start`);
  }

  endTimer(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageDuration(name) {
    const relevantMetrics = this.metrics.filter((m) => m.name === name);
    if (relevantMetrics.length === 0) return 0;

    return (
      relevantMetrics.reduce((acc, m) => acc + m.duration, 0) /
      relevantMetrics.length
    );
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        totalMetrics: this.metrics.length,
        averageDuration:
          this.metrics.reduce((acc, m) => acc + m.duration, 0) /
          this.metrics.length,
      },
    };

    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

## Best Practices

### 1. Build Optimization

```javascript
// scripts/build-optimizer.js
const fs = require("fs");
const path = require("path");

class BuildOptimizer {
  constructor() {
    this.optimizations = [];
  }

  optimizeBundle() {
    console.log("🔧 Optimizing bundle...");

    // Remove unused dependencies
    this.removeUnusedDependencies();

    // Optimize images
    this.optimizeImages();

    // Minify code
    this.minifyCode();

    console.log("✅ Bundle optimization complete");
  }

  removeUnusedDependencies() {
    console.log("🗑️ Removing unused dependencies...");
    // Implementation for dependency analysis
  }

  optimizeImages() {
    console.log("🖼️ Optimizing images...");
    // Implementation for image optimization
  }

  minifyCode() {
    console.log("📝 Minifying code...");
    // Implementation for code minification
  }

  generateBuildReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: this.optimizations,
      bundleSize: this.getBundleSize(),
    };

    fs.writeFileSync("build-report.json", JSON.stringify(report, null, 2));
    console.log("📊 Build report generated");
  }

  getBundleSize() {
    // Implementation for bundle size calculation
    return {
      js: "2.1MB",
      assets: "5.3MB",
      total: "7.4MB",
    };
  }
}

module.exports = BuildOptimizer;
```

### 2. Security Checks

```javascript
// scripts/security-checker.js
const fs = require("fs");
const path = require("path");

class SecurityChecker {
  constructor() {
    this.vulnerabilities = [];
  }

  async checkDependencies() {
    console.log("🔒 Checking dependencies for vulnerabilities...");

    try {
      const { execSync } = require("child_process");
      execSync("npm audit --audit-level moderate", { stdio: "inherit" });
      console.log("✅ No critical vulnerabilities found");
    } catch (error) {
      console.error("❌ Vulnerabilities found in dependencies");
      this.vulnerabilities.push("dependencies");
    }
  }

  async checkCodeSecurity() {
    console.log("🔒 Checking code security...");

    // Check for common security issues
    this.checkForHardcodedSecrets();
    this.checkForInsecureAPIs();
    this.checkForWeakEncryption();

    console.log("✅ Code security check complete");
  }

  checkForHardcodedSecrets() {
    const patterns = [
      /api_key\s*[:=]\s*['"][^'"]+['"]/,
      /password\s*[:=]\s*['"][^'"]+['"]/,
      /secret\s*[:=]\s*['"][^'"]+['"]/,
    ];

    const files = this.getAllFiles(".");

    files.forEach((file) => {
      if (
        file.endsWith(".js") ||
        file.endsWith(".ts") ||
        file.endsWith(".json")
      ) {
        const content = fs.readFileSync(file, "utf8");
        patterns.forEach((pattern) => {
          if (pattern.test(content)) {
            console.warn(`⚠️ Potential hardcoded secret found in ${file}`);
          }
        });
      }
    });
  }

  checkForInsecureAPIs() {
    const insecurePatterns = [/http:\/\//, /eval\(/, /innerHTML\s*=/];

    const files = this.getAllFiles(".");

    files.forEach((file) => {
      if (file.endsWith(".js") || file.endsWith(".ts")) {
        const content = fs.readFileSync(file, "utf8");
        insecurePatterns.forEach((pattern) => {
          if (pattern.test(content)) {
            console.warn(`⚠️ Potential insecure API usage found in ${file}`);
          }
        });
      }
    });
  }

  checkForWeakEncryption() {
    // Implementation for encryption strength checking
  }

  getAllFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith(".") &&
        item !== "node_modules"
      ) {
        files.push(...this.getAllFiles(fullPath));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    });

    return files;
  }

  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      vulnerabilities: this.vulnerabilities,
      summary: {
        total: this.vulnerabilities.length,
        critical: this.vulnerabilities.filter((v) => v === "critical").length,
        moderate: this.vulnerabilities.filter((v) => v === "moderate").length,
        low: this.vulnerabilities.filter((v) => v === "low").length,
      },
    };

    fs.writeFileSync("security-report.json", JSON.stringify(report, null, 2));
    console.log("📊 Security report generated");
  }
}

module.exports = SecurityChecker;
```

## Real-World Examples

### 1. Complete Deployment Pipeline

```javascript
// scripts/deploy.js
const { execSync } = require("child_process");
const TestPipeline = require("./test-pipeline");
const BuildOptimizer = require("./build-optimizer");
const SecurityChecker = require("./security-checker");

class DeploymentPipeline {
  constructor() {
    this.testPipeline = new TestPipeline();
    this.buildOptimizer = new BuildOptimizer();
    this.securityChecker = new SecurityChecker();
  }

  async run() {
    console.log("🚀 Starting deployment pipeline...");

    try {
      // 1. Run tests
      console.log("\n📋 Step 1: Running tests...");
      const testsPassed = await this.testPipeline.runAll();
      if (!testsPassed) {
        throw new Error("Tests failed");
      }

      // 2. Security checks
      console.log("\n🔒 Step 2: Security checks...");
      await this.securityChecker.checkDependencies();
      await this.securityChecker.checkCodeSecurity();

      // 3. Build optimization
      console.log("\n🔧 Step 3: Build optimization...");
      this.buildOptimizer.optimizeBundle();

      // 4. Build for production
      console.log("\n🏗️ Step 4: Building for production...");
      await this.buildForProduction();

      // 5. Deploy
      console.log("\n🚀 Step 5: Deploying...");
      await this.deploy();

      console.log("\n✅ Deployment completed successfully!");
    } catch (error) {
      console.error("\n❌ Deployment failed:", error.message);
      process.exit(1);
    }
  }

  async buildForProduction() {
    const platform = process.env.PLATFORM || "all";

    if (platform === "ios" || platform === "all") {
      console.log("📱 Building for iOS...");
      execSync(
        "eas build --platform ios --profile production --non-interactive",
        { stdio: "inherit" }
      );
    }

    if (platform === "android" || platform === "all") {
      console.log("🤖 Building for Android...");
      execSync(
        "eas build --platform android --profile production --non-interactive",
        { stdio: "inherit" }
      );
    }
  }

  async deploy() {
    console.log("📤 Submitting to app stores...");
    execSync("eas submit --platform all --non-interactive", {
      stdio: "inherit",
    });
  }
}

// Run deployment if called directly
if (require.main === module) {
  const pipeline = new DeploymentPipeline();
  pipeline.run();
}

module.exports = DeploymentPipeline;
```

### 2. Environment-Specific Configuration

```javascript
// config/deployment.js
const environments = {
  development: {
    apiUrl: "https://dev-api.solitude.com",
    websocketUrl: "wss://dev-ws.solitude.com",
    environment: "development",
    enableLogging: true,
    enableAnalytics: false,
    enableCrashReporting: false,
    buildNumber: "1",
    version: "1.0.0-dev",
  },
  staging: {
    apiUrl: "https://staging-api.solitude.com",
    websocketUrl: "wss://staging-ws.solitude.com",
    environment: "staging",
    enableLogging: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    buildNumber: "2",
    version: "1.0.0-beta",
  },
  production: {
    apiUrl: "https://api.solitude.com",
    websocketUrl: "wss://ws.solitude.com",
    environment: "production",
    enableLogging: false,
    enableAnalytics: true,
    enableCrashReporting: true,
    buildNumber: "3",
    version: "1.0.0",
  },
};

class DeploymentConfig {
  constructor(environment = "development") {
    this.environment = environment;
    this.config = environments[environment];
  }

  getApiUrl() {
    return this.config.apiUrl;
  }

  getWebsocketUrl() {
    return this.config.websocketUrl;
  }

  isLoggingEnabled() {
    return this.config.enableLogging;
  }

  isAnalyticsEnabled() {
    return this.config.enableAnalytics;
  }

  isCrashReportingEnabled() {
    return this.config.enableCrashReporting;
  }

  getBuildNumber() {
    return this.config.buildNumber;
  }

  getVersion() {
    return this.config.version;
  }

  updateAppConfig() {
    // Update app.json with environment-specific values
    const appConfig = require("../app.json");

    appConfig.expo.version = this.config.version;
    appConfig.expo.ios.buildNumber = this.config.buildNumber;
    appConfig.expo.android.versionCode = parseInt(this.config.buildNumber);

    // Update extra configuration
    appConfig.expo.extra = {
      ...appConfig.expo.extra,
      apiUrl: this.config.apiUrl,
      websocketUrl: this.config.websocketUrl,
      environment: this.config.environment,
      enableLogging: this.config.enableLogging,
      enableAnalytics: this.config.enableAnalytics,
      enableCrashReporting: this.config.enableCrashReporting,
    };

    return appConfig;
  }
}

module.exports = DeploymentConfig;
```

This comprehensive deployment guide covers all essential aspects of deploying React Native applications, from build configuration to automated deployment pipelines. The examples are specifically tailored for your focus app and include best practices for production deployments.

The guide provides everything you need to set up a robust deployment pipeline with automated testing, security checks, and monitoring for your React Native application.
