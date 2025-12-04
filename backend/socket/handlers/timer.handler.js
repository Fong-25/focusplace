export const timerHandlers = (io, socket, rooms) => {
    // Start timer
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
        io.to(roomId).emit('timerStarted')

        console.log(`Timer started in ${roomId}`)
    })

    // Pause timer
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
        io.to(roomId).emit('timerPause')

        console.log(`Timer paused in ${roomId}`)
    })

    // Reset timer
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
        io.to(roomId).emit('timerReset')

        console.log(`Timer reset in ${roomId}`)
    })
}