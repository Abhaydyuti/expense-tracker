// middlewares/validationMiddleware.js
// Validates expense form data before it reaches the controller.
// If validation fails, we re-render the form with errors.
// If validation passes, we call next() to continue to the controller.
const {
  sanitizeString,
  sanitizeAmount,
  sanitizeInt,
  sanitizeDate
} = require('./sanitize');

const expenseModel = require('../models/expenseModel');

const validateExpense = async (req, res, next) => {
  const { title, amount, category_id, expense_date } = req.body;

  const errors = [];

  // ── Title ──────────────────────────────────────────────────
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  } else if (title.trim().length > 200) {
    errors.push('Title must be under 200 characters');
  }

  // ── Amount ─────────────────────────────────────────────────
  if (!amount || amount === '') {
    errors.push('Amount is required');
  } else if (isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push('Amount must be a positive number');
  } else if (parseFloat(amount) > 9999999.99) {
    errors.push('Amount is too large');
  }

  // ── Category ───────────────────────────────────────────────
  if (!category_id || category_id === '') {
    errors.push('Please select a category');
  }

  // ── Date ───────────────────────────────────────────────────
  if (!expense_date || expense_date === '') {
    errors.push('Date is required');
  } else {
    const selected = new Date(expense_date);
    const today    = new Date();
    // Allow dates up to 10 years in the past — reasonable for expense tracking
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(today.getFullYear() - 10);

    if (isNaN(selected.getTime())) {
      errors.push('Please enter a valid date');
    } else if (selected > today) {
      errors.push('Date cannot be in the future');
    } else if (selected < tenYearsAgo) {
      errors.push('Date is too far in the past');
    }
  }

  // ── If errors exist, re-render the correct form ────────────
  if (errors.length > 0) {
    const categories = await expenseModel.getAllCategories();

    // Decide which view to render based on the route
    // req.path will be '/add' or '/edit/:id'
    const isEdit = req.path.includes('edit') || req.params.id;

    if (isEdit) {
      // For edit, we need to pass back the expense data to refill the form
      return res.render('expenses/edit', {
        categories,
        errors,
        // Pass form values back so user doesn't lose their input
        expense: {
          id:           req.params.id,
          title:        title,
          amount:       amount,
          category_id:  category_id,
          expense_date: expense_date,
          notes:        req.body.notes
        }
      });
    } else {
      return res.render('expenses/add', {
        categories,
        errors,
        // Pass form values back so user doesn't lose their input
        formData: {
          title:        title,
          amount:       amount,
          category_id:  category_id,
          expense_date: expense_date,
          notes:        req.body.notes
        }
      });
    }
  }

  // ── No errors — sanitize and continue ──────────────────────
  // Clean up values before they reach the controller
  // Sanitize and attach clean values to req.body
req.body.title        = sanitizeString(title, 200);
req.body.amount       = sanitizeAmount(amount);
req.body.category_id  = sanitizeInt(category_id);
req.body.expense_date = sanitizeDate(expense_date);
req.body.notes        = sanitizeString(req.body.notes, 500);

next();
};

module.exports = { validateExpense };