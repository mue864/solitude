import Add from "@/assets/svg/Add_ring_duotone.svg";
import ChevronDown from "@/assets/svg/chevron-down.svg";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import TaskLine from "@/assets/svg/dottedLine.svg";
import Edit from "@/assets/svg/edit.svg";
import Streak from "@/assets/svg/streak.svg";
import ChangeSessionTimeCard from "@/components/modals/ChangeSessionTimeCard";
import StartSessionBtn from "@/components/StartSessionBtn";
import TodayProgress from "@/components/TodayProgress";
import { useSessionStore } from "@/store/sessionState";
import { useStreakStore } from "@/store/streakStore";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import QuickTaskModal from "@/components/modals/QuickTaskModal";

export default function Focus() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuickTaskModalVisible, setIsQuickTaskModalVisible] = useState(false);
  const streak = useStreakStore((state) => state.streak);
  const {
    duration,
    isRunning,
    isPaused,
    setDuration,
    completeSession,
    currentStreak,
  } = useSessionStore();
  const sessionType = useSessionStore((state) => state.sessionType);
  const setSessionType = useSessionStore((state) => state.setSessionType);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationMinutes = Math.floor(duration / 60);

  // Handle timer countdown
  useEffect(() => {
    // Clear any existing interval when component unmounts or dependencies change
    const cleanup = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Only run the timer if running and not paused
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((currentDuration: number) => {
          // If we reach 0 or below, end the session
          if (currentDuration <= 1) {
            console.log("In here")
            cleanup();

            completeSession();
            return 0;
          }
          // Otherwise, just decrement the timer
          return currentDuration - 1;
        });
      }, 1000);
    } else {
      cleanup();
    }

    // Clean up on unmount or when dependencies change
    return cleanup;
  }, [isRunning, isPaused, setDuration, completeSession]);

  // Update duration when session type changes - only when not running and not paused
  useEffect(() => {
    if (!isRunning && !isPaused) {
      // Reset duration based on session type when not running and not paused
      if (sessionType === "Break") {
        setDuration(5 * 60);
      } else if (sessionType === "Study") {
        setDuration(50 * 60);
      } else {
        setDuration(25 * 60);
      }
    }
  }, [sessionType, isRunning, isPaused, setDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  const sessionTypes = ["Work", "Study", "Break"] as const;

  const handleSessionSelect = (type: (typeof sessionTypes)[number]) => {
    setSessionType(type);
    setIsDropdownOpen(false);
  };

  return (
    <View className="flex-1 bg-primary pb-24">
      {/* Progress and Streak */}
      <View className="flex-row gap-1 mx-4 mt-4">
        <View className="">
          <Streak width={23} />
        </View>
        <View className="items-center justify-center">
          <Text className="text-text-primary font-SoraBold">
            {currentStreak}
          </Text>
        </View>
      </View>

      <View className="flex-1 justify-between">
        {/* Session Selector */}
        <View className="items-center">
          <TouchableOpacity
            className="flex-row gap-2 items-center px-4 py-2 rounded-lg bg-primary-700"
            activeOpacity={0.7}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text className="text-text-primary font-SoraBold text-2xl">
              {sessionType}
            </Text>
            <ChevronDown
              style={{
                transform: [{ rotate: isDropdownOpen ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View className="absolute top-16 w-40 bg-tab-bg rounded-xl shadow-xl z-10">
              {sessionTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`px-4 py-3 ${
                    type === sessionType ? "bg-primary-600" : ""
                  }`}
                  onPress={() => handleSessionSelect(type)}
                >
                  <Text className="text-text-primary font-Sora text-lg">
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Session Timer */}
        <View className="flex-row items-center justify-center gap-3">
          <View className=" items-baseline justify-center flex-row">
            <Text className="text-text-primary font-SoraBold text-8xl">
              {isRunning || isPaused ? formatTime(duration) : durationMinutes}
            </Text>
            <Text className="text-text-primary font-SoraBold text-4xl">
              {isRunning || isPaused
                ? ""
                : durationMinutes >= 1
                  ? "min"
                  : "sec"}
            </Text>
          </View>
          {isRunning || isPaused ? null : (
            <TouchableOpacity onPress={() => setIsTimeModalVisible(true)}>
              <Edit />
            </TouchableOpacity>
          )}
        </View>

        <View>
          {/* upcoming session */}
          <View className="flex-row items-center justify-center gap-3">
            <View>
              <Text className="text-text-secondary font-SoraBold">Next</Text>
            </View>
            <View>
              <ChevronRight />
            </View>
            <View>
              {/* Here the upcoming session has to be displayed it's dynamic */}
              <Text className="text-text-secondary font-SoraBold">Break</Text>
            </View>
          </View>

          {/* select task */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 mt-3"
            activeOpacity={0.7}
            onPress={() => setIsQuickTaskModalVisible(true)}
          >
            <View>
              <Add />
            </View>
            <View>
              {/* if no task is available show Pick a task otherwise show the active task */}
              <Text className="text-text-primary font-SoraBold">
                Pick a task
              </Text>
              <TaskLine />
            </View>
          </TouchableOpacity>
        </View>

        {/* start session button */}
        <View className="items-center justify-center">
          <StartSessionBtn />
        </View>

        {/* Progress Stats */}
        <View className="mx-4 pb-10">
          <TodayProgress />
        </View>
      </View>

      <ChangeSessionTimeCard
        isVisible={isTimeModalVisible}
        onClose={() => setIsTimeModalVisible(false)}
        sessionType={sessionType}
      />
      <QuickTaskModal
        isVisible={isQuickTaskModalVisible}
        onClose={() => setIsQuickTaskModalVisible(false)}
        sessionType={sessionType}
      />
    </View>
  );
}
