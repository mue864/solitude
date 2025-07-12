import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomTheme, useSettingsStore } from "../../store/settingsStore";

interface ThemeEditorModalProps {
  visible: boolean;
  onClose: () => void;
  editingTheme?: CustomTheme | null;
}

export default function ThemeEditorModal({
  visible,
  onClose,
  editingTheme,
}: ThemeEditorModalProps) {
  const insets = useSafeAreaInsets();
  const { addCustomTheme, updateCustomTheme, removeCustomTheme } =
    useSettingsStore();

  const [themeName, setThemeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#1E40AF");
  const [accentColor, setAccentColor] = useState("#60A5FA");
  const [isEditing, setIsEditing] = useState(false);

  // Predefined color options for easy selection
  const colorOptions = [
    "#3B82F6",
    "#1E40AF",
    "#60A5FA", // Blue variants
    "#10B981",
    "#059669",
    "#34D399", // Green variants
    "#F59E0B",
    "#D97706",
    "#FBBF24", // Orange variants
    "#8B5CF6",
    "#7C3AED",
    "#A78BFA", // Purple variants
    "#EF4444",
    "#DC2626",
    "#F87171", // Red variants
    "#6B7280",
    "#374151",
    "#9CA3AF", // Gray variants
    "#000000",
    "#FFFFFF",
    "#F3F4F6", // Black, White, Light Gray
  ];

  useEffect(() => {
    if (editingTheme) {
      setThemeName(editingTheme.name);
      setPrimaryColor(editingTheme.primaryColor);
      setSecondaryColor(editingTheme.secondaryColor);
      setAccentColor(editingTheme.accentColor);
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [editingTheme, visible]);

  const resetForm = () => {
    setThemeName("");
    setPrimaryColor("#3B82F6");
    setSecondaryColor("#1E40AF");
    setAccentColor("#60A5FA");
  };

  const handleSave = () => {
    if (!themeName.trim()) {
      Alert.alert("Error", "Please enter a theme name");
      return;
    }

    const theme: CustomTheme = {
      id: editingTheme?.id || `theme-${Date.now()}`,
      name: themeName.trim(),
      primaryColor,
      secondaryColor,
      accentColor,
    };

    if (isEditing && editingTheme) {
      updateCustomTheme(editingTheme.id, theme);
    } else {
      addCustomTheme(theme);
    }

    Alert.alert(
      "Success",
      `Theme "${theme.name}" ${isEditing ? "updated" : "created"} successfully!`
    );
    onClose();
  };

  const handleDelete = () => {
    if (!editingTheme) return;

    Alert.alert(
      "Delete Theme",
      `Are you sure you want to delete "${editingTheme.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeCustomTheme(editingTheme.id);
            Alert.alert("Success", "Theme deleted successfully!");
            onClose();
          },
        },
      ]
    );
  };

  const ColorPicker = ({
    label,
    value,
    onColorChange,
  }: {
    label: string;
    value: string;
    onColorChange: (color: string) => void;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <View
          className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600"
          style={{ backgroundColor: value }}
        />
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white font-mono text-sm"
          value={value}
          onChangeText={onColorChange}
          placeholder="#000000"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Color Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2"
      >
        <View className="flex-row gap-2">
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${
                value === color
                  ? "border-gray-900 dark:border-white"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              style={{ backgroundColor: color }}
              onPress={() => onColorChange(color)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const ThemePreview = () => (
    <View className="mb-6">
      <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-3">
        Preview
      </Text>
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <View
          className="rounded-xl p-4 mb-3"
          style={{ backgroundColor: primaryColor }}
        >
          <Text className="text-white font-SoraSemiBold text-lg">
            {themeName || "Theme Preview"}
          </Text>
          <Text className="text-white/80 font-Sora text-sm mt-1">
            This is how your theme will look
          </Text>
        </View>

        {/* Content */}
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 dark:text-white font-SoraSemiBold">
              Primary Elements
            </Text>
            <View
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 dark:text-white font-SoraSemiBold">
              Secondary Elements
            </Text>
            <View
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: secondaryColor }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 dark:text-white font-SoraSemiBold">
              Accent Elements
            </Text>
            <View
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </View>
        </View>

        {/* Action Buttons Preview */}
        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            className="flex-1 rounded-xl p-3 items-center"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="text-white font-SoraSemiBold text-sm">
              Primary Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-xl p-3 items-center border-2"
            style={{
              borderColor: secondaryColor,
              backgroundColor: "transparent",
            }}
          >
            <Text
              className="font-SoraSemiBold text-sm"
              style={{ color: secondaryColor }}
            >
              Secondary
            </Text>
          </TouchableOpacity>
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
              {isEditing ? "Edit Theme" : "Create Theme"}
            </Text>

            <TouchableOpacity onPress={handleSave} className="p-2">
              <Text className="text-blue-600 font-SoraSemiBold text-base">
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Theme Name */}
          <View className="mb-6">
            <Text className="text-sm font-SoraSemiBold text-gray-700 dark:text-gray-300 mb-2">
              Theme Name
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-SoraSemiBold border border-gray-200 dark:border-gray-700"
              value={themeName}
              onChangeText={setThemeName}
              placeholder="Enter theme name..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Theme Preview */}
          <ThemePreview />

          {/* Color Pickers */}
          <View className="mb-6">
            <Text className="text-lg font-SoraSemiBold text-gray-900 dark:text-white mb-4">
              Colors
            </Text>

            <ColorPicker
              label="Primary Color"
              value={primaryColor}
              onColorChange={setPrimaryColor}
            />

            <ColorPicker
              label="Secondary Color"
              value={secondaryColor}
              onColorChange={setSecondaryColor}
            />

            <ColorPicker
              label="Accent Color"
              value={accentColor}
              onColorChange={setAccentColor}
            />
          </View>

          {/* Delete Button (only for editing) */}
          {isEditing && editingTheme && !editingTheme.isDefault && (
            <TouchableOpacity
              className="bg-red-100 dark:bg-red-900 rounded-2xl p-4 items-center mb-6"
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="text-red-600 dark:text-red-400 font-SoraSemiBold mt-1">
                Delete Theme
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
