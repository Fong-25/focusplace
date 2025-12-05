'use client'
import { Mic, MicOff } from 'lucide-react'
import { useThemStore } from '../stores/themeStore'

export default function VoiceControls({ isMuted, isConnecting, onToggleMute, activeSpeakers = new Set(), currentUserId }) {
    const { getTheme } = useThemStore()
    const theme = getTheme()

    const isCurrentUserSpeaking = activeSpeakers.has(currentUserId) && !isMuted

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Toggle Button */}
            <button
                onClick={onToggleMute}
                disabled={isConnecting}
                className={`
                    relative inline-flex items-center justify-center p-3 rounded-lg
                    transition-all duration-200 transform hover:scale-105 active:scale-95
                    ${isConnecting
                        ? `${theme.secondary} ${theme.secondaryText} opacity-50 cursor-not-allowed`
                        : isMuted
                            ? `${theme.secondary} ${theme.secondaryText} hover:${theme.border}`
                            : `${theme.primary} ${theme.primaryText} shadow-md`
                    }
                    ${isCurrentUserSpeaking ? 'ring-2 ring-green-400 ring-offset-2 animate-pulse' : ''}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300
                `}
                title={isConnecting ? "Connecting..." : isMuted ? "Unmute microphone" : "Mute microphone"}
            >
                {isConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : isMuted ? (
                    <MicOff className="w-5 h-5" />
                ) : (
                    <Mic className="w-5 h-5" />
                )}

                {/* Speaking indicator ring */}
                {isCurrentUserSpeaking && (
                    <span className="absolute inset-0 rounded-lg border-2 border-green-400 animate-ping"></span>
                )}
            </button>

            {/* Label */}
            <span className={`text-xs lg:text-xs font-medium ${theme.textMuted} text-center`}>
                {isConnecting ? 'Connecting...' : 'Voice Chat'}
            </span>

            {/* Status Indicator */}
            <div className="flex items-center gap-1">
                <div
                    className={`
                        w-2 h-2 rounded-full transition-colors duration-200
                        ${isConnecting
                            ? 'bg-yellow-500 animate-pulse'
                            : isMuted
                                ? 'bg-red-500'
                                : 'bg-green-500'
                        }
                    `}
                />
                <span className={`text-xs ${theme.textMuted}`}>
                    {isConnecting ? 'Connecting' : isMuted ? 'Muted' : 'Active'}
                </span>
            </div>

            {/* Active speakers count */}
            {activeSpeakers.size > 0 && (
                <div className={`text-xs ${theme.textMuted} text-center`}>
                    {activeSpeakers.size} speaking
                </div>
            )}
        </div>
    )
}