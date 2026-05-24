import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login    from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTask  from "./pages/AddTask";
import Settings from "./pages/Settings";

import Sidebar        from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider }  from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const AUTH_ROUTES = ["/login", "/register"];

const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isAuthPage   = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
            },
          }}
        />

        <AppLayout>
          <Routes>
            <Route
              path="/"
              element={
                localStorage.getItem("token")
                  ? <Navigate to="/dashboard" />
                  : <Navigate to="/login" />
              }
            />

            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-task"  element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
            <Route path="/edit-task/:id" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;