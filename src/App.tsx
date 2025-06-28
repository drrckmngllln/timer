import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Timer, Settings } from 'lucide-react';

// Timer State Interface
interface TimerState {
  timeLeft: number;
  initialTime: number;
  isRunning: boolean;
  lastUpdate: number;
}

// Timer Context Type
interface TimerContextType {
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  initialTime: number;
  setInitialTime: (time: number) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  formatTime: (seconds: number) => string;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

// Create Timer Context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Timer Provider Component
const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [initialTime, setInitialTime] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const storageKey = 'timer-app-state';

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsedState: TimerState = JSON.parse(savedState);
        const now = Date.now();
        const timeDiff = Math.floor((now - parsedState.lastUpdate) / 1000);
        
        // If timer was running, calculate the elapsed time
        if (parsedState.isRunning) {
          const updatedTimeLeft = parsedState.timeLeft - timeDiff;
          setTimeLeft(updatedTimeLeft);
        } else {
          setTimeLeft(parsedState.timeLeft);
        }
        
        setInitialTime(parsedState.initialTime);
        setIsRunning(parsedState.isRunning);
      } catch (error) {
        console.error('Error parsing saved timer state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  const saveState = (newTimeLeft: number, newInitialTime: number, newIsRunning: boolean) => {
    const state: TimerState = {
      timeLeft: newTimeLeft,
      initialTime: newInitialTime,
      isRunning: newIsRunning,
      lastUpdate: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: storageKey,
      newValue: JSON.stringify(state),
    }));
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsedState: TimerState = JSON.parse(e.newValue);
          const now = Date.now();
          const timeDiff = Math.floor((now - parsedState.lastUpdate) / 1000);
          
          if (parsedState.isRunning) {
            const updatedTimeLeft = parsedState.timeLeft - timeDiff;
            setTimeLeft(updatedTimeLeft);
          } else {
            setTimeLeft(parsedState.timeLeft);
          }
          
          setInitialTime(parsedState.initialTime);
          setIsRunning(parsedState.isRunning);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTimeLeft = prev - 1;
          saveState(newTimeLeft, initialTime, true);
          return newTimeLeft;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, initialTime]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startTimer = (): void => {
    let newTimeLeft = timeLeft;
    if (timeLeft === 0) {
      newTimeLeft = initialTime * 60;
      setTimeLeft(newTimeLeft);
    }
    setIsRunning(true);
    saveState(newTimeLeft, initialTime, true);
  };

  const pauseTimer = (): void => {
    setIsRunning(false);
    saveState(timeLeft, initialTime, false);
  };

  const resetTimer = (): void => {
    const newTimeLeft = initialTime * 60;
    setIsRunning(false);
    setTimeLeft(newTimeLeft);
    saveState(newTimeLeft, initialTime, false);
  };

  const updateInitialTime = (newInitialTime: number): void => {
    setInitialTime(newInitialTime);
    const newTimeLeft = newInitialTime * 60;
    setTimeLeft(newTimeLeft);
    setIsRunning(false);
    saveState(newTimeLeft, newInitialTime, false);
  };

  const value: TimerContextType = {
    timeLeft,
    setTimeLeft,
    initialTime,
    setInitialTime: updateInitialTime,
    isRunning,
    setIsRunning,
    formatTime,
    startTimer,
    pauseTimer,
    resetTimer,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

// Custom hook to use Timer Context
const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

// Landing Page Component
const LandingPage: React.FC = () => {
  const { timeLeft, formatTime } = useTimer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <Timer className="w-20 h-20 mx-auto text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-800">Timer App</h1>
          <p className="text-gray-600 text-lg">
            A simple and elegant timer for your productivity needs
          </p>
        </div>
        
        <div className="space-y-4">
          <div className={`text-6xl font-mono font-bold ${timeLeft < 0 ? 'text-red-500' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          
          <Link
            to="/controller"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto w-fit"
          >
            <Settings className="w-5 h-5" />
            Open Controller
          </Link>
        </div>
      </div>
    </div>
  );
};

// Controller Page Component
const ControllerPage: React.FC = () => {
  const { 
    timeLeft, 
    initialTime, 
    setInitialTime, 
    isRunning, 
    formatTime, 
    startTimer, 
    pauseTimer, 
    resetTimer 
  } = useTimer();
  
  const [minuteInput, setMinuteInput] = useState<string>(initialTime.toString());
  const navigate = useNavigate();

  // Update minuteInput when initialTime changes (from other tabs)
  useEffect(() => {
    setMinuteInput(initialTime.toString());
  }, [initialTime]);

  const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setMinuteInput(e.target.value);
  };

  const setMinutes = (): void => {
    const minutes = parseInt(minuteInput) || 1;
    setInitialTime(minutes);
  };

  const handleBackToHome = (): void => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <button
            onClick={handleBackToHome}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Timer Controller</h1>
          <p className="text-sm text-gray-500">
            Control the timer from any tab - changes sync across all open tabs
          </p>
        </div>

        {/* Timer Display */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className={`text-8xl font-mono font-bold mb-6 ${timeLeft < 0 ? 'text-red-500' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          
          {timeLeft < 0 && (
            <div className="text-red-500 font-semibold text-lg mb-4">
              Time's Up! Overtime Running
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`${
                isRunning 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Time Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Set Timer Duration</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Minutes
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={minuteInput}
                onChange={handleMinuteInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                placeholder="Enter minutes"
              />
            </div>
            <button
              onClick={setMinutes}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Set Timer
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Current: {initialTime} minute{initialTime !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Status Info */}
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-600">
            Status: <span className={`font-semibold ${isRunning ? 'text-green-600' : 'text-gray-800'}`}>
              {isRunning ? 'Running' : 'Paused'}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Timer state syncs across all browser tabs
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/controller" element={<ControllerPage />} />
        </Routes>
      </TimerProvider>
    </Router>
  );
};

export default App;