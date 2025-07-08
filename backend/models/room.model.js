// In-memory room model

import { DEFAULT_ROOM_SETTING } from "../config/constants.js";

export class Room {
    constructor(roomId, hostUserId) {
        this.id = roomId
        this.hostId = hostUserId

        // socket id => userId, username
        this.users = new Map()

        this.timer = {
            isRunning: false,
            phase: 'focus', // || "break"
            timeLeft: DEFAULT_ROOM_SETTING.focusTime * 60, // in seconds
            lastUpdatedAt: null
        }
        this.setting = { ...DEFAULT_ROOM_SETTING }
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

    resetTimer() {
        const time = this.setting[this.timer.phase + "Time"] * 60
        this.timer = {
            isRunning: false,
            phase: 'focus',
            timeLeft: time,
            lastUpdatedAt: null
        }
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