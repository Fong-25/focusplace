import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { createSystemMessage, messageTemplates } from './utils/system.js'
import { roomHandlers } from './handlers/room.handler.js'
import { chatHandlers } from './handlers/chat.handler.js'
import { timerHandlers } from './handlers/timer.handler.js'
import { voiceHandlers } from './handlers/voice.handler.js'
import { startTimerSync } from './services/timerSync.service.js'

import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

// Global in-memory room store
export const rooms = new Map()

export const setupSocket = (io) => {
    io.use((socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie
            const cookies = cookie.parse(rawCookie || "")
            const token = cookies.token

            if (!token) {
                console.log("No token in handshake")
                return next(new Error("Unauthorized"))
            }

            const user = jwt.verify(token, JWT_SECRET)
            socket.user = user
            next()
        } catch (error) {
            console.log("Socket auth error:", error.message)
            return next(new Error("Unauthorized"))
        }
    })
    io.on('connection', (socket) => {
        console.log(`${socket.id} connected`)

        // Register all event handlers
        roomHandlers(io, socket, rooms)
        chatHandlers(io, socket, rooms)
        timerHandlers(io, socket, rooms)
        voiceHandlers(io, socket, rooms)

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`)
            handleDisconnect(io, socket, rooms)
        })
    })

    // Start server-side timer synchronization
    startTimerSync(io, rooms)
}

function handleDisconnect(io, socket, rooms) {
    for (const [roomId, room] of rooms) {
        if (room.users.has(socket.id)) {
            const user = room.users.get(socket.id)
            room.removeUser(socket.id)

            // Send disconnect notification using helper
            socket.to(roomId).emit('chatMessage',
                createSystemMessage(messageTemplates.userDisconnected(user.username))
            )
            socket.to(roomId).emit('userLeft', { userId: user.id })
            if (room.isEmpty()) {
                // Delete after 2 min grace period
                room.deleteTimeout = setTimeout(() => {
                    rooms.delete(roomId)
                    console.log(`Room ${roomId} deleted`)
                }, 2 * 60 * 1000)
            } else if (room.hostId === user.id) {
                // Transfer host
                const userIds = Array.from(room.users.values()).map(u => u.id)
                const newHostId = userIds.find(id => id !== user.id) || null

                if (newHostId) {
                    const newHost = Array.from(room.users.values()).find(u => u.id === newHostId)
                    room.setHost(newHostId)

                    io.to(roomId).emit('chatMessage',
                        createSystemMessage(messageTemplates.hostTransferred(newHost.username))
                    )
                    io.to(roomId).emit('hostTransferred', { newHostId, room: room.toPublic() })
                    console.log(`Host transferred to ${newHostId} in ${roomId}`)
                }
            }
            break
        }
    }
}