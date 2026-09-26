const express = require('express');

const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

const protect = require('../middleware/authMiddleware');

const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

// Add comment to a task
router.post(
  '/task/:taskId',
  validateObjectId('taskId'),
  validateRequiredFields(['commentText']),
  createComment
);

// Get comments for a task
router.get(
  '/task/:taskId',
  validateObjectId('taskId'),
  getTaskComments
);

// Update comment
router.put(
  '/:id',
  validateObjectId('id'),
  validateRequiredFields(['commentText']),
  updateComment
);

// Delete comment
router.delete(
  '/:id',
  validateObjectId('id'),
  deleteComment
);

module.exports = router;