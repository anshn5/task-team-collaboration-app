const express = require('express');

const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const protect = require('../middleware/authMiddleware');

const {
  validateObjectId,
  validateBodyObjectId,
  validateRequiredFields,
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

// Create project
router.post(
  '/',
  validateRequiredFields(['projectName', 'teamID', 'deadline']),
  validateBodyObjectId('teamID'),
  createProject
);

// Get my projects
router.get('/', getMyProjects);

// Get project by ID
router.get(
  '/:id',
  validateObjectId('id'),
  getProjectById
);

// Update project
router.put(
  '/:id',
  validateObjectId('id'),
  validateBodyObjectId('teamID'),
  updateProject
);

// Delete project
router.delete(
  '/:id',
  validateObjectId('id'),
  deleteProject
);

module.exports = router;