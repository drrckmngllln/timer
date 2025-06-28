import { createContext, useContext, useEffect, useRef, useState } from "react";

interface TimerState {
  timeLeft: number;
  initialTime: number;
  isRunning: boolean;
  lastUpdate: number;
}

// Timer Context Type
interface TimerContextType {
  timeLeft: number;
  initialTime: number;
  isRunning: boolean;
  formatTime: (seconds: number) => string;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setInitialTime: (time: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Timer Provider Component
export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [initialTime, setInitialTime] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const storageKey = "timer-app-state-v2";

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsedState: TimerState & { targetTime?: number } =
          JSON.parse(savedState);
        setInitialTime(parsedState.initialTime);
        setIsRunning(parsedState.isRunning);
        if (parsedState.isRunning && parsedState.targetTime) {
          setTargetTime(parsedState.targetTime);
        } else {
          setTimeLeft(parsedState.timeLeft);
          setTargetTime(null);
        }
      } catch (error) {
        setTimeLeft(5 * 60);
        setInitialTime(5);
        setIsRunning(false);
        setTargetTime(null);
      }
    } else {
      setTimeLeft(5 * 60);
      setTargetTime(null);
    }
  }, []);

  // Save state to localStorage
  const saveState = (
    newTimeLeft: number,
    newInitialTime: number,
    newIsRunning: boolean,
    newTargetTime: number | null
  ) => {
    const state = {
      timeLeft: newTimeLeft,
      initialTime: newInitialTime,
      isRunning: newIsRunning,
      lastUpdate: Date.now(),
      targetTime: newTargetTime,
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  // Timer countdown logic (smoother)
  useEffect(() => {
    if (!isRunning || !targetTime) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const update = () => {
      const now = Date.now();
      const secondsLeft = Math.round((targetTime - now) / 1000);
      setTimeLeft(secondsLeft);
      saveState(secondsLeft, initialTime, true, targetTime);

      if (secondsLeft > -3600) {
        // allow up to 1 hour overtime
        rafRef.current = requestAnimationFrame(update);
      }
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, targetTime, initialTime]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsedState: TimerState & { targetTime?: number } = JSON.parse(
            e.newValue
          );
          setInitialTime(parsedState.initialTime);
          setIsRunning(parsedState.isRunning);
          if (parsedState.isRunning && parsedState.targetTime) {
            setTargetTime(parsedState.targetTime);
          } else {
            setTimeLeft(parsedState.timeLeft);
            setTargetTime(null);
          }
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Timer controls
  const startTimer = (): void => {
    const now = Date.now();
    const newTargetTime =
      now + (timeLeft > 0 ? timeLeft : initialTime * 60) * 1000;
    setIsRunning(true);
    setTargetTime(newTargetTime);
    saveState(
      timeLeft > 0 ? timeLeft : initialTime * 60,
      initialTime,
      true,
      newTargetTime
    );
  };

  const pauseTimer = (): void => {
    setIsRunning(false);
    setTargetTime(null);
    saveState(timeLeft, initialTime, false, null);
  };

  const resetTimer = (): void => {
    const newTimeLeft = initialTime * 60;
    setIsRunning(false);
    setTimeLeft(newTimeLeft);
    setTargetTime(null);
    saveState(newTimeLeft, initialTime, false, null);
  };

  const updateInitialTime = (newInitialTime: number): void => {
    const newTimeLeft = newInitialTime * 60;
    setInitialTime(newInitialTime);
    setTimeLeft(newTimeLeft);
    setIsRunning(false);
    setTargetTime(null);
    saveState(newTimeLeft, newInitialTime, false, null);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? "-" : "";
    return `${sign}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const value: TimerContextType = {
    timeLeft,
    initialTime,
    isRunning,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setInitialTime: updateInitialTime,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

// Custom hook to use Timer Context
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
