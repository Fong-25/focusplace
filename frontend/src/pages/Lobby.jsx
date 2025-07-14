
"use client"

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/protectedRoute';
import toast, { Toaster } from 'react-hot-toast';
import { useThemeStore } from '../stores/themeStore';
import { useLobbyStore } from '../stores/lobbyStore';
import { SocketContext } from '../contexts/socketContext';
import ThemeChooser from '../components/themeChooser';
import RoomModal from '../components/roomModal';
import ResetTheme from '../components/resetTheme';
import Warning from '../components/warning';
import { Users, Plus } from 'lucide-react';

function Lobby() {
    const { getTheme } = useThemeStore();
    const theme = getTheme();
    const navigate = useNavigate();
    const { user } = useUser();
    const { socket, isConnected } = useContext(SocketContext);
    const [isConnecting, setIsConnecting] = useState(false)
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
        joinRoom,
        createRoom,
        setRoomData,
    } = useLobbyStore();

    useEffect(() => {
        if (!socket) return;

        socket.on('roomCreated', (roomData) => {
            setRoomData(roomData);
            toast.success(`Created room: ${roomData.roomId}`);
            navigate(`/room/${roomData.roomId}`);
        });

        socket.on('roomJoined', (roomData) => {
            setRoomData(roomData);
            toast.success(`Joined room: ${roomData.roomId}`);
            navigate(`/room/${roomData.roomId}`);
        });

        socket.on('error', ({ message }) => {
            toast.error(message);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('roomJoined');
            socket.off('error');
        };
    }, [socket, setRoomData, navigate]);

    const handleJoinRoom = (roomId) => {
        if (!isConnected) {
            toast.error('Not connected to server');
            return;
        }
        joinRoom(socket, roomId, user);
        resetJoinForm()
    };

    const handleCreateRoom = (roomId) => {
        if (!isConnected) {
            toast.error('Not connected to server');
            return;
        }
        createRoom(socket, roomId, user, roomSettings);
        resetCreateForm()
        resetJoinForm()
    };

    const handleJoinModalClose = () => {
        resetJoinForm();
    };

    const handleCreateModalClose = () => {
        resetCreateForm();
    };

    // const handleReconnect = () => {
    //     if (socket) {
    //         socket.connect();
    //     }
    // };

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

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            if (socket) {
                socket.disconnect();
            }
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <div className={`min-h-screen transition-all duration-300 ${theme.background}`}>
            <Toaster position="top-right" />
            <div className="absolute top-6 left-6">
                <ThemeChooser />
            </div>
            <div className="absolute top-4 right-4">
                <ResetTheme />
            </div>
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md sm:mt-0 mt-12">
                    <div className="text-center mb-8">
                        <h1 className={`text-4xl font-bold mb-4 ${theme.text}`}>
                            Welcome to the Lobby, {user?.username}!
                        </h1>
                        <p className={`text-lg ${theme.textMuted}`}>
                            Join an existing room or create your own to get started
                        </p>
                    </div>
                    <div className={`rounded-xl shadow-lg border p-8 ${theme.cardBackground} ${theme.border} -translate-y-2`}>
                        <div className="space-y-4 mb-6">
                            <button
                                onClick={() => setJoinModalOpen(true)}
                                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200 ${theme.primary} ${theme.primaryText} focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                <Users className="w-6 h-6" />
                                Join Room
                            </button>
                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg text-lg font-medium transition-all duration-200 border-2 ${theme.secondary} ${theme.secondaryText} ${theme.border} hover:${theme.primary} hover:${theme.primaryText} focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]`}
                            >
                                <Plus className="w-6 h-6" />
                                Create Room
                            </button>
                        </div>
                        <div className={`border-t ${theme.border} my-6`}></div>
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
            <RoomModal
                isOpen={isJoinModalOpen}
                onClose={handleJoinModalClose}
                onSubmit={handleJoinRoom}
                title="Join Room"
                type="join"
                roomId={joinRoomId}
                setRoomId={setJoinRoomId}
            />
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
            <div className="w-full absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-500">
                <Warning />
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
    );
}

export default Lobby;