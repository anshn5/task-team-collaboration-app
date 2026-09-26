import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  CheckCircle2,
  CircleDot,
  Clock3,
  CalendarDays,
  User,
  ArrowLeft,
  LayoutDashboard,
  Flag,
  GripVertical,
  SlidersHorizontal,
} from 'lucide-react';

import API from '../api';

const columns = [
  {
    id: 'To Do',
    title: 'To Do',
    subtitle: 'Ready to start',
    icon: CircleDot,
    header:
      'border-slate-400/20 bg-slate-500/10',
    iconBg:
      'bg-slate-500/15 text-slate-300',
    accent: 'bg-slate-400',
    glow: 'shadow-slate-500/5',
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    subtitle: 'Currently working',
    icon: Clock3,
    header:
      'border-blue-400/20 bg-blue-500/10',
    iconBg:
      'bg-blue-500/15 text-blue-300',
    accent: 'bg-blue-400',
    glow: 'shadow-blue-500/10',
  },
  {
    id: 'Done',
    title: 'Done',
    subtitle: 'Completed work',
    icon: CheckCircle2,
    header:
      'border-emerald-400/20 bg-emerald-500/10',
    iconBg:
      'bg-emerald-500/15 text-emerald-300',
    accent: 'bg-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
];

// --------------------------------------------------
// TASK CARD
// --------------------------------------------------

function TaskCard({
  task,
  onClick,
  isOverlay = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(
      transform
    ),
    transition,
  };

  const getPriority = () => {
    if (task.priority === 'High') {
      return {
        color: 'text-rose-300',
        bg:
          'bg-rose-500/10 border-rose-400/20',
      };
    }

    if (task.priority === 'Medium') {
      return {
        color: 'text-amber-300',
        bg:
          'bg-amber-500/10 border-amber-400/20',
      };
    }

    return {
      color: 'text-emerald-300',
      bg:
        'bg-emerald-500/10 border-emerald-400/20',
    };
  };

  const priority = getPriority();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative mb-3 cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900 active:cursor-grabbing ${
        isDragging
          ? 'opacity-30'
          : ''
      } ${
        isOverlay
          ? 'rotate-2 shadow-2xl shadow-blue-500/20'
          : ''
      }`}
    >
      {/* Top glow */}

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition group-hover:bg-blue-500/10" />

      <div className="relative">

        {/* HEADER */}

        <div className="flex items-start gap-3">

          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-600 transition group-hover:text-slate-300">

            <GripVertical size={15} />

          </div>

          <div className="min-w-0 flex-1">

            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-white transition group-hover:text-cyan-300">
              {task.title}
            </h3>

            <p className="mt-1 truncate text-[10px] text-slate-600">
              {task.projectID?.projectName ||
                'No project'}
            </p>

          </div>

        </div>

        {/* DESCRIPTION */}

        {task.description && (
          <p className="mt-4 line-clamp-2 text-xs leading-5 text-slate-500">
            {task.description}
          </p>
        )}

        {/* TAGS */}

        <div className="mt-4 flex flex-wrap gap-2">

          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${priority.bg} ${priority.color}`}
          >

            <Flag size={10} />

            {task.priority}

          </span>

          {task.dueDate && (
            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-medium text-slate-500">

              <CalendarDays size={10} />

              {new Date(
                task.dueDate
              ).toLocaleDateString(
                undefined,
                {
                  day: 'numeric',
                  month: 'short',
                }
              )}

            </span>
          )}

        </div>

        {/* FOOTER */}

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">

              <User
                size={12}
                className="text-slate-400"
              />

            </div>

            <span className="truncate text-[10px] font-semibold text-slate-500">
              {task.assignedTo?.name ||
                'Unassigned'}
            </span>

          </div>

          <span className="text-[9px] font-medium text-slate-700">
            Click to open
          </span>

        </div>

      </div>

      {/* Bottom line */}

      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-hover:w-full" />

    </div>
  );
}

// --------------------------------------------------
// COLUMN
// --------------------------------------------------

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
}) {
  const { setNodeRef, isOver } =
    useDroppable({
      id: column.id,
    });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[560px] flex-col rounded-3xl border border-white/10 bg-white/[0.025] p-3 transition duration-300 ${
        isOver
          ? `border-white/20 bg-white/[0.05] shadow-2xl ${column.glow}`
          : ''
      }`}
    >

      {/* COLUMN HEADER */}

      <div
        className={`mb-3 rounded-2xl border p-4 ${column.header}`}
      >

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${column.iconBg}`}
            >

              <Icon size={19} />

            </div>

            <div>

              <h2 className="text-sm font-bold text-white">
                {column.title}
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500">
                {column.subtitle}
              </p>

            </div>

          </div>

          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/10 px-2 text-xs font-bold text-slate-300">
            {tasks.length}
          </span>

        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/20">

          <div
            className={`h-full rounded-full ${column.accent}`}
            style={{
              width:
                tasks.length > 0
                  ? '100%'
                  : '0%',
              opacity: 0.65,
            }}
          />

        </div>

      </div>

      {/* TASKS */}

      <div className="flex-1">

        <SortableContext
          items={tasks.map(
            (task) => task._id
          )}
          strategy={
            verticalListSortingStrategy
          }
        >

          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() =>
                onTaskClick(task._id)
              }
            />
          ))}

        </SortableContext>

        {tasks.length === 0 && (
          <div
            className={`flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed transition ${
              isOver
                ? 'border-cyan-400/30 bg-cyan-400/5'
                : 'border-white/5 bg-white/[0.015]'
            }`}
          >

            <div className="text-center">

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">

                <Icon
                  size={18}
                  className="text-slate-600"
                />

              </div>

              <p className="mt-3 text-[10px] font-medium text-slate-600">
                Drop tasks here
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

// --------------------------------------------------
// MAIN BOARD
// --------------------------------------------------

function KanbanBoard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] =
    useState('');

  const [activeTask, setActiveTask] =
    useState(null);

  const [movingTask, setMovingTask] =
    useState(false);

  // --------------------------------------------------
  // FETCH
  // --------------------------------------------------

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('token');

      const response = await API.get(
        '/tasks?limit=50',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(
        response.data.tasks || []
      );
    } catch (error) {
      console.error(
        'Kanban error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to load the Kanban board.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredTasks = useMemo(() => {
    if (!search.trim()) {
      return tasks;
    }

    const value =
      search.toLowerCase();

    return tasks.filter((task) => {

      const text = `
        ${task.title || ''}
        ${task.description || ''}
        ${task.projectID?.projectName || ''}
        ${task.assignedTo?.name || ''}
        ${task.priority || ''}
      `.toLowerCase();

      return text.includes(value);
    });
  }, [tasks, search]);

  // --------------------------------------------------
  // FIND TASK
  // --------------------------------------------------

  const findTask = (taskId) =>
    tasks.find(
      (task) => task._id === taskId
    );

  // --------------------------------------------------
  // DRAG START
  // --------------------------------------------------

  const handleDragStart = (event) => {
    const task = findTask(
      event.active.id
    );

    setActiveTask(task || null);
  };

  // --------------------------------------------------
  // DRAG END
  // --------------------------------------------------

  const handleDragEnd = async (event) => {
    setActiveTask(null);

    const {
      active,
      over,
    } = event;

    if (!over) {
      return;
    }

    const task = findTask(
      active.id
    );

    if (!task) {
      return;
    }

    let newStatus = over.id;

    const targetTask = findTask(
      over.id
    );

    if (targetTask) {
      newStatus = targetTask.status;
    }

    const validStatus =
      columns.some(
        (column) =>
          column.id === newStatus
      );

    if (!validStatus) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    const oldStatus = task.status;

    // Optimistic update

    setTasks((current) =>
      current.map((item) =>
        item._id === task._id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    setMovingTask(true);
    setError('');

    try {
      const token =
        localStorage.getItem('token');

      await API.put(
        `/tasks/${task._id}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to update task status.'
      );

      // Rollback

      setTasks((current) =>
        current.map((item) =>
          item._id === task._id
            ? {
                ...item,
                status: oldStatus,
              }
            : item
        )
      );
    } finally {
      setMovingTask(false);
    }
  };

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const todoCount =
    filteredTasks.filter(
      (task) =>
        task.status === 'To Do'
    ).length;

  const progressCount =
    filteredTasks.filter(
      (task) =>
        task.status === 'In Progress'
    ).length;

  const doneCount =
    filteredTasks.filter(
      (task) =>
        task.status === 'Done'
    ).length;

  const totalCount =
    filteredTasks.length;

  const completion =
    totalCount > 0
      ? Math.round(
          (doneCount / totalCount) * 100
        )
      : 0;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="text-center">

          <div className="relative mx-auto h-16 w-16">

            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/20" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

              <LayoutDashboard
                size={27}
                className="animate-pulse text-purple-300"
              />

            </div>

          </div>

          <p className="mt-5 text-sm text-slate-400">
            Building your Kanban board...
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/15 blur-[120px]" />

        <div
          className="absolute right-[-150px] top-[15%] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/15 blur-[120px]"
          style={{
            animationDelay: '1s',
          }}
        />

        <div
          className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/10 blur-[120px]"
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

      <main className="relative z-10 mx-auto max-w-[1600px] px-5 py-7 sm:px-8">

        {/* ================================================= */}
        {/* TOP */}
        {/* ================================================= */}

        <div className="mb-6 flex items-center justify-between">

          <button
            onClick={() =>
              navigate('/dashboard')
            }
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
          >

            <ArrowLeft
              size={17}
              className="transition group-hover:-translate-x-1"
            />

            Dashboard

          </button>

          <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">

            <Sparkles
              size={14}
              className="text-cyan-300"
            />

            TEAM WORKSPACE

          </div>

        </div>

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-7 shadow-2xl shadow-blue-900/20 sm:p-9">

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />

          <div className="absolute bottom-[-100px] right-[25%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">

                <Sparkles size={14} />

                KANBAN WORKSPACE

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Team Board
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Visualize your workflow, move tasks
                between stages and keep your team
                moving forward.
              </p>

            </div>

            {/* PROGRESS */}

            <div className="flex items-center gap-5 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">

              <div className="relative h-20 w-20">

                <svg
                  className="h-20 w-20 -rotate-90"
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
                    className="text-white transition-all duration-1000"
                    strokeDasharray="264"
                    strokeDashoffset={
                      264 -
                      (264 * completion) /
                        100
                    }
                  />

                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-sm font-black">
                  {completion}%
                </div>

              </div>

              <div>

                <p className="text-xs text-blue-100">
                  Completion
                </p>

                <p className="mt-1 text-lg font-black">
                  {doneCount}/{totalCount}
                </p>

                <p className="text-[10px] text-blue-100/60">
                  Tasks completed
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

          <SummaryCard
            label="Total Tasks"
            value={totalCount}
            icon={<LayoutDashboard size={18} />}
            iconClass="text-cyan-300"
          />

          <SummaryCard
            label="To Do"
            value={todoCount}
            icon={<CircleDot size={18} />}
            iconClass="text-slate-300"
          />

          <SummaryCard
            label="In Progress"
            value={progressCount}
            icon={<Clock3 size={18} />}
            iconClass="text-blue-300"
          />

          <SummaryCard
            label="Completed"
            value={doneCount}
            icon={<CheckCircle2 size={18} />}
            iconClass="text-emerald-300"
          />

        </section>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search tasks, projects, assignees or priorities..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/30 focus:bg-white/[0.07]"
              />

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">

              <SlidersHorizontal
                size={16}
              />

              <span>
                Drag cards to update status
              </span>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* MOVING */}

        {movingTask && (
          <div className="mt-4 flex items-center gap-2 text-xs text-cyan-300">

            <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />

            Updating task status...

          </div>
        )}

        {/* ================================================= */}
        {/* BOARD */}
        {/* ================================================= */}

        <section className="mt-7">

          <DndContext
            collisionDetection={
              closestCorners
            }
            onDragStart={
              handleDragStart
            }
            onDragEnd={
              handleDragEnd
            }
          >

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

              {columns.map((column) => (

                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasks.filter(
                    (task) =>
                      task.status ===
                      column.id
                  )}
                  onTaskClick={(taskId) =>
                    navigate(
                      `/tasks/${taskId}`
                    )
                  }
                />

              ))}

            </div>

            {/* DRAG OVERLAY */}

            <DragOverlay>

              {activeTask ? (
                <div className="w-[320px]">

                  <TaskCard
                    task={activeTask}
                    isOverlay
                  />

                </div>
              ) : null}

            </DragOverlay>

          </DndContext>

        </section>

      </main>

    </div>
  );
}

// --------------------------------------------------
// SUMMARY CARD
// --------------------------------------------------

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-700">
          BOARD
        </span>

      </div>

      <p className="mt-4 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>

    </div>
  );
}

export default KanbanBoard;