"use client"

import { X, Users, Plus } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import RoomSettings from "./roomSettings"

function RoomModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    type,
    roomId,
    setRoomId,
    roomSettings,
    onSettingsChange,
    settingsEnabled = false
}) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()

    const handleSubmit = (e) => {
        e.preventDefault()
        if (roomId.trim()) {
            onSubmit(roomId.trim())
        }
    }
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`
                            w-full max-w-md rounded-xl shadow-xl border transition-all duration-300
                            ${theme.cardBackground} ${theme.border}
                            `}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${theme.border}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${theme.secondary}`}>
                            {type === "join" ? (
                                <Users className={`w-5 h-5 ${theme.secondaryText}`} />
                            ) : (
                                <Plus className={`w-5 h-5 ${theme.secondaryText}`} />
                            )}
                        </div>
                        <h2 className={`text-xl font-semibold ${theme.text}`}>{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`
                                    p-2 rounded-lg transition-colors duration-200
                                    ${theme.secondary} hover:${theme.border} ${theme.textMuted} hover:${theme.text}
                                `}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="mb-4">
                            <label htmlFor="roomId" className={`block text-sm font-medium mb-2 ${theme.text}`}>
                                {type === "join" ? "Enter Room ID to Join" : "Choose a Room ID"}
                            </label>
                            <input
                                type="text"
                                id="roomId"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className={`
                                            w-full px-4 py-2.5 text-lg rounded-lg border transition-all duration-200
                                            ${theme.input} ${theme.inputText}
                                            focus:outline-none focus:ring-2 focus:ring-offset-1
                                            placeholder-gray-400 text-center font-mono tracking-wider
                                        `}
                                placeholder={type === "join" ? "ROOM123" : "MY-ROOM"}
                                maxLength={20}
                                autoFocus
                                required
                            />
                            <p className={`mt-1 text-xs ${theme.textMuted} text-center`}>
                                Room ID must be at least 4 characters long
                            </p>
                        </div>

                        {/* Room Settings - Only for Create Room */}
                        {type === "create" && (
                            <div className="mb-4">
                                <RoomSettings settings={roomSettings} onSettingsChange={onSettingsChange} disabled={!settingsEnabled} />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`
                                            flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                            ${theme.secondary} ${theme.secondaryText}
                                            hover:${theme.border} focus:outline-none focus:ring-2 focus:ring-offset-1
                                        `}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!roomId.trim() || roomId.trim().length < 4}
                                className={`
                                            flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                                            ${theme.primary} ${theme.primaryText}
                                            focus:outline-none focus:ring-2 focus:ring-offset-1
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            transform hover:scale-[1.02] active:scale-[0.98]
                                        `}
                            >
                                {type === "join" ? "Join Room" : "Create Room"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RoomModal