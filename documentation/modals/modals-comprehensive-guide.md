# React Native Modals Comprehensive Guide

## Table of Contents

1. [What are React Native Modals?](#what-are-react-native-modals)
2. [Types of Modals](#types-of-modals)
3. [Basic Modal Implementation](#basic-modal-implementation)
4. [Advanced Modal Patterns](#advanced-modal-patterns)
5. [Animated Modals](#animated-modals)
6. [Custom Modal Components](#custom-modal-components)
7. [Best Practices](#best-practices)
8. [Real-World Examples](#real-world-examples)

## What are React Native Modals?

**React Native Modals** are overlay components that appear on top of the current screen to display additional content, forms, or confirmations. They provide a focused user experience by temporarily blocking interaction with the underlying content.

### Key Characteristics:

1. **Overlay**: Appears on top of the current screen
2. **Focus**: Captures user attention for specific actions
3. **Dismissible**: Can be closed by tapping outside or pressing buttons
4. **Responsive**: Adapts to different screen sizes
5. **Accessible**: Should support screen readers and keyboard navigation

## Types of Modals

### 1. Alert Modals

- Simple confirmations
- Yes/No decisions
- Error messages

### 2. Form Modals

- Data input
- Settings configuration
- User preferences

### 3. Content Modals

- Image galleries
- Detailed information
- Full-screen content

### 4. Action Sheet Modals

- Multiple options
- Context menus
- Selection lists

## Basic Modal Implementation

### 1. Simple Modal

```javascript
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

const SimpleModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <TouchableOpacity
        onPress={openModal}
        className="bg-blue-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Open Modal</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-white rounded-xl p-6 m-4 shadow-xl">
                <Text className="text-xl font-bold text-gray-800 mb-4">
                  Welcome to Solitude
                </Text>
                <Text className="text-gray-600 mb-6">
                  Take a moment to breathe and reflect on your journey.
                </Text>

                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity onPress={closeModal} className="px-4 py-2">
                    <Text className="text-gray-500">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={closeModal}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold">Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default SimpleModal;
```

### 2. Confirmation Modal

```javascript
const ConfirmationModal = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 m-4 shadow-xl max-w-sm">
          <Text className="text-xl font-bold text-gray-800 mb-3 text-center">
            {title}
          </Text>

          <Text className="text-gray-600 mb-6 text-center">{message}</Text>

          <View className="flex-row justify-center space-x-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-gray-700 font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-red-500 py-3 rounded-lg ml-3"
            >
              <Text className="text-white font-semibold text-center">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

### 3. Form Modal

```javascript
const FormModal = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "neutral",
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ title: "", content: "", mood: "neutral" });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              New Journal Entry
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Title</Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, title: text }))
                }
                placeholder="Entry title..."
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Content</Text>
              <TextInput
                value={formData.content}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, content: text }))
                }
                placeholder="Write your thoughts..."
                multiline
                numberOfLines={4}
                className="border border-gray-300 rounded-lg p-3 text-gray-800"
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Mood</Text>
              <View className="flex-row space-x-2">
                {["😊", "😐", "😔", "😤", "😌"].map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    onPress={() => setFormData((prev) => ({ ...prev, mood }))}
                    className={`p-2 rounded-lg ${
                      formData.mood === mood
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Text className="text-xl">{mood}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View className="flex-row justify-end space-x-3 mt-6">
            <TouchableOpacity onPress={onClose} className="px-6 py-3">
              <Text className="text-gray-500 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

## Advanced Modal Patterns

### 1. Modal with Backdrop Animation

```javascript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const AnimatedModal = ({ visible, onClose, children }) => {
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalTranslateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      modalTranslateY.value = withSpring(0);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      modalScale.value = withSpring(0.8);
      modalTranslateY.value = withSpring(50);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={backdropStyle}
      className="absolute inset-0 bg-black/50 justify-center items-center"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      <Animated.View
        style={modalStyle}
        className="bg-white rounded-xl p-6 m-4 shadow-xl"
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
};
```

### 2. Bottom Sheet Modal

```javascript
const BottomSheetModal = ({ visible, onClose, children }) => {
  const translateY = useSharedValue(300);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withSpring(300);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={backdropStyle}
      className="absolute inset-0 bg-black/50 justify-end"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      <Animated.View
        style={sheetStyle}
        className="bg-white rounded-t-xl p-6 shadow-xl"
      >
        {/* Handle */}
        <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {children}
      </Animated.View>
    </Animated.View>
  );
};
```

### 3. Full Screen Modal

```javascript
const FullScreenModal = ({ visible, onClose, children }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(0.9);
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={modalStyle} className="absolute inset-0 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Full Screen</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-2xl text-gray-500">×</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 p-6">{children}</View>
    </Animated.View>
  );
};
```

## Animated Modals

### 1. Slide Animation Modal

```javascript
const SlideModal = ({ visible, onClose, direction = "bottom" }) => {
  const translateValue = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateValue.value = withSpring(0, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateValue.value = withSpring(300);
    }
  }, [visible]);

  const getTransform = () => {
    switch (direction) {
      case "top":
        return [{ translateY: -translateValue.value }];
      case "bottom":
        return [{ translateY: translateValue.value }];
      case "left":
        return [{ translateX: -translateValue.value }];
      case "right":
        return [{ translateX: translateValue.value }];
      default:
        return [{ translateY: translateValue.value }];
    }
  };

  const modalStyle = useAnimatedStyle(() => ({
    transform: getTransform(),
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      <Animated.View
        style={modalStyle}
        className="bg-white rounded-xl p-6 m-4 shadow-xl"
      >
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Slide from {direction}
        </Text>
        <Text className="text-gray-600 mb-6">
          This modal slides in from the {direction} direction.
        </Text>

        <TouchableOpacity
          onPress={onClose}
          className="bg-blue-500 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-center">Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
```

### 2. Scale Animation Modal

```javascript
const ScaleModal = ({ visible, onClose }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withSpring(0);
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      <Animated.View
        style={modalStyle}
        className="bg-white rounded-xl p-6 m-4 shadow-xl"
      >
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Scale Animation
        </Text>
        <Text className="text-gray-600 mb-6">
          This modal scales in and out smoothly.
        </Text>

        <TouchableOpacity
          onPress={onClose}
          className="bg-blue-500 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-center">Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
```

## Custom Modal Components

### 1. Reusable Modal Hook

```javascript
// hooks/useModal.js
import { useState, useCallback } from "react";

export const useModal = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);

  const openModal = useCallback(() => setIsVisible(true), []);
  const closeModal = useCallback(() => setIsVisible(false), []);
  const toggleModal = useCallback(() => setIsVisible((prev) => !prev), []);

  return {
    isVisible,
    openModal,
    closeModal,
    toggleModal,
  };
};
```

### 2. Modal Provider Context

```javascript
// context/ModalContext.js
import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({});

  const showModal = (id, content) => {
    setModals((prev) => ({ ...prev, [id]: content }));
  };

  const hideModal = (id) => {
    setModals((prev) => {
      const newModals = { ...prev };
      delete newModals[id];
      return newModals;
    });
  };

  return (
    <ModalContext.Provider value={{ modals, showModal, hideModal }}>
      {children}
      {/* Render all active modals */}
      {Object.entries(modals).map(([id, content]) => (
        <View key={id} className="absolute inset-0">
          {content}
        </View>
      ))}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within ModalProvider");
  }
  return context;
};
```

### 3. Custom Modal Component

```javascript
const CustomModal = ({
  visible,
  onClose,
  title,
  children,
  showBackdrop = true,
  animationType = "fade",
  position = "center",
  size = "medium",
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "justify-start pt-20";
      case "bottom":
        return "justify-end pb-20";
      case "center":
      default:
        return "justify-center";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "max-w-sm";
      case "large":
        return "max-w-2xl";
      case "full":
        return "w-full h-full";
      case "medium":
      default:
        return "max-w-lg";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 ${showBackdrop ? "bg-black/50" : ""} ${getPositionClasses()}`}
      >
        <View
          className={`bg-white rounded-xl p-6 m-4 shadow-xl ${getSizeClasses()}`}
        >
          {title && (
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-2xl text-gray-500">×</Text>
              </TouchableOpacity>
            </View>
          )}

          {children}
        </View>
      </View>
    </Modal>
  );
};
```

## Best Practices

### 1. Accessibility

```javascript
const AccessibleModal = ({ visible, onClose, children }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityLabel="Modal dialog"
      accessibilityRole="dialog"
      accessibilityHint="Double tap to close"
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View
          className="bg-white rounded-xl p-6 m-4 shadow-xl"
          accessible={true}
          accessibilityLabel="Modal content"
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};
```

### 2. Keyboard Handling

```javascript
const KeyboardAwareModal = ({ visible, onClose, children }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-white rounded-t-xl p-6"
          style={{ marginBottom: keyboardHeight }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};
```

### 3. Performance Optimization

```javascript
const OptimizedModal = React.memo(({ visible, onClose, children }) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 m-4 shadow-xl">
          {children}
        </View>
      </View>
    </Modal>
  );
});
```

## Real-World Examples

### 1. Settings Modal

```javascript
const SettingsModal = ({ visible, onClose }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Notifications</Text>
              <Switch
                value={settings.notifications}
                onValueChange={(value) =>
                  handleSettingChange("notifications", value)
                }
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) =>
                  handleSettingChange("darkMode", value)
                }
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">Auto Save</Text>
              <Switch
                value={settings.autoSave}
                onValueChange={(value) =>
                  handleSettingChange("autoSave", value)
                }
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="bg-blue-500 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-semibold text-center">
              Save Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
```

### 2. Image Gallery Modal

```javascript
const ImageGalleryModal = ({ visible, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black justify-center items-center">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-12 right-6 z-10"
        >
          <Text className="text-white text-2xl">×</Text>
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center">
          <Image
            source={{ uri: images[currentIndex] }}
            className="w-full h-96"
            resizeMode="contain"
          />
        </View>

        <View className="flex-row justify-between items-center p-6">
          <TouchableOpacity onPress={prevImage}>
            <Text className="text-white text-2xl">‹</Text>
          </TouchableOpacity>

          <Text className="text-white text-lg">
            {currentIndex + 1} / {images.length}
          </Text>

          <TouchableOpacity onPress={nextImage}>
            <Text className="text-white text-2xl">›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
```

### 3. Action Sheet Modal

```javascript
const ActionSheetModal = ({ visible, onClose, actions, title }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        <View className="bg-white rounded-t-xl p-6">
          {title && (
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {title}
            </Text>
          )}

          <View className="space-y-2">
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  action.onPress();
                  onClose();
                }}
                className={`py-4 px-6 rounded-lg ${
                  action.destructive ? "bg-red-50" : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    action.destructive ? "text-red-600" : "text-gray-800"
                  }`}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 py-4 px-6 rounded-lg bg-gray-100"
          >
            <Text className="text-gray-600 font-medium text-center">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
```

## Summary

React Native Modals are essential for creating focused user interactions. Key takeaways:

1. **Choose the Right Type**: Alert, form, content, or action sheet modals
2. **Use Animations**: Smooth transitions improve user experience
3. **Handle Accessibility**: Support screen readers and keyboard navigation
4. **Optimize Performance**: Use memoization and conditional rendering
5. **Follow Patterns**: Reusable components and hooks for consistency
6. **Use NativeWind**: Consistent styling across all modal types

This comprehensive guide covers the fundamentals and advanced patterns of React Native Modals, helping you create engaging, accessible, and performant modal experiences for your Solitude app.
