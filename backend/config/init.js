import pool from './db.js';

const init = async () => {
  try {
    // Enable uuid extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(500) UNIQUE NOT NULL,
        email VARCHAR(500) UNIQUE NOT NULL,
        password VARCHAR(500) UNIQUE NOT NULL,
        createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ users table created or already exists.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing DB:', err);
    process.exit(1);
  }
};

init();
