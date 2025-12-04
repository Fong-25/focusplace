import { createSystemMessage, messageTemplates } from '../utils/system.js'
import { Room } from '../../models/room.model.js'

export const roomHandlers = (io, socket, rooms) => {
    // Create room
    socket.on('createRoom', ({ roomId, user, settings }) => {
        if (rooms.has(roomId)) {
            return socket.emit('error', { message: 'Room already exists.' })
        }

        const newRoom = new Room(roomId, user.id, settings)
        newRoom.addUser(socket.id, user)

        rooms.set(roomId, newRoom)
        socket.join(roomId)

        // Welcome message using helper
        socket.emit('chatMessage', createSystemMessage(messageTemplates.welcomeHost(roomId)))
        socket.emit('roomCreated', newRoom.toPublic())

        console.log(`Room ${roomId} created by ${user.username}`)
    })

    // Join room
    socket.on('joinRoom', ({ roomId, user }) => {
        const room = rooms.get(roomId)

        if (!room) {
            return socket.emit('error', { message: 'Room does not exist.' })
        }

        // Cancel deletion if scheduled
        if (room.deleteTimeout) {
            clearTimeout(room.deleteTimeout)
            room.deleteTimeout = null
            console.log(`Room ${roomId} deletion cancelled`)
        }

        room.addUser(socket.id, user)
        socket.join(roomId)

        // Welcome messages using helpers
        socket.emit('chatMessage', createSystemMessage(messageTemplates.welcome(roomId)))
        socket.to(roomId).emit('chatMessage', createSystemMessage(messageTemplates.userJoined(user.username)))

        socket.emit('roomJoined', {
            ...room.toPublic(),
            isHost: room.hostId === user.id
        })

        socket.to(roomId).emit('userJoined', { user })
        console.log(`${user.username} joined ${roomId}`)
    })

    // Leave room
    socket.on('leaveRoom', ({ roomId, userId }, callback) => {
        const room = rooms.get(roomId)

        if (room && room.users.has(socket.id)) {
            const user = room.users.get(socket.id)

            if (user.id === userId) {
                room.removeUser(socket.id)

                // Send leave notification using helper
                socket.to(roomId).emit('chatMessage', createSystemMessage(messageTemplates.userLeft(user.username)))
                socket.to(roomId).emit('userLeft', { userId })
                socket.leave(roomId)

                console.log(`${user.username} left ${roomId}`)

                if (room.isEmpty()) {
                    clearTimeout(room.deleteTimeout)
                    room.deleteTimeout = setTimeout(() => {
                        rooms.delete(roomId)
                        console.log(`Room ${roomId} deleted`)
                    }, 2 * 60 * 1000)
                } else if (room.hostId === userId) {
                    // Transfer host
                    const userIds = Array.from(room.users.values()).map(u => u.id)
                    const newHostId = userIds.find(id => id !== userId) || null

                    if (newHostId) {
                        const newHost = Array.from(room.users.values()).find(u => u.id === newHostId)
                        room.hostId = newHostId

                        // Use helper for host transfer message
                        io.to(roomId).emit('chatMessage', createSystemMessage(messageTemplates.hostTransferred(newHost.username)))
                        io.to(roomId).emit('hostTransferred', { newHostId, room: room.toPublic() })

                        console.log(`Host transferred to ${newHostId} in ${roomId}`)
                    }
                }

                if (callback) callback()
            }
        }
    })
}
