const Task = require('../models/Task');
const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
const { getIO } = require('../socket');


// =====================================================
// CREATE TASK
// =====================================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      projectID,
      status,
      priority,
      dueDate,
    } = req.body;

    if (!title || !projectID) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project ID are required',
      });
    }

    const project = await Project.findById(projectID);

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

    const isMember = team.members.some(
      (member) =>
        member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found',
        });
      }

      const isAssignedUserMember = team.members.some(
        (member) =>
          member.toString() === assignedTo.toString()
      );

      if (!isAssignedUserMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this team',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null,
      projectID,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('projectID', 'projectName');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask,
    });

  } catch (error) {
    console.error(
      'Create task error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while creating task',
    });
  }
};


// =====================================================
// GET MY TASKS
// Supports pagination, search, status filter and priority filter
// =====================================================

const getMyTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      priority,
    } = req.query;

    // Convert pagination values to numbers
    const currentPage = Math.max(
      parseInt(page) || 1,
      1
    );

    const itemsPerPage = Math.min(
      Math.max(parseInt(limit) || 10, 1),
      50
    );

    // Find teams of logged-in user
    const teams = await Team.find({
      members: req.user._id,
    }).select('_id');

    const teamIds = teams.map(
      (team) => team._id
    );

    // Find projects belonging to those teams
    const projects = await Project.find({
      teamID: { $in: teamIds },
    }).select('_id');

    const projectIds = projects.map(
      (project) => project._id
    );

    // Base filter
    const filters = {
      projectID: { $in: projectIds },
    };

    // Search task title or description
    if (search.trim()) {
      filters.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      filters.status = status;
    }

    // Filter by priority
    if (priority) {
      filters.priority = priority;
    }

    // Count total matching tasks
    const totalTasks =
      await Task.countDocuments(filters);

    // Fetch paginated tasks
    const tasks = await Task.find(filters)
      .populate(
        'assignedTo',
        'name email role'
      )
      .populate(
        'projectID',
        'projectName'
      )
      .sort({ createdAt: -1 })
      .skip(
        (currentPage - 1) *
          itemsPerPage
      )
      .limit(itemsPerPage);

    const totalPages =
      Math.ceil(
        totalTasks / itemsPerPage
      );

    res.status(200).json({
      success: true,
      count: tasks.length,

      pagination: {
        currentPage,
        itemsPerPage,
        totalTasks,
        totalPages,
      },

      filters: {
        search,
        status: status || null,
        priority: priority || null,
      },

      tasks,
    });

  } catch (error) {
    console.error(
      'Get tasks error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
    });
  }
};


// =====================================================
// GET SINGLE TASK
// =====================================================

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(
      req.params.id
    )
      .populate(
        'assignedTo',
        'name email role'
      )
      .populate(
        'projectID',
        'projectName teamID'
      );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const team = await Team.findById(
      task.projectID.teamID
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Task team not found',
      });
    }

    const isMember = team.members.some(
      (member) =>
        member.toString() ===
        req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message:
          'You are not a member of this task team',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });

  } catch (error) {
    console.error(
      'Get task error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while fetching task',
    });
  }
};


// =====================================================
// UPDATE TASK
// =====================================================

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    const task = await Task.findById(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(
      task.projectID
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Task project not found',
      });
    }

    const team = await Team.findById(
      project.teamID
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Task team not found',
      });
    }

    const isMember = team.members.some(
      (member) =>
        member.toString() ===
        req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }


    // =================================================
    // VALIDATE ASSIGNED USER
    // =================================================

    if (
      assignedTo !== undefined &&
      assignedTo !== null &&
      assignedTo !== ''
    ) {
      const assignedUser =
        await User.findById(assignedTo);

      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found',
        });
      }

      const isAssignedUserMember =
        team.members.some(
          (member) =>
            member.toString() ===
            assignedTo.toString()
        );

      if (!isAssignedUserMember) {
        return res.status(400).json({
          success: false,
          message:
            'Assigned user is not a member of this team',
        });
      }

      task.assignedTo = assignedTo;
    }

    // Remove assignee
    if (
      assignedTo === null ||
      assignedTo === ''
    ) {
      task.assignedTo = null;
    }


    // =================================================
    // UPDATE FIELDS
    // =================================================

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }


    // =================================================
    // SAVE TASK
    // =================================================

    await task.save();


    // =================================================
    // GET UPDATED TASK
    // =================================================

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          'assignedTo',
          'name email role'
        )
        .populate(
          'projectID',
          'projectName'
        );


    // =================================================
    // REALTIME TASK UPDATE
    // =================================================

    const io = getIO();

    io.to(
      `task_${task._id}`
    ).emit(
      'task_updated',
      updatedTask
    );


    // =================================================
    // RESPONSE
    // =================================================

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });

  } catch (error) {
    console.error(
      'Update task error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
    });
  }
};


// =====================================================
// DELETE TASK
// =====================================================

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(
      task.projectID
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Task project not found',
      });
    }

    const team = await Team.findById(
      project.teamID
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Task team not found',
      });
    }

    if (
      team.createdBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Only the team creator can delete the task',
      });
    }

    await Task.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });

  } catch (error) {
    console.error(
      'Delete task error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
};