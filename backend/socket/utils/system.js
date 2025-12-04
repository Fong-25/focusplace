export const createSystemMessage = (message) => ({
    id: Date.now(),
    username: "System",
    message,
    timestamp: Date.now(),
    isSystem: true
})

export const messageTemplates = {
    welcome: (roomId) => `Welcome to room ${roomId}!`,
    welcomeHost: (roomId) => `Welcome to room ${roomId}! You are the host.`,
    userJoined: (username) => `${username} joined the room`,
    userLeft: (username) => `${username} left the room`,
    userDisconnected: (username) => `${username} disconnected`,
    hostTransferred: (username) => `${username} is now the host`,
    phaseSwitched: (phase) => `Switched to ${phase} phase`,
    phaseSwitchedManual: (phase) => `Switched to ${phase} phase. Press Start to begin.`
}