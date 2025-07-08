"use client"

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useState } from 'react'
import { useUser } from '../components/protectedRoute'
import toast, { Toaster } from 'react-hot-toast'
import { useThemeStore } from '../stores/themeStore'
import { useLobbyStore } from '../stores/lobbyStore'
import ThemeChooser from '../components/themeChooser'
import RoomModal from '../components/roomModal'
import { Users, Plus } from 'lucide-react'
import Warning from '../components/warning'
import ResetTheme from '../components/resetTheme'

function Lobby() {
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    // Get user data from ProtectedRoute context
    const { user } = useUser()

    useEffect(() => {
        // Create socket connection inside useEffect
        const newSocket = io('http://localhost:3000', {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            timeout: 20000,
            forceNew: true
        })

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Connected:', newSocket.id)
            setIsConnected(true)
        })

        newSocket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason)
            setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error)
            setIsConnected(false)
        })

        newSocket.on('error', (err) => {
            console.error('Socket error:', err)
        })

        setSocket(newSocket)

        // Cleanup function
        return () => {
            if (newSocket) {
                newSocket.disconnect()
            }
        }
    }, [])

    const handleReconnect = () => {
        if (socket) {
            socket.connect()
        }
    }
    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            if (socket) {
                socket.disconnect()
            }

            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const {
        isJoinModalOpen,
        isCreateModalOpen,
        joinRoomId,
        createRoomId,
        roomSettings,
        settingsEnabled,
        setJoinModalOpen,
        setCreateModalOpen,
        setJoinRoomId,
        setCreateRoomId,
        updateRoomSettings,
        resetJoinForm,
        resetCreateForm,
    } = useLobbyStore()

    const handleJoinRoom = (roomId) => {
        console.log("Joining room:", roomId)
        toast.success(`Joining room: ${roomId}`)
        resetJoinForm()
    }
    const handleCreateRoom = (roomId) => {
        console.log("Creating room:", roomId, "with settings:", roomSettings)
        toast.success(`Creating room: ${roomId} with custom settings`)
        resetCreateForm()
    }

    const handleJoinModalClose = () => {
        resetJoinForm()
    }

    const handleCreateModalClose = () => {
        resetCreateForm()
    }
    return (
        <div className={`min-h-screen transition-all duration-300 ${theme.background}`}>
            <Toaster position="top-right" />

            {/* Theme Chooser - Top Left */}
            <div className="absolute top-6 left-6">
                <ThemeChooser />
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md sm:mt-0 mt-12">
                    {/* Welcome Message */}
                    <div className="text-center mb-8">
                        <h1 className={`text-4xl font-bold mb-4 ${theme.text}`}>Welcome to the Lobby, {user?.username}!</h1>
                        <p className={`text-lg ${theme.textMuted}`}>Join an existing room or create your own to get started</p>
                    </div>

                    <div className="absolute top-6 right-4">
                        <ResetTheme />
                    </div>

                    {/* Main Action Card */}
                    <div
                        className={`
                                    rounded-xl shadow-lg border p-8
                                    ${theme.cardBackground} ${theme.border}
                                `}
                    >
                        {/* Action Buttons */}
                        <div className="space-y-4 mb-6">
                            <button
                                onClick={() => setJoinModalOpen(true)}
                                className={`
                                            w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg
                                            text-lg font-medium transition-all duration-200
                                            ${theme.primary} ${theme.primaryText}
                                            focus:outline-none focus:ring-2 focus:ring-offset-2
                                            transform hover:scale-[1.02] active:scale-[0.98]
                                        `}
                            >
                                <Users className="w-6 h-6" />
                                Join Room
                            </button>

                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className={`
                                            w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg
                                            text-lg font-medium transition-all duration-200 border-2
                                            ${theme.secondary} ${theme.secondaryText} ${theme.border}
                                            hover:${theme.primary} hover:${theme.primaryText}
                                            focus:outline-none focus:ring-2 focus:ring-offset-2
                                            transform hover:scale-[1.02] active:scale-[0.98]
                                        `}
                            >
                                <Plus className="w-6 h-6" />
                                Create Room
                            </button>
                        </div>

                        {/* Divider */}
                        <div className={`border-t ${theme.border} my-6`}></div>

                        {/* Quick Tips */}
                        <div className={`p-4 rounded-lg ${theme.secondary}`}>
                            <h3 className={`text-sm font-semibold mb-2 ${theme.secondaryText}`}>Quick Tips:</h3>
                            <ul className={`text-xs space-y-1 ${theme.textMuted}`}>
                                <li>• Room IDs must be at least 4 characters long</li>
                                <li>• Share your room ID with friends to let them join</li>
                                <li>• Use memorable names for easy sharing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Join Room Modal */}
            <RoomModal
                isOpen={isJoinModalOpen}
                onClose={handleJoinModalClose}
                onSubmit={handleJoinRoom}
                title="Join Room"
                type="join"
                roomId={joinRoomId}
                setRoomId={setJoinRoomId}
            />

            {/* Create Room Modal */}
            <RoomModal
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onSubmit={handleCreateRoom}
                title="Create Room"
                type="create"
                roomId={createRoomId}
                setRoomId={setCreateRoomId}
                roomSettings={roomSettings}
                onSettingsChange={updateRoomSettings}
                settingsEnabled={settingsEnabled}
            />

            <div className="w-full absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-500" >
                <Warning />
            </div>
        </div>
    )
}

export default Lobby