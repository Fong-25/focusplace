import dotenv from 'dotenv'
dotenv.config()

const PING_INTERVAL_MS = 10 * 60 * 1000
const SERVER_URL = process.env.SERVER_URL || 'https://letslearntogether.onrender.com'

let pingTimer = null

const ping = async () => {
    try {
        const res = await fetch(`${SERVER_URL}/health`)
        if (res.ok) {
            console.log("[ALIVE] ping ok")
        } else {
            console.warn(`[ALIVE] ping returned ${res.status}`)
        }
    } catch (error) {
        console.error(`[ALIVE] ping error: `, error.message)
    }
}

export const startKeepAlive = (rooms) => {
    if (!SERVER_URL) {
        console.warn("[ALIVE] ping warning: server not found")
        return
    }
    if (pingTimer) return

    pingTimer = setInterval(() => {
        const hasActiveRooms = rooms.size > 0
        if (hasActiveRooms) {
            ping()
        } else {
            console.log("[ALIVE] No active rooms found")
        }
    }, PING_INTERVAL_MS)
    console.log("[ALIVE] server started")
}

export const stopKeepAlive = () => {
    if (pingTimer) {
        clearInterval(pingTimer)
        pingTimer = null
        console.log("[ALIVE] service stopped")
    }
}