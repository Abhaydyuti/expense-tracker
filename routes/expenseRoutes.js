// routes/expenseRoutes.js

const express              = require('express');
const router               = express.Router();
const expenseController    = require('../controllers/expenseController');
const { isLoggedIn }       = require('../middlewares/authMiddleware');
const { validateExpense }  = require('../middlewares/validationMiddleware');
const { verifyExpenseOwner } = require('../middlewares/securityMiddleware');
const { asyncHandler }     = require('../middlewares/errorMiddleware');

// List all expenses
router.get(
  '/',
  isLoggedIn,
  asyncHandler(expenseController.getExpenses)
);

// Add expense
router.get(
  '/add',
  isLoggedIn,
  asyncHandler(expenseController.getAddExpense)
);
router.post(
  '/add',
  isLoggedIn,
  validateExpense,
  asyncHandler(expenseController.postAddExpense)
);

// Edit expense
// verifyExpenseOwner runs BEFORE the controller
// — confirms the expense exists AND belongs to this user
router.get(
  '/edit/:id',
  isLoggedIn,
  asyncHandler(verifyExpenseOwner),
  asyncHandler(expenseController.getEditExpense)
);
router.post(
  '/edit/:id',
  isLoggedIn,
  asyncHandler(verifyExpenseOwner),
  validateExpense,
  asyncHandler(expenseController.postEditExpense)
);

// Delete expense
router.post(
  '/delete/:id',
  isLoggedIn,
  asyncHandler(verifyExpenseOwner),
  asyncHandler(expenseController.deleteExpense)
);

module.exports = router;