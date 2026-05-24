import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import TaskCard from "../components/TaskCard";
import EmptyState from "../components/EmptyState";
import toast from "react-hot-toast";

// ── Skeleton card ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
    <div className="flex justify-between">
      <div className="skeleton h-4 w-2/3 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
    <div className="skeleton h-3 w-full rounded-full" />
    <div className="skeleton h-3 w-4/5 rounded-full" />
    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
      <div className="skeleton h-4 w-20 rounded-full" />
      <div className="skeleton h-4 w-24 rounded-full" />
    </div>
  </div>
);

// ── Stat card ──────────────────────────────────────────────────
const StatCard = ({ label, value, colorClass }) => (
  <div className={`rounded-xl px-4 py-3 text-center ${colorClass}`}>
    <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
    <p className="text-2xl font-bold font-display">{value}</p>
  </div>
);

// ── Filter pill button ─────────────────────────────────────────
const FilterPill = ({ label, active, onClick, activeClass }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-150
      ${active
        ? `${activeClass} shadow-md`
        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
      }`}
  >
    {label}
  </button>
);

// ── SORT OPTIONS ───────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newest",   label: "Newest first" },
  { value: "oldest",   label: "Oldest first" },
  { value: "due_date", label: "Due date" },
  { value: "priority", label: "Priority" },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ── Main component ─────────────────────────────────────────────
const Dashboard = () => {
  const [tasks,          setTasks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [search,         setSearch]         = useState("");
  const [sortBy,         setSortBy]         = useState("newest");
  const [showSort,       setShowSort]       = useState(false);

  // ── Fetch tasks ──────────────────────────────────────────────
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

  // ── Delete ───────────────────────────────────────────────────
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
      fetchTasks(); // rollback
    }
  };

  // ── Filter + Search + Sort ───────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;
      const statusMatch   = statusFilter   === "all" || task.status   === statusFilter;
      const searchMatch   = search.trim() === "" || (
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(search.toLowerCase())
      );
      return priorityMatch && statusMatch && searchMatch;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "newest")   return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")   return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "due_date") {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return  1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortBy === "priority") return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
      return 0;
    });

    return result;
  }, [tasks, priorityFilter, statusFilter, search, sortBy]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      tasks.length,
    low:        tasks.filter((t) => t.priority === "low").length,
    medium:     tasks.filter((t) => t.priority === "medium").length,
    high:       tasks.filter((t) => t.priority === "high").length,
    pending:    tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed:  tasks.filter((t) => t.status === "completed").length,
  }), [tasks]);

  const completionPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  const isFiltered = priorityFilter !== "all" || statusFilter !== "all" || search.trim() !== "";

  return (
    <div className="flex-1 min-h-screen bg-slate-100 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              {stats.total} tasks · {completionPct}% complete
            </p>
          </div>
          <Link
            to="/add-task"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
              text-white px-4 py-2.5 rounded-xl text-sm font-semibold
              shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40
              transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Task</span>
          </Link>
        </div>

        {/* ── Completion progress bar ── */}
        {stats.total > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Progress</span>
              <span>{stats.completed}/{stats.total} completed</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          <StatCard label="Total"       value={stats.total}      colorClass="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" />
          <StatCard label="Low"         value={stats.low}        colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" />
          <StatCard label="Medium"      value={stats.medium}     colorClass="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" />
          <StatCard label="High"        value={stats.high}       colorClass="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" />
          <StatCard label="Pending"     value={stats.pending}    colorClass="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300" />
          <StatCard label="In Progress" value={stats.inProgress} colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" />
          <StatCard label="Completed"   value={stats.completed}  colorClass="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400" />
        </div>

        {/* ── Search + Sort bar ── */}
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title or description…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-200
                placeholder-slate-400 dark:placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-brand-500/40
                transition-all duration-150"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((p) => !p)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all
                ${showSort
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Sort</span>
            </button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${sortBy === opt.value
                          ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Filter pills ── */}
        <div className="space-y-3">
          {/* Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium w-14 shrink-0">Priority</span>
            {["all", "low", "medium", "high"].map((item) => (
              <FilterPill
                key={item}
                label={item}
                active={priorityFilter === item}
                onClick={() => setPriorityFilter(item)}
                activeClass={
                  item === "low"    ? "bg-emerald-500 text-white" :
                  item === "medium" ? "bg-amber-500 text-white"   :
                  item === "high"   ? "bg-red-500 text-white"     :
                  "bg-brand-500 text-white"
                }
              />
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium w-14 shrink-0">Status</span>
            {["all", "pending", "in-progress", "completed"].map((item) => (
              <FilterPill
                key={item}
                label={item}
                active={statusFilter === item}
                onClick={() => setStatusFilter(item)}
                activeClass={
                  item === "pending"     ? "bg-slate-500 text-white"  :
                  item === "in-progress" ? "bg-blue-500 text-white"   :
                  item === "completed"   ? "bg-teal-500 text-white"   :
                  "bg-brand-500 text-white"
                }
              />
            ))}
          </div>

          {/* Clear filters badge */}
          {isFiltered && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setPriorityFilter("all"); setStatusFilter("all"); setSearch(""); }}
              className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              <X size={12} />
              Clear all filters
            </motion.button>
          )}
        </div>

        {/* ── Task grid ── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState filtered={isFiltered} />
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDelete={deleteTask} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;