"use client"

import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../components/protectedRoute';
import { useThemeStore } from '../stores/themeStore';
import { useLobbyStore } from '../stores/lobbyStore';
import { SocketContext } from '../contexts/socketContext';
import { Users, Crown, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ThemeChooser from '../components/themeChooser';
import ResetTheme from '../components/resetTheme';

function Room() {
    const { roomId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const { getTheme } = useThemeStore();
    const theme = getTheme();
    const { socket, isConnected } = useContext(SocketContext);
    const { roomData, setRoomData, leaveRoom } = useLobbyStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false)

    useEffect(() => {
        if (!socket || !isConnected) {
            toast.error('Not connected to server');
            navigate('/lobby');
            return;
        }

        // Listen for room updates
        socket.on('roomJoined', (data) => {
            if (!isLeaving) {
                setRoomData(data);
                setIsLoading(false);
            }
        });

        socket.on('userJoined', ({ user: newUser }) => {
            if (!isLeaving) {
                setRoomData({
                    ...roomData,
                    users: [...roomData.users, newUser],
                });
                toast.success(`${newUser.username} joined the room`);
            }
        });

        socket.on('userLeft', ({ userId }) => {
            if (!isLeaving) {
                setRoomData({
                    ...roomData,
                    users: roomData.users.filter((u) => u.id !== userId),
                });
                toast(`${roomData.users.find((u) => u.id === userId)?.username} left the room`);
            }
        });

        socket.on('hostTransferred', ({ newHostId, room }) => {
            if (!isLeaving) {
                setRoomData(room);
                const newHostName = room.users.find(u => u.id === newHostId)?.username || 'new user';
                toast.success(`Host transferred to ${newHostName}`);
            }
        });

        socket.on('error', ({ message }) => {
            if (!isLeaving) {
                toast.error(message);
                leaveRoom(socket, roomId, user, () => navigate('/lobby'));
            }
        });

        // Request room data if not already loaded and not leaving
        if (!isLeaving && (!roomData || roomData.roomId !== roomId)) {
            socket.emit('joinRoom', { roomId, user });
        } else if (!isLeaving) {
            setIsLoading(false);
        }

        return () => {
            socket.off('roomJoined');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('hostTransferred');
            socket.off('error');
        };
    }, [socket, isConnected, roomId, user, roomData, setRoomData, navigate, leaveRoom, isLeaving]);

    const handleLeaveRoom = () => {
        setIsLeaving(true); // Set flag to prevent rejoin
        leaveRoom(socket, roomId, user, () => {
            setIsLeaving(false); // Reset flag after leave is complete
            navigate('/lobby');
            socket.disconnect() // Disconnect temporarily to prevent rejoin immediately, fix this later
            // socket.connect()
        }).catch((error) => {
            console.error('Leave room error:', error);
            setIsLeaving(false);
            toast.error('Failed to leave room');
            navigate('/lobby');
        });
    };

    const handleReconnect = () => {
        if (socket) {
            setIsConnecting(true)
            socket.connect();
            const timeoutId = setTimeout(() => {
                if (socket.connected) {
                    toast.success('Connected to server');
                    setIsConnecting(false)
                    // setIsConnected(true); // Ensure isConnected updates if not already
                } else {
                    toast.error('Error: Cannot connect');
                    setIsConnecting(false)
                }
            }, 2500); // Check after 2.5 second to allow connection to establish
            return () => clearTimeout(timeoutId); // Cleanup timeout
        }
    };
    if (isLoading || !roomData) {
        return (
            <div className={`min-h-screen p-6 ${theme.background}`}>
                <div className="text-center">
                    <p className={`text-lg ${theme.text}`}>Loading room...</p>
                </div>
            </div>
        );
    }
    return (
        <div className={`min-h-screen p-6 ${theme.background}`}>
            <Toaster position="top-right" />
            <div className="absolute top-6 left-6">
                <ThemeChooser />
            </div>
            <div className="absolute top-4 right-4">
                <ResetTheme />
            </div>
            <div className={`max-w-4xl mx-auto rounded-xl shadow-lg border p-8 ${theme.cardBackground} ${theme.border}`}>
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>Room {roomId}</h1>
                    <div className="flex items-center gap-2">
                        <Users className={`w-5 h-5 ${theme.textMuted}`} />
                        <span className={`text-lg ${theme.textMuted}`}>
                            {roomData.users.length} user{roomData.users.length !== 1 ? 's' : ''} online
                        </span>
                        <div className={`ml-2 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roomData.users.map((roomUser) => (
                        <div
                            key={roomUser.id}
                            className={`p-4 rounded-lg border transition-all duration-200 ${theme.secondary} ${theme.border} ${roomUser.id === user.id ? 'ring-2 ring-blue-400' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${roomUser.id === roomData.hostId ? 'bg-yellow-500' : theme.primary
                                        }`}
                                >
                                    {roomUser.id === roomData.hostId ? (
                                        <Crown className="w-5 h-5 text-white" />
                                    ) : (
                                        <User className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-medium ${theme.text}`}>{roomUser.username}</h3>
                                        {roomUser.id === user.id && (
                                            <span className={`text-xs px-2 py-1 rounded ${theme.primary} ${theme.primaryText}`}>You</span>
                                        )}
                                    </div>
                                    <p className={`text-sm ${theme.textMuted}`}>
                                        {roomUser.id === roomData.hostId ? 'Host' : 'Member'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`mt-8 p-4 rounded-lg ${theme.secondary}`}>
                    <h3 className={`text-sm font-medium mb-2 ${theme.secondaryText}`}>Room Settings</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className={`${theme.textMuted}`}>Focus Time:</span>
                            <span className={`ml-2 ${theme.text}`}>{roomData.settings?.focusTime || 25} min</span>
                        </div>
                        <div>
                            <span className={`${theme.textMuted}`}>Break Time:</span>
                            <span className={`ml-2 ${theme.text}`}>{roomData.settings?.breakTime || 5} min</span>
                        </div>
                        <div>
                            <span className={`${theme.textMuted}`}>Strict Mode:</span>
                            <span className={`ml-2 ${theme.text}`}>{roomData.settings?.strictMode ? 'On' : 'Off'}</span>
                        </div>
                        <div>
                            <span className={`${theme.textMuted}`}>Auto Switch:</span>
                            <span className={`ml-2 ${theme.text}`}>{roomData.settings?.autoPhaseChange ? 'On' : 'Off'}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleLeaveRoom}
                        className={`px-6 py-2 rounded-lg transition-all duration-200 ${theme.secondary} ${theme.secondaryText} hover:${theme.border}`}
                    >
                        Leave Room
                    </button>
                </div>
            </div>
            <div className="absolute bottom-4 left-4">
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected to server' : 'Disconnected to server'}
                </span>
                {!isConnected && (
                    <button
                        disabled={isConnecting}
                        onClick={handleReconnect}
                        className={`ml-2 text-sm ${theme.primaryText} ${theme.primary} px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isConnecting ? "Reconnecting" : "Reconnect"}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Room