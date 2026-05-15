// controllers/authController.js
// Handles all authentication logic: signup, login, logout.
// It sits between the route and the model.

const bcrypt    = require('bcryptjs');
const userModel = require('../models/userModel');

// ─── Show Signup Page ────────────────────────────────────────
const getSignup = (req, res) => {
  res.render('auth/signup', { errors: [] });
};

// ─── Handle Signup Form Submission ──────────────────────────
const postSignup = async (req, res) => {
  // 1. Pull data from the submitted form
  const { name, email, password, confirmPassword } = req.body;

  // 2. Basic server-side validation
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  // 3. If there are errors, re-render the form with error messages
  if (errors.length > 0) {
    return res.render('auth/signup', { errors });
  }

  try {
    // 4. Check if email is already registered
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.render('auth/signup', {
        errors: ['An account with that email already exists']
      });
    }

    // 5. Hash the password before saving
    // bcrypt.hash(password, saltRounds) — 10 salt rounds is the standard
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Save the new user to the database
    await userModel.createUser(name.trim(), email.trim(), hashedPassword);

    // 7. Flash a success message and redirect to login
    req.flash('success_msg', 'Account created! Please log in.');
    res.redirect('/login');

  } catch (err) {
    console.error('Signup error:', err.message);
    res.render('auth/signup', {
      errors: ['Something went wrong. Please try again.']
    });
  }
};

// ─── Show Login Page ─────────────────────────────────────────
const getLogin = (req, res) => {
  res.render('auth/login', { errors: [] });
};

// ─── Handle Login Form Submission ────────────────────────────
const postLogin = async (req, res) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || email.trim() === '') errors.push('Email is required');
  if (!password)                      errors.push('Password is required');

  if (errors.length > 0) {
    return res.render('auth/login', { errors });
  }

  try {
    // 1. Look up the user by email
    const user = await userModel.findUserByEmail(email);

    // 2. If no user found, show a vague error (don't reveal what's wrong)
    if (!user) {
      return res.render('auth/login', {
        errors: ['Invalid email or password']
      });
    }

    // 3. Compare the submitted password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('auth/login', {
        errors: ['Invalid email or password']
      });
    }

    // 4. Password matches — create the session
    req.session.userId   = user.id;
    req.session.userName = user.name;

    // 5. Redirect to dashboard
    req.flash('success_msg', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err.message);
    res.render('auth/login', {
      errors: ['Something went wrong. Please try again.']
    });
  }
};

// ─── Logout ──────────────────────────────────────────────────
const logout = (req, res) => {
  // Destroy the session completely
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
    }
    res.redirect('/login');
  });
};

module.exports = { getSignup, postSignup, getLogin, postLogin, logout };