import { useTheme } from "@/context/ThemeContext";
import quotes from "@/data/quotes.json";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type QuoteModalProps = {
  onClose: () => void;
};

const QuoteCard = ({ onClose }: QuoteModalProps) => {
  const { colors } = useTheme();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  const quote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    [],
  );

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 280 });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 280 });
      translateY.value = withTiming(80, { duration: 280 }, (finished) => {
        if (finished) runOnJS(onClose)();
      });
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        animStyle,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.quote, { color: colors.textPrimary }]}>
        "{quote.quoteText}"
      </Text>
      <Text style={[styles.author, { color: colors.textSecondary }]}>
        — {quote.quoteAuthor}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  quote: {
    fontSize: 14,
    fontFamily: "SoraSemiBold",
    lineHeight: 22,
    marginBottom: 8,
  },
  author: {
    fontSize: 13,
    fontFamily: "WorkSansItalic",
  },
});

export default QuoteCard;
