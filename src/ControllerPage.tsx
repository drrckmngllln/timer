import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTimer } from "./TimerContext";

export default function ControllerPage() {
  const {
    initialTime,
    setInitialTime,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    handleSetTownName,
    townName,
  } = useTimer();

  const [minuteInput, setMinuteInput] = useState<string>(
    initialTime.toString()
  );

  const [town, setTown] = useState<string | undefined>(townName);

  // Update minuteInput when initialTime changes (from other tabs)
  useEffect(() => {
    setMinuteInput(initialTime.toString());
    if (townName) handleSetTownName(townName);
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

  function setTownName() {
    if (town) handleSetTownName(town);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
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

          <h2 className="text-xl font-semibold text-gray-800 my-4">
            Town Settings
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <input
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                placeholder="Enter Town"
              />
            </div>
            <button
              onClick={setTownName}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Update Town
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Current Town: {townName}</p>
        </div>
      </div>
    </div>
  );
}
