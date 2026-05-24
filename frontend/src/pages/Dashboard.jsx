/**
 * Dashboard.jsx — Main overview page
 *
 * Sections (top to bottom):
 *  1. Greeting header + "New Task" button
 *  2. Completion progress bar
 *  3. Stats cards grid (responsive: 2 cols mobile → 3 cols sm → 6 cols lg)
 *  4. Quick To-Do widget (QuickTodo component)
 *  5. Search bar + Sort dropdown
 *  6. Priority + Status filter pills
 *  7. Task grid (1 col mobile → 2 cols sm → 3 cols lg)
 *     or Skeleton loaders or Empty state
 *  8. Footer
 *
 * Key responsive fixes vs. screenshots:
 *  - Stats grid: 2 columns on mobile (was 6, causing overflow)
 *  - Search + Sort: stacks cleanly on small screens
 *  - Filter pills: flex-wrap so they never overflow
 *  - Task grid: single column on phones, wider on tablets+
 */

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, SlidersHorizontal, X, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, ListTodo,
} from "lucide-react";

import axiosInstance from "../api/axiosInstance";
import TaskCard      from "../components/TaskCard";
import EmptyState    from "../components/EmptyState";
import QuickTodo     from "../components/QuickTodo";
import Footer        from "../components/Footer";
import { useAuth }   from "../context/AuthContext";
import toast         from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────
   SkeletonCard — placeholder card shown during task fetch
───────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
    <div className="flex justify-between gap-2">
      <div className="skeleton h-4 w-2/3 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
    <div className="skeleton h-3 w-full  rounded-full" />
    <div className="skeleton h-3 w-4/5  rounded-full" />
    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="skeleton h-3 w-24 rounded-full" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   StatCard — single KPI tile in the stats grid
   colorClass controls bg + text + border for light and dark.
───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ duration: 0.15 }}
    className={`
      rounded-2xl px-3 py-3 sm:px-4 sm:py-4
      flex items-center gap-2.5
      border transition-all
      ${colorClass}
    `}
  >
    {/* Icon container */}
    <div className="
      w-8 h-8 rounded-xl shrink-0
      flex items-center justify-center
      bg-white/50 dark:bg-black/20
    ">
      <Icon size={16} />
    </div>

    {/* Value + label */}
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-bold font-display leading-none">{value}</p>
      <p className="text-[11px] sm:text-xs font-medium opacity-70 mt-0.5 truncate">{label}</p>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   FilterPill — single filter button (priority / status)
───────────────────────────────────────────────────────────── */
const FilterPill = ({ label, active, onClick, activeClass }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-full text-xs font-semibold capitalize
      transition-all duration-150 whitespace-nowrap
      ${active
        ? `${activeClass} shadow-sm`
        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }
    `}
  >
    {label}
  </button>
);

/* Sort options shown in the dropdown */
const SORT_OPTIONS = [
  { value: "newest",   label: "Newest first"   },
  { value: "oldest",   label: "Oldest first"   },
  { value: "due_date", label: "By due date"     },
  { value: "priority", label: "By priority"     },
];

/* Numeric order for priority sort */
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/* Greeting based on time of day */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/* ═════════════════════════════════════════════════════════════
   Dashboard component
═════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();

  /* Task state */
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  /* Filter state */
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [search,         setSearch]         = useState("");
  const [sortBy,         setSortBy]         = useState("newest");
  const [showSort,       setShowSort]       = useState(false);

  /* ── Fetch all tasks for logged-in user ── */
  const fetchTasks = async () => {
    try {
      const res = await axiosInstance.get("/tasks");
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  /* ── Delete with optimistic UI update ── */
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    /* Optimistically remove from UI first */
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
      fetchTasks(); /* Rollback on error */
    }
  };

  /* ── Filter + sort (memoised to avoid re-computing on every render) ── */
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const pm = priorityFilter === "all" || t.priority === priorityFilter;
      const sm = statusFilter   === "all" || t.status   === statusFilter;
      const qm = !search.trim() ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase());
      return pm && sm && qm;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "newest")   return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")   return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "due_date") {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === "priority") {
        return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
      }
      return 0;
    });
  }, [tasks, priorityFilter, statusFilter, search, sortBy]);

  /* ── Computed stats (memoised) ── */
  const stats = useMemo(() => {
    const nowDay = new Date(); nowDay.setHours(0, 0, 0, 0);
    return {
      total:      tasks.length,
      pending:    tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in-progress").length,
      completed:  tasks.filter(t => t.status === "completed").length,
      high:       tasks.filter(t => t.priority === "high" && t.status !== "completed").length,
      overdue:    tasks.filter(t => {
        if (!t.due_date || t.status === "completed") return false;
        const d = new Date(t.due_date); d.setHours(0, 0, 0, 0);
        return d < nowDay;
      }).length,
    };
  }, [tasks]);

  const completionPct = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const isFiltered =
    priorityFilter !== "all" || statusFilter !== "all" || !!search.trim();

  const clearFilters = () => {
    setPriorityFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  return (
    <div className="page-wrapper">
      <div className="page-inner space-y-5 sm:space-y-6">

        {/* ── 1. Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-3"
        >
          <div className="min-w-0">
            {/* Greeting — truncate on very small screens */}
            <h1 className="font-display text-lg sm:text-2xl font-bold text-slate-800 dark:text-white truncate">
              {getGreeting()},{" "}
              <span className="text-gradient">{user?.username || "there"}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              {stats.total} tasks · {completionPct}% complete
              {stats.overdue > 0 && (
                <span className="ml-2 text-red-500 font-medium">
                  · {stats.overdue} overdue
                </span>
              )}
            </p>
          </div>

          {/* New Task CTA */}
          <Link to="/add-task" className="btn-primary shrink-0">
            <Plus size={15} />
            {/* Hide label text on very small screens to avoid overflow */}
            <span className="hidden xs:inline sm:inline">New Task</span>
          </Link>
        </motion.div>

        {/* ── 2. Completion progress bar ── */}
        {stats.total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <TrendingUp size={11} /> Progress
              </span>
              <span>{stats.completed}/{stats.total} done</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-500 via-violet-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        )}

        {/* ── 3. Stats grid ─────────────────────────────────────────────
            Breakpoints:
              mobile  (<640px):  2 columns — prevents cards from squishing
              sm      (640px+):  3 columns
              lg      (1024px+): 6 columns (all stats in one row)
        ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <StatCard
            label="Total"       value={stats.total}
            icon={ListTodo}
            colorClass="bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          />
          <StatCard
            label="Pending"     value={stats.pending}
            icon={Clock}
            colorClass="bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          />
          <StatCard
            label="In Progress" value={stats.inProgress}
            icon={TrendingUp}
            colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800/40"
          />
          <StatCard
            label="Completed"   value={stats.completed}
            icon={CheckCircle2}
            colorClass="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-800/40"
          />
          <StatCard
            label="High Priority" value={stats.high}
            icon={AlertTriangle}
            colorClass="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800/40"
          />
          <StatCard
            label="Overdue"     value={stats.overdue}
            icon={AlertTriangle}
            colorClass={
              stats.overdue > 0
                ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800/40"
                : "bg-white dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            }
          />
        </div>



        {/* ── 5. Search + Sort ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search input — expands to fill available space */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="
                w-full pl-9 pr-8 py-2.5 rounded-xl text-sm
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-200
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
                transition-all
              "
            />
            {/* Clear search button */}
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSort(p => !p)}
              className={`
                flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border
                transition-all
                ${showSort
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }
              `}
              aria-label="Sort options"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Sort</span>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="
                    absolute right-0 top-full mt-2 w-44 z-20
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    rounded-xl shadow-xl overflow-hidden
                  "
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`
                        w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${sortBy === opt.value
                          ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 6. Filter pills ── */}
        <div className="space-y-2.5">
          {/* Priority filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-14 shrink-0">
              Priority
            </span>
            {["all", "low", "medium", "high"].map(v => (
              <FilterPill
                key={v} label={v} active={priorityFilter === v}
                onClick={() => setPriorityFilter(v)}
                activeClass={
                  v === "low"    ? "bg-emerald-500 text-white" :
                  v === "medium" ? "bg-amber-500 text-white"   :
                  v === "high"   ? "bg-red-500 text-white"     :
                  "bg-brand-500 text-white"
                }
              />
            ))}
          </div>

          {/* Status filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-14 shrink-0">
              Status
            </span>
            {["all", "pending", "in-progress", "completed"].map(v => (
              <FilterPill
                key={v} label={v} active={statusFilter === v}
                onClick={() => setStatusFilter(v)}
                activeClass={
                  v === "pending"     ? "bg-slate-500 text-white"  :
                  v === "in-progress" ? "bg-blue-500 text-white"   :
                  v === "completed"   ? "bg-teal-500 text-white"   :
                  "bg-brand-500 text-white"
                }
              />
            ))}
          </div>

          {/* Clear all filters — only shown when filters are active */}
          {isFiltered && (
            <motion.button
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              <X size={11} /> Clear all filters
            </motion.button>
          )}
        </div>

        {/* ── 7. Task grid / skeletons / empty state ── */}
        {loading ? (
          /* Show 6 skeleton cards while loading */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty state with illustration */
          <EmptyState filtered={isFiltered} />
        ) : (
          /* Task grid — 1/2/3 columns by breakpoint */
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onDelete={deleteTask} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── 8. Footer ── */}
      <Footer />
    </div>
  );
};

export default Dashboard;