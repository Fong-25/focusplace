import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'
import roomRoutes from './routes/room.route.js'
import { connectDB } from './config/db.js'
import http from 'http'
import { Server } from 'socket.io'
import { setupSocket } from './socket.js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const app = express()
const __dirname = path.resolve()

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
})

app.use(cors({
    origin: ['http://localhost:5173', 'https://letslearntogether.onrender.com'],
    credentials: true
}))

setupSocket(io)
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

app.get('/', (req, res) => {
    res.send("Welcome")
})

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})