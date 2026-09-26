import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  Edit3,
  FolderKanban,
  ListTodo,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';
import socket from '../socket';


function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [commentSaving, setCommentSaving] =
    useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [commentText, setCommentText] =
    useState('');

  const [editingComment, setEditingComment] =
    useState(null);

  const [editingCommentText, setEditingCommentText] =
    useState('');

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
  });


  // =====================================================
  // AUTH
  // =====================================================

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };


  // =====================================================
  // FETCH TASK
  // =====================================================

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get(
        `/tasks/${id}`,
        { headers }
      );

      const taskData = response.data.task;

      setTask(taskData);

      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        priority: taskData.priority || 'Medium',
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate)
              .toISOString()
              .split('T')[0]
          : '',
        assignedTo:
          taskData.assignedTo?._id || '',
      });

    } catch (error) {
      console.error(
        'Fetch task error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to load task.'
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // FETCH COMMENTS
  // =====================================================

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);

      const response = await API.get(
        `/comments/task/${id}`,
        { headers }
      );

      setComments(
        response.data.comments || []
      );

    } catch (error) {
      console.error(
        'Fetch comments error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to load comments.'
      );
    } finally {
      setCommentsLoading(false);
    }
  };


  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    fetchTask();
    fetchComments();

    if (!id) {
      return;
    }

    // Connect to Socket.IO
    socket.connect();

    // Join this task's realtime room
    socket.emit('join_task', id);


    // ---------------------------------------------------
    // TASK UPDATED
    // ---------------------------------------------------

    const handleTaskUpdated = (
      updatedTask
    ) => {
      if (!updatedTask) {
        return;
      }

      setTask(updatedTask);

      setFormData((prev) => ({
        ...prev,
        title:
          updatedTask.title || '',
        description:
          updatedTask.description || '',
        status:
          updatedTask.status ||
          'To Do',
        priority:
          updatedTask.priority ||
          'Medium',
        dueDate:
          updatedTask.dueDate
            ? new Date(
                updatedTask.dueDate
              )
                .toISOString()
                .split('T')[0]
            : '',
        assignedTo:
          updatedTask.assignedTo?._id ||
          '',
      }));
    };


    // ---------------------------------------------------
    // COMMENT ADDED
    // ---------------------------------------------------

    const handleCommentAdded = (
      newComment
    ) => {
      if (!newComment) {
        return;
      }

      setComments((prev) => {
        const alreadyExists =
          prev.some(
            (comment) =>
              comment._id ===
              newComment._id
          );

        if (alreadyExists) {
          return prev;
        }

        return [
          ...prev,
          newComment,
        ];
      });
    };


    // ---------------------------------------------------
    // COMMENT UPDATED
    // ---------------------------------------------------

    const handleCommentUpdated = (
      updatedComment
    ) => {
      if (!updatedComment) {
        return;
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment._id ===
          updatedComment._id
            ? updatedComment
            : comment
        )
      );
    };


    // ---------------------------------------------------
    // COMMENT DELETED
    // ---------------------------------------------------

    const handleCommentDeleted = (
      commentId
    ) => {
      if (!commentId) {
        return;
      }

      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment._id !==
            commentId
        )
      );
    };


    // Register listeners
    socket.on(
      'task_updated',
      handleTaskUpdated
    );

    socket.on(
      'comment_added',
      handleCommentAdded
    );

    socket.on(
      'comment_updated',
      handleCommentUpdated
    );

    socket.on(
      'comment_deleted',
      handleCommentDeleted
    );


    // ---------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------

    return () => {
      socket.emit(
        'leave_task',
        id
      );

      socket.off(
        'task_updated',
        handleTaskUpdated
      );

      socket.off(
        'comment_added',
        handleCommentAdded
      );

      socket.off(
        'comment_updated',
        handleCommentUpdated
      );

      socket.off(
        'comment_deleted',
        handleCommentDeleted
      );

      socket.disconnect();
    };

  }, [id]);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };


  // =====================================================
  // UPDATE TASK
  // =====================================================

  const handleUpdateTask = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response =
        await API.put(
          `/tasks/${id}`,
          {
            title:
              formData.title,
            description:
              formData.description,
            status:
              formData.status,
            priority:
              formData.priority,
            dueDate:
              formData.dueDate ||
              null,
            assignedTo:
              formData.assignedTo ||
              null,
          },
          { headers }
        );

      // Update current browser immediately
      setTask(
        response.data.task
      );

      setShowEditModal(false);

      setSuccess(
        'Task updated successfully.'
      );

    } catch (error) {
      console.error(
        'Update task error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to update task.'
      );
    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // QUICK STATUS
  // =====================================================

  const handleStatusChange = async (
    status
  ) => {
    try {
      setError('');
      setSuccess('');

      const response =
        await API.put(
          `/tasks/${id}`,
          { status },
          { headers }
        );

      setTask(
        response.data.task
      );

      setFormData((prev) => ({
        ...prev,
        status,
      }));

      setSuccess(
        'Task status updated.'
      );

    } catch (error) {
      console.error(
        'Status update error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to update status.'
      );
    }
  };


  // =====================================================
  // DELETE TASK
  // =====================================================

  const handleDeleteTask = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this task?'
      );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await API.delete(
        `/tasks/${id}`,
        { headers }
      );

      navigate('/tasks');

    } catch (error) {
      console.error(
        'Delete task error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to delete task.'
      );

      setShowMenu(false);
    }
  };


  // =====================================================
  // ADD COMMENT
  // =====================================================

  const handleAddComment = async (
    e
  ) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setCommentSaving(true);
      setError('');
      setSuccess('');

      const response =
        await API.post(
          `/comments/task/${id}`,
          {
            commentText:
              commentText.trim(),
          },
          { headers }
        );

      // Add immediately.
      // Socket.IO also performs duplicate checking.
      setComments((prev) => {
        const newComment =
          response.data.comment;

        const alreadyExists =
          prev.some(
            (comment) =>
              comment._id ===
              newComment._id
          );

        if (alreadyExists) {
          return prev;
        }

        return [
          ...prev,
          newComment,
        ];
      });

      setCommentText('');

      setSuccess(
        'Comment added successfully.'
      );

    } catch (error) {
      console.error(
        'Add comment error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to add comment.'
      );
    } finally {
      setCommentSaving(false);
    }
  };


  // =====================================================
  // EDIT COMMENT
  // =====================================================

  const startEditComment = (
    comment
  ) => {
    setEditingComment(
      comment._id
    );

    setEditingCommentText(
      comment.commentText
    );
  };


  const cancelEditComment = () => {
    setEditingComment(null);
    setEditingCommentText('');
  };


  const handleUpdateComment =
    async (commentId) => {
      if (
        !editingCommentText.trim()
      ) {
        return;
      }

      try {
        setError('');
        setSuccess('');

        const response =
          await API.put(
            `/comments/${commentId}`,
            {
              commentText:
                editingCommentText.trim(),
            },
            { headers }
          );

        setComments((prev) =>
          prev.map((comment) =>
            comment._id ===
            commentId
              ? response.data.comment
              : comment
          )
        );

        cancelEditComment();

        setSuccess(
          'Comment updated successfully.'
        );

      } catch (error) {
        console.error(
          'Update comment error:',
          error
        );

        setError(
          error.response?.data?.message ||
            'Unable to update comment.'
        );
      }
    };


  // =====================================================
  // DELETE COMMENT
  // =====================================================

  const handleDeleteComment =
    async (commentId) => {
      const confirmed =
        window.confirm(
          'Delete this comment?'
        );

      if (!confirmed) {
        return;
      }

      try {
        setError('');
        setSuccess('');

        await API.delete(
          `/comments/${commentId}`,
          { headers }
        );

        setComments((prev) =>
          prev.filter(
            (comment) =>
              comment._id !==
              commentId
          )
        );

        setSuccess(
          'Comment deleted successfully.'
        );

      } catch (error) {
        console.error(
          'Delete comment error:',
          error
        );

        setError(
          error.response?.data?.message ||
            'Unable to delete comment.'
        );
      }
    };


  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return 'No due date';
    }

    return new Date(
      date
    ).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };


  const formatCommentDate = (
    date
  ) => {
    if (!date) {
      return '';
    }

    return new Date(
      date
    ).toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };


  const priorityClass =
    task?.priority === 'High'
      ? 'bg-rose-500/10 text-rose-300 border-rose-400/10'
      : task?.priority === 'Medium'
        ? 'bg-amber-500/10 text-amber-300 border-amber-400/10'
        : 'bg-emerald-500/10 text-emerald-300 border-emerald-400/10';


  const statusClass =
    task?.status === 'Done'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/10'
      : task?.status ===
          'In Progress'
        ? 'bg-blue-500/10 text-blue-300 border-blue-400/10'
        : 'bg-slate-500/10 text-slate-400 border-white/10';


  const statusIcon =
    task?.status === 'Done'
      ? (
        <CheckCircle2 size={18} />
      )
      : task?.status ===
          'In Progress'
        ? (
          <CircleDot size={18} />
        )
        : (
          <Circle size={18} />
        );


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">

        <Navbar />

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">

          <div className="text-center">

            <div className="relative mx-auto h-16 w-16">

              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

                <ListTodo
                  size={27}
                  className="animate-pulse text-cyan-300"
                />

              </div>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Loading task...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!task) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">

        <Navbar />

        <main className="mx-auto max-w-4xl px-5 py-20 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">

            <AlertTriangle
              size={30}
              className="text-rose-300"
            />

          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Task not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              'The requested task could not be found.'}
          </p>

          <button
            onClick={() =>
              navigate('/tasks')
            }
            className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold"
          >
            Back to Tasks
          </button>

        </main>

      </div>
    );
  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      <Navbar />


      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-[-150px] top-[15%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      </div>

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '45px 45px',
        }}
      />


      {/* CONTENT */}

      <main className="relative z-10 mx-auto max-w-[1450px] px-5 py-7 sm:px-8">

        {/* BACK */}

        <button
          onClick={() =>
            navigate('/tasks')
          }
          className="group mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        >

          <ArrowLeft
            size={17}
            className="transition group-hover:-translate-x-1"
          />

          All Tasks

        </button>


        {/* ALERTS */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">

            <AlertTriangle size={17} />

            <span>{error}</span>

            <button
              onClick={() =>
                setError('')
              }
              className="ml-auto"
            >
              <X size={16} />
            </button>

          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">

            <CheckCircle2 size={17} />

            <span>{success}</span>

            <button
              onClick={() =>
                setSuccess('')
              }
              className="ml-auto"
            >
              <X size={16} />
            </button>

          </div>
        )}


        {/* TASK HERO */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-7 shadow-2xl shadow-blue-900/20 sm:p-10">

          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[45px] border-white/10" />

          <div className="absolute bottom-[-120px] left-[30%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">

              <div className="min-w-0">

                <div className="mb-5 flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">

                    <Sparkles size={12} />

                    Task Details

                  </span>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${priorityClass}`}
                  >
                    {task.priority}
                  </span>

                </div>

                <h1 className="max-w-4xl break-words text-3xl font-black tracking-tight sm:text-5xl">
                  {task.title}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
                  {task.description ||
                    'No description has been added for this task.'}
                </p>


                {/* STATUS */}

                <div className="mt-7 flex flex-wrap items-center gap-3">

                  {[
                    'To Do',
                    'In Progress',
                    'Done',
                  ].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleStatusChange(
                            status
                          )
                        }
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                          task.status ===
                          status
                            ? 'border-white/30 bg-white/20 text-white'
                            : 'border-white/10 bg-white/5 text-blue-100 hover:bg-white/10'
                        }`}
                      >

                        {status ===
                        'Done' ? (
                          <CheckCircle2
                            size={15}
                          />
                        ) : status ===
                          'In Progress' ? (
                          <CircleDot
                            size={15}
                          />
                        ) : (
                          <Circle
                            size={15}
                          />
                        )}

                        {status}

                      </button>
                    )
                  )}

                </div>

              </div>


              {/* ACTION MENU */}

              <div className="relative self-start">

                <button
                  onClick={() =>
                    setShowMenu(
                      !showMenu
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                >

                  <MoreHorizontal
                    size={20}
                  />

                </button>


                {showMenu && (
                  <>

                    <div
                      className="fixed inset-0 z-10"
                      onClick={() =>
                        setShowMenu(
                          false
                        )
                      }
                    />

                    <div className="absolute right-0 top-13 z-20 w-48 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl">

                      <button
                        onClick={() => {
                          setShowEditModal(
                            true
                          );
                          setShowMenu(
                            false
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >

                        <Pencil size={15} />

                        Edit Task

                      </button>

                      <button
                        onClick={
                          handleDeleteTask
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
                      >

                        <Trash2 size={15} />

                        Delete Task

                      </button>

                    </div>

                  </>
                )}

              </div>

            </div>


            {/* META */}

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <MetaCard
                icon={
                  <FolderKanban size={17} />
                }
                label="Project"
                value={
                  task.projectID
                    ?.projectName ||
                  'Unknown Project'
                }
              />

              <MetaCard
                icon={
                  <UserRound size={17} />
                }
                label="Assigned To"
                value={
                  task.assignedTo
                    ?.name ||
                  'Unassigned'
                }
              />

              <MetaCard
                icon={
                  <CalendarDays size={17} />
                }
                label="Due Date"
                value={formatDate(
                  task.dueDate
                )}
              />

              <MetaCard
                icon={
                  <Clock3 size={17} />
                }
                label="Current Status"
                value={task.status}
              />

            </div>

          </div>

        </section>


        {/* MAIN GRID */}

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.4fr_0.6fr]">


          {/* COMMENTS */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-7">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">

                    <MessageCircle size={19} />

                  </div>

                  <div>

                    <h2 className="font-bold">
                      Comments
                    </h2>

                    <p className="text-xs text-slate-600">
                      Collaborate with your
                      team
                    </p>

                  </div>

                </div>

              </div>

              <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-500">
                {comments.length}
              </span>

            </div>


            {/* ADD COMMENT */}

            <form
              onSubmit={
                handleAddComment
              }
              className="mt-7"
            >

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">

                <textarea
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
                  }
                  rows="3"
                  placeholder="Write a comment..."
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-slate-700"
                />

                <div className="flex justify-end border-t border-white/5 pt-3">

                  <button
                    type="submit"
                    disabled={
                      commentSaving ||
                      !commentText.trim()
                    }
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <Send size={14} />

                    {commentSaving
                      ? 'Posting...'
                      : 'Post Comment'}

                  </button>

                </div>

              </div>

            </form>


            {/* COMMENTS LIST */}

            <div className="mt-7">

              {commentsLoading ? (

                <div className="py-12 text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

                  <p className="mt-4 text-xs text-slate-600">
                    Loading comments...
                  </p>

                </div>

              ) : comments.length ===
                0 ? (

                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">

                  <MessageCircle
                    size={27}
                    className="mx-auto text-slate-700"
                  />

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    No comments yet
                  </p>

                  <p className="mt-1 text-xs text-slate-700">
                    Start the conversation
                    with your team.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {comments.map(
                    (comment) => (
                      <CommentCard
                        key={
                          comment._id
                        }
                        comment={
                          comment
                        }
                        editingComment={
                          editingComment
                        }
                        editingCommentText={
                          editingCommentText
                        }
                        setEditingCommentText={
                          setEditingCommentText
                        }
                        onEdit={
                          startEditComment
                        }
                        onCancel={
                          cancelEditComment
                        }
                        onSave={
                          handleUpdateComment
                        }
                        onDelete={
                          handleDeleteComment
                        }
                        formatDate={
                          formatCommentDate
                        }
                      />
                    )
                  )}

                </div>

              )}

            </div>

          </section>


          {/* SIDEBAR */}

          <aside className="space-y-5">

            {/* TASK SUMMARY */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">

                  <ListTodo size={19} />

                </div>

                <div>

                  <h2 className="font-bold">
                    Task Summary
                  </h2>

                  <p className="text-xs text-slate-600">
                    Current task information
                  </p>

                </div>

              </div>


              <div className="mt-6 space-y-4">

                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${statusClass}`}
                    >
                      {statusIcon}
                      {task.status}
                    </span>
                  }
                />

                <InfoRow
                  label="Priority"
                  value={
                    <span
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${priorityClass}`}
                    >
                      {task.priority}
                    </span>
                  }
                />

                <InfoRow
                  label="Assignee"
                  value={
                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-[9px] font-black">
                        {task.assignedTo?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          '?'}
                      </div>

                      <span>
                        {task.assignedTo
                          ?.name ||
                          'Unassigned'}
                      </span>

                    </div>
                  }
                />

                <InfoRow
                  label="Due Date"
                  value={formatDate(
                    task.dueDate
                  )}
                />

              </div>

            </div>


            {/* PROJECT CARD */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">

                  <FolderKanban size={19} />

                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Project
                  </p>

                  <h3 className="truncate text-sm font-bold text-white">
                    {task.projectID
                      ?.projectName ||
                      'Unknown Project'}
                  </h3>

                </div>

              </div>


              <button
                onClick={() => {
                  const projectId =
                    typeof task.projectID ===
                    'object'
                      ? task.projectID?._id
                      : task.projectID;

                  if (projectId) {
                    navigate(
                      `/projects/${projectId}`
                    );
                  }
                }}
                className="group mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white"
              >

                View Project

                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-1"
                />

              </button>

            </div>


            {/* QUICK STATUS */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Quick Status
              </p>

              <div className="mt-4 space-y-2">

                {[
                  'To Do',
                  'In Progress',
                  'Done',
                ].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusChange(
                          status
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs font-semibold transition ${
                        task.status ===
                        status
                          ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                          : 'border-white/5 bg-white/[0.02] text-slate-500 hover:bg-white/5 hover:text-white'
                      }`}
                    >

                      {status ===
                      'Done' ? (
                        <CheckCircle2
                          size={16}
                        />
                      ) : status ===
                        'In Progress' ? (
                        <CircleDot
                          size={16}
                        />
                      ) : (
                        <Circle
                          size={16}
                        />
                      )}

                      {status}

                      {task.status ===
                        status && (
                        <Check
                          size={15}
                          className="ml-auto"
                        />
                      )}

                    </button>
                  )
                )}

              </div>

            </div>

          </aside>

        </div>

      </main>


      {/* EDIT MODAL */}

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-md">

          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">

                  <Edit3 size={18} />

                </div>

                <div>

                  <h2 className="font-bold">
                    Edit Task
                  </h2>

                  <p className="text-xs text-slate-600">
                    Update task information
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setShowEditModal(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>

            </div>


            <form
              onSubmit={
                handleUpdateTask
              }
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Task Title
                </label>

                <input
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-400/30"
                />

              </div>


              <div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-400/30"
                />

              </div>


              <div className="grid gap-5 sm:grid-cols-3">

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
                  >

                    <option value="To Do">
                      To Do
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Done">
                      Done
                    </option>

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      formData.dueDate
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-sm text-slate-300 outline-none focus:border-cyan-400/30"
                  />

                </div>

              </div>


              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowEditModal(
                      false
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


// =====================================================
// META CARD
// =====================================================

function MetaCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-white">
          {value}
        </p>

      </div>

    </div>
  );
}


// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">

      <span className="text-xs text-slate-600">
        {label}
      </span>

      <div className="text-right text-xs font-semibold text-slate-300">
        {value}
      </div>

    </div>
  );
}


// =====================================================
// COMMENT CARD
// =====================================================

function CommentCard({
  comment,
  editingComment,
  editingCommentText,
  setEditingCommentText,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  formatDate,
}) {
  const isEditing =
    editingComment ===
    comment._id;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">

      <div className="flex gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-black text-white">

          {comment.userID?.name
            ?.charAt(0)
            ?.toUpperCase() ||
            'U'}

        </div>


        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <span className="text-sm font-bold text-white">
              {comment.userID
                ?.name ||
                'User'}
            </span>

            <span className="text-[10px] text-slate-700">
              {formatDate(
                comment.createdAt
              )}
            </span>

          </div>


          {isEditing ? (

            <div className="mt-3">

              <textarea
                value={
                  editingCommentText
                }
                onChange={(e) =>
                  setEditingCommentText(
                    e.target.value
                  )
                }
                rows="3"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400/30"
              />

              <div className="mt-2 flex gap-2">

                <button
                  onClick={() =>
                    onSave(
                      comment._id
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                >

                  <Check size={13} />

                  Save

                </button>

                <button
                  onClick={onCancel}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-400 hover:bg-white/10"
                >

                  <X size={13} />

                  Cancel

                </button>

              </div>

            </div>

          ) : (

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
              {comment.commentText}
            </p>

          )}


          {!isEditing && (
            <div className="mt-3 flex items-center gap-2">

              <button
                onClick={() =>
                  onEdit(comment)
                }
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-white/5 hover:text-slate-300"
              >

                <Pencil size={12} />

                Edit

              </button>

              <button
                onClick={() =>
                  onDelete(
                    comment._id
                  )
                }
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-300"
              >

                <Trash2 size={12} />

                Delete

              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default TaskDetails;