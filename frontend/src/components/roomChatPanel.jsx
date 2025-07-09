"use client"

import { X, Send } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import { useRoomStore } from "../stores/roomStore"
import { useEffect, useRef } from "react"

function RoomChatPanel({ isOpen, onClose, currentUser }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { messages, newMessage, setNewMessage, addMessage } = useRoomStore()
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (newMessage.trim() && currentUser) {
            addMessage(currentUser.username, newMessage.trim())
        }
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <>
            {/* Backdrop */}
            {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

            {/* Panel */}
            <div
                className={`
                            fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out
                            ${theme.cardBackground} ${theme.border} border-l
                            ${isOpen ? "translate-x-0" : "translate-x-full"}
                            lg:relative lg:translate-x-0 lg:z-auto
                        `}
            >
                <div className="flex flex-col h-full">
                    {/* Panel Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${theme.border}`}>
                        <h2 className={`text-lg font-semibold ${theme.text}`}>Chat</h2>
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

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.slice(-50).map((message) => (
                            <div
                                key={message.id}
                                className={`
                                            ${message.isSystem ? "text-center" : ""}
                                            `}
                            >
                                {message.isSystem ? (
                                    <div className={`text-xs ${theme.textMuted} italic`}>{message.message}</div>
                                ) : (
                                    <div className={`p-3 rounded-lg ${theme.secondary}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-medium ${theme.text}`}>
                                                {message.username}
                                                {message.username === currentUser?.username && (
                                                    <span className={`ml-1 text-xs ${theme.textMuted}`}>(You)</span>
                                                )}
                                            </span>
                                            <span className={`text-xs ${theme.textMuted}`}>{formatTime(message.timestamp)}</span>
                                        </div>
                                        <p className={`text-sm ${theme.text}`}>{message.message}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className={`p-4 border-t ${theme.border}`}>
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className={`
                                            flex-1 px-3 py-2 text-sm rounded-lg border transition-all duration-200
                                            ${theme.input} ${theme.inputText}
                                            focus:outline-none focus:ring-2 focus:ring-offset-1
                                            placeholder-gray-400
                                        `}
                                maxLength={500}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={`
                                            p-2 rounded-lg transition-all duration-200
                                            ${theme.primary} ${theme.primaryText}
                                            focus:outline-none focus:ring-2 focus:ring-offset-1
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            transform hover:scale-105 active:scale-95
                                        `}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RoomChatPanel
