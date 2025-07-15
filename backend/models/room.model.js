// In-memory room model

import { DEFAULT_ROOM_SETTING } from "../config/constants.js";

export class Room {
    constructor(roomId, hostUserId, settings = {}) {
        this.id = roomId
        this.hostId = hostUserId

        // socket id => userId, username
        this.users = new Map()

        // Merge custom settings with defaults
        this.settings = { ...DEFAULT_ROOM_SETTING, ...settings }

        this.timer = {
            isRunning: false,
            phase: 'focus', // || "break"
            timeLeft: this.settings.focusTime * 60, // in seconds
            lastUpdatedAt: null
        }
        this.deleteTimeout = null
    }

    addUser(socketId, userInfo) {
        this.users.set(socketId, userInfo)
    }

    removeUser(socketId) {
        this.users.delete(socketId)
    }
    isEmpty() {
        return this.users.size === 0
    }

    getUserCount() {
        return this.users.size
    }

    setHost(newHostId) {
        this.hostId = newHostId
    }

    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.isRunning = true
            this.timer.lastUpdatedAt = Date.now()
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            this.timer.isRunning = false
            this.timer.timeLeft = Math.max(0, this.timer.timeLeft - Math.floor((Date.now() - this.timer.lastUpdatedAt) / 1000))
            this.timer.lastUpdatedAt = null
        }
    }

    resetTimer() {
        // const time = this.settings[this.timer.phase + "Time"] * 60
        const time = this.settings.focusTime * 60
        this.timer = {
            isRunning: false,
            phase: 'focus',
            timeLeft: time,
            lastUpdatedAt: null
        }
    }

    updateTimer() {
        if (this.timer.isRunning && this.timer.lastUpdatedAt) {
            const elapsed = Math.floor((Date.now() - this.timer.lastUpdatedAt) / 1000)
            this.timer.timeLeft = Math.max(0, this.timer.timeLeft - elapsed)
            this.timer.lastUpdatedAt = Date.now()
        }
    }

    switchPhase() {
        this.timer.phase = this.timer.phase === 'focus' ? 'break' : 'focus'
        this.timer.timeLeft = this.settings[`${this.timer.phase}Time`] * 60
        this.timer.lastUpdatedAt = this.timer.isRunning ? Date.now() : null
    }

    updateTimerState({ phase, timeLeft, isRunning, lastUpdatedAt }) {
        if (phase) this.timer.phase = phase
        if (typeof (timeLeft) === "number") this.timer.timeLeft = timeLeft
        if (typeof (isRunning) === "boolean") this.timer.isRunning = isRunning
        if (lastUpdatedAt) this.timer.lastUpdatedAt = lastUpdatedAt
    }
    toPublic() {
        return {
            roomId: this.id,
            hostId: this.hostId,
            timer: this.timer,
            settings: this.settings,
            users: Array.from(this.users.values())
        }
    }
}