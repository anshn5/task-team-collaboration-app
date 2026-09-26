const express = require('express');

const {
  signup,
  login,
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.user,
  });
});

// Admin-only test route
router.get(
  '/admin-test',
  protect,
  requireRole('Admin'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Admin access granted',
      user: req.user,
    });
  }
);

module.exports = router;