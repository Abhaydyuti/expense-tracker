// routes/authRoutes.js

const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const { asyncHandler } = require('../middlewares/errorMiddleware');

router.get('/signup',  authController.getSignup);
router.post('/signup', asyncHandler(authController.postSignup));

router.get('/login',   authController.getLogin);
router.post('/login',  asyncHandler(authController.postLogin));

router.get('/logout',  authController.logout);

module.exports = router;