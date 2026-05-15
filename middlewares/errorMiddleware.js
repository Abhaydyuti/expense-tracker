// middlewares/errorMiddleware.js
// Central error handling for the whole app.
// Two things live here:
//   1. asyncHandler — wraps async route handlers to catch errors automatically
//   2. errorHandler — the global Express error handler (last middleware in app.js)

// ── asyncHandler ───────────────────────────────────────────────
// Normally every async controller needs its own try/catch.
// asyncHandler wraps the function and forwards any error to next()
// automatically — so controllers stay clean.
//
// Usage in routes:
//   router.get('/', isLoggedIn, asyncHandler(expenseController.getExpenses));
//
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ── 404 Handler ────────────────────────────────────────────────
// Catches any request that didn't match a route
const notFoundHandler = (req, res, next) => {
  const err    = new Error(`Page not found: ${req.originalUrl}`);
  err.status   = 404;
  next(err); // pass to global error handler below
};

// ── Global Error Handler ───────────────────────────────────────
// Express recognises this as an error handler because it has 4 params
// It MUST be the last middleware registered in app.js
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status was set
  const statusCode = err.status || 500;

  // Always log the full error on the server for debugging
  console.error(`[${new Date().toISOString()}] ${statusCode} — ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack); // show stack trace in development only
  }

  // If the request expected JSON (API call), respond with JSON
  if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
    return res.status(statusCode).json({
      error:   err.message || 'An error occurred',
      status:  statusCode
    });
  }

  // Otherwise render the error page
  res.status(statusCode).render('error', {
    statusCode,
    message: statusCode === 404
      ? 'Page not found'
      : 'Something went wrong. Please try again.'
  });
};

module.exports = { asyncHandler, notFoundHandler, errorHandler };