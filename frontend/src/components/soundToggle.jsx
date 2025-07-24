"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import { useRoomStore } from "../stores/roomStore"

export default function SoundToggle() {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { soundEffectsEnabled, toggleSoundsEffect } = useRoomStore()

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Toggle Button */}
            <button
                onClick={toggleSoundsEffect}
                className={`
                            relative inline-flex items-center justify-center p-3 rounded-lg
                            transition-all duration-200 transform hover:scale-105 active:scale-95
                            ${soundEffectsEnabled
                        ? `${theme.primary} ${theme.primaryText} shadow-md`
                        : `${theme.secondary} ${theme.secondaryText} hover:${theme.border}`
                    }
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300
                        `}
                title={`Sound effects ${soundEffectsEnabled ? "enabled" : "disabled"}`}
            >
                {soundEffectsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Label */}
            <span className={`text-xs lg:text-xs font-medium ${theme.textMuted} text-center`}>Notification</span>

            {/* Status Indicator */}
            <div className="flex items-center gap-1">
                <div
                    className={`
                        w-2 h-2 rounded-full transition-colors duration-200
                        ${soundEffectsEnabled ? "bg-green-500" : "bg-gray-400"}
                    `}
                />
                <span className={`text-xs ${theme.textMuted}`}>{soundEffectsEnabled ? "On" : "Off"}</span>
            </div>
        </div>
    )
}
