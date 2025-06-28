import { useTimer } from "./timerContext";

export default function LandingPage() {
  const { timeLeft, formatTime, isRunning } = useTimer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          {/* Timer Display - Only shown here */}
          <div
            className={`text-[10rem] font-mono font-bold transition-colors duration-300 ${
              timeLeft < 0 ? "text-red-500" : "text-gray-800"
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {isRunning ? "Running" : "Stopped"}
            </span>
          </div>

          {timeLeft < 0 && (
            <div className="text-red-500 font-semibold text-lg animate-pulse">
              Time's Up! Overtime Running
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
