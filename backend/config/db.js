import pkg from 'pg'
const { Pool } = pkg

import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
    connectionString: process.env.DB_STRING,
    ssl: {
        rejectUnauthorized: false
    }
})

export default pool

export const connectDB = async () => {
    try {
        // No need to call pool.connect()
        console.log('Connected to the database')
    } catch (error) {
        console.error('Error connecting to the database', error)
        process.exit(1)
    }
}