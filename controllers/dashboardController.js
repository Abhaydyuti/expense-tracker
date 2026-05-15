// controllers/dashboardController.js
// Fetches all summary data and passes it to the dashboard view.

const expenseModel = require('../models/expenseModel');

const getDashboard = async (req, res) => {
  try {
    const userId = req.session.userId;

    const [
      allTimeTotal,
      currentMonthTotal,
      categoryTotals,
      topCategory,
      expenseCount,
      recentExpenses,
      monthlyTotals,
      dailyTotals          // ← add this
    ] = await Promise.all([
      expenseModel.getAllTimeTotal(userId),
      expenseModel.getCurrentMonthTotal(userId),
      expenseModel.getTotalByCategory(userId),
      expenseModel.getTopCategoryThisMonth(userId),
      expenseModel.getExpenseCount(userId),
      expenseModel.getRecentExpenses(userId),
      expenseModel.getMonthlyTotals(userId),
      expenseModel.getDailyTotalsThisMonth(userId)  // ← add this
    ]);

    // Build daily chart data (fill gaps with 0)
    const today      = new Date();
    const currentDay = today.getDate();
    const dailyMap   = {};
    dailyTotals.forEach(r => { dailyMap[r.day] = parseFloat(r.total); });

    const dailyLabels = [];
    const dailyValues = [];
    for (let d = 1; d <= currentDay; d++) {
      dailyLabels.push(`${d}`);
      dailyValues.push(dailyMap[d] || 0);
    }

    const chartData = {
      monthly: {
        labels: monthlyTotals.map(r => r.month_label),
        values: monthlyTotals.map(r => parseFloat(r.total))
      },
      categories: {
        labels: categoryTotals
                  .filter(r => parseFloat(r.total) > 0)
                  .map(r => r.category_name),
        values: categoryTotals
                  .filter(r => parseFloat(r.total) > 0)
                  .map(r => parseFloat(r.total))
      },
      daily: {
        labels: dailyLabels,
        values: dailyValues
      }
    };

    res.render('dashboard/index', {
      allTimeTotal,
      currentMonthTotal,
      categoryTotals,
      topCategory,
      expenseCount,
      recentExpenses,
      monthlyTotals,
      chartData: JSON.stringify(chartData)
    });

  } catch (err) {
    console.error('Dashboard error:', err.message);
    req.flash('error_msg', 'Could not load dashboard.');
    res.redirect('/expenses');
  }
};

// ─── Reports Page ─────────────────────────────────────────────
// Shows all charts in a dedicated full-width page
const getReports = async (req, res) => {
  try {
    const userId = req.session.userId;

    const [
      categoryTotals,
      monthlyTotals,
      dailyTotals,
      allTimeTotal,
      currentMonthTotal
    ] = await Promise.all([
      expenseModel.getTotalByCategory(userId),
      expenseModel.getMonthlyTotals(userId),
      expenseModel.getDailyTotalsThisMonth(userId),
      expenseModel.getAllTimeTotal(userId),
      expenseModel.getCurrentMonthTotal(userId)
    ]);

    // Build full day-by-day data for current month
    // Fill in 0 for days with no spending so the line chart is continuous
    const today        = new Date();
    const daysInMonth  = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    // Create a lookup map: { day: total }
    const dailyMap = {};
    dailyTotals.forEach(r => {
      dailyMap[r.day] = parseFloat(r.total);
    });

    // Fill every day from 1 to today (don't show future days)
    const currentDay   = today.getDate();
    const dailyLabels  = [];
    const dailyValues  = [];

    for (let d = 1; d <= currentDay; d++) {
      dailyLabels.push(`Day ${d}`);
      dailyValues.push(dailyMap[d] || 0);
    }

    const chartData = {
      monthly: {
        labels: monthlyTotals.map(r => r.month_label),
        values: monthlyTotals.map(r => parseFloat(r.total))
      },
      categories: {
        labels: categoryTotals
                  .filter(r => parseFloat(r.total) > 0)
                  .map(r => r.category_name),
        values: categoryTotals
                  .filter(r => parseFloat(r.total) > 0)
                  .map(r => parseFloat(r.total))
      },
      daily: {
        labels: dailyLabels,
        values: dailyValues
      }
    };

    // Get current month name for display
    const monthName = today.toLocaleString('en-IN', { month: 'long' });

    res.render('dashboard/reports', {
      chartData:          JSON.stringify(chartData),
      categoryTotals,
      allTimeTotal,
      currentMonthTotal,
      monthName,
      hasData:            monthlyTotals.length > 0
    });

  } catch (err) {
    console.error('Reports error:', err.message);
    req.flash('error_msg', 'Could not load reports.');
    res.redirect('/dashboard');
  }
};

module.exports = { getDashboard, getReports };