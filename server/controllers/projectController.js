const Project = require('../models/Project');
const Team = require('../models/Team');

// ==================== CREATE PROJECT ====================
const createProject = async (req, res) => {
  try {
    const { projectName, teamID, description, deadline } = req.body;

    if (!projectName || !teamID || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Project name, team ID and deadline are required',
      });
    }

    // Check if team exists
    const team = await Team.findById(teamID);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is a team member
    const isMember = team.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }

    // Create project
    const project = await Project.create({
      projectName,
      teamID,
      description,
      deadline,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('teamID', 'teamName');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject,
    });
  } catch (error) {
    console.error('Create project error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while creating project',
    });
  }
};

// ==================== GET MY PROJECTS ====================
const getMyProjects = async (req, res) => {
  try {
    // Find teams where current user is a member
    const teams = await Team.find({
      members: req.user._id,
    }).select('_id');

    const teamIds = teams.map((team) => team._id);

    // Find projects belonging to those teams
    const projects = await Project.find({
      teamID: { $in: teamIds },
    })
      .populate('teamID', 'teamName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects',
    });
  }
};

// ==================== GET SINGLE PROJECT ====================
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamID', 'teamName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user belongs to project team
    const team = await Team.findById(project.teamID._id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Project team not found',
      });
    }

    const isMember = team.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project team',
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('Get project error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while fetching project',
    });
  }
};

// ==================== UPDATE PROJECT ====================
const updateProject = async (req, res) => {
  try {
    const { projectName, description, deadline } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const team = await Team.findById(project.teamID);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Project team not found',
      });
    }

    // Only team creator can update project
    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team creator can update the project',
      });
    }

    if (projectName) project.projectName = projectName;
    if (description !== undefined) project.description = description;
    if (deadline) project.deadline = deadline;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('teamID', 'teamName');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while updating project',
    });
  }
};

// ==================== DELETE PROJECT ====================
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const team = await Team.findById(project.teamID);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Project team not found',
      });
    }

    // Only team creator can delete project
    if (team.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team creator can delete the project',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server error while deleting project',
    });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
};