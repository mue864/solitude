import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useSessionStore } from '@/store/sessionState';

const TodayProgress = () => {
  const { completedSessions, missedSessions, totalSessions } = useSessionStore();
  const [prevCompleted, setPrevCompleted] = useState(completedSessions);
  
  const completedPercentage = Math.round((completedSessions / totalSessions) * 100);
  const missedPercentage = Math.round((missedSessions / totalSessions) * 100);
  const remainingSessions = Math.max(0, totalSessions - (completedSessions + missedSessions));
  const remainingPercentage = Math.round((remainingSessions / totalSessions) * 100);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate when completed sessions change
  useEffect(() => {
    if (completedSessions !== prevCompleted) {
      setPrevCompleted(completedSessions);
      // Bounce animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [completedSessions, prevCompleted, scaleAnim]);

  return (
    <View className="bg-white rounded-xl p-4 my-2 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-SoraSemiBold text-text-primary">
          Today&apos;s Progress
        </Text>
        <Text className="text-sm text-text-secondary font-SoraMedium">
          {completedSessions} of {totalSessions} sessions
        </Text>
      </View>
      
      {/* Progress bar */}
      <View className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <View 
          className="h-full bg-green-500 rounded-full" 
          style={{ 
            width: `${completedPercentage}%`,
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        />
      </View>
      
      <View className="gap-3">
        <Animated.View 
          className="flex-row items-center gap-3"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
            <Text className="text-base font-bold text-green-600">✓</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary font-SoraMedium">
              Completed: <Text className="font-SoraSemiBold">{completedSessions}</Text> ({completedPercentage}%)
            </Text>
          </View>
        </Animated.View>
        
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
            <Text className="text-base font-bold text-red-600">✕</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary font-SoraMedium">
              Missed: <Text className="font-SoraSemiBold">{missedSessions}</Text> ({missedPercentage}%)
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
            <Text className="text-base font-bold text-gray-600">•</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-secondary font-SoraMedium">
              Remaining: <Text className="font-SoraSemiBold">{remainingSessions}</Text> ({remainingPercentage}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TodayProgress;
