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
import SoundToggle from "../components/soundToggle"
import { Howl, Howler } from 'howler'
import startSound from '../assets/sounds/start.wav'
import pauseSound from '../assets/sounds/timerpause.mp3'
import endPhase from '../assets/sounds/endphase.wav'

function Room() {
    const { roomId } = useParams()
    const { user } = useUser()
    const navigate = useNavigate()
    const { getTheme } = useThemeStore()
    const theme = getTheme()
    const { socket, isConnected } = useContext(SocketContext)
    const { roomData, setRoomData, leaveRoom } = useLobbyStore()
    const { isLeftPanelOpen, isRightPanelOpen, setLeftPanelOpen, setRightPanelOpen, addSocketMessage, clearMessages, soundEffectsEnabled } = useRoomStore()

    const [isLoading, setIsLoading] = useState(true)
    const [isLeaving, setIsLeaving] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    const isHost = roomData?.hostId === user?.id

    useEffect(() => {
        if (!socket || !isConnected) {
            toast.error("Not connected to server")
            navigate("/lobby")
            return
        }

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

        socket.on("chatMessage", (message) => {
            if (!isLeaving) {
                addSocketMessage(message)
            }
        })

        socket.on("timerUpdate", (timer) => {
            if (!isLeaving) {
                setRoomData({ ...roomData, timer })
            }
        })

        socket.on("timerStarted", () => {
            if (!isLeaving) {
                toast.success("Timer started")
                if (soundEffectsEnabled) {
                    let sound = new Howl({
                        src: [startSound]
                    })
                    sound.play()
                }
            }
        })

        socket.on("timerPause", () => {
            if (!isLeaving) {
                toast.success("Timer paused")
                if (soundEffectsEnabled) {
                    let sound = new Howl({
                        src: [pauseSound]
                    })
                    sound.play()
                }
            }
        })

        socket.on("timerReset", () => {
            if (!isLeaving) {
                toast.success("Timer reset")
            }
        })

        socket.on("phaseSwitched", ({ phase }) => {
            if (!isLeaving) {
                toast.success(`Switched to ${phase} phase`)
                if (soundEffectsEnabled) {
                    let sound = new Howl({
                        src: [endPhase]
                    })
                    sound.play()
                }
            }
        })

        socket.on("error", ({ message }) => {
            if (!isLeaving) {
                toast.error(message)
                leaveRoom(socket, roomId, user, () => navigate("/lobby"))
            }
        })

        if (!isLeaving && (!roomData || roomData.roomId !== roomId)) {
            clearMessages()
            socket.emit("joinRoom", { roomId, user })
        } else if (!isLeaving) {
            setIsLoading(false)
        }

        return () => {
            socket.off("roomJoined")
            socket.off("userJoined")
            socket.off("userLeft")
            socket.off("hostTransferred")
            socket.off("chatMessage")
            socket.off("timerUpdate")
            socket.off('timerStarted')
            socket.off('timerPause')
            socket.off('timerReset')
            socket.off('phaseSwitched')
            socket.off("error")
        }
    }, [socket, isConnected, roomId, user, roomData, setRoomData, navigate, leaveRoom, isLeaving, addSocketMessage, clearMessages])

    const handleLeaveRoom = () => {
        setIsLeaving(true)
        clearMessages()
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

            <div className="absolute top-5.5 right-15.5 z-30">
                <ThemeChooser />
            </div>

            <div className="absolute bottom-3 right-2 z-1 lg:fixed lg:bottom-0 lg:right-40 lg:z-30">
                <div className="lg:absolute lg:bottom-0 lg:right-42">
                    <SoundToggle />
                </div>

            </div>

            <div className="flex flex-col h-screen">
                <RoomHeader
                    roomId={roomId}
                    phaseName={roomData.timer.phase === 'focus' ? roomData.settings.focusPhaseName : roomData.settings.breakPhaseName}
                    userCount={roomData.users.length}
                    isConnected={isConnected}
                />

                <div className="flex flex-1 overflow-hidden">
                    <RoomLeftPanel
                        isOpen={isLeftPanelOpen}
                        onClose={() => setLeftPanelOpen(false)}
                        roomData={roomData}
                        currentUser={user}
                    />

                    <main className="flex-1 flex items-center justify-center p-4">
                        <RoomTimer isHost={isHost} socket={socket} roomId={roomId} />
                    </main>

                    <RoomChatPanel
                        isOpen={isRightPanelOpen}
                        onClose={() => setRightPanelOpen(false)}
                        currentUser={user}
                        socket={socket}
                        roomId={roomId}
                    />
                </div>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-4 z-1">
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