export const chatHandlers = (io, socket, rooms) => {
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

        io.to(roomId).emit('chatMessage', chatMessage)
        console.log(`${user.username} in ${roomId}: ${message}`)
    })
}