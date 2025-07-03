import { useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
    withCredentials: true
})

export default function TestSocket() {
    useEffect(() => {
        socket.on('connect', () => {
            console.log(' Connected:', socket.id)
        })

        socket.on('disconnect', () => {
            console.log(' Disconnected')
        })

        socket.on('error', (err) => {
            console.error(' Socket error:', err)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return <div>Socket Test Running... check console!</div>
}
