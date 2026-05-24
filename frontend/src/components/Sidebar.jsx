import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Settings, LogOut,
  Menu, X, CheckSquare, Sun, Moon,
} from "lucide-react";
import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Settings",  icon: Settings,        to: "/settings"  },
];

const Sidebar = () => {
  const { logout, user }      = useAuth();
  const { dark, toggleTheme } = useTheme();
  const { pathname }          = useLocation();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "TF";

  const NavLink = ({ item, onClick }) => {
    const active = pathname === item.to;
    return (
      <Link
        to={item.to}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
          ${active
            ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
          }`}
      >
        <item.icon size={20} className="shrink-0" />
        {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
      </Link>
    );
  };

  // ── Desktop sidebar ─────────────────────────────────────────
  const DesktopSidebar = () => (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-[#0f1117] border-r border-slate-800 z-40 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-slate-800">
        {!collapsed ? (
          <>
            <Link to="/dashboard" className="flex items-center gap-2">
              <CheckSquare size={22} className="text-brand-400 shrink-0" />
              <span className="font-display font-bold text-lg text-white tracking-tight">TaskFlow</span>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <Link to="/dashboard" className="mx-auto">
            <CheckSquare size={22} className="text-brand-400" />
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => <NavLink key={item.to} item={item} />)}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-slate-800 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all"
        >
          {dark
            ? <Sun  size={20} className="shrink-0 text-yellow-400" />
            : <Moon size={20} className="shrink-0 text-brand-400"  />}
          {!collapsed && (
            <span className="text-sm font-medium">{dark ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {/* Expand when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-full py-2 text-slate-500 hover:text-white"
          >
            <Menu size={18} />
          </button>
        )}

        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );

  // ── Mobile ──────────────────────────────────────────────────
  const MobileNav = () => (
    <>
      <header className="md:hidden sticky top-0 z-50 bg-[#0f1117] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <CheckSquare size={20} className="text-brand-400" />
          <span className="font-display font-bold text-white">TaskFlow</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-400 hover:text-white">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-[#0f1117] border-r border-slate-800 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <CheckSquare size={20} className="text-brand-400" />
                  <span className="font-display font-bold text-white">TaskFlow</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.to} item={item} onClick={() => setMobileOpen(false)} />
                ))}
              </nav>

              <div className="px-3 py-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
};

export default Sidebar;