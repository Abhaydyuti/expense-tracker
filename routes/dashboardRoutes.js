// routes/dashboardRoutes.js

const express             = require('express');
const router              = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isLoggedIn }      = require('../middlewares/authMiddleware');
const { asyncHandler }    = require('../middlewares/errorMiddleware');

router.get(
  '/',
  isLoggedIn,
  asyncHandler(dashboardController.getDashboard)
);

router.get(
  '/reports',
  isLoggedIn,
  asyncHandler(dashboardController.getReports)
);

module.exports = router;