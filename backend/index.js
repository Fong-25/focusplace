import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.route.js'
import { connectDB } from './config/db.js'
import http from 'http'
import { Server } from 'socket.io'
import { setupSocket } from './socket.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()


const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
})

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

setupSocket(io)
app.use(cookieParser())
app.use(express.json())



app.get('/', (req, res) => {
    res.send("Welcome")
})

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
})