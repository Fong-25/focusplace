import {
    createUser,
    getUserByEmail,
    getUserById,
    getUserByUsername,
    validateEmail
} from '../services/user.service.js'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const signup = async (req, res) => {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    try {
        const existingEmail = await getUserByEmail(email)
        const existingUsername = await getUserByUsername(username)
        if (existingEmail || existingUsername) {
            return res.status(400).json({
                message: 'Email or username already exists'
            })
        }
        if (!validateEmail(email)) {
            return res.status(400).json({
                message: 'Invalid email.'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await createUser({
            username,
            email,
            password: hashedPassword
        })
        return res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Sign up error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }
    try {
        const user = await getUserByUsername(username)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        })

        return res.status(200).json({ message: "Login successfully", username: user.username })
    } catch (error) {
        console.error('Log in error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const logout = async (req, res) => {
    try {
        if (!req.cookies.token) {
            return res.status(400).json({ message: "No user is logged in" })
        }
        res.clearCookie('token', {
            httpOnly: true,
        })
        return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        console.error('Log out error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const verifyToken = async (req, res) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "No token provided" })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        const user = await getUserById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }
        return res.status(200).json({
            message: 'Token valid',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })

    } catch (error) {
        console.error('verifyToken error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}