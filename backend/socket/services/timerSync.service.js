import { createSystemMessage, messageTemplates } from '../utils/system.js'

export const startTimerSync = (io, rooms) => {
    setInterval(() => {
        for (const [roomId, room] of rooms) {
            if (room.timer.isRunning) {
                room.updateTimer()
                io.to(roomId).emit('timerUpdate', room.timer)

                if (room.timer.timeLeft <= 0) {
                    if (room.settings.autoPhaseChange) {
                        room.switchPhase()
                        io.to(roomId).emit('phaseSwitched')
                        io.to(roomId).emit('timerUpdate', room.timer)
                        io.to(roomId).emit('chatMessage',
                            createSystemMessage(messageTemplates.phaseSwitched(room.timer.phase))
                        )
                    } else {
                        room.switchPhase()
                        room.timer.isRunning = false
                        room.timer.lastUpdatedAt = null
                        io.to(roomId).emit('phaseSwitched')
                        io.to(roomId).emit('timerUpdate', room.timer)
                        io.to(roomId).emit('chatMessage',
                            createSystemMessage(messageTemplates.phaseSwitchedManual(room.timer.phase))
                        )
                    }
                }
            }
        }
    }, 1000)
}