// middlewares/authMiddleware.js
// This middleware protects routes from unauthenticated access.
// We'll attach it to any route that requires login.

const isLoggedIn = (req, res, next) => {
  // Check if the session has a userId stored
  if (req.session && req.session.userId) {
    return next(); // user is logged in, continue to the route
  }
  // Not logged in — flash a message and redirect to login
  req.flash('error_msg', 'Please log in to access that page');
  res.redirect('/login');
};

module.exports = { isLoggedIn };