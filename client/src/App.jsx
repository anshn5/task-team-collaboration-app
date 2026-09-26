import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import TaskDetails from './pages/TaskDetails';
import KanbanBoard from './pages/KanbanBoard';


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // While checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="text-center">

          {/* Animated Loader */}
          <div className="relative mx-auto h-16 w-16">

            <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-cyan-400" />

            </div>

          </div>

          <p className="mt-5 text-sm font-medium text-slate-400">
            Loading workspace...
          </p>

        </div>

      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User is authenticated
  return children;
}


// =====================================================
// MAIN APP
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TEAMS
        ================================================= */}

        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PROJECTS
        ================================================= */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PROJECT DETAILS
        ================================================= */}

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TASKS
        ================================================= */}

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            TASK DETAILS
        ================================================= */}

        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetails />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            KANBAN BOARD
        ================================================= */}

        <Route
          path="/kanban"
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            DEFAULT ROUTE
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =================================================
            404 / UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;