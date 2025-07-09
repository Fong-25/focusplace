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

            socket.emit('roomJoined', {
                ...room.toPublic(),
                isHost: room.hostId === user.id
            })

            socket.to(roomId).emit('userJoined', { user })
            console.log(`${user.username} joined ${roomId}`)
        })

        // Handle leaving a room
        socket.on('leaveRoom', ({ roomId, userId }, callback) => {
            const room = rooms.get(roomId);
            if (room && room.users.has(socket.id)) {
                const user = room.users.get(socket.id);
                if (user.id === userId) {
                    room.removeUser(socket.id);
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
                            room.hostId = newHostId;
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
                            room.setHost(newHostId); // Use the model method
                            io.to(roomId).emit('hostTransferred', { newHostId, room: room.toPublic() });
                            console.log(`Host transferred to ${newHostId} in ${roomId} after disconnect`);
                        }
                    }
                    break;
                }
            }
        });
    });
};