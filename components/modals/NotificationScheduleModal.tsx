import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ProNotificationSchedule,
  useSettingsStore,
} from "../../store/settingsStore";

interface NotificationScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  editingSchedule?: ProNotificationSchedule | null;
}

const DAYS_OF_WEEK = [
  { id: 0, name: "Sun", fullName: "Sunday" },
  { id: 1, name: "Mon", fullName: "Monday" },
  { id: 2, name: "Tue", fullName: "Tuesday" },
  { id: 3, name: "Wed", fullName: "Wednesday" },
  { id: 4, name: "Thu", fullName: "Thursday" },
  { id: 5, name: "Fri", fullName: "Friday" },
  { id: 6, name: "Sat", fullName: "Saturday" },
];

const SCHEDULE_TYPES = [
  {
    value: "session",
    label: "Session Reminder",
    icon: "timer",
    description: "Remind to start focus sessions",
  },
  {
    value: "break",
    label: "Break Reminder",
    icon: "cafe",
    description: "Remind to take breaks",
  },
  {
    value: "reminder",
    label: "General Reminder",
    icon: "notifications",
    description: "General productivity reminders",
  },
];

export default function NotificationScheduleModal({
  visible,
  onClose,
  editingSchedule,
}: NotificationScheduleModalProps) {
  const insets = useSafeAreaInsets();
  const {
    addNotificationSchedule,
    updateNotificationSchedule,
    removeNotificationSchedule,
  } = useSettingsStore();

  const [scheduleName, setScheduleName] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [scheduleType, setScheduleType] = useState<
    "session" | "break" | "reminder"
  >("session");
  const [isEnabled, setIsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editingSchedule) {
      setScheduleName(editingSchedule.name);
      setSelectedTime(editingSchedule.time);
      setSelectedDays(editingSchedule.days);
      setScheduleType(editingSchedule.type);
      setIsEnabled(editingSchedule.enabled);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [editingSchedule, visible]);

  const resetForm = () => {
    setScheduleName("");
    setSelectedTime("09:00");
    setSelectedDays([1, 2, 3, 4, 5]); // Monday to Friday by default
    setScheduleType("session");
    setIsEnabled(true);
  };

  const handleSave = () => {
    if (!scheduleName.trim()) {
      Alert.alert("Error", "Please enter a schedule name");
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    const schedule: ProNotificationSchedule = {
      id: editingSchedule?.id || `schedule-${Date.now()}`,
      name: scheduleName.trim(),
      time: selectedTime,
      days: selectedDays,
      enabled: isEnabled,
      type: scheduleType,
    };

    if (isEditing && editingSchedule) {
      updateNotificationSchedule(editingSchedule.id, schedule);
    } else {
      addNotificationSchedule(schedule);
    }

    Alert.alert(
      "Success",
      `Schedule "${schedule.name}" ${isEditing ? "updated" : "created"} successfully!`
    );
    onClose();
  };

  const handleDelete = () => {
    if (!editingSchedule) return;

    Alert.alert(
      "Delete Schedule",
      `Are you sure you want to delete "${editingSchedule.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeNotificationSchedule(editingSchedule.id);
            Alert.alert("Success", "Schedule deleted successfully!");
            onClose();
          },
        },
      ]
    );
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const selectAllDays = () => {
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const selectWeekdays = () => {
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  const selectWeekends = () => {
    setSelectedDays([0, 6]);
  };

  const TimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );

    const [hour, minute] = selectedTime.split(":");

    return (
      <View className="mb-6">
        <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-3">
          Time
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
          <View className="flex-row items-center justify-center gap-4">
            {/* Hour Picker */}
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                Hour
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {hours.map((h) => (
                  <TouchableOpacity
                    key={h}
                    className={`px-4 py-2 rounded-xl mr-2 ${
                      h === hour
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                    onPress={() => setSelectedTime(`${h}:${minute}`)}
                  >
                    <Text
                      className={`text-sm font-mono ${
                        h === hour
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text className="text-2xl font-mono text-gray-400">:</Text>

            {/* Minute Picker */}
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                Minute
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {minutes.map((m) => (
                  <TouchableOpacity
                    key={m}
                    className={`px-4 py-2 rounded-xl mr-2 ${
                      m === minute
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                    onPress={() => setSelectedTime(`${hour}:${m}`)}
                  >
                    <Text
                      className={`text-sm font-mono ${
                        m === minute
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
            {selectedTime} ({parseInt(hour) >= 12 ? "PM" : "AM"})
          </Text>
        </View>
      </View>
    );
  };

  const DaySelector = () => (
    <View className="mb-6">
      <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-3">
        Days
      </Text>

      {/* Quick Selection Buttons */}
      <View className="flex-row gap-2 mb-3">
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2"
          onPress={selectAllDays}
        >
          <Text className="text-xs font-SoraSemiBold text-gray-600 dark:text-gray-400">
            All Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2"
          onPress={selectWeekdays}
        >
          <Text className="text-xs font-SoraSemiBold text-gray-600 dark:text-gray-400">
            Weekdays
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2"
          onPress={selectWeekends}
        >
          <Text className="text-xs font-SoraSemiBold text-gray-600 dark:text-gray-400">
            Weekends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Grid */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
        <View className="flex-row justify-between">
          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day.id}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                selectedDays.includes(day.id)
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
              onPress={() => toggleDay(day.id)}
            >
              <Text
                className={`text-xs font-SoraSemiBold ${
                  selectedDays.includes(day.id)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {day.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          {selectedDays.length === 0
            ? "No days selected"
            : selectedDays.length === 7
              ? "Every day"
              : selectedDays.length === 5 &&
                  selectedDays.every((d) => [1, 2, 3, 4, 5].includes(d))
                ? "Weekdays only"
                : selectedDays.length === 2 &&
                    selectedDays.every((d) => [0, 6].includes(d))
                  ? "Weekends only"
                  : `${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""} selected`}
        </Text>
      </View>
    </View>
  );

  const ScheduleTypeSelector = () => (
    <View className="mb-6">
      <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-3">
        Schedule Type
      </Text>
      <View className="space-y-2">
        {SCHEDULE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            className={`flex-row items-center p-4 rounded-2xl border ${
              scheduleType === type.value
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
            }`}
            onPress={() => setScheduleType(type.value as any)}
          >
            <View
              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                scheduleType === type.value
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Ionicons
                name={type.icon as any}
                size={20}
                color={scheduleType === type.value ? "#3B82F6" : "#6B7280"}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`font-SoraSemiBold ${
                  scheduleType === type.value
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {type.label}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora">
                {type.description}
              </Text>
            </View>
            {scheduleType === type.value && (
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const SchedulePreview = () => (
    <View className="mb-6">
      <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-3">
        Preview
      </Text>
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
            {scheduleName || "Schedule Name"}
          </Text>
          <View
            className={`px-2 py-1 rounded-full ${
              isEnabled
                ? "bg-green-100 dark:bg-green-900"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <Text
              className={`text-xs font-SoraSemiBold ${
                isEnabled
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {isEnabled ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora ml-2">
              {selectedTime}{" "}
              {parseInt(selectedTime.split(":")[0]) >= 12 ? "PM" : "AM"}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora ml-2">
              {selectedDays.length === 0
                ? "No days selected"
                : selectedDays.length === 7
                  ? "Every day"
                  : selectedDays.length === 5 &&
                      selectedDays.every((d) => [1, 2, 3, 4, 5].includes(d))
                    ? "Weekdays only"
                    : selectedDays.length === 2 &&
                        selectedDays.every((d) => [0, 6].includes(d))
                      ? "Weekends only"
                      : `${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""} selected`}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name={
                SCHEDULE_TYPES.find((t) => t.value === scheduleType)
                  ?.icon as any
              }
              size={16}
              color="#6B7280"
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400 font-Sora ml-2">
              {SCHEDULE_TYPES.find((t) => t.value === scheduleType)?.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View
          className="pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700"
          style={{ paddingTop: insets.top + 12 }}
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            <Text className="text-lg font-SoraBold text-gray-900 dark:text-white">
              {isEditing ? "Edit Schedule" : "Create Schedule"}
            </Text>

            <TouchableOpacity onPress={handleSave} className="p-2">
              <Text className="text-blue-600 font-SoraSemiBold text-base">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Schedule Name */}
          <View className="mb-6">
            <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-2">
              Schedule Name
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-SoraSemiBold border border-gray-200 dark:border-gray-600"
              value={scheduleName}
              onChangeText={setScheduleName}
              placeholder="Enter schedule name..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Schedule Preview */}
          <SchedulePreview />

          {/* Schedule Type */}
          <ScheduleTypeSelector />

          {/* Time Picker */}
          <TimePicker />

          {/* Day Selector */}
          <DaySelector />

          {/* Enable/Disable Toggle */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
              <View className="flex-row items-center">
                <Ionicons
                  name={isEnabled ? "notifications" : "notifications-off"}
                  size={20}
                  color={isEnabled ? "#3B82F6" : "#6B7280"}
                />
                <View className="ml-3">
                  <Text className="text-base font-SoraSemiBold text-gray-900 dark:text-white">
                    Enable Schedule
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 font-Sora">
                    {isEnabled ? "Schedule is active" : "Schedule is paused"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={setIsEnabled}
                trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                thumbColor={isEnabled ? "#FFFFFF" : "#FFFFFF"}
              />
            </View>
          </View>

          {/* Delete Button (only for editing) */}
          {isEditing && editingSchedule && (
            <TouchableOpacity
              className="bg-red-100 dark:bg-red-900 rounded-2xl p-4 items-center mb-6"
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="text-red-600 dark:text-red-400 font-SoraSemiBold mt-1">
                Delete Schedule
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
