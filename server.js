// server.js
// Starts the server and handles process-level errors.

const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ── Graceful shutdown ──────────────────────────────────────────
// If the process is told to stop (e.g. Ctrl+C or Render stopping it),
// finish handling current requests before closing
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// ── Catch unhandled promise rejections ────────────────────────
// Prevents the server from crashing silently on missed await errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // In production you'd log this to a service like Sentry
});

// ── Catch uncaught synchronous exceptions ─────────────────────
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1); // always exit on uncaught exceptions
});