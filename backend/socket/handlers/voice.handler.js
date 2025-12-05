export const voiceHandlers = (io, socket, rooms) => {
    socket.on('voiceSignal', ({ roomId, targetUserId, signal }) => {
        const room = rooms.get(roomId)

        if (!room || !room.users.has(socket.id)) {
            return socket.emit('error', { message: 'You are not in this room.' })
        }

        // Find the target user's socket ID
        let targetSocketId = null
        for (const [sid, user] of room.users.entries()) {
            if (user.id === targetUserId) {
                targetSocketId = sid
                break
            }
        }

        if (targetSocketId) {
            const fromUser = room.users.get(socket.id)
            io.to(targetSocketId).emit('voiceSignal', {
                fromUserId: fromUser.id,
                signal
            })
        }
    })
    // Handle voice activity detection
    socket.on('voiceActivity', ({ roomId, userId, isSpeaking }) => {
        const room = rooms.get(roomId)

        if (!room || !room.users.has(socket.id)) {
            return
        }

        // Broadcast to all users in the room
        socket.to(roomId).emit('voiceActivity', { userId, isSpeaking })
    })

    // Handle mute status updates
    socket.on('voiceMuteStatus', ({ roomId, userId, isMuted }) => {
        const room = rooms.get(roomId)

        if (!room || !room.users.has(socket.id)) {
            return
        }

        // Broadcast to all users in the room
        socket.to(roomId).emit('voiceMuteStatus', { userId, isMuted })

        console.log(`User ${userId} ${isMuted ? 'muted' : 'unmuted'} in room ${roomId}`)
    })

    // Notify when user joins voice chat
    socket.on('joinVoiceChat', ({ roomId, userId }) => {
        const room = rooms.get(roomId)

        if (!room || !room.users.has(socket.id)) {
            return
        }

        socket.to(roomId).emit('userJoinedVoice', { userId })
        console.log(`User ${userId} joined voice chat in room ${roomId}`)
    })

    // Notify when user leaves voice chat
    socket.on('leaveVoiceChat', ({ roomId, userId }) => {
        const room = rooms.get(roomId)

        if (!room) {
            return
        }

        socket.to(roomId).emit('userLeftVoice', { userId })
        console.log(`User ${userId} left voice chat in room ${roomId}`)
    })
}