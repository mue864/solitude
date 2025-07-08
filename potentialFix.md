#### Potential fix for timer delaying

```jsx
import React, { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

// Expo Go compatible timer hook
export const useExpoTimer = (initialDuration, onComplete) => {
  const [duration, setDuration] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const backgroundTimeRef = useRef(null);
  
  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const updateTimer = () => {
    if (!startTimeRef.current || isPaused) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
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
      const pauseDuration = Date.now() - pausedTimeRef.current;
      pausedTimeRef.current = pauseDuration;
      setIsPaused(false);
    } else {
      // Fresh start
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setIsRunning(true);
    }
    
    // Use shorter interval for better accuracy in Expo Go
    intervalRef.current = setInterval(updateTimer, 100);
  };

  const pause = () => {
    if (!isRunning || isPaused) return;
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
    cleanup();
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setDuration(initialDuration);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    backgroundTimeRef.current = null;
    cleanup();
  };

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (!isRunning) return;
      
      if (nextAppState === 'background') {
        // Store background time
        backgroundTimeRef.current = Date.now();
        cleanup(); // Stop interval to save battery
      } else if (nextAppState === 'active' && backgroundTimeRef.current) {
        // Calculate time spent in background
        const backgroundDuration = Date.now() - backgroundTimeRef.current;
        pausedTimeRef.current += backgroundDuration;
        backgroundTimeRef.current = null;
        
        // Recalculate and restart timer
        const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
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
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription?.remove();
      cleanup();
    };
  }, [isRunning, isPaused, initialDuration, onComplete]);

  // Update duration when initialDuration changes (for session type changes)
  useEffect(() => {
    if (!isRunning && !isPaused) {
      setDuration(initialDuration);
    }
  }, [initialDuration, isRunning, isPaused]);

  return {
    duration,
    isRunning,
    isPaused,
    start,
    pause,
    stop
  };
};

// Drop-in replacement for your current timer logic
export const replacementCode = `
// Replace your current timer useEffect with this:
const { duration, isRunning, isPaused, start, pause, stop } = useExpoTimer(
  SESSION_TYPES[sessionType] || 25 * 60,
  () => {
    completeSession();
  }
);

// Remove your current timer useEffect entirely and replace with:
useEffect(() => {
  if (isRunning && !isPaused) {
    // Timer is running
  } else if (isPaused) {
    // Timer is paused
  }
}, [isRunning, isPaused]);

// Update your button handlers:
const handleStartPause = () => {
  if (isRunning && !isPaused) {
    pause();
  } else {
    start();
  }
};

const handleStop = () => {
  stop();
};
`;

// Example integration with your existing component
export const IntegratedExample = () => {
  // Your existing state
  const [sessionType, setSessionType] = useState('focus');
  const SESSION_TYPES = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  // Replace your timer logic with this
  const { duration, isRunning, isPaused, start, pause, stop } = useExpoTimer(
    SESSION_TYPES[sessionType] || 25 * 60,
    () => {
      console.log("Session completed!");
      // Your completion logic here
    }
  );

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h1>{formatTime(duration)}</h1>
      <button onClick={isRunning && !isPaused ? pause : start}>
        {isPaused ? "Resume" : isRunning ? "Pause" : "Start"}
      </button>
      <button onClick={stop}>Stop</button>
    </div>
  );
};
`;
```