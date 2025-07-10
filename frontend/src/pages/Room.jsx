"use client"

import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "../components/protectedRoute"
import { useThemeStore } from "../stores/themeStore"
import { useLobbyStore } from "../stores/lobbyStore"
import { useRoomStore } from "../stores/roomStore"
import { SocketContext } from "../contexts/socketContext"
import toast, { Toaster } from "react-hot-toast"
import ThemeChooser from "../components/themeChooser"
import RoomHeader from "../components/roomHeader"
import RoomTimer from "../components/roomTimer"
import RoomLeftPanel from "../components/roomLeftPanel"
import RoomChatPanel from "../components/roomChatPanel"

function Room() {
    const { roomId } = useParams()
    const { user } = useUser()
    const navigate = useNavigate()
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { socket, isConnected } = useContext(SocketContext)
    const { roomData, setRoomData, leaveRoom } = useLobbyStore()
    const { isLeftPanelOpen, isRightPanelOpen, setLeftPanelOpen, setRightPanelOpen } = useRoomStore()

    const [isLoading, setIsLoading] = useState(true)
    const [isLeaving, setIsLeaving] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    // Check if current user is host
    const isHost = roomData?.hostId === user?.id

    useEffect(() => {
        if (!socket || !isConnected) {
            toast.error("Not connected to server")
            navigate("/lobby")
            return
        }

        // Listen for room updates
        socket.on("roomJoined", (data) => {
            if (!isLeaving) {
                setRoomData(data)
                setIsLoading(false)
            }
        })

        socket.on("userJoined", ({ user: newUser }) => {
            if (!isLeaving) {
                setRoomData({
                    ...roomData,
                    users: [...roomData.users, newUser],
                })
                toast.success(`${newUser.username} joined the room`)
            }
        })

        socket.on("userLeft", ({ userId }) => {
            if (!isLeaving) {
                setRoomData({
                    ...roomData,
                    users: roomData.users.filter((u) => u.id !== userId),
                })
                toast(`${roomData.users.find((u) => u.id === userId)?.username} left the room`)
            }
        })

        socket.on("hostTransferred", ({ newHostId, room }) => {
            if (!isLeaving) {
                setRoomData(room)
                const newHostName = room.users.find((u) => u.id === newHostId)?.username || "new user"
                toast.success(`Host transferred to ${newHostName}`)
            }
        })

        socket.on("error", ({ message }) => {
            if (!isLeaving) {
                toast.error(message)
                leaveRoom(socket, roomId, user, () => navigate("/lobby"))
            }
        })

        // Request room data if not already loaded and not leaving
        if (!isLeaving && (!roomData || roomData.roomId !== roomId)) {
            socket.emit("joinRoom", { roomId, user })
        } else if (!isLeaving) {
            setIsLoading(false)
        }

        return () => {
            socket.off("roomJoined")
            socket.off("userJoined")
            socket.off("userLeft")
            socket.off("hostTransferred")
            socket.off("error")
        }
    }, [socket, isConnected, roomId, user, roomData, setRoomData, navigate, leaveRoom, isLeaving])

    const handleLeaveRoom = () => {
        setIsLeaving(true)
        leaveRoom(socket, roomId, user, () => {
            setIsLeaving(false)
            navigate("/lobby")
            socket.disconnect()
        }).catch((error) => {
            console.error("Leave room error:", error)
            setIsLeaving(false)
            toast.error("Failed to leave room")
            navigate("/lobby")
        })
    }

    const handleReconnect = () => {
        if (socket) {
            setIsConnecting(true)
            socket.connect()
            const timeoutId = setTimeout(() => {
                if (socket.connected) {
                    toast.success("Connected to server")
                    setIsConnecting(false)
                } else {
                    toast.error("Error: Cannot connect")
                    setIsConnecting(false)
                }
            }, 2500)
            return () => clearTimeout(timeoutId)
        }
    }

    // Close panels on mobile when clicking outside
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setLeftPanelOpen(true)
                setRightPanelOpen(true)
            } else {
                setLeftPanelOpen(false)
                setRightPanelOpen(false)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [setLeftPanelOpen, setRightPanelOpen])

    if (isLoading || !roomData) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
                <div className="text-center">
                    <p className={`text-lg ${theme.text}`}>Loading room...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${theme.background}`}>
            <Toaster position="top-right" />

            {/* Theme Chooser */}
            <div className="absolute top-5.5 right-15.5 z-30">
                <ThemeChooser />
            </div>

            {/* Main Layout */}
            <div className="flex flex-col h-screen">
                {/* Header */}
                <RoomHeader
                    roomId={roomId}
                    phaseName="Focus" // This should come from your socket data
                    userCount={roomData.users.length}
                    isConnected={isConnected}
                />

                {/* Main Content Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel */}
                    <RoomLeftPanel
                        isOpen={isLeftPanelOpen}
                        onClose={() => setLeftPanelOpen(false)}
                        roomData={roomData}
                        currentUser={user}
                    />

                    {/* Center Timer */}
                    <main className="flex-1 flex items-center justify-center p-4">
                        <RoomTimer isHost={isHost} />
                    </main>

                    {/* Right Panel */}
                    <RoomChatPanel isOpen={isRightPanelOpen} onClose={() => setRightPanelOpen(false)} currentUser={user} />
                </div>
            </div>

            {/* Connection Status & Leave Button */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4">
                <span className={`text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>
                    {isConnected ? "Connected to server" : "Disconnected to server"}
                </span>
                {!isConnected && (
                    <button
                        disabled={isConnecting}
                        onClick={handleReconnect}
                        className={`
                                    text-sm px-3 py-1 rounded transition-all duration-200
                                    ${theme.primary} ${theme.primaryText}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                    >
                        {isConnecting ? "Reconnecting" : "Reconnect"}
                    </button>
                )}

                <button
                    onClick={handleLeaveRoom}
                    className={`
                                text-sm px-3 py-1 rounded transition-all duration-200
                                ${theme.secondary} ${theme.secondaryText} hover:${theme.border}
                            `}
                >
                    Leave Room
                </button>
            </div>
            <div className="w-full absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-500" >
                <p>Always check for connection status. Use computer for the best experience.</p>
            </div>
        </div>
    )
}
export default Room