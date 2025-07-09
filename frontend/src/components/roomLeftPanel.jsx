"use client"

import { X, Settings, Users, Crown, User } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"

function RoomLeftPanel({ isOpen, onClose, roomData, currentUser }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

            {/* Panel */}
            <div
                className={`
                            fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out
                            ${theme.cardBackground} ${theme.border} border-r
                            ${isOpen ? "translate-x-0" : "-translate-x-full"}
                            lg:relative lg:translate-x-0 lg:z-auto
                        `}
            >
                <div className="flex flex-col h-full">
                    {/* Panel Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${theme.border}`}>
                        <h2 className={`text-lg font-semibold ${theme.text}`}>Room Details</h2>
                        <button
                            onClick={onClose}
                            className={`
                                        p-2 rounded-lg transition-colors duration-200 lg:hidden
                                        ${theme.secondary} hover:${theme.border} ${theme.textMuted} hover:${theme.text}
                                    `}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Room Settings */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className={`w-4 h-4 ${theme.textMuted}`} />
                                <h3 className={`text-sm font-semibold ${theme.text}`}>Settings</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${theme.secondary} space-y-2`}>
                                <div className="flex justify-between text-sm">
                                    <span className={`${theme.textMuted}`}>Focus Time:</span>
                                    <span className={`${theme.text}`}>{roomData?.settings?.focusTime || 25} min</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={`${theme.textMuted}`}>Break Time:</span>
                                    <span className={`${theme.text}`}>{roomData?.settings?.breakTime || 5} min</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={`${theme.textMuted}`}>Strict Mode:</span>
                                    <span className={`${theme.text}`}>{roomData?.settings?.strictMode ? "On" : "Off"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={`${theme.textMuted}`}>Auto Switch:</span>
                                    <span className={`${theme.text}`}>{roomData?.settings?.autoPhaseChange ? "On" : "Off"}</span>
                                </div>
                            </div>
                        </div>

                        {/* User List */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className={`w-4 h-4 ${theme.textMuted}`} />
                                <h3 className={`text-sm font-semibold ${theme.text}`}>Users ({roomData?.users?.length || 0})</h3>
                            </div>
                            <div className="space-y-2">
                                {roomData?.users?.map((roomUser) => (
                                    <div
                                        key={roomUser.id}
                                        className={`
                                                    p-3 rounded-lg border transition-all duration-200
                                                    ${theme.secondary} ${theme.border}
                                                    ${roomUser.id === currentUser?.id ? "ring-2 ring-blue-400" : ""}
                                                `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center
                                                            ${roomUser.id === roomData.hostId ? "bg-yellow-500" : theme.primary}
                                                        `}
                                            >
                                                {roomUser.id === roomData.hostId ? (
                                                    <Crown className="w-4 h-4 text-white" />
                                                ) : (
                                                    <User className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-sm font-medium ${theme.text}`}>{roomUser.username}</h4>
                                                    {roomUser.id === currentUser?.id && (
                                                        <span className={`text-xs px-2 py-0.5 rounded ${theme.primary} ${theme.primaryText}`}>
                                                            You
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-xs ${theme.textMuted}`}>
                                                    {roomUser.id === roomData.hostId ? "Host" : "Member"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RoomLeftPanel