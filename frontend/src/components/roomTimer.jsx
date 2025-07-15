"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import { useLobbyStore } from "../stores/lobbyStore"
import toast from "react-hot-toast"
import { useEffect } from "react"

function RoomTimer({ isHost = false, socket, roomId }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { roomData } = useLobbyStore()

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

    const handleStart = () => {
        socket.emit('startTimer', { roomId })
    }

    const handlePause = () => {
        socket.emit('pauseTimer', { roomId })
    }

    const handleReset = () => {
        socket.emit('resetTimer', { roomId })
    }

    // Toast on phase switch
    useEffect(() => {
        if (!socket) return;
        const handlePhaseSwitched = () => {
            if (!roomData) return;
            const phase = roomData.timer.phase === 'focus' ? 'Break' : 'Focus'; // phase will be switched after event
            const phaseName = phase === 'Focus' ? roomData.settings.focusPhaseName : roomData.settings.breakPhaseName;
            toast((t) => (
                <span>
                    Switched to <b>{phaseName}</b> phase!
                </span>
            ), { id: 'phase-switched', duration: 3000 });
        };
        socket.on('phaseSwitched', handlePhaseSwitched);
        return () => {
            socket.off('phaseSwitched', handlePhaseSwitched);
        };
    }, [socket, roomData]);

    if (!roomData) return null

    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center mb-4">
                <div className={`text-6xl md:text-8xl font-mono font-bold mb-2 ${theme.text}`}>
                    {formatDigitalTime(roomData.timer.timeLeft)}
                </div>
                <div className={`text-sm ${theme.textMuted} mb-2`}>
                    {roomData.timer.phase === 'focus' ? roomData.settings.focusPhaseName : roomData.settings.breakPhaseName}
                </div>
            </div>

            {(isHost || !roomData.settings.strictMode) ? (
                <div className="flex items-center gap-4">
                    <button
                        onClick={roomData.timer.isRunning ? handlePause : handleStart}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-medium
                            transition-all duration-200 transform hover:scale-105
                            ${theme.primary} ${theme.primaryText}
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                        `}
                    >
                        {roomData.timer.isRunning ? (
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
                        onClick={handleReset}
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