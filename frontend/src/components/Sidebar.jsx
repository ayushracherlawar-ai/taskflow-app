import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare,
  Settings, LogOut, Menu, X, Sun, Moon, Zap,
  ChevronLeft,
} from "lucide-react";
import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "My Tasks",  icon: CheckSquare,     to: "/my-tasks"  },
  { label: "Settings",  icon: Settings,        to: "/settings"  },
];

/* ── Logo ──────────────────────────────────────────────────── */
const Logo = ({ onClick }) => (
  <Link to="/dashboard" onClick={onClick} className="flex items-center gap-2.5 min-w-0">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600
      flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
      <Zap size={16} className="text-white" />
    </div>
    <span className="font-display font-bold text-lg text-white tracking-tight truncate">
      Task<span className="bg-gradient-to-r from-brand-400 via-violet-400 to-teal-400 bg-clip-text text-transparent">Flow</span>
    </span>
  </Link>
);

/* ── Nav link (shared between desktop + mobile) ────────────── */
const NavLink = ({ item, collapsed, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === item.to || pathname.startsWith(item.to + "/");

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-150 group
        ${active
          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <item.icon size={19} className="shrink-0" />
      {!collapsed && (
        <span className="text-sm font-medium truncate leading-none">{item.label}</span>
      )}
      {/* Tooltip when sidebar collapsed */}
      {collapsed && (
        <span className="
          pointer-events-none absolute left-full ml-3 z-50
          px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700
          text-white text-xs whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-1 group-hover:translate-x-0
          transition-all duration-150
        ">
          {item.label}
        </span>
      )}
    </Link>
  );
};

/* ── User chip ─────────────────────────────────────────────── */
const UserChip = ({ user, collapsed }) => {
  const initials = user?.username?.slice(0, 2).toUpperCase() || "TF";
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500
        flex items-center justify-center text-white text-[11px] font-bold shrink-0">
        {initials}
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{user?.username}</p>
          <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{user?.email}</p>
        </div>
      )}
    </div>
  );
};

/* ── Theme toggle button (shared) ──────────────────────────── */
const ThemeBtn = ({ dark, toggleTheme, collapsed }) => (
  <button
    onClick={toggleTheme}
    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
      text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-150"
  >
    {dark
      ? <Sun  size={18} className="shrink-0 text-yellow-400" />
      : <Moon size={18} className="shrink-0 text-brand-400" />}
    {!collapsed && (
      <span className="text-sm font-medium">{dark ? "Light Mode" : "Dark Mode"}</span>
    )}
  </button>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN SIDEBAR COMPONENT
   ─ md+  : fixed left sidebar (collapsible icon-only mode)
   ─ <md  : sticky top navbar + slide-in drawer
═══════════════════════════════════════════════════════════════ */
const Sidebar = () => {
  const { logout, user }      = useAuth();
  const { dark, toggleTheme } = useTheme();

  /* Desktop: expanded (224 px) ↔ collapsed (64 px) */
  const [collapsed,  setCollapsed]  = useState(false);
  /* Mobile: drawer open/closed */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Close drawer on route change */
  const { pathname } = useLocation();
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  /* Close drawer on wide screen resize */
  useEffect(() => {
    const handle = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* ── Desktop sidebar ──────────────────────────────────────── */
  const DesktopSidebar = () => (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="
        hidden md:flex flex-col
        h-screen sticky top-0 shrink-0
        bg-[#0d0f18] border-r border-slate-800/80
        z-40 overflow-hidden
      "
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-5 pb-4 border-b border-slate-800/60">
        {collapsed ? (
          /* Collapsed: just icon logo, click to expand */
          <button onClick={() => setCollapsed(false)} className="mx-auto group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600
              flex items-center justify-center shadow-lg shadow-brand-500/25
              group-hover:shadow-brand-500/40 transition-all">
              <Zap size={15} className="text-white" />
            </div>
          </button>
        ) : (
          <>
            <Logo />
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/8 transition-colors ml-1 shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map(item => (
          <NavLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-slate-800/60 space-y-0.5">
        <ThemeBtn dark={dark} toggleTheme={toggleTheme} collapsed={collapsed} />

        <UserChip user={user} collapsed={collapsed} />

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
            text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );

  /* ── Mobile: top bar + drawer ─────────────────────────────── */
  const MobileTopBar = () => (
    <header className="
      md:hidden sticky top-0 z-40
      bg-[#0d0f18]/95 backdrop-blur-md
      border-b border-slate-800/80
      px-4 h-14 flex items-center justify-between
      safe-top
    ">
      <Logo />
      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );

  const MobileDrawer = () => (
    <AnimatePresence>
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/65 backdrop-blur-sm z-50"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260, mass: 0.9 }}
            className="
              md:hidden fixed inset-y-0 left-0 z-50
              w-[min(288px,85vw)]
              bg-[#0d0f18] border-r border-slate-800
              flex flex-col
            "
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 h-14">
              <Logo onClick={() => setMobileOpen(false)} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {NAV.map(item => (
                <NavLink
                  key={item.to} item={item} collapsed={false}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
              <ThemeBtn dark={dark} toggleTheme={toggleTheme} collapsed={false} />
              <UserChip user={user} collapsed={false} />
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                  text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <DesktopSidebar />

      {/* Mobile top bar (always visible on <md) */}
      <MobileTopBar />

      {/* Mobile drawer (slides in) */}
      <MobileDrawer />
    </>
  );
};

export default Sidebar;