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
} from 'lucide-react';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

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
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/tasks') {
      return (
        location.pathname === '/tasks'
      );
    }

    if (path === '/projects') {
      return (
        location.pathname === '/projects'
      );
    }

    return location.pathname === path;
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
              const active =
                isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() =>
                    handleNavigation(
                      item.path
                    )
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

            {/* USER */}

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-black text-white">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  'U'}
              </div>

              <div className="max-w-[130px]">

                <p className="truncate text-xs font-bold text-white">
                  {user?.name ||
                    'User'}
                </p>

                <p className="truncate text-[9px] text-slate-600">
                  {user?.role ||
                    'Member'}
                </p>

              </div>

            </div>


            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-500 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300"
              title="Logout"
            >

              <LogOut
                size={17}
                className="transition group-hover:translate-x-0.5"
              />

            </button>

          </div>


          {/* MOBILE BUTTON */}

          <button
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
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


        {/* ==================================================
            MOBILE MENU
        ================================================== */}

        {mobileOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-5 py-5 backdrop-blur-2xl lg:hidden">

            {/* USER */}

            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-black text-white">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  'U'}
              </div>

              <div>

                <p className="font-bold text-white">
                  {user?.name ||
                    'User'}
                </p>

                <p className="text-xs text-slate-500">
                  {user?.email}
                </p>

              </div>

            </div>


            {/* LINKS */}

            <div className="space-y-2">

              {navigation.map((item) => {

                const Icon = item.icon;
                const active =
                  isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() =>
                      handleNavigation(
                        item.path
                      )
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


            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-rose-400/10 bg-rose-500/5 px-4 py-3.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>
        )}

      </nav>
    </>
  );
}

export default Navbar;