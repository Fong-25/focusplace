import { create } from "zustand"
import { persist } from "zustand/middleware"

// No fallback - settings will be fetched from backend

export const useLobbyStore = create(
    persist(
        (set, get) => ({
            // Room state
            currentRoom: null,
            recentRooms: [],
            isInRoom: false,

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
            isLoading: false,
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
            joinRoom: async (roomId) => {
                set({ isLoading: true })
                try {
                    await new Promise((resolve) => setTimeout(resolve, 1500))

                    if (roomId.length < 4) {
                        throw new Error("Room ID must be at least 4 characters long")
                    }

                    if (roomId === "invalid") {
                        throw new Error("Room not found. Please check the room ID and try again.")
                    }

                    const room = {
                        id: roomId,
                        name: `Room ${roomId}`,
                        joinedAt: new Date().toISOString(),
                        type: "joined",
                    }

                    set({
                        currentRoom: room,
                        isInRoom: true,
                        isJoinModalOpen: false,
                    })

                    const { recentRooms } = get()
                    const updatedRooms = [room, ...recentRooms.filter((r) => r.id !== roomId)].slice(0, 5)
                    set({ recentRooms: updatedRooms })

                    return { success: true, room }
                } catch (error) {
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            createRoom: async (roomId, settings) => {
                set({ isLoading: true })
                try {
                    await new Promise((resolve) => setTimeout(resolve, 1500))

                    if (roomId.length < 4) {
                        throw new Error("Room ID must be at least 4 characters long")
                    }

                    if (roomId === "taken") {
                        throw new Error("Room ID is already taken. Please choose a different one.")
                    }

                    const { defaultRoomSettings } = get()
                    const room = {
                        id: roomId,
                        name: `Room ${roomId}`,
                        createdAt: new Date().toISOString(),
                        type: "created",
                        settings: settings || (defaultRoomSettings ? { ...defaultRoomSettings } : null),
                    }

                    set({
                        currentRoom: room,
                        isInRoom: true,
                        isCreateModalOpen: false,
                    })

                    const { recentRooms } = get()
                    const updatedRooms = [room, ...recentRooms.filter((r) => r.id !== roomId)].slice(0, 5)
                    set({ recentRooms: updatedRooms })

                    return { success: true, room }
                } catch (error) {
                    throw error
                } finally {
                    set({ isLoading: false })
                }
            },

            leaveRoom: () => {
                set({
                    currentRoom: null,
                    isInRoom: false,
                })
            },

            clearRecentRooms: () => {
                set({ recentRooms: [] })
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