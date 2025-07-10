import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useRoomStore = create(
    persist(
        (set, get) => ({
            // Panel states
            isLeftPanelOpen: false,
            isRightPanelOpen: false,

            // Timer state
            focusTime: 100 * 60, // 100 minutes in seconds
            breakTime: 5 * 60,
            isRunning: false,

            // Chat state (simulate)
            messages: [
                { id: 1, username: "System", message: "Welcome to the room!", timestamp: Date.now(), isSystem: true },
                { id: 2, username: "System", message: "Always check for connection status!", timestamp: Date.now(), isSystem: true },
                { id: 3, username: "Alice", message: "Hey everyone!", timestamp: Date.now() - 60000 },
                { id: 4, username: "Bob", message: "Ready to focus?", timestamp: Date.now() - 30000 },
            ],
            newMessage: "",

            // Actions
            toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
            toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

            setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }),
            setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }),

            // Timer actions
            startTimer: () => set({ isRunning: true }),
            pauseTimer: () => set({ isRunning: false }),
            resetTimer: () => set({ focusTime: 100 * 60, breakTime: 5 * 60, isRunning: false }),

            // Chat actions
            setNewMessage: (message) => set({ newMessage: message }),
            addMessage: (username, message) => {
                const newMsg = {
                    id: Date.now(),
                    username,
                    message,
                    timestamp: Date.now(),
                    isSystem: false,
                }
                set((state) => ({
                    messages: [...state.messages, newMsg],
                    newMessage: "",
                }))
            },

            // Clear messages
            clearMessages: () => set({ messages: [] }),
        }),
        {
            name: "room-storage",
            partialize: (state) => ({
                isLeftPanelOpen: state.isLeftPanelOpen,
                isRightPanelOpen: state.isRightPanelOpen,
            }),
        },
    ),
)
