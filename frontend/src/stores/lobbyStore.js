import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

// No fallback - settings will be fetched from backend

export const useLobbyStore = create(
    persist(
        (set, get) => ({
            // Room state
            currentRoom: null,
            recentRooms: [],
            isInRoom: false,
            roomData: null,

            // Modal states
            isJoinModalOpen: false,
            isCreateModalOpen: false,

            // Form data
            joinRoomId: "",
            createRoomId: "",
            roomSettings: null, // Will be set after loading defaults

            // Default settings from server
            defaultRoomSettings: null, // Will be populated from backend
            isDefaultSettingsLoaded: false,

            // UI state
            // isLoading: false,
            settingsEnabled: false,

            // Actions
            setJoinModalOpen: (isOpen) => set({ isJoinModalOpen: isOpen }),
            setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),
            setLoading: (isLoading) => set({ isLoading }),
            setJoinRoomId: (roomId) => set({ joinRoomId: roomId }),
            setCreateRoomId: (roomId) => set({ createRoomId: roomId }),
            setSettingsEnabled: (enabled) => set({ settingsEnabled: enabled }),

            // Load default settings from server
            loadDefaultSettings: async () => {
                try {
                    const res = await fetch('http://localhost:3000/api/rooms/default-settings', {
                        method: "GET",
                        credentials: 'include'
                    })
                    const data = await res.json()

                    set({
                        defaultRoomSettings: data,
                        isDefaultSettingsLoaded: true,
                        roomSettings: data
                    })
                } catch (error) {
                    console.error('Failed to fetch default room settings:', error)
                    set({ isDefaultSettingsLoaded: false })
                    throw error // Re-throw so components can handle the error
                }
            },

            // Room settings actions
            updateRoomSettings: (settings) =>
                set((state) => ({
                    roomSettings: { ...state.roomSettings, ...settings },
                })),

            resetRoomSettings: () => {
                const { defaultRoomSettings } = get()
                if (defaultRoomSettings) {
                    set({ roomSettings: { ...defaultRoomSettings } })
                }
            },

            // Reset form data when modals close
            resetJoinForm: () => set({ joinRoomId: "", isJoinModalOpen: false }),
            resetCreateForm: () => {
                const { defaultRoomSettings } = get()
                set({
                    createRoomId: "",
                    isCreateModalOpen: false,
                    roomSettings: defaultRoomSettings ? { ...defaultRoomSettings } : null,
                })
            },

            // Room operations
            joinRoom: (socket, roomId, user) => {
                if (roomId.length < 4) {
                    toast.error('Room ID must be at least 4 characters long');
                    return;
                }
                socket.emit('joinRoom', { roomId, user });
            },

            createRoom: (socket, roomId, user, settings) => {
                if (roomId.length < 4) {
                    toast.error('Room ID must be at least 4 characters long');
                    return;
                }
                socket.emit('createRoom', { roomId, user, settings });
            },

            setRoomData: (roomData) => set({ roomData, isInRoom: true }),

            leaveRoom: (socket, roomId, user, callback) => {
                return new Promise((resolve) => {
                    if (socket && roomId && user) {
                        socket.emit('leaveRoom', { roomId, userId: user.id }, () => {
                            // Server acknowledges leave
                            set({
                                currentRoom: null,
                                isInRoom: false,
                                roomData: null,
                                isJoinModalOpen: false,
                                isCreateModalOpen: false,
                            });
                            resolve();
                            if (callback) callback();
                        });
                    } else {
                        set({
                            currentRoom: null,
                            isInRoom: false,
                            roomData: null,
                            isJoinModalOpen: false,
                            isCreateModalOpen: false,
                        });
                        resolve();
                    }
                });
            },

            clearRecentRooms: () => {
                set({ recentRooms: [] });
            },
        }),
        {
            name: "lobby-storage",
            partialize: (state) => ({
                recentRooms: state.recentRooms,
                currentRoom: state.currentRoom,
                isInRoom: state.isInRoom,
                settingsEnabled: state.settingsEnabled,
                defaultRoomSettings: state.defaultRoomSettings,
                isDefaultSettingsLoaded: state.isDefaultSettingsLoaded,
            }),
        },
    ),
)

// Auto-load default settings when the store is created
useLobbyStore.getState().loadDefaultSettings()