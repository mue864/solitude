import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export const useExpoTimer = (
  initialDuration: number,
  onComplete?: () => void
) => {
  const [duration, setDuration] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeRef = useRef<number | null>(null);

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateTimer = () => {
    if (!startTimeRef.current || isPaused) return;

    const now = Date.now();
    const elapsed = Math.floor(
      (now - startTimeRef.current - pausedTimeRef.current) / 1000
    );
    const remaining = Math.max(0, initialDuration - elapsed);

    setDuration(remaining);

    if (remaining <= 0) {
      cleanup();
      setIsRunning(false);
      setIsPaused(false);
      onComplete?.();
    }
  };

  const start = () => {
    if (isRunning && !isPaused) return;

    if (isPaused) {
      // Resume from pause
      const now = Date.now();
      const pauseDuration = now - pausedTimeRef.current;
      pausedTimeRef.current += pauseDuration;
      setIsPaused(false);
    } else {
      // Fresh start
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
    }

    setIsRunning(true);
    // Use shorter interval for better accuracy
    cleanup(); // Ensure no duplicate intervals
    intervalRef.current = setInterval(updateTimer, 100);
  };

  const pause = () => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
    cleanup();
  };

  const stop = () => {
    cleanup();
    setIsRunning(false);
    setIsPaused(false);
    setDuration(initialDuration);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    backgroundTimeRef.current = null;
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (!isRunning) return;

      if (nextAppState === "background") {
        // Store background time
        backgroundTimeRef.current = Date.now();
        cleanup(); // Stop interval to save battery
      } else if (nextAppState === "active" && backgroundTimeRef.current) {
        // Calculate time spent in background
        const now = Date.now();
        const backgroundDuration = now - backgroundTimeRef.current;
        pausedTimeRef.current += backgroundDuration;
        backgroundTimeRef.current = null;

        if (startTimeRef.current) {
          // Recalculate and restart timer
          const elapsed = Math.floor(
            (now - startTimeRef.current - pausedTimeRef.current) / 1000
          );
          const remaining = Math.max(0, initialDuration - elapsed);

          if (remaining <= 0) {
            cleanup();
            setIsRunning(false);
            setIsPaused(false);
            onComplete?.();
          } else {
            setDuration(remaining);
            if (!isPaused) {
              intervalRef.current = setInterval(updateTimer, 100);
            }
          }
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
      cleanup();
    };
  }, [isRunning, isPaused, initialDuration, onComplete]);

  // Update duration when initialDuration changes (for session type changes)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setDuration(initialDuration);
    }
  }, [initialDuration, isRunning, isPaused]);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    duration,
    isRunning,
    isPaused,
    start,
    pause,
    stop,
  };
};
