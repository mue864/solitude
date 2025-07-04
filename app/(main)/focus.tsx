import Add from "@/assets/svg/Add_ring_duotone.svg";
import ChevronDown from "@/assets/svg/chevron-down.svg";
import ChevronRight from "@/assets/svg/chevron-right.svg";
import TaskLine from "@/assets/svg/dottedLine.svg";
import Edit from "@/assets/svg/edit.svg";
import Streak from "@/assets/svg/streak.svg";
import ChangeSessionTimeCard from "@/components/modals/ChangeSessionTimeCard";
import StartSessionBtn from "@/components/StartSessionBtn";
import { useSessionStore } from "@/store/sessionState";
import { useStreakStore } from "@/store/streakStore";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import TodayProgress from "@/components/TodayProgress";

export default function Focus() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const streak = useStreakStore((state) => state.streak);
  const { duration, isRunning, isPaused, setDuration, completeSession, currentStreak } = useSessionStore();
  const sessionType = useSessionStore((state) => state.sessionType);
  const setSessionType = useSessionStore((state) => state.setSessionType);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationMinutes = Math.floor(duration / 60);

  // Handle timer countdown
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setDuration((currentDuration: number) => {
        if (currentDuration <= 1) {
          // Clear the interval first
          clearInterval(timerRef.current!);
          // Mark session as complete
          completeSession();
          // Reset the timer and session state
          useSessionStore.setState({ 
            isRunning: false, 
            isPaused: false,
            duration: 0
          });
          // Play a sound or show notification here if needed
          return 0;
        }
        return currentDuration - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, setDuration, completeSession]);

  // Update duration when session type changes
  useEffect(() => {
    if (!isRunning) {
      // Reset duration based on session type when not running
      if (sessionType === 'Break') {
        setDuration(5 * 60);
      } else if (sessionType === 'Study') {
        setDuration(50 * 60);
      } else {
        setDuration(25 * 60);
      }
    }
  }, [sessionType, isRunning, setDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);

  const sessionTypes = ["Work", "Study", "Break"] as const;

  const handleSessionSelect = (type: (typeof sessionTypes)[number]) => {
    setSessionType(type);
    setIsDropdownOpen(false);
  };

  return (
    <View className="flex-1 bg-primary">
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

      {/* Session Selector */}
      <View className="items-center mt-2">
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
      <View className="mt-12 flex-row items-center justify-center gap-3">
        <View className=" items-baseline justify-center flex-row">
          <Text className="text-text-primary font-SoraBold text-8xl">
            {isRunning || isPaused ? formatTime(duration) : durationMinutes}
          </Text>
          <Text className="text-text-primary font-SoraBold text-4xl">
            {isRunning || isPaused ? "" : durationMinutes >= 1 ? "min" : "sec"}
          </Text>
        </View>
        {isRunning || isPaused ? null : (
          <TouchableOpacity onPress={() => setIsTimeModalVisible(true)}>
            <Edit />
          </TouchableOpacity>
        )}
      </View>

      {/* upcoming session */}
      <View className="flex-row items-center justify-center gap-3 mt-4">
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
        className="flex-row items-center justify-center gap-2 mt-4"
        activeOpacity={0.7}
      >
        <View>
          <Add />
        </View>
        <View>
          {/* if no task is available show Pick a task otherwise show the active task */}
          <Text className="text-text-primary font-SoraBold">Pick a task</Text>
          <TaskLine />
        </View>
      </TouchableOpacity>

      {/* start session button */}
      <View className="mt-12 items-center justify-center">
        <StartSessionBtn />
      </View>

      {/* Progress Stats */}
      <View className="mx-4 mt-5">
        <TodayProgress />
      </View>

      <ChangeSessionTimeCard
        isVisible={isTimeModalVisible}
        onClose={() => setIsTimeModalVisible(false)}
        sessionType={sessionType}
      />
    </View>
  );
}
