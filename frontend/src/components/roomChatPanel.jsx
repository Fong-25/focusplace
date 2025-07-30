"use client"

import { X, Send, Smile } from "lucide-react"
import { useThemeStore } from "../stores/themeStore"
import { useRoomStore } from "../stores/roomStore"
import { useEffect, useRef, useState } from "react"
import { Picker } from "emoji-mart"

function RoomChatPanel({ isOpen, onClose, currentUser, socket, roomId }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { messages, newMessage, setNewMessage, sendMessage } = useRoomStore()
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const emojiPickerRef = useRef(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [emojiData, setEmojiData] = useState(null)

    // Load emoji data
    useEffect(() => {
        const loadEmojiData = async () => {
            try {
                const response = await fetch('https://cdn.jsdelivr.net/npm/emoji-mart@latest/data/all.json')
                const data = await response.json()
                setEmojiData(data)
            } catch (error) {
                console.error('Failed to load emoji data:', error)
            }
        }

        loadEmojiData()
    }, [])

    // Inject CSS for emoji-mart if needed
    useEffect(() => {
        if (!document.querySelector('#emoji-mart-css')) {
            const link = document.createElement('link')
            link.id = 'emoji-mart-css'
            link.rel = 'stylesheet'
            link.href = 'https://cdn.jsdelivr.net/npm/emoji-mart@latest/css/emoji-mart.css'
            document.head.appendChild(link)
        }
    }, [])

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

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false)
            }
        }

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showEmojiPicker])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (newMessage.trim() && currentUser && socket && roomId) {
            sendMessage(socket, roomId, newMessage.trim())
            setShowEmojiPicker(false)
        }
    }

    const handleEmojiSelect = (emoji) => {
        const cursorPosition = inputRef.current?.selectionStart || newMessage.length
        const newText = newMessage.slice(0, cursorPosition) + emoji.native + newMessage.slice(cursorPosition)
        setNewMessage(newText)

        // Focus back to input and set cursor position
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
                const newCursorPosition = cursorPosition + emoji.native.length
                inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
            }
        }, 0)
    }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker)
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Function to render message text with emoji support
    const renderMessageText = (text) => {
        return text
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
                        {messages.length === 0 ? (
                            <div className={`text-center text-sm ${theme.textMuted} italic`}>
                                No messages yet. Start the conversation! 😊
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`
                                                ${message.isSystem ? "text-center" : ""}
                                                `}
                                >
                                    {message.isSystem ? (
                                        <div className={`text-xs ${theme.textMuted} italic px-2 py-1`}>
                                            {renderMessageText(message.message)}
                                        </div>
                                    ) : (
                                        <div className={`p-3 rounded-lg ${theme.secondary}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm font-medium ${theme.text}`}>
                                                    {message.username}
                                                    {message.username === currentUser?.username && (
                                                        <span className={`ml-1 text-xs ${theme.textMuted}`}>(You)</span>
                                                    )}
                                                </span>
                                                <span className={`text-xs ${theme.textMuted}`}>
                                                    {formatTime(message.timestamp)}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${theme.text} break-words leading-relaxed`}>
                                                {renderMessageText(message.message)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className={`p-4 border-t ${theme.border} relative`}>
                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
                                className="absolute bottom-full right-4 mb-2 z-50 shadow-lg rounded-lg overflow-hidden"
                            >
                                <Picker
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                    theme={theme.cardBackground.includes('dark') ? 'dark' : 'light'}
                                    previewPosition="none"
                                    skinTonePosition="none"
                                    searchPosition="none"
                                    navPosition="bottom"
                                    perLine={8}
                                    maxFrequentRows={2}
                                />
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message... 😊"
                                    className={`
                                                w-full pr-10 pl-3 py-2 text-sm rounded-lg border transition-all duration-200
                                                ${theme.input} ${theme.inputText}
                                                focus:outline-none focus:ring-2 focus:ring-offset-1
                                                placeholder-gray-400
                                            `}
                                    maxLength={500}
                                    disabled={!socket || !roomId}
                                />
                                <button
                                    type="button"
                                    onClick={toggleEmojiPicker}
                                    className={`
                                                absolute right-2 top-1/2 transform -translate-y-1/2
                                                p-1 rounded transition-colors duration-200
                                                ${theme.textMuted} hover:${theme.text}
                                                ${showEmojiPicker ? theme.text : ''}
                                            `}
                                    disabled={!socket || !roomId}
                                >
                                    <Smile className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || !socket || !roomId}
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