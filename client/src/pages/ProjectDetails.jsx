import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Search,
  Users,
  Circle,
  CircleDot,
  CircleCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] =
    useState(true);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // =====================================================
  // FETCH PROJECT + TASKS
  // =====================================================

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setTasksLoading(true);
      setError('');

      const token =
        localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const projectResponse =
        await API.get(
          `/projects/${id}`,
          { headers }
        );

      setProject(
        projectResponse.data.project
      );

      /*
       * Existing backend task endpoint returns
       * all tasks accessible to the logged-in user.
       *
       * We filter them below by projectID.
       */
      const tasksResponse =
        await API.get(
          '/tasks?limit=50',
          { headers }
        );

      const allTasks =
        tasksResponse.data.tasks || [];

      const projectTasks =
        allTasks.filter((task) => {
          const taskProjectId =
            typeof task.projectID ===
            'object'
              ? task.projectID?._id
              : task.projectID;

          return (
            taskProjectId === id
          );
        });

      setTasks(projectTasks);

    } catch (error) {
      console.error(
        'Project details error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to load project.'
      );
    } finally {
      setLoading(false);
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);


  // =====================================================
  // TASK SEARCH
  // =====================================================

  const filteredTasks =
    useMemo(() => {
      return tasks.filter((task) => {
        const text = `
          ${task.title || ''}
          ${task.description || ''}
          ${task.priority || ''}
          ${task.status || ''}
          ${task.assignedTo?.name || ''}
        `.toLowerCase();

        return text.includes(
          search.toLowerCase()
        );
      });
    }, [tasks, search]);


  // =====================================================
  // TASK STATS
  // =====================================================

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,

      todo: tasks.filter(
        (task) =>
          task.status === 'To Do'
      ).length,

      progress: tasks.filter(
        (task) =>
          task.status ===
          'In Progress'
      ).length,

      done: tasks.filter(
        (task) =>
          task.status === 'Done'
      ).length,
    };
  }, [tasks]);


  const completion =
    taskStats.total > 0
      ? Math.round(
          (taskStats.done /
            taskStats.total) *
            100
        )
      : 0;


  // =====================================================
  // DEADLINE
  // =====================================================

  const deadlineInfo = useMemo(() => {
    if (!project?.deadline) {
      return {
        text: 'No deadline',
        className:
          'text-slate-400 bg-white/5',
      };
    }

    const today =
      new Date();

    const deadline =
      new Date(project.deadline);

    today.setHours(
      0,
      0,
      0,
      0
    );

    deadline.setHours(
      0,
      0,
      0,
      0
    );

    const days = Math.ceil(
      (deadline - today) /
        (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
      return {
        text: 'Overdue',
        className:
          'bg-rose-500/10 text-rose-300',
      };
    }

    if (days === 0) {
      return {
        text: 'Due today',
        className:
          'bg-amber-500/10 text-amber-300',
      };
    }

    if (days <= 7) {
      return {
        text: `${days} day${
          days === 1 ? '' : 's'
        } left`,
        className:
          'bg-amber-500/10 text-amber-300',
      };
    }

    return {
      text: `${days} days left`,
      className:
        'bg-emerald-500/10 text-emerald-300',
    };
  }, [project]);


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

                <FolderKanban
                  size={28}
                  className="animate-pulse text-cyan-300"
                />

              </div>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Loading project...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (!project) {
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
            Project not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              'The project could not be loaded.'}
          </p>

          <button
            onClick={() =>
              navigate('/projects')
            }
            className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold"
          >
            Back to Projects
          </button>

        </main>

      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      <Navbar />

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />

        <div
          className="absolute right-[-150px] top-[10%] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/10 blur-[120px]"
          style={{
            animationDelay: '1s',
          }}
        />

        <div
          className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/10 blur-[120px]"
          style={{
            animationDelay: '2s',
          }}
        />

      </div>

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '45px 45px',
        }}
      />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="relative z-10 mx-auto max-w-[1600px] px-5 py-7 sm:px-8">

        {/* BACK */}

        <button
          onClick={() =>
            navigate('/projects')
          }
          className="group mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        >

          <ArrowLeft
            size={17}
            className="transition group-hover:-translate-x-1"
          />

          All Projects

        </button>


        {/* =================================================
            PROJECT HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-7 shadow-2xl shadow-blue-900/20 sm:p-10">

          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[45px] border-white/10" />

          <div className="absolute bottom-[-120px] right-[20%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="min-w-0">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">

                  <Sparkles
                    size={14}
                  />

                  PROJECT DETAILS

                </div>

                <h1 className="break-words text-4xl font-black tracking-tight sm:text-5xl">
                  {project.projectName}
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
                  {project.description ||
                    'No project description available.'}
                </p>

              </div>


              {/* COMPLETION */}

              <div className="shrink-0 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">

                <div className="flex items-center gap-5">

                  <div className="relative flex h-24 w-24 items-center justify-center">

                    <svg
                      className="h-24 w-24 -rotate-90"
                      viewBox="0 0 100 100"
                    >

                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-white/10"
                      />

                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="text-white transition-all duration-700"
                        strokeDasharray={
                          263.9
                        }
                        strokeDashoffset={
                          263.9 -
                          (263.9 *
                            completion) /
                            100
                        }
                      />

                    </svg>

                    <span className="absolute text-lg font-black">
                      {completion}%
                    </span>

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                      Completion
                    </p>

                    <p className="mt-1 text-sm text-white/80">
                      {taskStats.done}{' '}
                      of{' '}
                      {taskStats.total}{' '}
                      tasks done
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* META */}

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

              <MetaCard
                icon={
                  <Users
                    size={17}
                  />
                }
                label="Team"
                value={
                  project.teamID
                    ?.teamName ||
                  'Unknown team'
                }
              />

              <MetaCard
                icon={
                  <CalendarDays
                    size={17}
                  />
                }
                label="Deadline"
                value={
                  project.deadline
                    ? new Date(
                        project.deadline
                      ).toLocaleDateString(
                        'en-GB'
                      )
                    : 'No deadline'
                }
              />

              <MetaCard
                icon={
                  <Clock3
                    size={17}
                  />
                }
                label="Status"
                value={
                  deadlineInfo.text
                }
              />

            </div>

          </div>

        </section>


        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <ProjectStat
            icon={
              <ListTodo
                size={21}
              />
            }
            iconClass="text-blue-300"
            value={
              taskStats.total
            }
            label="Total Tasks"
          />

          <ProjectStat
            icon={
              <Circle
                size={21}
              />
            }
            iconClass="text-slate-400"
            value={
              taskStats.todo
            }
            label="To Do"
          />

          <ProjectStat
            icon={
              <CircleDot
                size={21}
              />
            }
            iconClass="text-amber-300"
            value={
              taskStats.progress
            }
            label="In Progress"
          />

          <ProjectStat
            icon={
              <CircleCheck
                size={21}
              />
            }
            iconClass="text-emerald-300"
            value={
              taskStats.done
            }
            label="Completed"
          />

        </section>


        {/* =================================================
            TASK SECTION
        ================================================= */}

        <section className="mt-9">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Project Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks currently associated
                with this project
              </p>

            </div>

            <button
              onClick={() =>
                navigate('/tasks')
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Manage Tasks

              <ArrowRight
                size={15}
              />
            </button>

          </div>


          {/* SEARCH */}

          <div className="relative mt-5">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search project tasks..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-11 pr-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-slate-600 focus:border-cyan-400/30"
            />

          </div>


          {/* TASKS */}

          <div className="mt-5">

            {tasksLoading ? (

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading tasks...
                </p>

              </div>

            ) : filteredTasks.length ===
              0 ? (

              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">

                  <ListTodo
                    size={28}
                    className="text-slate-600"
                  />

                </div>

                <h3 className="mt-5 text-lg font-bold">
                  No tasks found
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {search
                    ? 'Try another search term.'
                    : 'This project does not have any tasks yet.'}
                </p>

                <button
                  onClick={() =>
                    navigate('/tasks')
                  }
                  className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold"
                >
                  Go to Tasks
                </button>

              </div>

            ) : (

              <div className="space-y-3">

                {filteredTasks.map(
                  (task) => (
                    <TaskRow
                      key={
                        task._id
                      }
                      task={
                        task
                      }
                      onOpen={() =>
                        navigate(
                          `/tasks/${task._id}`
                        )
                      }
                    />
                  )
                )}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}


// =========================================================
// META CARD
// =========================================================

function MetaCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
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


// =========================================================
// PROJECT STAT
// =========================================================

function ProjectStat({
  icon,
  iconClass,
  value,
  label,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.06]">

      <div className={iconClass}>
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>

    </div>
  );
}


// =========================================================
// TASK ROW
// =========================================================

function TaskRow({
  task,
  onOpen,
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
      : task.status ===
          'In Progress'
        ? 'bg-blue-500/10 text-blue-300'
        : 'bg-white/5 text-slate-400';

  return (
    <button
      onClick={onOpen}
      className="group flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] sm:flex-row sm:items-center"
    >

      {/* ICON */}

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">

        {task.status ===
        'Done' ? (
          <CheckCircle2
            size={20}
          />
        ) : (
          <ListTodo
            size={20}
          />
        )}

      </div>


      {/* CONTENT */}

      <div className="min-w-0 flex-1">

        <h3 className="truncate text-sm font-bold text-white">
          {task.title}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs text-slate-600">
          {task.description ||
            'No description'}
        </p>

      </div>


      {/* ASSIGNEE */}

      <div className="flex items-center gap-2 sm:w-40">

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-bold text-white">
          {task.assignedTo?.name
            ?.charAt(0)
            ?.toUpperCase() ||
            '?'}
        </div>

        <span className="max-w-[100px] truncate text-xs text-slate-500">
          {task.assignedTo
            ?.name ||
            'Unassigned'}
        </span>

      </div>


      {/* BADGES */}

      <div className="flex items-center gap-2">

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${priorityClass}`}
        >
          {task.priority ||
            'Medium'}
        </span>

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${statusClass}`}
        >
          {task.status}
        </span>

      </div>


      {/* ARROW */}

      <ArrowRight
        size={17}
        className="shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300"
      />

    </button>
  );
}

export default ProjectDetails;