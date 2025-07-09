"use client"

import { Users, Menu, MessageSquare } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import { useRoomStore } from "../stores/roomStore"

function RoomHeader({ roomId, phaseName = "Focus", userCount, isConnected }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { toggleLeftPanel, toggleRightPanel } = useRoomStore()

    return (
        <header className={`border-b ${theme.border} ${theme.cardBackground} px-4 py-3`}>
            <div className="flex items-center justify-between">
                {/* Left side - Menu button and Room info */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLeftPanel}
                        className={`
                                    p-2 rounded-lg transition-colors duration-200
                                    ${theme.secondary} hover:${theme.border} ${theme.textMuted} hover:${theme.text}
                                `}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className={`text-xl font-bold ${theme.text}`}>Room {roomId}</h1>
                            <p className={`text-sm ${theme.textMuted}`}>Current Phase: {phaseName}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users className={`w-4 h-4 ${theme.textMuted}`} />
                            <span className={`text-sm ${theme.textMuted}`}>
                                {userCount} user{userCount !== 1 ? "s" : ""}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                        </div>
                    </div>
                </div>

                {/* Right side - Chat button */}
                <button
                    onClick={toggleRightPanel}
                    className={`
                                p-2 rounded-lg transition-colors duration-200
                                ${theme.secondary} hover:${theme.border} ${theme.textMuted} hover:${theme.text}
                            `}
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            </div>
        </header>
    )
}

export default RoomHeader