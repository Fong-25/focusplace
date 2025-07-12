import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useRoomStore = create(
    persist(
        (set, get) => ({
            isLeftPanelOpen: false,
            isRightPanelOpen: false,
            messages: [
                { id: 1, username: "System", message: "Welcome to the room!", timestamp: Date.now(), isSystem: true }
            ],
            newMessage: "",

            toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
            toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

            setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }),
            setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }),

            setNewMessage: (message) => set({ newMessage: message }),

            addSocketMessage: (message) => {
                set((state) => ({
                    messages: [...state.messages, message],
                }))
            },

            sendMessage: (socket, roomId, message) => {
                if (socket && roomId && message.trim()) {
                    socket.emit('sendMessage', { roomId, message: message.trim() })
                    set({ newMessage: "" })
                }
            },

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