const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Team = require('../models/Team');
const { getIO } = require('../socket');


// =====================================================
// CREATE COMMENT
// =====================================================

const createComment = async (req, res) => {
  try {
    const { commentText } = req.body;
    const { taskId } = req.params;

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.projectID);

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
        message: 'Team not found',
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

    const comment = await Comment.create({
      taskID: taskId,
      userID: req.user._id,
      commentText: commentText.trim(),
    });

    const populatedComment = await Comment.findById(
      comment._id
    )
      .populate('userID', 'name email role')
      .populate('taskID', 'title');


    // =================================================
    // REALTIME COMMENT EVENT
    // =================================================

    const io = getIO();

    io.to(`task_${taskId}`).emit(
      'comment_added',
      populatedComment
    );


    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment,
    });

  } catch (error) {
    console.error(
      'Create comment error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while creating comment',
    });
  }
};


// =====================================================
// GET TASK COMMENTS
// =====================================================

const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

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
        message: 'Project not found',
      });
    }

    const team = await Team.findById(project.teamID);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
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

    const comments = await Comment.find({
      taskID: taskId,
    })
      .populate('userID', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });

  } catch (error) {
    console.error(
      'Get comments error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments',
    });
  }
};


// =====================================================
// UPDATE COMMENT
// =====================================================

const updateComment = async (req, res) => {
  try {
    const { commentText } = req.body;

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const comment = await Comment.findById(
      req.params.id
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (
      comment.userID.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own comments',
      });
    }

    comment.commentText = commentText.trim();

    await comment.save();

    const updatedComment = await Comment.findById(
      comment._id
    )
      .populate('userID', 'name email role')
      .populate('taskID', 'title');


    // =================================================
    // REALTIME COMMENT UPDATE
    // =================================================

    const io = getIO();

    io.to(`task_${comment.taskID}`).emit(
      'comment_updated',
      updatedComment
    );


    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment,
    });

  } catch (error) {
    console.error(
      'Update comment error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while updating comment',
    });
  }
};


// =====================================================
// DELETE COMMENT
// =====================================================

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(
      req.params.id
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (
      comment.userID.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }


    // Save task ID before deleting the comment
    const taskId = comment.taskID.toString();
    const commentId = comment._id.toString();

    await Comment.findByIdAndDelete(
      req.params.id
    );


    // =================================================
    // REALTIME COMMENT DELETE
    // =================================================

    const io = getIO();

    io.to(`task_${taskId}`).emit(
      'comment_deleted',
      commentId
    );


    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });

  } catch (error) {
    console.error(
      'Delete comment error:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment',
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
};