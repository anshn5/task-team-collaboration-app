import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListTodo,
  Columns3,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  User,
  Settings,
  Shield,
  Mail,
  CircleUserRound,
  Save,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
} from 'lucide-react';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
    updateUser,
  } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // =====================================================
  // ACCOUNT SETTINGS STATE
  // =====================================================

  const [settingsForm, setSettingsForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // =====================================================
  // PROFILE PICTURE STATE
  // =====================================================

  const [pictureLoading, setPictureLoading] = useState(false);
  const [pictureError, setPictureError] = useState('');

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Teams',
      path: '/teams',
      icon: Users,
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: FolderKanban,
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: ListTodo,
    },
    {
      name: 'Kanban',
      path: '/kanban',
      icon: Columns3,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    setProfileOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    setProfileOpen(false);
    setProfileModalOpen(false);
    setSettingsModalOpen(false);
    setMobileOpen(false);

    logout();
    navigate('/login');
  };

  // =====================================================
  // PROFILE
  // =====================================================

  const openProfile = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    setPictureError('');
    setProfileModalOpen(true);
  };

  // =====================================================
  // ACCOUNT SETTINGS
  // =====================================================

  const openSettings = () => {
    setProfileOpen(false);

    setSettingsForm({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    });

    setSettingsMessage('');
    setSettingsError('');

    setSettingsModalOpen(true);
  };

  const closeSettings = () => {
    if (settingsLoading) {
      return;
    }

    setSettingsModalOpen(false);
    setSettingsMessage('');
    setSettingsError('');
  };

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;

    setSettingsForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSettingsMessage('');
    setSettingsError('');
  };

  // =====================================================
  // UPDATE ACCOUNT SETTINGS
  // =====================================================

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();

    setSettingsLoading(true);
    setSettingsMessage('');
    setSettingsError('');

    try {
      const token = localStorage.getItem('token');

      const response = await API.put(
        '/auth/profile',
        {
          name: settingsForm.name,
          email: settingsForm.email,
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data.user;

      // Update user in AuthContext
      updateUser(updatedUser);

      // Clear password fields
      setSettingsForm((previous) => ({
        ...previous,
        currentPassword: '',
        newPassword: '',
      }));

      setSettingsMessage(
        'Account settings updated successfully.'
      );
    } catch (error) {
      console.error(
        'Update profile error:',
        error
      );

      setSettingsError(
        error.response?.data?.message ||
          'Unable to update account settings.'
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // =====================================================
  // PROFILE PICTURE UPLOAD
  // =====================================================

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPictureError('');
    setPictureLoading(true);

    try {
      // ---------------------------------------------------
      // CHECK FILE TYPE
      // ---------------------------------------------------

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          'Please select a JPG, PNG, or WEBP image.'
        );
      }

      // ---------------------------------------------------
      // CHECK FILE SIZE
      // Maximum 2 MB
      // ---------------------------------------------------

      if (file.size > 2 * 1024 * 1024) {
        throw new Error(
          'Profile picture must be smaller than 2 MB.'
        );
      }

      // ---------------------------------------------------
      // UPLOAD TO CLOUDINARY
      // ---------------------------------------------------

      const formData = new FormData();

      formData.append('file', file);

      formData.append(
        'upload_preset',
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData =
        await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
        throw new Error(
          cloudinaryData.error?.message ||
            'Cloudinary upload failed.'
        );
      }

      // ---------------------------------------------------
      // GET CLOUDINARY SECURE URL
      // ---------------------------------------------------

      const imageUrl =
        cloudinaryData.secure_url;

      if (!imageUrl) {
        throw new Error(
          'Cloudinary did not return an image URL.'
        );
      }

      // ---------------------------------------------------
      // SAVE IMAGE URL TO DATABASE
      // ---------------------------------------------------

      const token =
        localStorage.getItem('token');

      const response = await API.put(
        '/auth/profile',
        {
          profilePicture: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ---------------------------------------------------
      // UPDATE AUTH CONTEXT
      // ---------------------------------------------------

      updateUser(response.data.user);

    } catch (error) {
      console.error(
        'Profile picture upload error:',
        error
      );

      setPictureError(
        error.message ||
          'Unable to upload profile picture.'
      );
    } finally {
      setPictureLoading(false);

      // Allow selecting the same file again
      event.target.value = '';
    }
  };

  // =====================================================
  // REMOVE PROFILE PICTURE
  // =====================================================

  const handleRemoveProfilePicture = async () => {
    setPictureError('');
    setPictureLoading(true);

    try {
      const token =
        localStorage.getItem('token');

      const response = await API.put(
        '/auth/profile',
        {
          profilePicture: '',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateUser(response.data.user);

    } catch (error) {
      console.error(
        'Remove profile picture error:',
        error
      );

      setPictureError(
        error.response?.data?.message ||
          'Unable to remove profile picture.'
      );
    } finally {
      setPictureLoading(false);
    }
  };

  // =====================================================
  // ACTIVE NAVIGATION
  // =====================================================

  const isActive = (path) => {
    if (path === '/tasks') {
      return location.pathname === '/tasks';
    }

    if (path === '/projects') {
      return location.pathname === '/projects';
    }

    return location.pathname === path;
  };

  // =====================================================
  // USER INITIALS
  // =====================================================

  const userInitials =
    user?.name
      ?.split(' ')
      .map((name) => name.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  // =====================================================
  // PROFILE PICTURE COMPONENT
  // =====================================================

  const ProfileAvatar = ({
    sizeClass = 'h-9 w-9',
    textClass = 'text-xs',
  }) => {
    if (user?.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt="Profile"
          className={`${sizeClass} rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ${textClass} font-black text-white`}
      >
        {userInitials}
      </div>
    );
  };

  return (
    <>
      {/* ==================================================
          DESKTOP NAVBAR
      ================================================== */}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 sm:px-8">

          {/* LOGO */}

          <button
            onClick={() =>
              handleNavigation('/dashboard')
            }
            className="group flex items-center gap-3"
          >
            <div className="relative">

              <div className="absolute inset-0 rounded-xl bg-cyan-500/30 blur-lg transition group-hover:bg-cyan-400/50" />

              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-600 text-sm font-black text-white shadow-lg">
                TC
              </div>

            </div>

            <div className="hidden text-left sm:block">

              <p className="text-sm font-black tracking-wide text-white">
                TaskCollab
              </p>

              <div className="flex items-center gap-1">

                <Sparkles
                  size={10}
                  className="text-cyan-300"
                />

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  Workspace
                </span>

              </div>

            </div>

          </button>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden items-center gap-1 lg:flex">

            {navigation.map((item) => {

              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() =>
                    handleNavigation(item.path)
                  }
                  className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-300 ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >

                  <Icon
                    size={17}
                    className={
                      active
                        ? 'text-cyan-300'
                        : 'text-slate-500 transition group-hover:text-slate-300'
                    }
                  />

                  {item.name}

                  {active && (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                  )}

                </button>
              );
            })}

          </div>

          {/* USER AREA */}

          <div className="hidden items-center gap-3 lg:flex">

            <div className="relative">

              <button
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                  profileOpen
                    ? 'border-cyan-400/30 bg-white/10'
                    : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >

                <ProfileAvatar />

                <div className="max-w-[130px] text-left">

                  <p className="truncate text-xs font-bold text-white">
                    {user?.name || 'User'}
                  </p>

                  <p className="truncate text-[9px] text-slate-500">
                    {user?.role || 'Member'}
                  </p>

                </div>

                <ChevronRight
                  size={15}
                  className={`text-slate-500 transition-transform ${
                    profileOpen
                      ? 'rotate-90'
                      : ''
                  }`}
                />

              </button>

              {/* PROFILE DROPDOWN */}

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-2xl">

                  {/* PROFILE HEADER */}

                  <div className="border-b border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 p-4">

                    <div className="flex items-center gap-3">

                      <ProfileAvatar
                        sizeClass="h-12 w-12"
                        textClass="text-sm"
                      />

                      <div className="min-w-0">

                        <p className="truncate font-bold text-white">
                          {user?.name || 'User'}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user?.email || 'No email'}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* PROFILE OPTIONS */}

                  <div className="p-2">

                    <button
                      onClick={openProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                        <User size={17} />
                      </div>

                      <div>
                        <p>My Profile</p>

                        <p className="text-[10px] text-slate-600">
                          View account details
                        </p>
                      </div>
                    </button>

                    {/* ACCOUNT SETTINGS */}

                    <button
                      onClick={openSettings}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300">
                        <Settings size={17} />
                      </div>

                      <div>
                        <p>Account Settings</p>

                        <p className="text-[10px] text-slate-600">
                          Manage your account
                        </p>
                      </div>
                    </button>

                  </div>

                  {/* LOGOUT */}

                  <div className="border-t border-white/10 p-2">

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10">
                        <LogOut size={17} />
                      </div>

                      Logout
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

          {/* MOBILE BUTTON */}

          <button
            onClick={() =>
              setMobileOpen(!mobileOpen)
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 lg:hidden"
          >

            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}

          </button>

        </div>

        {/* MOBILE MENU */}

        {mobileOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-5 py-5 backdrop-blur-2xl lg:hidden">

            {/* USER */}

            <button
              onClick={openProfile}
              className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
            >

              <ProfileAvatar
                sizeClass="h-11 w-11"
                textClass="text-sm"
              />

              <div className="min-w-0">

                <p className="truncate font-bold text-white">
                  {user?.name || 'User'}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.email || 'No email'}
                </p>

              </div>

              <ChevronRight
                size={17}
                className="ml-auto text-slate-600"
              />

            </button>

            {/* LINKS */}

            <div className="space-y-2">

              {navigation.map((item) => {

                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() =>
                      handleNavigation(item.path)
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <Icon
                        size={18}
                        className={
                          active
                            ? 'text-cyan-300'
                            : 'text-slate-500'
                        }
                      />

                      {item.name}

                    </div>

                    <ChevronRight
                      size={15}
                      className="text-slate-700"
                    />

                  </button>
                );
              })}

            </div>

            {/* MOBILE ACCOUNT SETTINGS */}

            <button
              onClick={openSettings}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-purple-400/10 bg-purple-500/5 px-4 py-3.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10"
            >
              <Settings size={18} />

              Account Settings
            </button>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border border-rose-400/10 bg-rose-500/5 px-4 py-3.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>
        )}

      </nav>

      {/* ==================================================
          PROFILE DETAILS MODAL
      ================================================== */}

      {profileModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={() =>
            setProfileModalOpen(false)
          }
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* PROFILE HEADER */}

            <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-purple-600/20 px-6 pb-8 pt-7">

              <button
                onClick={() =>
                  setProfileModalOpen(false)
                }
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="relative flex flex-col items-center">

                {/* PROFILE IMAGE */}

                <div className="relative mb-4">

                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-slate-900 bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-600 text-2xl font-black text-white shadow-xl shadow-cyan-500/10">

                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}

                  </div>

                  {/* CAMERA BUTTON */}

                  <label
                    className={`absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-500 text-white shadow-lg transition hover:bg-cyan-400 ${
                      pictureLoading
                        ? 'pointer-events-none opacity-60'
                        : ''
                    }`}
                    title="Change profile picture"
                  >

                    {pictureLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Camera size={16} />
                    )}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleProfilePictureUpload
                      }
                      disabled={pictureLoading}
                      className="hidden"
                    />

                  </label>

                </div>

                <h2 className="text-xl font-black text-white">
                  {user?.name || 'User'}
                </h2>

                <div className="mt-2 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1">

                  <Shield
                    size={12}
                    className="text-cyan-300"
                  />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                    {user?.role || 'Member'}
                  </span>

                </div>

                {/* PROFILE PICTURE ACTIONS */}

                <div className="mt-4 flex items-center gap-2">

                  <label
                    className={`cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white ${
                      pictureLoading
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }`}
                  >

                    <span className="flex items-center gap-2">
                      <Camera size={14} />
                      {pictureLoading
                        ? 'Uploading...'
                        : 'Change Photo'}
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleProfilePictureUpload
                      }
                      disabled={pictureLoading}
                      className="hidden"
                    />

                  </label>

                  {user?.profilePicture && (
                    <button
                      type="button"
                      onClick={
                        handleRemoveProfilePicture
                      }
                      disabled={pictureLoading}
                      className="flex items-center gap-2 rounded-lg border border-rose-400/10 bg-rose-500/5 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} />

                      Remove
                    </button>
                  )}

                </div>

                {/* PICTURE ERROR */}

                {pictureError && (
                  <div className="mt-3 flex max-w-xs items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-300">

                    <AlertCircle
                      size={14}
                      className="shrink-0"
                    />

                    <span>{pictureError}</span>

                  </div>
                )}

                <p className="mt-2 text-[9px] text-slate-600">
                  JPG, PNG or WEBP • Maximum 2 MB
                </p>

              </div>

            </div>

            {/* ACCOUNT INFORMATION */}

            <div className="p-6">

              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Account Information
              </p>

              <div className="space-y-3">

                {/* EMAIL */}

                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                    <Mail size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Email
                    </p>

                    <p className="truncate text-sm font-semibold text-slate-200">
                      {user?.email || 'Not available'}
                    </p>

                  </div>

                </div>

                {/* ROLE */}

                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                    <Shield size={17} />
                  </div>

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Role
                    </p>

                    <p className="text-sm font-semibold text-slate-200">
                      {user?.role || 'Member'}
                    </p>

                  </div>

                </div>

                {/* USER ID */}

                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                    <CircleUserRound size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      User ID
                    </p>

                    <p className="truncate text-xs font-medium text-slate-400">
                      {user?.id ||
                        user?._id ||
                        'Not available'}
                    </p>

                  </div>

                </div>

                {/* ACCOUNT CREATED */}

                <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <CircleUserRound size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Account Created
                    </p>

                    <p className="text-sm font-semibold text-slate-200">
                      {user?.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : 'Not available'}
                    </p>

                  </div>

                </div>

              </div>

              <button
                onClick={() =>
                  setProfileModalOpen(false)
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.01] hover:shadow-blue-500/20"
              >
                <User size={16} />

                Done
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          ACCOUNT SETTINGS MODAL
      ================================================== */}

      {settingsModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={closeSettings}
        >

          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="border-b border-white/10 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-500/10 px-6 py-6">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                    <Settings size={22} />
                  </div>

                  <div>

                    <h2 className="text-lg font-black text-white">
                      Account Settings
                    </h2>

                    <p className="text-xs text-slate-500">
                      Update your account information
                    </p>

                  </div>

                </div>

                <button
                  onClick={closeSettings}
                  disabled={settingsLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X size={18} />
                </button>

              </div>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSettingsSubmit}
              className="p-6"
            >

              {/* SUCCESS */}

              {settingsMessage && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">

                  <CheckCircle2 size={18} />

                  <span>{settingsMessage}</span>

                </div>
              )}

              {/* ERROR */}

              {settingsError && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">

                  <AlertCircle size={18} />

                  <span>{settingsError}</span>

                </div>
              )}

              {/* NAME */}

              <div className="mb-5">

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    name="name"
                    value={settingsForm.name}
                    onChange={handleSettingsChange}
                    minLength={2}
                    maxLength={50}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                    placeholder="Enter your name"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="mb-6">

                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="email"
                    name="email"
                    value={settingsForm.email}
                    onChange={handleSettingsChange}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.06]"
                    placeholder="Enter your email"
                  />

                </div>

              </div>

              {/* PASSWORD SECTION */}

              <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                    <Lock size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-white">
                      Change Password
                    </p>

                    <p className="text-[10px] text-slate-600">
                      Leave both fields empty if you don't want to change it.
                    </p>

                  </div>

                </div>

                {/* CURRENT PASSWORD */}

                <div className="mb-4">

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Current Password
                  </label>

                  <input
                    type="password"
                    name="currentPassword"
                    value={
                      settingsForm.currentPassword
                    }
                    onChange={handleSettingsChange}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-amber-400/40"
                    placeholder="Enter current password"
                  />

                </div>

                {/* NEW PASSWORD */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    New Password
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={
                      settingsForm.newPassword
                    }
                    onChange={handleSettingsChange}
                    minLength={6}
                    maxLength={100}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-amber-400/40"
                    placeholder="Enter new password"
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeSettings}
                  disabled={settingsLoading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {settingsLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}

export default Navbar;