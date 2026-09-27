const express = require('express');

const {
  signup,
  login,
  updateProfile,
} = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.post('/signup', signup);

router.post('/login', login);

// =====================================================
// CURRENT USER
// =====================================================

router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.user,
  });
});

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put('/profile', protect, updateProfile);

// =====================================================
// ADMIN-ONLY TEST ROUTE
// =====================================================

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