# React Native Modals - Part 2: Advanced Patterns & Complex Interactions

## Table of Contents

1. [Advanced Modal Patterns](#advanced-modal-patterns)
2. [Complex Modal Interactions](#complex-modal-interactions)
3. [Modal State Management](#modal-state-management)
4. [Performance Optimization](#performance-optimization)
5. [Accessibility Patterns](#accessibility-patterns)
6. [Real-World Complex Examples](#real-world-complex-examples)

## Advanced Modal Patterns

### 1. Modal Stack Management

```javascript
import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const ModalStack = () => {
  const [modalStack, setModalStack] = useState([]);
  const stackRef = useRef([]);

  const pushModal = (modalConfig) => {
    const newModal = {
      id: Date.now(),
      ...modalConfig,
    };

    setModalStack((prev) => [...prev, newModal]);
    stackRef.current = [...stackRef.current, newModal];
  };

  const popModal = () => {
    setModalStack((prev) => prev.slice(0, -1));
    stackRef.current = stackRef.current.slice(0, -1);
  };

  const closeAllModals = () => {
    setModalStack([]);
    stackRef.current = [];
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity
        onPress={() =>
          pushModal({
            title: "First Modal",
            content: "This is the first modal in the stack",
          })
        }
        className="bg-blue-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white font-semibold text-center">
          Open First Modal
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          pushModal({
            title: "Second Modal",
            content: "This is the second modal in the stack",
          })
        }
        className="bg-green-500 p-4 rounded-lg mb-4"
      >
        <Text className="text-white font-semibold text-center">
          Open Second Modal
        </Text>
      </TouchableOpacity>

      {/* Render modal stack */}
      {modalStack.map((modal, index) => (
        <StackedModal
          key={modal.id}
          visible={true}
          onClose={popModal}
          title={modal.title}
          zIndex={1000 + index}
        >
          <Text className="text-gray-600 mb-4">{modal.content}</Text>

          {index < modalStack.length - 1 && (
            <TouchableOpacity
              onPress={() =>
                pushModal({
                  title: `Modal ${modalStack.length + 1}`,
                  content: `This is modal number ${modalStack.length + 1}`,
                })
              }
              className="bg-purple-500 p-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Open Next Modal
              </Text>
            </TouchableOpacity>
          )}
        </StackedModal>
      ))}
    </View>
  );
};

const StackedModal = ({ visible, onClose, title, children, zIndex }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        className="absolute inset-0 bg-black/50 justify-center items-center"
        style={{ zIndex }}
      >
        <View className="bg-white rounded-xl p-6 m-4 shadow-xl max-w-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          {children}
        </View>
      </View>
    </Modal>
  );
};
```

### 2. Modal with Dynamic Content

```javascript
const DynamicModal = ({ visible, onClose, contentType, data }) => {
  const renderContent = () => {
    switch (contentType) {
      case "journal":
        return <JournalModalContent data={data} />;
      case "settings":
        return <SettingsModalContent data={data} />;
      case "profile":
        return <ProfileModalContent data={data} />;
      case "achievement":
        return <AchievementModalContent data={data} />;
      default:
        return <DefaultModalContent data={data} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 m-4 shadow-xl max-w-lg">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const JournalModalContent = ({ data }) => (
  <View>
    <Text className="text-gray-600 mb-4">{data.content}</Text>
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-gray-500">{data.date}</Text>
      <Text className="text-2xl">{data.mood}</Text>
    </View>
  </View>
);

const SettingsModalContent = ({ data }) => (
  <View className="space-y-4">
    {Object.entries(data).map(([key, value]) => (
      <View key={key} className="flex-row justify-between items-center">
        <Text className="text-gray-700">{key}</Text>
        <Switch value={value} />
      </View>
    ))}
  </View>
);
```

### 3. Modal with Form Validation

```javascript
const FormValidationModal = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({ title: "", content: "", tags: [] });
      setErrors({});
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
            <Text className="text-xl font-bold text-gray-800">New Entry</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Title</Text>
              <TextInput
                value={formData.title}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, title: text }));
                  if (errors.title)
                    setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="Entry title..."
                className={`border rounded-lg p-3 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.title}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Content</Text>
              <TextInput
                value={formData.content}
                onChangeText={(text) => {
                  setFormData((prev) => ({ ...prev, content: text }));
                  if (errors.content)
                    setErrors((prev) => ({ ...prev, content: "" }));
                }}
                placeholder="Write your thoughts..."
                multiline
                numberOfLines={4}
                className={`border rounded-lg p-3 ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.content && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.content}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-end space-x-3 mt-6">
            <TouchableOpacity
              onPress={onClose}
              className="px-6 py-3"
              disabled={isSubmitting}
            >
              <Text className="text-gray-500 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className={`px-6 py-3 rounded-lg ${
                isSubmitting ? "bg-gray-400" : "bg-blue-500"
              }`}
              disabled={isSubmitting}
            >
              <Text className="text-white font-semibold">
                {isSubmitting ? "Saving..." : "Save Entry"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

## Complex Modal Interactions

### 1. Modal with Gesture Handling

```javascript
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const GestureModal = ({ visible, onClose, children }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        opacity.value = 1 - event.translationY / 300;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        // Dismiss modal
        translateY.value = withTiming(300);
        opacity.value = withTiming(0, {}, () => {
          runOnJS(onClose)();
        });
      } else {
        // Snap back
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

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

        <GestureDetector gesture={gesture}>
          <Animated.View
            style={animatedStyle}
            className="bg-white rounded-t-xl p-6"
          >
            {/* Handle */}
            <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};
```

### 2. Modal with Keyboard Handling

```javascript
const KeyboardAwareModal = ({ visible, onClose, children }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      translateY.value = withTiming(-e.endCoordinates.height / 2);
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      translateY.value = withSpring(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

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

        <Animated.View
          style={animatedStyle}
          className="bg-white rounded-t-xl p-6"
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};
```

### 3. Modal with Backdrop Animation

```javascript
const AnimatedBackdropModal = ({ visible, onClose, children }) => {
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

## Modal State Management

### 1. Modal Context with Zustand

```javascript
// store/modalStore.js
import { create } from "zustand";

export const useModalStore = create((set, get) => ({
  modals: {},

  openModal: (id, config) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...config, isVisible: true },
      },
    }));
  },

  closeModal: (id) => {
    set((state) => {
      const newModals = { ...state.modals };
      delete newModals[id];
      return { modals: newModals };
    });
  },

  updateModal: (id, updates) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...state.modals[id], ...updates },
      },
    }));
  },

  closeAllModals: () => {
    set({ modals: {} });
  },
}));

// components/ModalManager.js
const ModalManager = () => {
  const { modals, closeModal } = useModalStore();

  return (
    <>
      {Object.entries(modals).map(([id, modal]) => (
        <Modal
          key={id}
          visible={modal.isVisible}
          transparent={true}
          animationType={modal.animationType || "fade"}
          onRequestClose={() => closeModal(id)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-xl p-6 m-4 shadow-xl">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  {modal.title}
                </Text>
                <TouchableOpacity onPress={() => closeModal(id)}>
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>

              {modal.content}
            </View>
          </View>
        </Modal>
      ))}
    </>
  );
};
```

### 2. Modal with Async Operations

```javascript
const AsyncModal = ({
  visible,
  onClose,
  onConfirm,
  loadingText = "Loading...",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 m-4 shadow-xl">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Confirm Action
          </Text>

          <Text className="text-gray-600 mb-6">
            Are you sure you want to proceed with this action?
          </Text>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="px-6 py-3"
              disabled={isLoading}
            >
              <Text className="text-gray-500 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`px-6 py-3 rounded-lg ${
                isLoading ? "bg-gray-400" : "bg-blue-500"
              }`}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold">
                {isLoading ? loadingText : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

## Performance Optimization

### 1. Memoized Modal Components

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

const ModalContent = React.memo(({ title, content, onClose }) => (
  <>
    <View className="flex-row justify-between items-center mb-4">
      <Text className="text-xl font-bold text-gray-800">{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text className="text-2xl text-gray-500">×</Text>
      </TouchableOpacity>
    </View>

    <Text className="text-gray-600">{content}</Text>
  </>
));
```

### 2. Conditional Modal Rendering

```javascript
const ConditionalModal = ({ shouldShow, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [shouldShow]);

  return (
    <Modal
      visible={isVisible}
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
};
```

## Accessibility Patterns

### 1. Accessible Modal with Focus Management

```javascript
const AccessibleModal = ({ visible, onClose, children }) => {
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Focus the modal when it opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleKeyPress = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-black/50 justify-center items-center"
        accessible={true}
        accessibilityRole="dialog"
        accessibilityLabel="Modal dialog"
        accessibilityHint="Double tap to close"
      >
        <View
          ref={modalRef}
          className="bg-white rounded-xl p-6 m-4 shadow-xl"
          accessible={true}
          accessibilityLabel="Modal content"
          onKeyPress={handleKeyPress}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};
```

### 2. Screen Reader Friendly Modal

```javascript
const ScreenReaderModal = ({ visible, onClose, title, content }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View
          className="bg-white rounded-xl p-6 m-4 shadow-xl"
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={title}
          accessibilityHint="Modal dialog with content"
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className="text-xl font-bold text-gray-800"
              accessible={true}
              accessibilityRole="header"
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessible={true}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          <Text
            className="text-gray-600"
            accessible={true}
            accessibilityRole="text"
          >
            {content}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
```

## Real-World Complex Examples

### 1. Multi-Step Form Modal

```javascript
const MultiStepFormModal = ({ visible, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: {},
    preferences: {},
    goals: {},
  });

  const steps = [
    {
      title: "Personal Info",
      component: PersonalInfoStep,
      data: formData.personal,
      updateData: (data) =>
        setFormData((prev) => ({ ...prev, personal: data })),
    },
    {
      title: "Preferences",
      component: PreferencesStep,
      data: formData.preferences,
      updateData: (data) =>
        setFormData((prev) => ({ ...prev, preferences: data })),
    },
    {
      title: "Goals",
      component: GoalsStep,
      data: formData.goals,
      updateData: (data) => setFormData((prev) => ({ ...prev, goals: data })),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(formData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-xl p-6">
          {/* Progress indicator */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              {steps[currentStep].title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-4">
            {steps.map((step, index) => (
              <View
                key={index}
                className={`flex-1 h-1 rounded-full mx-1 ${
                  index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </View>

          <CurrentStepComponent
            data={steps[currentStep].data}
            updateData={steps[currentStep].updateData}
          />

          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              onPress={handleBack}
              className={`px-6 py-3 rounded-lg ${
                currentStep === 0 ? "bg-gray-300" : "bg-gray-500"
              }`}
              disabled={currentStep === 0}
            >
              <Text
                className={`font-semibold ${
                  currentStep === 0 ? "text-gray-500" : "text-white"
                }`}
              >
                Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

### 2. Interactive Calendar Modal

```javascript
const CalendarModal = ({ visible, onClose, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState(selectedDate);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDateState(date);
    onDateSelect(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 m-4 shadow-xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Text className="text-2xl text-gray-500">‹</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold text-gray-800">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            <TouchableOpacity onPress={goToNextMonth}>
              <Text className="text-2xl text-gray-500">›</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar grid */}
          <View className="mb-4">
            {/* Day headers */}
            <View className="flex-row mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-sm text-gray-500 font-medium">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar days */}
            <View className="flex-row flex-wrap">
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => day && handleDateSelect(day)}
                  className={`w-10 h-10 items-center justify-center ${
                    day ? "cursor-pointer" : ""
                  }`}
                  disabled={!day}
                >
                  {day && (
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        selectedDateState &&
                        day.toDateString() === selectedDateState.toDateString()
                          ? "bg-blue-500"
                          : "bg-transparent"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selectedDateState &&
                          day.toDateString() ===
                            selectedDateState.toDateString()
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {day.getDate()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="bg-blue-500 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold text-center">
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
```

This comprehensive guide covers advanced modal patterns, complex interactions, state management, performance optimization, and accessibility considerations. The focus on NativeWind styling ensures consistent, maintainable code while providing powerful modal functionality for your Solitude app.
