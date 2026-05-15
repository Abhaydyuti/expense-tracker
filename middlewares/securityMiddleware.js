// middlewares/securityMiddleware.js
// Guards that verify a resource belongs to the logged-in user
// before the controller is allowed to read, edit, or delete it.

const pool = require('../config/db');

// ── Verify expense ownership ───────────────────────────────────
// Attaches the expense to req.expense if it belongs to this user.
// If not found or belongs to another user → 404 error.
// Use this on any route that touches a specific expense by ID.
const verifyExpenseOwner = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id);
    const userId    = req.session.userId;

    // Validate that the ID is actually a number
    if (isNaN(expenseId)) {
      const err  = new Error('Invalid expense ID');
      err.status = 400;
      return next(err);
    }

    const result = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      // Don't reveal whether the expense exists at all
      const err  = new Error('Expense not found');
      err.status = 404;
      return next(err);
    }

    // Attach expense to request so controller doesn't need to fetch again
    req.expense = result.rows[0];
    next();

  } catch (err) {
    next(err);
  }
};

module.exports = { verifyExpenseOwner };