// controllers/expenseController.js
// Handles all expense-related request logic.

const expenseModel = require('../models/expenseModel');

// ─── Show Add Expense Form ────────────────────────────────────
const getAddExpense = async (req, res) => {
    const categories = await expenseModel.getAllCategories();
    res.render('expenses/add', {
      categories,
      errors: []
    });
};

// ─── Handle Add Expense Form Submission ──────────────────────
// validateExpense middleware already ran — inputs are clean
const postAddExpense = async (req, res) => {
  const { title, amount, category_id, expense_date, notes } = req.body;
  const userId = req.session.userId;

    await expenseModel.addExpense(
      userId,
      category_id,
      title,
      amount,
      expense_date,
      notes
    );

    req.flash('success_msg', 'Expense added successfully!');
    res.redirect('/expenses');
};

// ─── List All Expenses (with optional filters) ────────────────
const getExpenses = async (req, res) => {
    const userId = req.session.userId;

    // Query string values from the URL
    // e.g. /expenses?category_id=2&month=3&year=2025
    const filters = {
      category_id: req.query.category_id || '',
      month:       req.query.month       || '',
      year:        req.query.year        || '',
      date_from:   req.query.date_from   || '',
      date_to:     req.query.date_to     || '',
    };

    // Load expenses with filters applied
    const expenses   = await expenseModel.getExpensesByUser(userId, filters);

    // Load categories for the filter dropdown
    const categories = await expenseModel.getAllCategories();

    // Build list of years for the year dropdown (last 5 years)
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 4; y--) {
      years.push(y);
    }

    // Calculate filtered total
    const total = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount), 0
    );

    res.render('expenses/index', {
      expenses,
      categories,
      years,
      filters,  // pass filters back so the form retains selected values
      total
    });
};

// ─── Delete an Expense ────────────────────────────────────────
const deleteExpense = async (req, res) => {
  const expenseId = req.expense.id; // comes from verifyExpenseOwner
  const userId    = req.session.userId;

  await expenseModel.deleteExpense(expenseId, userId);

  req.flash('success_msg', 'Expense deleted.');
  res.redirect('/expenses');
};

// ─── Show Edit Expense Form ───────────────────────────────────
// req.expense is already verified and attached by verifyExpenseOwner
const getEditExpense = async (req, res) => {
  const categories = await expenseModel.getAllCategories();
  res.render('expenses/edit', {
    expense:    req.expense,
    categories,
    errors:     []
  });
};

// ─── Handle Edit Expense Form Submission ─────────────────────
const postEditExpense = async (req, res) => {
  const { title, amount, category_id, expense_date, notes } = req.body;
  const userId    = req.session.userId;
  const expenseId = req.expense.id; // comes from verifyExpenseOwner

  const updated = await expenseModel.updateExpense(
    expenseId,
    userId,
    category_id,
    title,
    amount,
    expense_date,
    notes
  );

  if (!updated) {
    req.flash('error_msg', 'Could not update expense.');
    return res.redirect('/expenses');
  }

  req.flash('success_msg', 'Expense updated successfully!');
  res.redirect('/expenses');
};

module.exports = {
  getAddExpense,
  postAddExpense,
  getExpenses,
  deleteExpense,
  getEditExpense,
  postEditExpense 
};