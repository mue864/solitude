import React, { useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { TabIcon } from './TabIcon';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type TabName = 'focus' | 'plan' | 'journal' | 'insights' | 'settings';

const ROUTE_TO_ICON_MAP: Record<string, TabName> = {
  'reflect': 'journal',
} as const;

interface TabButtonProps {
  route: any;
  index: number;
  isFocused: boolean;
  onPress: (routeName: string) => void;
  label: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabButton = React.memo(({ route, isFocused, onPress, label }: TabButtonProps) => {
  const tabName = (ROUTE_TO_ICON_MAP[route.name] || route.name).toLowerCase() as TabName;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused, scale]);
  
  return (
    <AnimatedTouchable
      key={route.key}
      onPress={() => {
        onPress(route.name);
      }}
      className="items-center flex-1"
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle} className="items-center">
        <View className={`p-2 ${isFocused ? 'bg-active-tab rounded-full' : ''}`}>
          <TabIcon name={tabName} focused={isFocused} />
        </View>
        <Text
          className={`mt-1 text-xs font-SoraSemiBold font-semibold ${
            isFocused ? 'text-active-tab' : 'text-text-primary'
          }`}
        >
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Text>
      </Animated.View>
    </AnimatedTouchable>
  );
});

TabButton.displayName = 'TabButton';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const handleTabPress = useCallback((routeName: string) => {
    navigation.navigate(routeName);
  }, [navigation]);

  const tabs = useMemo(() => {
    return state.routes.map((route, index) => {
      const { options } = descriptors[route.key];
      const label = options.tabBarLabel ?? route.name;
      const isFocused = state.index === index;

      return (
        <TabButton
          key={route.key}
          route={route}
          isFocused={isFocused}
          onPress={handleTabPress}
          label={label}
          index={index}
        />
      );
    });
  }, [state.routes, state.index, descriptors, handleTabPress]);

  return (
    <View className="flex-row bg-tab-bg py-3 rounded-2xl mb-5 justify-around shadow shadow-black absolute bottom-0 left-4 right-4">
      {tabs}
    </View>
  );
};

export default React.memo(CustomTabBar);
