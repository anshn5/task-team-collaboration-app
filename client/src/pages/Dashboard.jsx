import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderKanban,
  ListTodo,
  Plus,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';


// ======================================================
// DASHBOARD
// ======================================================

function Dashboard() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // ======================================================
  // FETCH DASHBOARD DATA
  // ======================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        teamsResponse,
        projectsResponse,
        tasksResponse,
      ] = await Promise.all([
        API.get('/teams', { headers }),
        API.get('/projects', { headers }),
        API.get('/tasks?limit=50', {
          headers,
        }),
      ]);

      setTeams(
        teamsResponse.data.teams || []
      );

      setProjects(
        projectsResponse.data.projects || []
      );

      setTasks(
        tasksResponse.data.tasks || []
      );

    } catch (error) {
      console.error(
        'Dashboard error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);


  // ======================================================
  // TASK COUNTS
  // ======================================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === 'Done'
  ).length;

  const inProgressTasks = tasks.filter(
    (task) =>
      task.status === 'In Progress'
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === 'To Do'
  ).length;


  // ======================================================
  // COMPLETION
  // ======================================================

  const completionPercentage =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) *
            100
        )
      : 0;


  // ======================================================
  // RECENT TASKS
  // ======================================================

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [tasks]);


  // ======================================================
  // STATUS HELPERS
  // ======================================================

  const getStatusStyle = (status) => {
    if (status === 'Done') {
      return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300';
    }

    if (status === 'In Progress') {
      return 'border-blue-400/20 bg-blue-500/10 text-blue-300';
    }

    return 'border-slate-400/20 bg-slate-500/10 text-slate-300';
  };


  const getPriorityStyle = (priority) => {
    if (priority === 'High') {
      return 'border-rose-400/20 bg-rose-500/10 text-rose-300';
    }

    if (priority === 'Medium') {
      return 'border-amber-400/20 bg-amber-500/10 text-amber-300';
    }

    return 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300';
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-950">

          <div className="text-center">

            <div className="relative mx-auto h-16 w-16">

              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

                <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

              </div>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Loading your workspace...
            </p>

          </div>

        </div>
      </>
    );
  }


  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <Navbar />


      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="relative overflow-hidden">

        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />

          <div
            className="absolute right-[-150px] top-[15%] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/10 blur-[120px]"
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


        {/* GRID */}

        <div
          className="pointer-events-none fixed inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />


        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="relative z-10 mx-auto max-w-[1600px] px-5 py-7 sm:px-8">


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
              {error}
            </div>
          )}


          {/* ==================================================
              HERO
          ================================================== */}

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-7 shadow-2xl shadow-blue-900/20 sm:p-10">

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />

            <div className="absolute bottom-[-100px] right-[20%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">

                  <Sparkles size={14} />

                  TEAM WORKSPACE

                </div>


                <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">

                  Welcome to your
                  <span className="block text-cyan-100">
                    productivity hub.
                  </span>

                </h1>


                <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">

                  Manage your teams, organize projects,
                  track tasks and keep your entire
                  workflow moving forward.

                </p>


                {/* HERO BUTTONS */}

                <div className="mt-7 flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      navigate('/tasks')
                    }
                    className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >

                    <Plus size={17} />

                    Create Task

                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />

                  </button>


                  <button
                    onClick={() =>
                      navigate('/kanban')
                    }
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:bg-white/20"
                  >

                    <FolderKanban size={17} />

                    Open Kanban

                  </button>

                </div>

              </div>


              {/* COMPLETION ORB */}

              <div className="flex shrink-0 justify-center lg:pr-8">

                <div className="relative flex h-44 w-44 items-center justify-center">

                  <div className="absolute inset-0 animate-pulse rounded-full bg-white/10 blur-2xl" />

                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-xl">

                    <div className="text-center">

                      <p className="text-4xl font-black">
                        {completionPercentage}%
                      </p>

                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-100">
                        Completed
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              STATS
          ================================================== */}

          <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

            <DashboardStat
              title="Teams"
              value={teams.length}
              subtitle="Your teams"
              icon={<Users size={19} />}
              iconClass="text-cyan-300"
            />

            <DashboardStat
              title="Projects"
              value={projects.length}
              subtitle="Active projects"
              icon={<FolderKanban size={19} />}
              iconClass="text-purple-300"
            />

            <DashboardStat
              title="Total Tasks"
              value={totalTasks}
              subtitle="Across projects"
              icon={<ListTodo size={19} />}
              iconClass="text-blue-300"
            />

            <DashboardStat
              title="Completed"
              value={completedTasks}
              subtitle={`${completionPercentage}% completion`}
              icon={<CheckCircle2 size={19} />}
              iconClass="text-emerald-300"
            />

          </section>


          {/* ==================================================
              TWO COLUMN AREA
          ================================================== */}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">


            {/* ==================================================
                RECENT TASKS
            ================================================== */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <ListTodo
                      size={18}
                      className="text-cyan-300"
                    />

                    <h2 className="text-lg font-bold">
                      Recent Tasks
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    Latest work across your workspace
                  </p>

                </div>


                <button
                  onClick={() =>
                    navigate('/tasks')
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
                >
                  View all
                  <ArrowRight size={13} />
                </button>

              </div>


              <div className="mt-5 space-y-3">

                {recentTasks.length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">

                    <ListTodo
                      size={28}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      No tasks yet
                    </p>

                    <button
                      onClick={() =>
                        navigate('/tasks')
                      }
                      className="mt-3 text-xs font-semibold text-cyan-300"
                    >
                      Create your first task
                    </button>

                  </div>

                ) : (

                  recentTasks.map((task) => (

                    <button
                      key={task._id}
                      onClick={() =>
                        navigate(
                          `/tasks/${task._id}`
                        )
                      }
                      className="group flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.05]"
                    >

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">

                        {task.status ===
                        'Done' ? (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-300"
                          />
                        ) : task.status ===
                          'In Progress' ? (
                          <Clock3
                            size={18}
                            className="text-blue-300"
                          />
                        ) : (
                          <CircleDot
                            size={18}
                            className="text-slate-400"
                          />
                        )}

                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-bold text-white transition group-hover:text-cyan-300">
                          {task.title}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-600">
                          {task.projectID?.projectName ||
                            'No project'}
                        </p>

                      </div>


                      <div className="hidden items-center gap-2 sm:flex">

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>

                      </div>

                      <ArrowRight
                        size={15}
                        className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300"
                      />

                    </button>

                  ))

                )}

              </div>

            </div>


            {/* ==================================================
                PRODUCTIVITY
            ================================================== */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">

              <div className="flex items-center gap-2">

                <Target
                  size={18}
                  className="text-purple-300"
                />

                <h2 className="text-lg font-bold">
                  Productivity
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-600">
                Your current task distribution
              </p>


              {/* PROGRESS */}

              <div className="mt-7">

                <div className="mb-2 flex justify-between text-xs">

                  <span className="text-slate-500">
                    Overall completion
                  </span>

                  <span className="font-bold text-white">
                    {completionPercentage}%
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-1000"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />

                </div>

              </div>


              {/* TASK DISTRIBUTION */}

              <div className="mt-7 space-y-4">

                <ProgressRow
                  label="To Do"
                  value={todoTasks}
                  total={totalTasks}
                  icon={<CircleDot size={15} />}
                  iconClass="text-slate-400"
                />

                <ProgressRow
                  label="In Progress"
                  value={inProgressTasks}
                  total={totalTasks}
                  icon={<Clock3 size={15} />}
                  iconClass="text-blue-300"
                />

                <ProgressRow
                  label="Completed"
                  value={completedTasks}
                  total={totalTasks}
                  icon={<CheckCircle2 size={15} />}
                  iconClass="text-emerald-300"
                />

              </div>


              {/* KANBAN BUTTON */}

              <button
                onClick={() =>
                  navigate('/kanban')
                }
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >

                <FolderKanban size={15} />

                View Kanban Board

                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-1"
                />

              </button>

            </div>

          </section>


          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="mt-6">

            <div className="mb-4 flex items-center gap-2">

              <Zap
                size={18}
                className="text-amber-300"
              />

              <h2 className="text-lg font-bold">
                Quick Actions
              </h2>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <QuickAction
                title="Manage Teams"
                subtitle="Create and manage teams"
                icon={<Users size={20} />}
                iconClass="text-cyan-300"
                onClick={() =>
                  navigate('/teams')
                }
              />

              <QuickAction
                title="Projects"
                subtitle="View your projects"
                icon={<FolderKanban size={20} />}
                iconClass="text-purple-300"
                onClick={() =>
                  navigate('/projects')
                }
              />

              <QuickAction
                title="Tasks"
                subtitle="Manage all tasks"
                icon={<ListTodo size={20} />}
                iconClass="text-blue-300"
                onClick={() =>
                  navigate('/tasks')
                }
              />

              <QuickAction
                title="Kanban Board"
                subtitle="Drag and organize"
                icon={<LayoutIcon />}
                iconClass="text-emerald-300"
                onClick={() =>
                  navigate('/kanban')
                }
              />

            </div>

          </section>


          {/* FOOTER */}

          <div className="mt-10 border-t border-white/5 py-6 text-center">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
              Task & Team Collaboration Management System
            </p>

          </div>

        </main>

      </div>

    </div>
  );
}


// ======================================================
// STAT CARD
// ======================================================

function DashboardStat({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700">
          LIVE
        </span>

      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-300">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-600">
        {subtitle}
      </p>

    </div>
  );
}


// ======================================================
// PROGRESS ROW
// ======================================================

function ProgressRow({
  label,
  value,
  total,
  icon,
  iconClass,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span className={iconClass}>
            {icon}
          </span>

          <span className="text-xs font-medium text-slate-400">
            {label}
          </span>

        </div>

        <span className="text-xs font-bold text-slate-300">
          {value}
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-white/20 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  title,
  subtitle,
  icon,
  iconClass,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
    >

      <div className="flex items-center justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${iconClass}`}
        >
          {icon}
        </div>

        <ArrowRight
          size={16}
          className="text-slate-700 transition group-hover:translate-x-1 group-hover:text-white"
        />

      </div>

      <h3 className="mt-5 text-sm font-bold text-white">
        {title}
      </h3>

      <p className="mt-1 text-[10px] text-slate-600">
        {subtitle}
      </p>

    </button>
  );
}


// ======================================================
// SIMPLE LAYOUT ICON
// ======================================================

function LayoutIcon() {
  return (
    <div className="flex items-center gap-1">

      <span className="h-4 w-1.5 rounded-sm bg-current" />

      <span className="h-5 w-1.5 rounded-sm bg-current" />

      <span className="h-3 w-1.5 rounded-sm bg-current" />

    </div>
  );
}


export default Dashboard;