// config/db.js
// Handles both local development (individual env vars)
// and production on Render (DATABASE_URL connection string).

const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
  // Production — Render provides a full connection string
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // required for Render PostgreSQL
    }
  };
} else {
  // Local development — use individual variables from .env
  poolConfig = {
    user:     process.env.PG_USER,
    host:     process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port:     process.env.PG_PORT,
  };
}

const pool = new Pool({
  ...poolConfig,
  max:                    10,
  idleTimeoutMillis:      30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected DB pool error:', err.message);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;