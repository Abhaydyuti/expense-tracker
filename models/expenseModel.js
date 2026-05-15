// models/expenseModel.js
// All database queries related to expenses go here.

const pool = require('../config/db');

// ─── Get all categories (for the dropdown in add/edit forms) ──
const getAllCategories = async () => {
  const result = await pool.query(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  return result.rows;
};

// ─── Add a new expense ────────────────────────────────────────
const addExpense = async (userId, categoryId, title, amount, date, notes) => {
  const result = await pool.query(
    `INSERT INTO expenses 
      (user_id, category_id, title, amount, expense_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, categoryId, title, amount, date, notes]
  );
  return result.rows[0];
};

// ─── Get expenses for a user with optional filters ────────────
// We build the WHERE clause dynamically based on what filters
// the user has applied. This is called a "dynamic query" pattern.
const getExpensesByUser = async (userId, filters = {}) => {

  // We always filter by user_id — that's mandatory
  const conditions = ['e.user_id = $1'];
  const values     = [userId];
  let   paramIndex = 2; // next placeholder number ($2, $3, ...)

  // ── Category filter ────────────────────────────────────────
  if (filters.category_id && filters.category_id !== '') {
    conditions.push(`e.category_id = $${paramIndex}`);
    values.push(parseInt(filters.category_id));
    paramIndex++;
  }

  // ── Month + Year filter ────────────────────────────────────
  // EXTRACT pulls the month or year out of a DATE column
  if (filters.month && filters.month !== '') {
    conditions.push(`EXTRACT(MONTH FROM e.expense_date) = $${paramIndex}`);
    values.push(parseInt(filters.month));
    paramIndex++;
  }
  if (filters.year && filters.year !== '') {
    conditions.push(`EXTRACT(YEAR FROM e.expense_date) = $${paramIndex}`);
    values.push(parseInt(filters.year));
    paramIndex++;
  }

  // ── Date range filter ──────────────────────────────────────
  if (filters.date_from && filters.date_from !== '') {
    conditions.push(`e.expense_date >= $${paramIndex}`);
    values.push(filters.date_from);
    paramIndex++;
  }
  if (filters.date_to && filters.date_to !== '') {
    conditions.push(`e.expense_date <= $${paramIndex}`);
    values.push(filters.date_to);
    paramIndex++;
  }

  // Join all conditions with AND
  const whereClause = conditions.join(' AND ');

  const result = await pool.query(
    `SELECT
       e.id,
       e.title,
       e.amount,
       e.expense_date,
       e.notes,
       e.created_at,
       c.name AS category_name,
       e.category_id
     FROM expenses e
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE ${whereClause}
     ORDER BY e.expense_date DESC`,
    values
  );

  return result.rows;
};

// ─── Get a single expense by ID ───────────────────────────────
// Used when loading the edit form
// We also check user_id so users can't access each other's expenses
const getExpenseById = async (expenseId, userId) => {
  const result = await pool.query(
    `SELECT * FROM expenses 
     WHERE id = $1 AND user_id = $2`,
    [expenseId, userId]
  );
  return result.rows[0];
};

// ─── Delete an expense ────────────────────────────────────────
// Again, user_id check is critical for security
const deleteExpense = async (expenseId, userId) => {
  await pool.query(
    `DELETE FROM expenses 
     WHERE id = $1 AND user_id = $2`,
    [expenseId, userId]
  );
};

// ─── Update an existing expense ───────────────────────────────
// user_id check ensures users can only edit their OWN expenses
const updateExpense = async (expenseId, userId, categoryId, title, amount, date, notes) => {
  const result = await pool.query(
    `UPDATE expenses
     SET category_id  = $1,
         title        = $2,
         amount       = $3,
         expense_date = $4,
         notes        = $5
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
    [categoryId, title, amount, date, notes, expenseId, userId]
  );
  return result.rows[0]; // returns the updated row
};

// ─── Get total amount spent by a user (all time) ──────────────
const getAllTimeTotal = async (userId) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE user_id = $1`,
    [userId]
  );
  return parseFloat(result.rows[0].total);
};

// ─── Get total spent in the current month ─────────────────────
const getCurrentMonthTotal = async (userId) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE user_id = $1
       AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR  FROM expense_date) = EXTRACT(YEAR  FROM CURRENT_DATE)`,
    [userId]
  );
  return parseFloat(result.rows[0].total);
};

// ─── Get total per category for current user ──────────────────
// Used for the category breakdown card and doughnut chart
const getTotalByCategory = async (userId) => {
  const result = await pool.query(
    `SELECT
       c.name              AS category_name,
       COALESCE(SUM(e.amount), 0) AS total
     FROM categories c
     LEFT JOIN expenses e
       ON e.category_id = c.id AND e.user_id = $1
     GROUP BY c.name
     ORDER BY total DESC`,
    [userId]
  );
  return result.rows;
};

// ─── Get the most used category this month ────────────────────
const getTopCategoryThisMonth = async (userId) => {
  const result = await pool.query(
    `SELECT
       c.name AS category_name,
       SUM(e.amount) AS total
     FROM expenses e
     JOIN categories c ON e.category_id = c.id
     WHERE e.user_id = $1
       AND EXTRACT(MONTH FROM e.expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR  FROM e.expense_date) = EXTRACT(YEAR  FROM CURRENT_DATE)
     GROUP BY c.name
     ORDER BY total DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0] || null; // null if no expenses this month
};

// ─── Get total expense count for a user ───────────────────────
const getExpenseCount = async (userId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS count
     FROM expenses
     WHERE user_id = $1`,
    [userId]
  );
  return parseInt(result.rows[0].count);
};

// ─── Get 5 most recent expenses ───────────────────────────────
const getRecentExpenses = async (userId) => {
  const result = await pool.query(
    `SELECT
       e.id,
       e.title,
       e.amount,
       e.expense_date,
       c.name AS category_name
     FROM expenses e
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE e.user_id = $1
     ORDER BY e.expense_date DESC, e.created_at DESC
     LIMIT 5`,
    [userId]
  );
  return result.rows;
};

// ─── Get monthly totals for the last 6 months ─────────────────
// Used for the bar chart and monthly summary table
const getMonthlyTotals = async (userId) => {
  const result = await pool.query(
    `SELECT
       TO_CHAR(expense_date, 'Mon YYYY') AS month_label,
       TO_CHAR(expense_date, 'YYYY-MM')  AS month_key,
       SUM(amount)                        AS total
     FROM expenses
     WHERE user_id = $1
       AND expense_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
     GROUP BY month_label, month_key
     ORDER BY month_key ASC`,
    [userId]
  );
  return result.rows;
};

// ─── Get daily spending for the current month ─────────────────
// Used for the line chart — shows spending pattern day by day
const getDailyTotalsThisMonth = async (userId) => {
  const result = await pool.query(
    `SELECT
       EXTRACT(DAY FROM expense_date)::INTEGER AS day,
       SUM(amount)                              AS total
     FROM expenses
     WHERE user_id = $1
       AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR  FROM expense_date) = EXTRACT(YEAR  FROM CURRENT_DATE)
     GROUP BY day
     ORDER BY day ASC`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  getAllCategories,
  addExpense,
  getExpensesByUser,
  getExpenseById,
  deleteExpense,
  updateExpense,
  getAllTimeTotal,
  getCurrentMonthTotal,
  getTotalByCategory,
  getTopCategoryThisMonth,
  getExpenseCount,
  getRecentExpenses,
  getMonthlyTotals,
  getDailyTotalsThisMonth   // ← add this
};