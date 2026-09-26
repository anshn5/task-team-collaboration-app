import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  Plus,
  Search,
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleDot,
  MoreHorizontal,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  FolderKanban,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [openMenu, setOpenMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // =========================
  // CREATE TASK FORM
  // =========================

  const [form, setForm] = useState({
    title: '',
    description: '',
    projectID: '',
    assignedTo: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
  });

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await API.get('/tasks?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Tasks fetch error:', error);

      setError(
        error.response?.data?.message ||
          'Unable to load tasks.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH PROJECTS
  // =========================

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await API.get('/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Projects fetch error:', error);

      setError(
        error.response?.data?.message ||
          'Unable to load projects.'
      );
    }
  };

  // =========================
  // FETCH TEAMS
  // =========================

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await API.get('/teams', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Teams fetch error:', error);

      setError(
        error.response?.data?.message ||
          'Unable to load teams.'
      );
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTeams();
  }, []);

  // =========================
  // SELECTED PROJECT
  // =========================

  const selectedProject = useMemo(() => {
    return projects.find(
      (project) => project._id === form.projectID
    );
  }, [projects, form.projectID]);

  // =========================
  // SELECTED TEAM MEMBERS
  // =========================

  const selectedTeam = useMemo(() => {
    if (!selectedProject) return null;

    const teamId =
      selectedProject.teamID?._id ||
      selectedProject.teamID;

    return teams.find(
      (team) => team._id === teamId
    );
  }, [projects, teams, selectedProject]);

  const teamMembers = selectedTeam?.members || [];

  // =========================
  // FORM CHANGE
  // =========================

  const handleFormChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (field === 'projectID') {
      setForm((previous) => ({
        ...previous,
        projectID: value,
        assignedTo: '',
      }));
    }
  };

  // =========================
  // CREATE TASK
  // =========================

  const createTask = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (!form.projectID) {
      setError('Please select a project.');
      return;
    }

    try {
      setCreating(true);

      const token = localStorage.getItem('token');

      const taskData = {
        title: form.title.trim(),
        description: form.description.trim(),
        projectID: form.projectID,
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };

      const response = await API.post(
        '/tasks',
        taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newTask = response.data.task;

      setTasks((previous) => [
        newTask,
        ...previous,
      ]);

      setSuccess('Task created successfully.');

      setForm({
        title: '',
        description: '',
        projectID: '',
        assignedTo: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: '',
      });

      setShowCreateModal(false);
    } catch (error) {
      console.error('Create task error:', error);

      setError(
        error.response?.data?.message ||
          'Unable to create task.'
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text = `
        ${task.title || ''}
        ${task.description || ''}
        ${task.status || ''}
        ${task.priority || ''}
        ${task.assignedTo?.name || ''}
        ${task.projectID?.projectName || ''}
      `.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === 'All' ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'All' ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // =========================
  // STATS
  // =========================

  const stats = useMemo(() => {
    return {
      total: tasks.length,

      todo: tasks.filter(
        (task) => task.status === 'To Do'
      ).length,

      progress: tasks.filter(
        (task) => task.status === 'In Progress'
      ).length,

      done: tasks.filter(
        (task) => task.status === 'Done'
      ).length,

      high: tasks.filter(
        (task) => task.priority === 'High'
      ).length,
    };
  }, [tasks]);

  // =========================
  // STATUS UPDATE
  // =========================

  const updateStatus = async (task, status) => {
    try {
      const token = localStorage.getItem('token');

      await API.put(
        `/tasks/${task._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id
            ? { ...item, status }
            : item
        )
      );

      setSuccess('Task status updated.');
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to update status.'
      );
    } finally {
      setOpenMenu(null);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');

      await API.delete(`/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks((previous) =>
        previous.filter(
          (task) => task._id !== taskId
        )
      );

      setSuccess('Task deleted successfully.');
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to delete task.'
      );
    } finally {
      setOpenMenu(null);
    }
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return 'No due date';

    return new Date(date).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

            <p className="mt-4 text-sm text-slate-500">
              Loading tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      <Navbar />

      {/* Background glow */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-[-150px] top-[15%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      </div>

      <main className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 sm:px-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">

              <Sparkles size={12} />

              Task Management

            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Your Tasks
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Organize, prioritize and track your work.
            </p>

          </div>

          <button
            onClick={() => {
              setError('');
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-sm font-bold shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5"
          >
            <Plus size={18} />

            Create Task
          </button>

        </div>

        {/* ALERT */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">

            <AlertTriangle size={17} />

            <span>{error}</span>

            <button
              onClick={() => setError('')}
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
              onClick={() => setSuccess('')}
              className="ml-auto"
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          <Stat
            icon={<ListTodo size={20} />}
            value={stats.total}
            label="Total Tasks"
          />

          <Stat
            icon={<Circle size={20} />}
            value={stats.todo}
            label="To Do"
          />

          <Stat
            icon={<CircleDot size={20} />}
            value={stats.progress}
            label="In Progress"
          />

          <Stat
            icon={<CheckCircle2 size={20} />}
            value={stats.done}
            label="Completed"
          />

          <Stat
            icon={<AlertTriangle size={20} />}
            value={stats.high}
            label="High Priority"
          />

        </div>

        {/* FILTER BAR */}

        <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">

          <div className="flex flex-col gap-4 lg:flex-row">

            {/* Search */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search tasks, projects or people..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
              />

            </div>

            {/* Status */}

            <div className="flex gap-1 overflow-x-auto rounded-xl bg-white/[0.02] p-1">

              {[
                'All',
                'To Do',
                'In Progress',
                'Done',
              ].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                    statusFilter === status
                      ? 'bg-cyan-400/10 text-cyan-300'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}

            </div>

            {/* Priority */}

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 outline-none"
            >
              <option value="All">
                All Priorities
              </option>

              <option value="High">
                High Priority
              </option>

              <option value="Medium">
                Medium Priority
              </option>

              <option value="Low">
                Low Priority
              </option>
            </select>

          </div>

        </div>

        {/* TASK LIST */}

        <div className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold">
                All Tasks
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Showing {filteredTasks.length} of{' '}
                {tasks.length} tasks
              </p>

            </div>

          </div>

          {filteredTasks.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-16 text-center">

              <ListTodo
                size={40}
                className="mx-auto text-slate-700"
              />

              <h3 className="mt-5 text-lg font-bold">
                No tasks found
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Create your first task using the button above.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {filteredTasks.map((task) => (

                <TaskCard
                  key={task._id}
                  task={task}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  onOpen={() =>
                    navigate(`/tasks/${task._id}`)
                  }
                  onStatusChange={updateStatus}
                  onDelete={deleteTask}
                  formatDate={formatDate}
                />

              ))}

            </div>

          )}

        </div>

      </main>

      {/* =========================
          CREATE TASK MODAL
      ========================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <ListTodo size={20} />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold">
                      Create New Task
                    </h2>

                    <p className="text-xs text-slate-500">
                      Add a task to your project.
                    </p>

                  </div>

                </div>

              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={createTask}
              className="space-y-5 p-6"
            >

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Task Title *
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    handleFormChange(
                      'title',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Design login page"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/40"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange(
                      'description',
                      e.target.value
                    )
                  }
                  placeholder="Describe what needs to be done..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/40"
                />

              </div>

              {/* PROJECT + ASSIGNEE */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Project *
                  </label>

                  <div className="relative">

                    <FolderKanban
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300"
                    />

                    <select
                      value={form.projectID}
                      onChange={(e) =>
                        handleFormChange(
                          'projectID',
                          e.target.value
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-cyan-400/40"
                      required
                    >

                      <option value="">
                        Select project
                      </option>

                      {projects.map((project) => (
                        <option
                          key={project._id}
                          value={project._id}
                        >
                          {project.projectName}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assign To
                  </label>

                  <select
                    value={form.assignedTo}
                    onChange={(e) =>
                      handleFormChange(
                        'assignedTo',
                        e.target.value
                      )
                    }
                    disabled={!form.projectID}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <option value="">
                      Unassigned
                    </option>

                    {teamMembers.map((member) => (
                      <option
                        key={member._id}
                        value={member._id}
                      >
                        {member.name} ({member.email})
                      </option>
                    ))}

                  </select>

                  {!form.projectID && (
                    <p className="mt-2 text-[10px] text-slate-600">
                      Select a project first.
                    </p>
                  )}

                </div>

              </div>

              {/* STATUS + PRIORITY */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleFormChange(
                        'status',
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
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
                    value={form.priority}
                    onChange={(e) =>
                      handleFormChange(
                        'priority',
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40"
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

              </div>

              {/* DUE DATE */}

              <div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Due Date
                </label>

                <div className="relative">

                  <CalendarDays
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300"
                  />

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      handleFormChange(
                        'dueDate',
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-400/40"
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-bold shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {creating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Task
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================
// STAT
// =========================

function Stat({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.055]">

      <div className="text-cyan-300">
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {label}
      </p>

    </div>
  );
}

// =========================
// TASK CARD
// =========================

function TaskCard({
  task,
  openMenu,
  setOpenMenu,
  onOpen,
  onStatusChange,
  onDelete,
  formatDate,
}) {

  const priorityClass =
    task.priority === 'High'
      ? 'bg-rose-500/10 text-rose-300'
      : task.priority === 'Medium'
        ? 'bg-amber-500/10 text-amber-300'
        : 'bg-emerald-500/10 text-emerald-300';

  const statusClass =
    task.status === 'Done'
      ? 'bg-emerald-500/10 text-emerald-300'
      : task.status === 'In Progress'
        ? 'bg-blue-500/10 text-blue-300'
        : 'bg-slate-500/10 text-slate-400';

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.055]">

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

        {/* ICON */}

        <button
          onClick={onOpen}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-cyan-300"
        >
          {task.status === 'Done' ? (
            <CheckCircle2 size={22} />
          ) : task.status === 'In Progress' ? (
            <CircleDot size={22} />
          ) : (
            <Circle size={22} />
          )}
        </button>

        {/* TITLE */}

        <button
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="truncate text-sm font-bold">
              {task.title}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${priorityClass}`}
            >
              {task.priority}
            </span>

          </div>

          <p className="mt-1 line-clamp-1 text-xs text-slate-600">
            {task.description ||
              'No description provided.'}
          </p>

        </button>

        {/* PROJECT */}

        <div className="flex items-center gap-2 xl:w-48">

          <FolderKanban
            size={16}
            className="text-purple-300"
          />

          <div className="min-w-0">

            <p className="text-[9px] uppercase tracking-wider text-slate-700">
              Project
            </p>

            <p className="truncate text-xs font-semibold text-slate-400">
              {task.projectID?.projectName ||
                'Unknown'}
            </p>

          </div>

        </div>

        {/* ASSIGNED */}

        <div className="flex items-center gap-2 xl:w-40">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-black">
            {task.assignedTo?.name
              ?.charAt(0)
              ?.toUpperCase() || '?'}
          </div>

          <div className="min-w-0">

            <p className="text-[9px] uppercase tracking-wider text-slate-700">
              Assigned
            </p>

            <p className="truncate text-xs font-semibold text-slate-400">
              {task.assignedTo?.name ||
                'Unassigned'}
            </p>

          </div>

        </div>

        {/* DATE */}

        <div className="flex items-center gap-2 xl:w-32">

          <CalendarDays
            size={15}
            className="text-slate-600"
          />

          <div>

            <p className="text-[9px] uppercase tracking-wider text-slate-700">
              Due
            </p>

            <p className="text-xs font-semibold text-slate-400">
              {formatDate(task.dueDate)}
            </p>

          </div>

        </div>

        {/* STATUS */}

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusClass}`}
        >
          {task.status}
        </span>

        {/* MENU */}

        <div className="relative">

          <button
            onClick={() =>
              setOpenMenu(
                openMenu === task._id
                  ? null
                  : task._id
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-600 hover:bg-white/10 hover:text-white"
          >
            <MoreHorizontal size={18} />
          </button>

          {openMenu === task._id && (
            <div className="absolute bottom-11 right-0 z-30 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">

              <button
                onClick={onOpen}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <ArrowRight size={15} />
                View Details
              </button>

              <div className="my-1 border-t border-white/10" />

              <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-slate-700">
                Change Status
              </p>

              {[
                'To Do',
                'In Progress',
                'Done',
              ].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    onStatusChange(
                      task,
                      status
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  {status}
                </button>
              ))}

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={() =>
                  onDelete(task._id)
                }
                className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
              >
                Delete Task
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Tasks;