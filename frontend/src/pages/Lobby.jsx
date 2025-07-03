import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useState } from 'react'
import { useUser } from '../components/protectedRoute'

export default function Lobby() {
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

    return (
        <>
            <div>Socket Test Running... check console!</div>
            <div>Welcome back, {user?.username}~</div>
        </>
    )
}
