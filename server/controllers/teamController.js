const Team = require('../models/Team');
const User = require('../models/User');

// Create a team
const createTeam = async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required',
      });
    }

    const team = await Team.create({
      teamName,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: populatedTeam,
    });
  } catch (error) {
    console.error('Create team error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while creating team',
    });
  }
};


// Get all teams where current user is a member
const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      members: req.user._id,
    })
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error('Get teams error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching teams',
    });
  }
};


// Get a single team
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const isMember = team.members.some(
      member => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }

    res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    console.error('Get team error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching team',
    });
  }
};


// Update a team
const updateTeam = async (req, res) => {
  try {
    const { teamName } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team creator can update the team',
      });
    }

    if (teamName) {
      team.teamName = teamName;
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam,
    });
  } catch (error) {
    console.error('Update team error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while updating team',
    });
  }
};


// Delete a team
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team creator can delete the team',
      });
    }

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Delete team error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while deleting team',
    });
  }
};


// Add a member to a team
const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Only team creator can add members
    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team creator can add members',
      });
    }

    // Check whether user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some(
      member => member.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team',
      });
    }

    // Add user
    team.members.push(userId);

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      team: updatedTeam,
    });
  } catch (error) {
    console.error('Add team member error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while adding team member',
    });
  }
};


// Remove a member from a team
const removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Only team creator can remove members
    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team creator can remove members',
      });
    }

    // Team creator cannot remove themselves
    if (team.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Team creator cannot be removed',
      });
    }

    // Check if user is a member
    const isMember = team.members.some(
      member => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this team',
      });
    }

    // Remove user
    team.members = team.members.filter(
      member => member.toString() !== userId.toString()
    );

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      team: updatedTeam,
    });
  } catch (error) {
    console.error('Remove team member error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while removing team member',
    });
  }
};


module.exports = {
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
};