import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  Plus,
  Search,
  UserPlus,
  Trash2,
  Pencil,
  X,
  Check,
  Mail,
  Crown,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  UserMinus,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';

function Teams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedTeam, setSelectedTeam] =
    useState(null);

  const [showMembersModal, setShowMembersModal] =
    useState(false);

  const [editingTeam, setEditingTeam] =
    useState(null);

  const [editTeamName, setEditTeamName] =
    useState('');

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [deletingTeam, setDeletingTeam] =
    useState(null);

  const [newMemberId, setNewMemberId] =
    useState('');

  const [addingMember, setAddingMember] =
    useState(false);

  const [removingMember, setRemovingMember] =
    useState(null);


  // =====================================================
  // FETCH TEAMS
  // =====================================================

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('token');

      const response = await API.get(
        '/teams',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeams(
        response.data.teams || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to load teams.'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTeams();
  }, []);


  // =====================================================
  // CREATE TEAM
  // =====================================================

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError(
        'Please enter a team name.'
      );
      return;
    }

    try {
      setCreating(true);
      setError('');
      setSuccess('');

      const token =
        localStorage.getItem('token');

      await API.post(
        '/teams',
        {
          teamName: teamName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeamName('');
      setShowCreateModal(false);

      setSuccess(
        'Team created successfully.'
      );

      await fetchTeams();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to create team.'
      );
    } finally {
      setCreating(false);
    }
  };


  // =====================================================
  // UPDATE TEAM
  // =====================================================

  const handleUpdateTeam = async (e) => {
    e.preventDefault();

    if (!editTeamName.trim()) {
      setError(
        'Please enter a team name.'
      );
      return;
    }

    try {
      setSavingEdit(true);
      setError('');

      const token =
        localStorage.getItem('token');

      await API.put(
        `/teams/${editingTeam._id}`,
        {
          teamName:
            editTeamName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingTeam(null);
      setEditTeamName('');

      setSuccess(
        'Team updated successfully.'
      );

      await fetchTeams();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to update team.'
      );
    } finally {
      setSavingEdit(false);
    }
  };


  // =====================================================
  // DELETE TEAM
  // =====================================================

  const handleDeleteTeam = async (
    teamId
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this team?'
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTeam(teamId);
      setError('');

      const token =
        localStorage.getItem('token');

      await API.delete(
        `/teams/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        'Team deleted successfully.'
      );

      await fetchTeams();

      if (
        selectedTeam?._id === teamId
      ) {
        setSelectedTeam(null);
        setShowMembersModal(false);
      }

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to delete team.'
      );
    } finally {
      setDeletingTeam(null);
    }
  };


  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (
    e
  ) => {
    e.preventDefault();

    if (!newMemberId.trim()) {
      setError(
        'Please enter a user ID.'
      );
      return;
    }

    try {
      setAddingMember(true);
      setError('');

      const token =
        localStorage.getItem('token');

      const response =
        await API.post(
          `/teams/${selectedTeam._id}/members`,
          {
            userId:
              newMemberId.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setSelectedTeam(
        response.data.team
      );

      setNewMemberId('');

      setSuccess(
        'Member added successfully.'
      );

      await fetchTeams();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to add member.'
      );
    } finally {
      setAddingMember(false);
    }
  };


  // =====================================================
  // REMOVE MEMBER
  // =====================================================

  const handleRemoveMember = async (
    userId
  ) => {
    const confirmed =
      window.confirm(
        'Remove this member from the team?'
      );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingMember(userId);
      setError('');

      const token =
        localStorage.getItem('token');

      const response =
        await API.delete(
          `/teams/${selectedTeam._id}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: {
              userId,
            },
          }
        );

      setSelectedTeam(
        response.data.team
      );

      setSuccess(
        'Member removed successfully.'
      );

      await fetchTeams();

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to remove member.'
      );
    } finally {
      setRemovingMember(null);
    }
  };


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTeams =
    teams.filter((team) =>
      team.teamName
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  // =====================================================
  // OPEN MEMBERS
  // =====================================================

  const openMembers = (team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
    setError('');
  };


  // =====================================================
  // EDIT
  // =====================================================

  const openEdit = (team) => {
    setEditingTeam(team);
    setEditTeamName(
      team.teamName || ''
    );
    setError('');
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-950">

          <div className="text-center">

            <div className="relative mx-auto h-16 w-16">

              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

                <Users
                  size={25}
                  className="animate-pulse text-cyan-300"
                />

              </div>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Loading your teams...
            </p>

          </div>

        </div>
      </>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <div className="relative overflow-hidden">

        {/* BACKGROUND */}

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


        {/* GRID */}

        <div
          className="pointer-events-none fixed inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />


        {/* MAIN */}

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


          {/* HERO */}

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-500/10 p-7 sm:p-9">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-300">

                  <Sparkles size={12} />

                  Collaboration Workspace

                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Teams
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Create teams, manage members, and collaborate on projects in one workspace.
                </p>

              </div>


              <button
                onClick={() =>
                  setShowCreateModal(true)
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/10 transition hover:-translate-y-0.5"
              >

                <Plus size={18} />

                Create Team

              </button>

            </div>

          </section>


          {/* SEARCH */}

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-4">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search your teams..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/30 focus:bg-white/[0.07]"
              />

            </div>

          </div>


          {/* PAGE ERROR */}

          {error &&
            !editingTeam &&
            !showMembersModal && (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                {error}
              </div>
            )}


          {/* SUCCESS */}

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
              {success}
            </div>
          )}


          {/* TEAM GRID */}

          <section className="mt-7">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Your Teams
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  {filteredTeams.length}{' '}
                  team
                  {filteredTeams.length !==
                  1
                    ? 's'
                    : ''}{' '}
                  available
                </p>

              </div>

            </div>


            {filteredTeams.length ===
            0 ? (

              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-12 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">

                  <Users
                    size={28}
                    className="text-slate-600"
                  />

                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {search
                    ? 'No teams found'
                    : 'No teams yet'}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">

                  {search
                    ? 'Try a different search term.'
                    : 'Create your first team and start collaborating.'}

                </p>

                {!search && (
                  <button
                    onClick={() =>
                      setShowCreateModal(
                        true
                      )
                    }
                    className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  >
                    Create Team
                  </button>
                )}

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                {filteredTeams.map(
                  (team) => (
                    <TeamCard
                      key={team._id}
                      team={team}
                      onMembers={() =>
                        openMembers(
                          team
                        )
                      }
                      onEdit={() =>
                        openEdit(team)
                      }
                      onDelete={() =>
                        handleDeleteTeam(
                          team._id
                        )
                      }
                      deleting={
                        deletingTeam ===
                        team._id
                      }
                    />
                  )
                )}

              </div>

            )}

          </section>

        </main>

      </div>


      {/* =====================================================
          CREATE TEAM MODAL
      ===================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Create New Team
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Start a new collaborative workspace.
                </p>

              </div>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={handleCreateTeam}
              className="mt-6"
            >

              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Team Name
              </label>

              <input
                autoFocus
                type="text"
                value={teamName}
                onChange={(e) =>
                  setTeamName(
                    e.target.value
                  )
                }
                placeholder="e.g. Development Team"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
              />

              {error && showCreateModal && (
                <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {creating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create Team
                  </>
                )}

              </button>

            </form>

          </div>

        </div>
      )}


      {/* =====================================================
          MEMBERS MODAL
      ===================================================== */}

      {showMembersModal &&
        selectedTeam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    {selectedTeam.teamName}
                  </h2>

                  <p className="mt-1 text-xs text-slate-600">
                    {selectedTeam.members?.length ||
                      0}{' '}
                    team members
                  </p>

                </div>

                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setError('');
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>

              </div>


              {/* MEMBERS POPUP ERROR */}

              {error && showMembersModal && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">

                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />

                  <span>
                    {error}
                  </span>

                </div>
              )}


              {/* ADD MEMBER */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                <div className="mb-3 flex items-center gap-2">

                  <UserPlus
                    size={16}
                    className="text-cyan-300"
                  />

                  <h3 className="text-sm font-bold">
                    Add Member
                  </h3>

                </div>

                <form
                  onSubmit={
                    handleAddMember
                  }
                  className="flex flex-col gap-3 sm:flex-row"
                >

                  <input
                    type="text"
                    value={newMemberId}
                    onChange={(e) =>
                      setNewMemberId(
                        e.target.value
                      )
                    }
                    placeholder="Enter User ID"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/30"
                  />

                  <button
                    type="submit"
                    disabled={addingMember}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-bold disabled:opacity-50"
                  >

                    <UserPlus
                      size={16}
                    />

                    {addingMember
                      ? 'Adding...'
                      : 'Add Member'}

                  </button>

                </form>

                <p className="mt-2 text-[10px] text-slate-700">
                  Use the MongoDB User ID of the
                  person you want to add.
                </p>

              </div>


              {/* MEMBERS */}

              <div className="mt-5 space-y-3">

                {selectedTeam.members
                  ?.length > 0 ? (
                  selectedTeam.members.map(
                    (member) => {

                      const isCreator =
                        selectedTeam.createdBy?._id ===
                        member._id;

                      return (
                        <div
                          key={member._id}
                          className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                        >

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold">
                            {member.name
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              'U'}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center gap-2">

                              <p className="truncate text-sm font-bold">
                                {member.name}
                              </p>

                              {isCreator && (
                                <Crown
                                  size={13}
                                  className="shrink-0 text-amber-300"
                                />
                              )}

                            </div>

                            <div className="mt-1 flex items-center gap-1">

                              <Mail
                                size={11}
                                className="text-slate-600"
                              />

                              <p className="truncate text-xs text-slate-600">
                                {member.email}
                              </p>

                            </div>

                          </div>


                          <div className="flex items-center gap-2">

                            {isCreator ? (
                              <span className="hidden rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[9px] font-bold text-amber-300 sm:block">
                                Creator
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleRemoveMember(
                                    member._id
                                  )
                                }
                                disabled={
                                  removingMember ===
                                  member._id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/10 bg-rose-500/5 text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-40"
                                title="Remove member"
                              >

                                {removingMember ===
                                member._id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-300/30 border-t-rose-300" />
                                ) : (
                                  <UserMinus
                                    size={15}
                                  />
                                )}

                              </button>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
                    No members found.
                  </div>
                )}

              </div>

            </div>

          </div>
        )}


      {/* =====================================================
          EDIT TEAM MODAL
      ===================================================== */}

      {editingTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Edit Team
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Update your team name.
                </p>

              </div>

              <button
                onClick={() => {
                  setEditingTeam(null);
                  setError('');
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={
                handleUpdateTeam
              }
              className="mt-6"
            >

              {/* EDIT POPUP ERROR */}

              {error && editingTeam && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">

                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />

                  <span>
                    {error}
                  </span>

                </div>
              )}


              <input
                autoFocus
                type="text"
                value={editTeamName}
                onChange={(e) =>
                  setEditTeamName(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none focus:border-cyan-400/30"
              />

              <button
                type="submit"
                disabled={savingEdit}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-bold disabled:opacity-50"
              >

                {savingEdit ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    Save Changes
                  </>
                )}

              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


// =========================================================
// TEAM CARD
// =========================================================

function TeamCard({
  team,
  onMembers,
  onEdit,
  onDelete,
  deleting,
}) {
  const memberCount =
    team.members?.length || 0;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">

      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />


      {/* HEADER */}

      <div className="relative flex items-start justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">

          <Users
            size={23}
            className="text-cyan-300"
          />

        </div>


        <div className="flex gap-1">

          <button
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/10 hover:text-cyan-300"
            title="Edit team"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-40"
            title="Delete team"
          >

            {deleting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500/30 border-t-rose-300" />
            ) : (
              <Trash2 size={15} />
            )}

          </button>

        </div>

      </div>


      {/* NAME */}

      <h3 className="relative mt-5 truncate text-xl font-bold text-white">
        {team.teamName}
      </h3>

      <p className="relative mt-1 truncate text-xs text-slate-600">
        Created by{' '}
        <span className="text-slate-500">
          {team.createdBy?.name ||
            'Unknown'}
        </span>
      </p>


      {/* MEMBERS */}

      <div className="relative mt-6 rounded-2xl border border-white/5 bg-white/[0.025] p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <ShieldCheck
              size={15}
              className="text-cyan-300"
            />

            <span className="text-xs font-semibold text-slate-400">
              Members
            </span>

          </div>

          <span className="text-sm font-black text-white">
            {memberCount}
          </span>

        </div>


        <div className="mt-4 flex items-center">

          <div className="flex -space-x-2">

            {team.members
              ?.slice(0, 4)
              .map((member) => (
                <div
                  key={member._id}
                  title={member.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br from-blue-500 to-purple-600 text-[9px] font-bold"
                >
                  {member.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    'U'}
                </div>
              ))}

          </div>

          {memberCount > 4 && (
            <span className="ml-3 text-[10px] text-slate-600">
              +{memberCount - 4}{' '}
              more
            </span>
          )}

        </div>

      </div>


      {/* MANAGE MEMBERS */}

      <button
        onClick={onMembers}
        className="group/button relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >

        <Users size={15} />

        Manage Members

      </button>


      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-hover:w-full" />

    </div>
  );
}

export default Teams;