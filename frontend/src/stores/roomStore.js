import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useRoomStore = create(
    persist(
        (set, get) => ({
            soundEffectsEnabled: true,

            isLeftPanelOpen: false,
            isRightPanelOpen: false,
            messages: [
                { id: 1, username: "System", message: "Welcome to the room! 🎉", timestamp: Date.now(), isSystem: true }
            ],
            newMessage: "",

            // Emoji-related state
            recentEmojis: [],
            favoriteEmojis: ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'],

            toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
            toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

            setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }),
            setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }),

            toggleSoundsEffect: () => set((state) => ({ soundEffectsEnabled: !state.soundEffectsEnabled })),
            setSoundsEffect: (enabled) => set({ soundEffectsEnabled: enabled }),

            setNewMessage: (message) => set({ newMessage: message }),

            // Add emoji to recent emojis list
            addRecentEmoji: (emoji) => {
                set((state) => {
                    const newRecentEmojis = [emoji, ...state.recentEmojis.filter(e => e !== emoji)].slice(0, 20)
                    return { recentEmojis: newRecentEmojis }
                })
            },

            // Toggle emoji in favorites
            toggleFavoriteEmoji: (emoji) => {
                set((state) => {
                    const isFavorite = state.favoriteEmojis.includes(emoji)
                    const newFavorites = isFavorite
                        ? state.favoriteEmojis.filter(e => e !== emoji)
                        : [...state.favoriteEmojis, emoji].slice(0, 16) // Limit to 16 favorites
                    return { favoriteEmojis: newFavorites }
                })
            },

            addSocketMessage: (message) => {
                set((state) => ({
                    messages: [...state.messages, message],
                }))
            },

            sendMessage: (socket, roomId, message) => {
                if (socket && roomId && message.trim()) {
                    // Extract emojis from message and add to recent emojis
                    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
                    const emojisInMessage = message.match(emojiRegex) || []

                    // Add unique emojis to recent list
                    const uniqueEmojis = [...new Set(emojisInMessage)]
                    uniqueEmojis.forEach(emoji => {
                        get().addRecentEmoji(emoji)
                    })

                    socket.emit('sendMessage', { roomId, message: message.trim() })
                    set({ newMessage: "" })
                }
            },

            clearMessages: () => set({
                messages: [
                    { id: 1, username: "System", message: "Welcome to the room! 🎉", timestamp: Date.now(), isSystem: true }
                ]
            }),

            // Utility function to check if a string contains emojis
            hasEmojis: (text) => {
                const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
                return emojiRegex.test(text)
            },

            // Get emoji statistics for fun
            getEmojiStats: () => {
                const state = get()
                const allMessages = state.messages.filter(msg => !msg.isSystem)
                const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu

                const emojiCount = {}
                let totalEmojis = 0

                allMessages.forEach(msg => {
                    const emojis = msg.message.match(emojiRegex) || []
                    emojis.forEach(emoji => {
                        emojiCount[emoji] = (emojiCount[emoji] || 0) + 1
                        totalEmojis++
                    })
                })

                const mostUsed = Object.entries(emojiCount)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)

                return {
                    totalEmojis,
                    uniqueEmojis: Object.keys(emojiCount).length,
                    mostUsed,
                    messagesWithEmojis: allMessages.filter(msg => state.hasEmojis(msg.message)).length,
                    totalMessages: allMessages.length
                }
            }
        }),
        {
            name: "room-storage",
            partialize: (state) => ({
                isLeftPanelOpen: state.isLeftPanelOpen,
                isRightPanelOpen: state.isRightPanelOpen,
                recentEmojis: state.recentEmojis,
                favoriteEmojis: state.favoriteEmojis,
            }),
        },
    ),
)