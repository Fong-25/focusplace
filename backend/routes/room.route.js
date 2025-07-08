import express from 'express'
import { getDefaultRoomSettings } from '../controllers/room.controller.js'

const router = express.Router()

router.get('/default-settings', getDefaultRoomSettings)

export default router