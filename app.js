// app.js
// Express app setup with security hardening.

const express    = require('express');
const session    = require('express-session');
const flash      = require('connect-flash');
const path       = require('path');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
require('dotenv').config();

const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// ─── Trust Proxy ──────────────────────────────────────────────
// Required when deployed on Render, Heroku, Railway, or any
// platform that sits behind a reverse proxy.
// Without this, express-rate-limit can't correctly identify
// client IPs from the X-Forwarded-For header.
app.set('trust proxy', 1);

// ─── Security Headers (helmet) ───────────────────────────────
// Sets a bunch of HTTP headers to protect against common attacks:
// XSS, clickjacking, MIME sniffing, etc.
// We configure contentSecurityPolicy to allow CDN resources
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   [
        "'self'",
        "cdn.jsdelivr.net",
        "'unsafe-inline'"   // needed for inline scripts in EJS
      ],
      styleSrc:    [
        "'self'",
        "cdn.jsdelivr.net",
        "'unsafe-inline'"   // needed for Bootstrap inline styles
      ],
      imgSrc:      ["'self'", "data:"],
      connectSrc:  ["'self'"],
      fontSrc:     ["'self'", "cdn.jsdelivr.net"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// ─── Rate Limiter for Auth Routes ────────────────────────────
// Allows max 10 login/signup attempts per 15 minutes per IP
// Prevents brute-force password attacks
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              20,              // max requests per window
  skipSuccessfulRequests: true, 
  message:          'Too many attempts. Please try again in 15 minutes.',
  standardHeaders:  true,
  legacyHeaders:    false,
});

// ─── View Engine ─────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));

// ─── Session Setup ────────────────────────────────────────────
app.use(session({
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    maxAge:   1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,   // JS in browser cannot access the cookie
    secure:   process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax'  // protects against CSRF
  }
}));

// ─── Flash Messages ───────────────────────────────────────────
app.use(flash());

// ─── Global Template Variables ────────────────────────────────
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg   = req.flash('error_msg');
  res.locals.currentUser = req.session.userId
    ? { id: req.session.userId, name: req.session.userName }
    : null;
  next();
});

// ─── Silence favicon 404 ──────────────────────────────────────
// Browsers automatically request /favicon.ico
// Return an empty 204 (No Content) so it doesn't hit the 404 handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ─── Routes ───────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const expenseRoutes   = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


// Rate limiter only on login and signup — not on normal app usage
app.use('/login',   authLimiter);
app.use('/signup',  authLimiter);

app.use('/', authRoutes);
app.use('/expenses',  expenseRoutes);
app.use('/dashboard', dashboardRoutes);


// ─── Home Route ───────────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('landing');
});

// ─── 404 + Global Error Handler ───────────────────────────────
// These MUST be last — after all routes
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;