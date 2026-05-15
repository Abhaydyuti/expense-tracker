// models/userModel.js
// All database queries related to users go here.
// Controllers will call these functions — keeping DB logic separate.

const pool = require('../config/db');

// Find a user by their email address
// Used during login to check if the user exists
const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0]; // returns one user object or undefined
};

// Create a new user in the database
// Password passed here should already be hashed
const createUser = async (name, email, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, hashedPassword]
  );
  return result.rows[0]; // returns the newly created user
};

module.exports = { findUserByEmail, createUser };