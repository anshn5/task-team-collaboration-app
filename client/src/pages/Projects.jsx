import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FolderKanban,
  Plus,
  X,
  CalendarDays,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  Clock3,
  CheckCircle2,
  Layers3,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';

function Projects() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);

  const [projectName, setProjectName] = useState('');
  const [teamID, setTeamID] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [teamsResponse, projectsResponse] =
        await Promise.all([
          API.get('/teams', { headers }),
          API.get('/projects', { headers }),
        ]);

      setTeams(
        teamsResponse.data.teams || []
      );

      setProjects(
        projectsResponse.data.projects || []
      );
    } catch (error) {
      console.error(
        'Projects error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to load projects.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // CREATE PROJECT
  // =====================================================

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError(
        'Please enter a project name.'
      );
      return;
    }

    if (!teamID) {
      setError(
        'Please select a team.'
      );
      return;
    }

    if (!deadline) {
      setError(
        'Please select a deadline.'
      );
      return;
    }

    try {
      setCreating(true);
      setError('');

      const token =
        localStorage.getItem('token');

      await API.post(
        '/projects',
        {
          projectName:
            projectName.trim(),
          teamID,
          description:
            description.trim(),
          deadline,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      resetCreateForm();

      setShowCreateModal(false);

      setSuccess(
        'Project created successfully.'
      );

      await fetchData();

      hideSuccess();
    } catch (error) {
      console.error(
        'Create project error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to create project.'
      );
    } finally {
      setCreating(false);
    }
  };

  // =====================================================
  // UPDATE PROJECT
  // =====================================================

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!editingProject) {
      return;
    }

    if (!projectName.trim()) {
      setError(
        'Please enter a project name.'
      );
      return;
    }

    if (!deadline) {
      setError(
        'Please select a deadline.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');

      const token =
        localStorage.getItem('token');

      await API.put(
        `/projects/${editingProject._id}`,
        {
          projectName:
            projectName.trim(),
          description:
            description.trim(),
          deadline,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingProject(null);

      resetCreateForm();

      setSuccess(
        'Project updated successfully.'
      );

      await fetchData();

      hideSuccess();
    } catch (error) {
      console.error(
        'Update project error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to update project.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE PROJECT
  // =====================================================

  const handleDeleteProject = async (
    projectId
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this project?'
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(projectId);
      setError('');

      const token =
        localStorage.getItem('token');

      await API.delete(
        `/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        'Project deleted successfully.'
      );

      await fetchData();

      hideSuccess();
    } catch (error) {
      console.error(
        'Delete project error:',
        error
      );

      setError(
        error.response?.data?.message ||
          'Unable to delete project.'
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const resetCreateForm = () => {
    setProjectName('');
    setTeamID('');
    setDescription('');
    setDeadline('');
  };

  const hideSuccess = () => {
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const openCreateModal = () => {
    setError('');
    resetCreateForm();
    setEditingProject(null);
    setShowCreateModal(true);
  };

  const openEditModal = (project) => {
    setError('');

    setEditingProject(project);

    setProjectName(
      project.projectName || ''
    );

    setDescription(
      project.description || ''
    );

    setDeadline(
      project.deadline
        ? new Date(project.deadline)
            .toISOString()
            .split('T')[0]
        : ''
    );

    setTeamID(
      project.teamID?._id ||
        project.teamID ||
        ''
    );

    setShowCreateModal(true);
  };

  const closeModal = () => {
    if (creating || saving) {
      return;
    }

    setShowCreateModal(false);
    setEditingProject(null);
    resetCreateForm();
    setError('');
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredProjects =
    projects.filter((project) => {
      const text = `
        ${project.projectName || ''}
        ${project.description || ''}
        ${project.teamID?.teamName || ''}
      `.toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    });

  // =====================================================
  // PROJECT COLORS
  // =====================================================

  const getProjectStyle = (index) => {
    const styles = [
      {
        gradient:
          'from-blue-500/20 via-indigo-500/10 to-cyan-500/5',
        icon:
          'bg-blue-500/20 text-blue-300',
        glow:
          'hover:shadow-blue-500/10',
        line:
          'bg-blue-400',
      },
      {
        gradient:
          'from-purple-500/20 via-fuchsia-500/10 to-pink-500/5',
        icon:
          'bg-purple-500/20 text-purple-300',
        glow:
          'hover:shadow-purple-500/10',
        line:
          'bg-purple-400',
      },
      {
        gradient:
          'from-emerald-500/20 via-teal-500/10 to-cyan-500/5',
        icon:
          'bg-emerald-500/20 text-emerald-300',
        glow:
          'hover:shadow-emerald-500/10',
        line:
          'bg-emerald-400',
      },
      {
        gradient:
          'from-orange-500/20 via-amber-500/10 to-yellow-500/5',
        icon:
          'bg-orange-500/20 text-orange-300',
        glow:
          'hover:shadow-orange-500/10',
        line:
          'bg-orange-400',
      },
    ];

    return styles[
      index % styles.length
    ];
  };

  // =====================================================
  // DEADLINE STATUS
  // =====================================================

  const getDeadlineStatus = (
    deadline
  ) => {
    if (!deadline) {
      return {
        text: 'No deadline',
        className:
          'text-slate-500 bg-white/5',
      };
    }

    const today =
      new Date();

    const deadlineDate =
      new Date(deadline);

    today.setHours(
      0,
      0,
      0,
      0
    );

    deadlineDate.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      Math.ceil(
        (deadlineDate -
          today) /
          (1000 *
            60 *
            60 *
            24)
      );

    if (difference < 0) {
      return {
        text: 'Overdue',
        className:
          'bg-rose-500/10 text-rose-300',
      };
    }

    if (difference === 0) {
      return {
        text: 'Due today',
        className:
          'bg-amber-500/10 text-amber-300',
      };
    }

    if (difference <= 7) {
      return {
        text: `${difference}d left`,
        className:
          'bg-amber-500/10 text-amber-300',
      };
    }

    return {
      text: 'On track',
      className:
        'bg-emerald-500/10 text-emerald-300',
    };
  };

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

              <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

                <FolderKanban
                  size={27}
                  className="animate-pulse text-cyan-300"
                />

              </div>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Loading your projects...
            </p>

          </div>

        </div>

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

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/15 blur-[120px]" />

        <div
          className="absolute right-[-150px] top-[15%] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/15 blur-[120px]"
          style={{
            animationDelay:
              '1s',
          }}
        />

        <div
          className="absolute bottom-[-200px] left-[30%] h-[450px] w-[450px] animate-pulse rounded-full bg-cyan-500/10 blur-[120px]"
          style={{
            animationDelay:
              '2s',
          }}
        />

      </div>

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize:
            '45px 45px',
        }}
      />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="relative z-10 mx-auto max-w-[1600px] px-5 py-7 sm:px-8">

        {/* BACK */}

        <button
          onClick={() =>
            navigate('/dashboard')
          }
          className="group mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        >

          <ArrowLeft
            size={17}
            className="transition group-hover:-translate-x-1"
          />

          Dashboard

        </button>


        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-7 shadow-2xl shadow-blue-900/20 sm:p-10">

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />

          <div className="absolute bottom-[-100px] right-[20%] h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">

                <Sparkles
                  size={14}
                />

                PROJECT WORKSPACE

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Your Projects
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Plan, organize and track
                everything your team is
                building in one powerful
                workspace.
              </p>

            </div>


            <button
              onClick={
                openCreateModal
              }
              className="group flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-600 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >

              <Plus
                size={19}
                className="transition group-hover:rotate-90"
              />

              New Project

            </button>

          </div>

        </section>


        {/* =================================================
            MESSAGES
        ================================================= */}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">

            <CheckCircle2
              size={18}
            />

            {success}

          </div>
        )}

        {error && !showCreateModal && (
          <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
            {error}
          </div>
        )}


        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="mt-7">

          <div className="relative">

            <Search
              size={19}
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
              placeholder="Search projects, teams or descriptions..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 pl-12 pr-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/10"
            />

          </div>

        </section>


        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={
              <FolderKanban
                size={21}
              />
            }
            iconClass="text-blue-300"
            label="TOTAL"
            value={
              projects.length
            }
            description="Projects"
          />

          <StatCard
            icon={
              <Users
                size={21}
              />
            }
            iconClass="text-purple-300"
            label="ACTIVE"
            value={teams.length}
            description="Teams"
          />

          <StatCard
            icon={
              <Layers3
                size={21}
              />
            }
            iconClass="text-cyan-300"
            label="VISIBLE"
            value={
              filteredProjects.length
            }
            description="Matching projects"
          />

          <StatCard
            icon={
              <Clock3
                size={21}
              />
            }
            iconClass="text-amber-300"
            label="FOCUS"
            value={
              projects.length >
              0
                ? 'ON'
                : '—'
            }
            description="Project tracking"
          />

        </section>


        {/* =================================================
            PROJECT LIST
        ================================================= */}

        <section className="mt-9">

          <div className="mb-5 flex items-end justify-between">

            <div>

              <h2 className="text-xl font-bold">
                All Projects
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your team's current
                work
              </p>

            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
              {filteredProjects.length}{' '}
              projects
            </span>

          </div>


          {filteredProjects.length ===
          0 ? (

            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">

                <FolderKanban
                  size={30}
                  className="text-blue-300"
                />

              </div>

              <h3 className="mt-5 text-lg font-bold">
                No projects found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first project and start organizing your work.'}
              </p>

              {!search && (
                <button
                  onClick={
                    openCreateModal
                  }
                  className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  Create Project
                </button>
              )}

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredProjects.map(
                (
                  project,
                  index
                ) => {

                  const style =
                    getProjectStyle(
                      index
                    );

                  const deadlineStatus =
                    getDeadlineStatus(
                      project.deadline
                    );

                  return (
                    <ProjectCard
                      key={
                        project._id
                      }
                      project={
                        project
                      }
                      style={
                        style
                      }
                      deadlineStatus={
                        deadlineStatus
                      }
                      onOpen={() =>
                        navigate(
                          `/projects/${project._id}`
                        )
                      }
                      onEdit={() =>
                        openEditModal(
                          project
                        )
                      }
                      onDelete={() =>
                        handleDeleteProject(
                          project._id
                        )
                      }
                      deleting={
                        deleting ===
                        project._id
                      }
                    />
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>


      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">

          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-blue-900/30">

            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="relative">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">

                    {editingProject ? (
                      <Pencil
                        size={18}
                      />
                    ) : (
                      <FolderKanban
                        size={19}
                      />
                    )}

                  </div>

                  <div>

                    <h2 className="font-bold">
                      {editingProject
                        ? 'Edit Project'
                        : 'Create Project'}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {editingProject
                        ? 'Update project details'
                        : 'Start a new workspace'}
                    </p>

                  </div>

                </div>

                <button
                  onClick={
                    closeModal
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={19} />
                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={
                  editingProject
                    ? handleUpdateProject
                    : handleCreateProject
                }
                className="space-y-5 p-6"
              >

                {error && (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    {error}
                  </div>
                )}


                {/* NAME */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Project Name
                  </label>

                  <input
                    type="text"
                    value={
                      projectName
                    }
                    onChange={(e) =>
                      setProjectName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Website Redesign"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:bg-white/[0.07]"
                  />

                </div>


                {/* TEAM */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Team
                  </label>

                  <select
                    value={teamID}
                    onChange={(e) =>
                      setTeamID(
                        e.target.value
                      )
                    }
                    disabled={
                      !!editingProject
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <option value="">
                      Select a team
                    </option>

                    {teams.map(
                      (team) => (
                        <option
                          key={
                            team._id
                          }
                          value={
                            team._id
                          }
                        >
                          {
                            team.teamName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>


                {/* DEADLINE */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={
                      deadline
                    }
                    onChange={(e) =>
                      setDeadline(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/50 focus:bg-white/[0.07]"
                  />

                </div>


                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Description
                  </label>

                  <textarea
                    value={
                      description
                    }
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    rows="4"
                    placeholder="Describe what this project is about..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:bg-white/[0.07]"
                  />

                </div>


                {/* BUTTONS */}

                <div className="flex gap-3 pt-2">

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      creating ||
                      saving
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition hover:-translate-y-0.5 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {creating ||
                    saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        {editingProject
                          ? 'Saving...'
                          : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingProject ? (
                          <Save
                            size={17}
                          />
                        ) : (
                          <Plus
                            size={17}
                          />
                        )}

                        {editingProject
                          ? 'Save Changes'
                          : 'Create Project'}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  iconClass,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">

      <div className="flex items-center justify-between">

        <div className={iconClass}>
          {icon}
        </div>

        <span className="text-[10px] font-bold tracking-wider text-slate-600">
          {label}
        </span>

      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


// =========================================================
// PROJECT CARD
// =========================================================

function ProjectCard({
  project,
  style,
  deadlineStatus,
  onOpen,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${style.gradient} p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl ${style.glow}`}
    >

      {/* GLOW */}

      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-3xl transition duration-500 group-hover:scale-150" />


      {/* TOP */}

      <div className="relative flex items-start justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${style.icon}`}
        >
          <FolderKanban
            size={22}
          />
        </div>


        <div className="flex gap-1">

          <button
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-cyan-300"
            title="Edit project"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40"
            title="Delete project"
          >

            {deleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500/30 border-t-rose-300" />
            ) : (
              <Trash2 size={15} />
            )}

          </button>

        </div>

      </div>


      {/* PROJECT */}

      <div className="relative mt-6">

        <h3 className="truncate text-xl font-bold text-white">
          {project.projectName}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-6 text-slate-400">
          {project.description ||
            'No project description available.'}
        </p>

      </div>


      {/* TEAM */}

      <div className="relative mt-6 flex items-center gap-2">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">

          <Users
            size={15}
            className="text-slate-400"
          />

        </div>

        <div>

          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Team
          </p>

          <p className="max-w-[180px] truncate text-xs font-semibold text-slate-300">
            {project.teamID?.teamName ||
              'Unknown team'}
          </p>

        </div>

      </div>


      {/* DEADLINE */}

      <div className="relative mt-5 flex items-center justify-between border-t border-white/10 pt-4">

        <div className="flex items-center gap-2 text-xs text-slate-500">

          <CalendarDays
            size={14}
          />

          {project.deadline
            ? new Date(
                project.deadline
              ).toLocaleDateString(
                'en-GB'
              )
            : 'No deadline'}

        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${deadlineStatus.className}`}
        >
          {deadlineStatus.text}
        </span>

      </div>


      {/* OPEN */}

      <button
        onClick={onOpen}
        className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >

        Open Project

        <ArrowRight
          size={15}
          className="transition group-hover:translate-x-1"
        />

      </button>


      {/* BOTTOM LINE */}

      <div
        className={`absolute bottom-0 left-0 h-1 w-0 ${style.line} transition-all duration-500 group-hover:w-full`}
      />

    </div>
  );
}

export default Projects;