const express = require('express');

const {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/teamController');

const protect = require('../middleware/authMiddleware');

const {
  validateObjectId,
  validateBodyObjectId,
  validateRequiredFields,
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

// Create team
router.post(
  '/',
  validateRequiredFields(['teamName']),
  createTeam
);

// Get my teams
router.get('/', getMyTeams);

// Get team by ID
router.get(
  '/:id',
  validateObjectId('id'),
  getTeamById
);

// Update team
router.put(
  '/:id',
  validateObjectId('id'),
  validateRequiredFields(['teamName']),
  updateTeam
);

// Delete team
router.delete(
  '/:id',
  validateObjectId('id'),
  deleteTeam
);

// Add member
router.post(
  '/:id/members',
  validateObjectId('id'),
  validateRequiredFields(['userId']),
  validateBodyObjectId('userId'),
  addTeamMember
);

// Remove member
router.delete(
  '/:id/members',
  validateObjectId('id'),
  validateRequiredFields(['userId']),
  validateBodyObjectId('userId'),
  removeTeamMember
);

module.exports = router;