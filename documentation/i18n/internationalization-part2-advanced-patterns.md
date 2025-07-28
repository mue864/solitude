# React Native Internationalization - Part 2: Advanced Patterns & Implementation

## Table of Contents

1. [Advanced Translation Patterns](#advanced-translation-patterns)
2. [Dynamic Content Management](#dynamic-content-management)
3. [Performance Optimization](#performance-optimization)
4. [Testing & Quality Assurance](#testing--quality-assurance)
5. [Real-World Implementation](#real-world-implementation)
6. [Common Pitfalls & Solutions](#common-pitfalls--solutions)

## Advanced Translation Patterns

### 1. Nested Translation Keys with Context

```javascript
// translations/en.js
export default {
  journal: {
    entry: {
      new: "New Entry",
      edit: "Edit Entry",
      delete: "Delete Entry",
      save: "Save Entry",
      cancel: "Cancel",
      placeholder: "Write your thoughts...",
      characterCount: "{{count}} characters",
      wordCount: "{{words}} words",
    },
    mood: {
      title: "How are you feeling?",
      options: {
        happy: "Happy",
        calm: "Calm",
        anxious: "Anxious",
        sad: "Sad",
        excited: "Excited",
      },
    },
    tags: {
      title: "Tags",
      add: "Add Tag",
      remove: "Remove Tag",
      common: {
        work: "Work",
        personal: "Personal",
        health: "Health",
        relationships: "Relationships",
        goals: "Goals",
      },
    },
  },
  focus: {
    session: {
      start: "Start Session",
      pause: "Pause Session",
      resume: "Resume Session",
      end: "End Session",
      complete: "Session Complete!",
      duration: "{{minutes}} minutes",
      remaining: "{{time}} remaining",
    },
    timer: {
      work: "Work Time",
      break: "Break Time",
      longBreak: "Long Break",
      pomodoro: "Pomodoro",
    },
    stats: {
      today: "Today's Sessions",
      week: "This Week",
      month: "This Month",
      total: "Total Sessions",
      average: "Average Session",
    },
  },
};
```

### 2. Conditional Translations Based on User State

```javascript
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const PersonalizedGreeting = ({ user, sessionCount, isFirstTime }) => {
  const { t } = useTranslation();

  const getGreetingKey = () => {
    if (isFirstTime) return "greeting.firstTime";
    if (sessionCount === 0) return "greeting.noSessions";
    if (sessionCount < 5) return "greeting.fewSessions";
    return "greeting.experienced";
  };

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("motivation.morning");
    if (hour < 17) return t("motivation.afternoon");
    return t("motivation.evening");
  };

  return (
    <View className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 rounded-xl">
      <Text className="text-white text-2xl font-bold mb-2">
        {t(getGreetingKey(), { name: user.name })}
      </Text>

      <Text className="text-blue-100 text-lg mb-4">
        {getMotivationalMessage()}
      </Text>

      <View className="bg-white/20 rounded-lg p-4">
        <Text className="text-white text-base font-medium">
          {t("stats.sessionCount", { count: sessionCount })}
        </Text>

        {sessionCount > 0 && (
          <Text className="text-blue-100 text-sm mt-1">
            {t("stats.thisWeek", { count: user.weeklySessions })}
          </Text>
        )}
      </View>
    </View>
  );
};

export default PersonalizedGreeting;
```

### 3. Complex Pluralization with Context

```javascript
// translations/en.js
{
  notifications: {
    session: {
      reminder: "Time to focus!",
      complete: "Session completed!",
      overdue: "Session overdue by {{minutes}} minutes",
      streak: {
        one: "{{count}} day streak!",
        other: "{{count}} days streak!",
      },
    },
    journal: {
      reminder: "Time to reflect",
      entry: {
        one: "{{count}} journal entry today",
        other: "{{count}} journal entries today",
      },
      streak: {
        one: "{{count}} day of journaling",
        other: "{{count}} days of journaling",
      },
    },
    achievements: {
      milestone: "Milestone reached: {{achievement}}",
      newBadge: "New badge unlocked: {{badge}}",
    },
  },
}

// translations/es.js
{
  notifications: {
    session: {
      reminder: "¡Hora de enfocarse!",
      complete: "¡Sesión completada!",
      overdue: "Sesión retrasada {{minutes}} minutos",
      streak: {
        one: "¡{{count}} día seguido!",
        other: "¡{{count}} días seguidos!",
      },
    },
    journal: {
      reminder: "Hora de reflexionar",
      entry: {
        one: "{{count}} entrada del diario hoy",
        other: "{{count}} entradas del diario hoy",
      },
      streak: {
        one: "{{count}} día escribiendo",
        other: "{{count}} días escribiendo",
      },
    },
    achievements: {
      milestone: "Hito alcanzado: {{achievement}}",
      newBadge: "Nueva insignia desbloqueada: {{badge}}",
    },
  },
}
```

## Dynamic Content Management

### 1. Dynamic Translation Loading

```javascript
// utils/dynamicTranslations.js
import AsyncStorage from "@react-native-async-storage/async-storage";

class DynamicTranslationManager {
  constructor() {
    this.customTranslations = new Map();
    this.loadCustomTranslations();
  }

  async loadCustomTranslations() {
    try {
      const stored = await AsyncStorage.getItem("customTranslations");
      if (stored) {
        this.customTranslations = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Failed to load custom translations:", error);
    }
  }

  async addCustomTranslation(key, translations) {
    this.customTranslations.set(key, translations);
    await this.saveCustomTranslations();
  }

  async saveCustomTranslations() {
    try {
      const serialized = JSON.stringify(
        Array.from(this.customTranslations.entries())
      );
      await AsyncStorage.setItem("customTranslations", serialized);
    } catch (error) {
      console.warn("Failed to save custom translations:", error);
    }
  }

  getCustomTranslation(key, language) {
    const custom = this.customTranslations.get(key);
    return custom?.[language] || null;
  }
}

export const dynamicTranslationManager = new DynamicTranslationManager();
```

### 2. User-Generated Content Translation

```javascript
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { dynamicTranslationManager } from "../utils/dynamicTranslations";

const CustomTranslationEditor = () => {
  const { t, i18n } = useTranslation();
  const [key, setKey] = useState("");
  const [translations, setTranslations] = useState({
    en: "",
    es: "",
  });

  const handleSave = async () => {
    if (!key.trim() || !translations.en.trim()) {
      Alert.alert(t("error.title"), t("error.invalidTranslation"));
      return;
    }

    try {
      await dynamicTranslationManager.addCustomTranslation(key, translations);
      Alert.alert(t("success.title"), t("success.translationSaved"));
      setKey("");
      setTranslations({ en: "", es: "" });
    } catch (error) {
      Alert.alert(t("error.title"), t("error.saveFailed"));
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-6">
      <Text className="text-2xl font-bold text-gray-800 mb-6">
        {t("settings.customTranslations")}
      </Text>

      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-medium text-gray-700 mb-2">
          {t("settings.translationKey")}
        </Text>
        <TextInput
          value={key}
          onChangeText={setKey}
          placeholder={t("settings.keyPlaceholder")}
          className="border border-gray-300 rounded-lg p-3 text-gray-800"
        />
      </View>

      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-medium text-gray-700 mb-2">English</Text>
        <TextInput
          value={translations.en}
          onChangeText={(text) =>
            setTranslations((prev) => ({ ...prev, en: text }))
          }
          placeholder="Enter English translation"
          className="border border-gray-300 rounded-lg p-3 text-gray-800"
          multiline
        />
      </View>

      <View className="bg-white rounded-lg p-4 mb-6">
        <Text className="text-lg font-medium text-gray-700 mb-2">Español</Text>
        <TextInput
          value={translations.es}
          onChangeText={(text) =>
            setTranslations((prev) => ({ ...prev, es: text }))
          }
          placeholder="Enter Spanish translation"
          className="border border-gray-300 rounded-lg p-3 text-gray-800"
          multiline
        />
      </View>

      <TouchableOpacity
        onPress={handleSave}
        className="bg-blue-500 py-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold text-lg">
          {t("common.save")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomTranslationEditor;
```

### 3. Context-Aware Translation Hooks

```javascript
// hooks/useContextualTranslation.js
import { useTranslation } from "react-i18next";
import { useAppState } from "./useAppState";
import { useUserPreferences } from "./useUserPreferences";

export const useContextualTranslation = () => {
  const { t, i18n } = useTranslation();
  const { isActive, currentSession } = useAppState();
  const { userPreferences } = useUserPreferences();

  const getContextualMessage = (baseKey, context = {}) => {
    const { timeOfDay, userMood, sessionType } = context;

    // Time-based translations
    if (timeOfDay) {
      const timeKey = `${baseKey}.${timeOfDay}`;
      if (i18n.exists(timeKey)) {
        return t(timeKey, context);
      }
    }

    // Mood-based translations
    if (userMood) {
      const moodKey = `${baseKey}.mood.${userMood}`;
      if (i18n.exists(moodKey)) {
        return t(moodKey, context);
      }
    }

    // Session-type based translations
    if (sessionType) {
      const sessionKey = `${baseKey}.session.${sessionType}`;
      if (i18n.exists(sessionKey)) {
        return t(sessionKey, context);
      }
    }

    // Fallback to base translation
    return t(baseKey, context);
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    let timeOfDay = "morning";

    if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17) timeOfDay = "evening";

    return getContextualMessage("greeting.personalized", {
      timeOfDay,
      name: userPreferences.displayName,
    });
  };

  const getSessionMotivation = () => {
    const sessionCount = userPreferences.totalSessions;
    const streak = userPreferences.currentStreak;

    if (sessionCount === 0) {
      return t("motivation.firstSession");
    }

    if (streak > 7) {
      return t("motivation.streak", { count: streak });
    }

    return getContextualMessage("motivation.session", {
      sessionCount,
      streak,
    });
  };

  return {
    t,
    getContextualMessage,
    getPersonalizedGreeting,
    getSessionMotivation,
    currentLanguage: i18n.language,
  };
};
```

## Performance Optimization

### 1. Lazy Loading Translations

```javascript
// i18n/lazyLoader.js
import i18n from "i18next";

class TranslationLazyLoader {
  constructor() {
    this.loadedLanguages = new Set();
    this.loadingPromises = new Map();
  }

  async loadLanguage(language) {
    if (this.loadedLanguages.has(language)) {
      return;
    }

    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language);
    }

    const loadPromise = this.loadLanguageFile(language);
    this.loadingPromises.set(language, loadPromise);

    try {
      await loadPromise;
      this.loadedLanguages.add(language);
      this.loadingPromises.delete(language);
    } catch (error) {
      this.loadingPromises.delete(language);
      throw error;
    }
  }

  async loadLanguageFile(language) {
    switch (language) {
      case "en":
        const en = await import("./translations/en");
        i18n.addResourceBundle("en", "translation", en.default, true, true);
        break;
      case "es":
        const es = await import("./translations/es");
        i18n.addResourceBundle("es", "translation", es.default, true, true);
        break;
      case "fr":
        const fr = await import("./translations/fr");
        i18n.addResourceBundle("fr", "translation", fr.default, true, true);
        break;
      default:
        throw new Error(`Language ${language} not supported`);
    }
  }

  isLanguageLoaded(language) {
    return this.loadedLanguages.has(language);
  }
}

export const translationLazyLoader = new TranslationLazyLoader();
```

### 2. Optimized Translation Components

```javascript
import React, { memo, useMemo } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

const OptimizedTranslatedText = memo(
  ({ translationKey, values, style, numberOfLines, onPress }) => {
    const { t } = useTranslation();

    const translatedText = useMemo(() => {
      return t(translationKey, values);
    }, [t, translationKey, values]);

    return (
      <Text style={style} numberOfLines={numberOfLines} onPress={onPress}>
        {translatedText}
      </Text>
    );
  }
);

const OptimizedTranslatedView = memo(
  ({ children, translationKey, values, className, ...props }) => {
    const { t } = useTranslation();

    const translatedContent = useMemo(() => {
      if (typeof children === "string") {
        return t(translationKey || children, values);
      }
      return children;
    }, [children, translationKey, values, t]);

    return (
      <View className={className} {...props}>
        {translatedContent}
      </View>
    );
  }
);

export { OptimizedTranslatedText, OptimizedTranslatedView };
```

### 3. Translation Caching

```javascript
// utils/translationCache.js
class TranslationCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;
  }

  get(key, language, values) {
    const cacheKey = this.generateCacheKey(key, language, values);
    return this.cache.get(cacheKey);
  }

  set(key, language, values, result) {
    const cacheKey = this.generateCacheKey(key, language, values);

    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, result);
  }

  generateCacheKey(key, language, values) {
    const valuesString = values ? JSON.stringify(values) : "";
    return `${language}:${key}:${valuesString}`;
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

export const translationCache = new TranslationCache();

// Enhanced translation hook with caching
export const useCachedTranslation = () => {
  const { t, i18n } = useTranslation();

  const cachedT = (key, values) => {
    const cached = translationCache.get(key, i18n.language, values);
    if (cached !== undefined) {
      return cached;
    }

    const result = t(key, values);
    translationCache.set(key, i18n.language, values, result);
    return result;
  };

  return {
    t: cachedT,
    i18n,
    cacheStats: translationCache.getStats(),
  };
};
```

## Testing & Quality Assurance

### 1. Translation Testing Utilities

```javascript
// utils/translationTesting.js
import i18n from "../i18n";

export class TranslationTester {
  constructor() {
    this.missingKeys = new Set();
    this.placeholderKeys = new Set();
  }

  testTranslation(key, language = "en") {
    const translation = i18n.t(key, { lng: language });

    // Check for missing translations
    if (translation === key) {
      this.missingKeys.add(`${language}:${key}`);
      return false;
    }

    // Check for placeholder translations
    if (translation.includes("{{") && translation.includes("}}")) {
      this.placeholderKeys.add(`${language}:${key}`);
    }

    return true;
  }

  testAllTranslations(languages = ["en", "es"]) {
    const allKeys = this.getAllTranslationKeys();

    languages.forEach((language) => {
      allKeys.forEach((key) => {
        this.testTranslation(key, language);
      });
    });

    return {
      missingKeys: Array.from(this.missingKeys),
      placeholderKeys: Array.from(this.placeholderKeys),
      totalKeys: allKeys.length,
    };
  }

  getAllTranslationKeys() {
    const resources = i18n.options.resources;
    const keys = new Set();

    Object.values(resources).forEach((resource) => {
      this.extractKeys(resource.translation, "", keys);
    });

    return Array.from(keys);
  }

  extractKeys(obj, prefix, keys) {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === "object") {
        this.extractKeys(obj[key], fullKey, keys);
      } else {
        keys.add(fullKey);
      }
    });
  }

  generateReport() {
    const results = this.testAllTranslations();

    console.log("Translation Test Report:");
    console.log(`Total Keys: ${results.totalKeys}`);
    console.log(`Missing Keys: ${results.missingKeys.length}`);
    console.log(`Placeholder Keys: ${results.placeholderKeys.length}`);

    if (results.missingKeys.length > 0) {
      console.log("\nMissing Translations:");
      results.missingKeys.forEach((key) => console.log(`  - ${key}`));
    }

    if (results.placeholderKeys.length > 0) {
      console.log("\nPlaceholder Translations:");
      results.placeholderKeys.forEach((key) => console.log(`  - ${key}`));
    }

    return results;
  }
}

export const translationTester = new TranslationTester();
```

### 2. Translation Quality Components

```javascript
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { translationTester } from "../utils/translationTesting";

const TranslationQualityChecker = () => {
  const { t } = useTranslation();
  const [report, setReport] = React.useState(null);

  const runQualityCheck = () => {
    const results = translationTester.generateReport();
    setReport(results);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {t("settings.translationQuality")}
        </Text>
        <Text className="text-gray-600">
          Check for missing or incomplete translations
        </Text>
      </View>

      <TouchableOpacity
        onPress={runQualityCheck}
        className="mx-6 mt-6 bg-blue-500 py-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold text-lg">
          {t("settings.runQualityCheck")}
        </Text>
      </TouchableOpacity>

      {report && (
        <ScrollView className="flex-1 px-6 mt-6">
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Summary
            </Text>
            <Text className="text-gray-600">
              Total Keys: {report.totalKeys}
            </Text>
            <Text className="text-red-600">
              Missing Keys: {report.missingKeys.length}
            </Text>
            <Text className="text-yellow-600">
              Placeholder Keys: {report.placeholderKeys.length}
            </Text>
          </View>

          {report.missingKeys.length > 0 && (
            <View className="bg-red-50 rounded-lg p-4 mb-4">
              <Text className="text-lg font-semibold text-red-800 mb-2">
                Missing Translations
              </Text>
              {report.missingKeys.map((key, index) => (
                <Text key={index} className="text-red-700 text-sm">
                  {key}
                </Text>
              ))}
            </View>
          )}

          {report.placeholderKeys.length > 0 && (
            <View className="bg-yellow-50 rounded-lg p-4 mb-4">
              <Text className="text-lg font-semibold text-yellow-800 mb-2">
                Placeholder Translations
              </Text>
              {report.placeholderKeys.map((key, index) => (
                <Text key={index} className="text-yellow-700 text-sm">
                  {key}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default TranslationQualityChecker;
```

## Real-World Implementation

### 1. Complete i18n Setup for Solitude App

```javascript
// i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translationLazyLoader } from "./lazyLoader";
import { translationCache } from "../utils/translationCache";

// Import base translations
import en from "./translations/en";
import es from "./translations/es";

const resources = {
  en: { translation: en },
  es: { translation: es },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale.split("-")[0],
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  // Custom interpolation for better performance
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      if (format === "uppercase") return value.toUpperCase();
      if (format === "lowercase") return value.toLowerCase();
      return value;
    },
  },
});

// Load user's preferred language
const loadUserLanguage = async () => {
  try {
    const userLanguage = await AsyncStorage.getItem("userLanguage");
    if (userLanguage && i18n.languages.includes(userLanguage)) {
      await i18n.changeLanguage(userLanguage);
    }
  } catch (error) {
    console.warn("Failed to load user language:", error);
  }
};

loadUserLanguage();

export default i18n;
```

### 2. Enhanced Translation Hook with Features

```javascript
// hooks/useEnhancedTranslation.js
import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { translationCache } from "../utils/translationCache";
import { dynamicTranslationManager } from "../utils/dynamicTranslations";

export const useEnhancedTranslation = () => {
  const { t, i18n } = useTranslation();

  const enhancedT = useCallback(
    (key, options = {}) => {
      const { values, count, context, language } = options;

      // Check cache first
      const cached = translationCache.get(
        key,
        language || i18n.language,
        values
      );
      if (cached !== undefined) {
        return cached;
      }

      // Check custom translations
      const custom = dynamicTranslationManager.getCustomTranslation(
        key,
        language || i18n.language
      );
      if (custom) {
        translationCache.set(key, i18n.language, values, custom);
        return custom;
      }

      // Use regular translation
      const result = t(key, { ...values, count, lng: language });
      translationCache.set(key, i18n.language, values, result);
      return result;
    },
    [t, i18n]
  );

  const formatNumber = useCallback(
    (number, options = {}) => {
      return new Intl.NumberFormat(i18n.language, options).format(number);
    },
    [i18n.language]
  );

  const formatDate = useCallback(
    (date, options = {}) => {
      return new Intl.DateTimeFormat(i18n.language, options).format(date);
    },
    [i18n.language]
  );

  const formatCurrency = useCallback(
    (amount, currency = "USD") => {
      return new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency,
      }).format(amount);
    },
    [i18n.language]
  );

  const changeLanguage = useCallback(
    async (language) => {
      try {
        await translationLazyLoader.loadLanguage(language);
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem("userLanguage", language);
        translationCache.clear(); // Clear cache when language changes
      } catch (error) {
        console.error("Failed to change language:", error);
      }
    },
    [i18n]
  );

  const isRTL = useMemo(() => {
    return ["ar", "he", "fa"].includes(i18n.language);
  }, [i18n.language]);

  return {
    t: enhancedT,
    i18n,
    formatNumber,
    formatDate,
    formatCurrency,
    changeLanguage,
    isRTL,
    currentLanguage: i18n.language,
    availableLanguages: i18n.languages,
  };
};
```

This comprehensive guide covers advanced internationalization patterns, performance optimization, testing strategies, and real-world implementation examples. The focus on NativeWind styling ensures consistent, maintainable code across all language variations.
