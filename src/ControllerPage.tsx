import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useTimer } from "./timerContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ControllerPage() {
  const {
    initialTime,
    setInitialTime,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useTimer();

  const [minuteInput, setMinuteInput] = useState<string>(
    initialTime.toString()
  );
  const navigate = useNavigate();

  // Update minuteInput when initialTime changes (from other tabs)
  useEffect(() => {
    setMinuteInput(initialTime.toString());
  }, [initialTime]);

  const handleMinuteInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setMinuteInput(e.target.value);
  };

  const setMinutes = (): void => {
    const minutes = parseInt(minuteInput) || 1;
    setInitialTime(minutes);
  };

  const handleBackToHome = (): void => {
    navigate("/");
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
            Control the timer - view the countdown on the home page
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Timer Controls
          </h2>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`${
                isRunning
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-3 text-lg`}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
              {isRunning ? "Pause Timer" : "Start Timer"}
            </button>

            <button
              onClick={resetTimer}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-3 text-lg"
            >
              <RotateCcw className="w-6 h-6" />
              Reset Timer
            </button>
          </div>

          {/* Status Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div
                className={`w-4 h-4 rounded-full ${
                  isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span
                className={`text-lg font-semibold ${
                  isRunning ? "text-green-600" : "text-gray-600"
                }`}
              >
                Timer is {isRunning ? "Running" : "Stopped"}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Go to the home page to see the countdown
            </p>
          </div>
        </div>

        {/* Time Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Timer Settings
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Duration (Minutes)
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
              Update Timer
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Current duration: {initialTime} minute{initialTime !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Timer className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800">
                How it works
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Use these controls to start, pause, or reset the timer. The
                countdown will be visible on the home page. Timer state syncs
                across all browser tabs automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
