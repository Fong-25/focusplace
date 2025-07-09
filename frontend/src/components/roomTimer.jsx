"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import { useRoomStore } from "../stores/roomStore"

function RoomTimer({ isHost = false }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { focusTime, breakTime, isRunning, startTimer, pauseTimer, resetTimer } = useRoomStore()

    // Format time to hours, minutes, seconds
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} min${minutes !== 1 ? "s" : ""}, ${secs} second${secs !== 1 ? "s" : ""}`
        } else if (minutes > 0) {
            return `${minutes} min${minutes !== 1 ? "s" : ""}, ${secs} second${secs !== 1 ? "s" : ""}`
        } else {
            return `${secs} second${secs !== 1 ? "s" : ""}`
        }
    }

    const formatDigitalTime = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        } else {
            return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            {/* Main Focus Timer Display */}
            <div className="text-center mb-4">
                <div className={`text-6xl md:text-8xl font-mono font-bold mb-2 ${theme.text}`}>
                    {formatDigitalTime(focusTime)}
                </div>
                <div className={`text-sm ${theme.textMuted} mb-2`}>Focus Time</div>
            </div>

            {/* Secondary Break Timer Display */}
            <div className="text-center mb-8">
                <div className={`text-2xl md:text-3xl font-mono font-medium ${theme.textMuted}`}>
                    {formatDigitalTime(breakTime)}
                </div>
                <div className={`text-xs ${theme.textMuted}`}>Break Time</div>
            </div>

            {/* Timer Controls - Only for Host */}
            {isHost ? (
                <div className="flex items-center gap-4">
                    <button
                        onClick={isRunning ? pauseTimer : startTimer}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium
              transition-all duration-200 transform hover:scale-105
              ${theme.primary} ${theme.primaryText}
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
                    >
                        {isRunning ? (
                            <>
                                <Pause className="w-6 h-6" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="w-6 h-6" />
                                Start
                            </>
                        )}
                    </button>

                    <button
                        onClick={resetTimer}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium
              transition-all duration-200 transform hover:scale-105 border-2
              ${theme.secondary} ${theme.secondaryText} ${theme.border}
              hover:${theme.primary} hover:${theme.primaryText}
              focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
                    >
                        <RotateCcw className="w-6 h-6" />
                        Reset
                    </button>
                </div>
            ) : (
                <div className={`text-center p-4 rounded-lg ${theme.secondary}`}>
                    <p className={`text-sm ${theme.secondaryText}`}>Only the host can control the timer</p>
                </div>
            )}
        </div>
    )
}

export default RoomTimer