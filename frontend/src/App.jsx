/**
 * App.jsx — Root application component
 *
 * Responsibilities:
 *  - Wraps the entire app with ThemeProvider + AuthProvider
 *  - Defines all client-side routes via React Router v6
 *  - Renders AppLayout which handles sidebar vs. auth page rendering
 *
 * Layout strategy:
 *  - Auth pages (/login, /register): full-width, no sidebar
 *  - Protected pages: sidebar (desktop fixed, mobile top-bar+drawer) + scrollable main
 *
 * Breakpoints:
 *  - Mobile  (<768px):  Sidebar = sticky top bar (56px) + slide drawer
 *  - Tablet  (768px+):  Sidebar = fixed left column (64px collapsed / 224px expanded)
 *  - Desktop (1024px+): Same as tablet, more content space
 */

import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ── Page imports ─────────────────────────────────────────────── */
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyTasks   from "./pages/MyTasks";
import AddTask   from "./pages/AddTask";
import Settings  from "./pages/Settings";

/* ── Component imports ────────────────────────────────────────── */
import Sidebar        from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

/* ── Context imports ──────────────────────────────────────────── */
import { AuthProvider }  from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

/** Pages that should render without the sidebar layout */
const AUTH_ROUTES = ["/login", "/register"];

/* ─────────────────────────────────────────────────────────────────
   AppLayout
   Decides whether to show the sidebar shell or just bare children.

   Key fix for mobile overflow:
   - The outer div uses `flex` (row on md+, column implicitly on mobile
     since Sidebar renders a <header> block element on mobile)
   - `overflow-hidden` on the outer prevents the sidebar from causing
     a horizontal scrollbar
   - `min-w-0` on <main> prevents flex children from overflowing their
     container (critical for text truncation + responsive grids)
───────────────────────────────────────────────────────────────── */
const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);

  /* Auth pages: no chrome, just the page */
  if (isAuth) return <>{children}</>;

  return (
    <div className="
      flex                    /* row on desktop (sidebar left, main right) */
      h-screen                /* full viewport height */
      overflow-hidden         /* prevent outer page scroll; inner main scrolls */
      bg-slate-100 dark:bg-[#0d0f18]
      transition-colors duration-300
    ">
      {/*
        Sidebar component handles its own responsive behavior:
          md+  → renders as a fixed left aside column
          <md  → renders as a sticky top <header> + slide-in drawer
        Because the mobile header is a block element, the flex layout
        naturally stacks it above <main> on small screens.
      */}
      <Sidebar />

      {/*
        Main scrollable content area.
        - flex-1        : takes all remaining horizontal space
        - min-w-0       : CRITICAL — without this, flex children can overflow
                          past the container, causing right-side clipping
        - overflow-y-auto : page-level scroll lives here, not on <body>
        - overflow-x-hidden : prevents any accidental horizontal scroll
        - flex flex-col : stacks page content + footer vertically
      */}
      <main className="
        flex-1 flex flex-col
        min-w-0
        overflow-y-auto overflow-x-hidden
      ">
        {children}
      </main>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   App — root component
   Order of providers matters: Theme wraps Auth so that dark class
   is set before any component renders.
───────────────────────────────────────────────────────────────── */
const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        {/* Global toast notifications (top-right, auto-dismissed) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              maxWidth: "320px",
            },
          }}
        />

        <AppLayout>
          <Routes>
            {/* ── Root: redirect based on auth state ── */}
            <Route
              path="/"
              element={
                localStorage.getItem("token")
                  ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/login"     replace />
              }
            />

            {/* ── Public auth pages ── */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Protected app pages (require valid JWT) ── */}
            <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-tasks"      element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
            <Route path="/add-task"      element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
            <Route path="/edit-task/:id" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
            <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* ── Catch-all: redirect unknown paths ── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;