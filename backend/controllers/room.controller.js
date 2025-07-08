import { DEFAULT_ROOM_SETTING } from "../config/constants.js"

export const getDefaultRoomSettings = (req, res) => {
    return res.status(200).json(DEFAULT_ROOM_SETTING)
}