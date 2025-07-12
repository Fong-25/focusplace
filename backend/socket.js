// socket.js
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import { Room } from './models/room.model.js'

import dotenv from 'dotenv'
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET
// Global in-memory room store
const rooms = new Map()

export const setupSocket = (io) => {
    io.use((socket, next) => {
        try {
            const rawCookie = socket.handshake.headers.cookie
            const cookies = cookie.parse(rawCookie || "")
            const token = cookies.token

            if (!token) {
                console.log(" No token in handshake")
                return next(new Error("Unauthorized"))
            }

            const user = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = user
            next()
        } catch (err) {
            console.log(" Socket auth error:", err.message)
            return next(new Error("Unauthorized"))
        }
    })

    io.on('connection', (socket) => {
        console.log(` ${socket.id} connected`)

        // Handle room creation
        socket.on('createRoom', ({ roomId, user }) => {
            if (rooms.has(roomId)) {
                return socket.emit('error', { message: 'Room already exists.' })
            }

            const newRoom = new Room(roomId, user.id)
            newRoom.addUser(socket.id, user)

            rooms.set(roomId, newRoom)
            socket.join(roomId)

            // Send welcome message to room creator
            const welcomeMessage = {
                id: Date.now(),
                username: "System",
                message: `Welcome to room ${roomId}! You are the host.`,
                timestamp: Date.now(),
                isSystem: true
            }
            socket.emit('chatMessage', welcomeMessage)

            socket.emit('roomCreated', newRoom.toPublic())
            console.log(` Room ${roomId} created by ${user.username}`)
        })

        // Handle joining an existing room
        socket.on('joinRoom', ({ roomId, user }) => {
            const room = rooms.get(roomId)

            if (!room) {
                return socket.emit('error', { message: 'Room does not exist.' })
            }

            if (room.deleteTimeout) {
                clearTimeout(room.deleteTimeout)
                room.deleteTimeout = null
                console.log(`Room ${roomId} deletion cancelled - user rejoined`)
            }

            room.addUser(socket.id, user)
            socket.join(roomId)

            // Send system message to new user
            const welcomeMessage = {
                id: Date.now(),
                username: "System",
                message: `Welcome to room ${roomId}!`,
                timestamp: Date.now(),
                isSystem: true
            }
            socket.emit('chatMessage', welcomeMessage)

            // Send join notification to other users in room
            const joinMessage = {
                id: Date.now() + 1,
                username: "System",
                message: `${user.username} joined the room`,
                timestamp: Date.now(),
                isSystem: true
            }
            socket.to(roomId).emit('chatMessage', joinMessage)

            socket.emit('roomJoined', {
                ...room.toPublic(),
                isHost: room.hostId === user.id
            })

            socket.to(roomId).emit('userJoined', { user })
            console.log(`${user.username} joined ${roomId}`)
        })

        // Handle chat messages
        socket.on('sendMessage', ({ roomId, message }) => {
            const room = rooms.get(roomId)
            if (!room || !room.users.has(socket.id)) {
                return socket.emit('error', { message: 'You are not in this room.' })
            }

            const user = room.users.get(socket.id)
            const chatMessage = {
                id: Date.now(),
                username: user.username,
                message: message.trim(),
                timestamp: Date.now(),
                isSystem: false
            }

            // Send message to all users in the room
            io.to(roomId).emit('chatMessage', chatMessage)
            console.log(`${user.username} in ${roomId}: ${message}`)
        })

        socket.on('startTimer', ({ roomId }) => {
            const room = rooms.get(roomId)
            if (!room || !room.users.has(socket.id)) {
                return socket.emit('error', { message: 'You are not in this room.' })
            }
            if (room.settings.strictMode && room.hostId !== socket.user.id) {
                return socket.emit('error', { message: 'Only host can control timer.' })
            }

            room.startTimer()
            io.to(roomId).emit('timerUpdate', room.timer)
            // Optional: system message
            io.to(roomId).emit('timerStarted')
            console.log(`Timer started in ${roomId}`)
        })

        socket.on('pauseTimer', ({ roomId }) => {
            const room = rooms.get(roomId)
            if (!room || !room.users.has(socket.id)) {
                return socket.emit('error', { message: 'You are not in this room.' })
            }
            if (room.settings.strictMode && room.hostId !== socket.user.id) {
                return socket.emit('error', { message: 'Only host can control timer.' })
            }

            room.pauseTimer()
            io.to(roomId).emit('timerUpdate', room.timer)
            // Optional: system message
            io.to(roomId).emit('timerPause')
            console.log(`Timer paused in ${roomId}`)
        })

        socket.on('resetTimer', ({ roomId }) => {
            const room = rooms.get(roomId)
            if (!room || !room.users.has(socket.id)) {
                return socket.emit('error', { message: 'You are not in this room.' })
            }
            if (room.settings.strictMode && room.hostId !== socket.user.id) {
                return socket.emit('error', { message: 'Only host can control timer.' })
            }

            room.resetTimer()
            io.to(roomId).emit('timerUpdate', room.timer)
            // Optional: system message
            io.to(roomId).emit('timerReset')
            console.log(`Timer reset in ${roomId}`)
        })

        // Handle leaving a room
        socket.on('leaveRoom', ({ roomId, userId }, callback) => {
            const room = rooms.get(roomId);
            if (room && room.users.has(socket.id)) {
                const user = room.users.get(socket.id);
                if (user.id === userId) {
                    room.removeUser(socket.id);

                    // Send leave notification to other users
                    const leaveMessage = {
                        id: Date.now(),
                        username: "System",
                        message: `${user.username} left the room`,
                        timestamp: Date.now(),
                        isSystem: true
                    }
                    socket.to(roomId).emit('chatMessage', leaveMessage)

                    socket.to(roomId).emit('userLeft', { userId });
                    socket.leave(roomId);
                    console.log(`${user.username} left ${roomId}`);

                    if (room.isEmpty()) {
                        clearTimeout(room.deleteTimeout);
                        room.deleteTimeout = setTimeout(() => {
                            rooms.delete(roomId);
                            console.log(`Room ${roomId} deleted`);
                        }, 2 * 60 * 1000);
                    } else if (room.hostId === userId) {
                        // Host left, transfer to next user
                        const userIds = Array.from(room.users.values()).map(u => u.id);
                        const newHostId = userIds.find(id => id !== userId) || null;
                        if (newHostId) {
                            const newHost = Array.from(room.users.values()).find(u => u.id === newHostId);
                            room.hostId = newHostId;

                            // Send host transfer notification
                            const hostTransferMessage = {
                                id: Date.now() + 1,
                                username: "System",
                                message: `${newHost.username} is now the host`,
                                timestamp: Date.now(),
                                isSystem: true
                            }
                            io.to(roomId).emit('chatMessage', hostTransferMessage)

                            io.to(roomId).emit('hostTransferred', { newHostId, room: room.toPublic() });
                            console.log(`Host transferred to ${newHostId} in ${roomId}`);
                        }
                    }
                    if (callback) callback();
                }
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`);
            for (const [roomId, room] of rooms) {
                if (room.users.has(socket.id)) {
                    const user = room.users.get(socket.id);
                    room.removeUser(socket.id);

                    // Send disconnect notification to other users
                    const disconnectMessage = {
                        id: Date.now(),
                        username: "System",
                        message: `${user.username} disconnected`,
                        timestamp: Date.now(),
                        isSystem: true
                    }
                    socket.to(roomId).emit('chatMessage', disconnectMessage)

                    socket.to(roomId).emit('userLeft', { userId: user.id });

                    if (room.isEmpty()) {
                        // Delete after 2 min grace period
                        room.deleteTimeout = setTimeout(() => {
                            rooms.delete(roomId);
                            console.log(`Room ${roomId} deleted`);
                        }, 2 * 60 * 1000);
                    } else if (room.hostId === user.id) {
                        const userIds = Array.from(room.users.values()).map(u => u.id);
                        const newHostId = userIds.find(id => id !== user.id) || null;
                        if (newHostId) {
                            const newHost = Array.from(room.users.values()).find(u => u.id === newHostId);
                            room.setHost(newHostId); // Use the model method

                            // Send host transfer notification
                            const hostTransferMessage = {
                                id: Date.now() + 1,
                                username: "System",
                                message: `${newHost.username} is now the host`,
                                timestamp: Date.now(),
                                isSystem: true
                            }
                            io.to(roomId).emit('chatMessage', hostTransferMessage)

                            io.to(roomId).emit('hostTransferred', { newHostId, room: room.toPublic() });
                            console.log(`Host transferred to ${newHostId} in ${roomId} after disconnect`);
                        }
                    }
                    break;
                }
            }
        });
    });
    // Server-side timer update interval
    setInterval(() => {
        for (const [roomId, room] of rooms) {
            if (room.timer.isRunning) {
                room.updateTimer()
                io.to(roomId).emit('timerUpdate', room.timer)
                if (room.timer.timeLeft <= 0 && room.settings.autoPhaseChange) {
                    room.switchPhase()
                    io.to(roomId).emit('phaseSwitched')
                    io.to(roomId).emit('timerUpdate', room.timer)
                    io.to(roomId).emit('chatMessage', {
                        id: Date.now(),
                        username: "System",
                        message: `Switched to ${room.timer.phase} phase`,
                        timestamp: Date.now(),
                        isSystem: true
                    })
                }
            }
        }
    }, 1000)
}