import { BlurView } from "expo-blur";
import { Modal, Text, View } from "react-native";
import Bulb from "@/assets/svg/idea.svg";
import quotes from "@/data/quotes.json";
import { useState, useEffect, useMemo } from "react";
import Timer from "@/assets/svg/tabs/focus.svg";

type QuoteModalProps = {
  onClose: () => void;
};

const VISIBLE_DURATION = 3000; // 3 seconds

const QuoteCard = ({ onClose }: QuoteModalProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timer, setTimer] = useState(3);
  
  // Memoize the quote to prevent re-renders
  const quote = useMemo(() => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
  }, []);

  // Handle the auto-dismiss timer
  useEffect(() => {
    // Set up auto-dismiss timer
    const timerId = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, VISIBLE_DURATION);
    
    // Set up countdown interval
    const intervalId = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up timers
    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [onClose]);


  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <BlurView
          intensity={20}
          className="w-full h-full justify-center items-center"
        >
          <View className="w-[85%] bg-tab-bg h-[50%] rounded-2xl shadow-xl overflow-hidden">
            <View className="flex-1 justify-between p-6">
              <View className="items-center">
                <Bulb />
              </View>
              <View className="items-center justify-center">
                <Text className="text-text-primary text-base font-SoraSemiBold">
                  &quot;{quote.quoteText}&quot;
                </Text>
                <Text className="text-text-primary text-base font-WorkSansItalic">
                  - {quote.quoteAuthor}
                </Text>
              </View>
              <View className="flex justify-between items-center">
                <View>
                  <Text className="text-text-primary text-base font-SoraSemiBold">
                    Timer Started
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Timer />
                  <Text className="text-text-primary text-2xl font-SoraBold">
                    {timer}s
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default QuoteCard;
