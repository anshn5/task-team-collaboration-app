const express = require('express');

const {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const protect = require('../middleware/authMiddleware');

const {
  validateObjectId,
  validateBodyObjectId,
  validateRequiredFields,
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

// Create task
router.post(
  '/',
  validateRequiredFields(['title', 'projectID']),
  validateBodyObjectId('projectID'),
  validateBodyObjectId('assignedTo'),
  createTask
);

// Get my tasks
router.get('/', getMyTasks);

// Get task by ID
router.get(
  '/:id',
  validateObjectId('id'),
  getTaskById
);

// Update task
router.put(
  '/:id',
  validateObjectId('id'),
  validateBodyObjectId('projectID'),
  validateBodyObjectId('assignedTo'),
  updateTask
);

// Delete task
router.delete(
  '/:id',
  validateObjectId('id'),
  deleteTask
);

module.exports = router;