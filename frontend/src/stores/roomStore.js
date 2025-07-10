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

            // Chat state - Only welcome by default, populated by socket
            messages: [
                { id: 1, username: "System", message: "Welcome to the room!", timestamp: Date.now(), isSystem: true }
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

            // Add message from socket
            addSocketMessage: (message) => {
                set((state) => ({
                    messages: [...state.messages, message],
                }))
            },

            // Send message via socket
            sendMessage: (socket, roomId, message) => {
                if (socket && roomId && message.trim()) {
                    socket.emit('sendMessage', { roomId, message: message.trim() })
                    set({ newMessage: "" })
                }
            },

            // Clear messages when leaving room
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