/**
 * MyTasks.jsx — Personal task list page
 *
 * Sections:
 *  1. Page header (title + "New Task" button)
 *  2. QuickTodoSection — Microsoft To-Do style quick checklist
 *     - Persisted in localStorage (not backend)
 *     - Editable list name
 *     - Share button (Web Share API → clipboard fallback)
 *     - Progress bar
 *  3. Filter tabs (All / Today / Pending / Completed) with counts
 *  4. Task list rows — left-accent border style
 *     - Click circle checkbox → toggles pending ↔ completed
 *     - Hover → shows Edit + Delete action buttons
 *  5. Footer
 *
 * Responsive notes:
 *  - Task rows use rounded-r-xl + rounded-l-none so the left
 *    border-4 accent shows cleanly without being clipped
 *  - Meta row inside task uses flex-wrap to prevent overflow
 *    on narrow screens
 */

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate }           from "react-router-dom";
import { motion, AnimatePresence }     from "framer-motion";
import {
  Plus, CheckSquare, Circle, CheckCircle2,
  Pencil, Trash2, Clock, Share2, ClipboardList,
} from "lucide-react";

import axiosInstance from "../api/axiosInstance";
import Footer        from "../components/Footer";
import toast         from "react-hot-toast";

/* ══════════════════════════════════════════════════════════════
   QUICK TO-DO SECTION
   Microsoft To-Do inspired quick checklist.
   Data stored in localStorage — survives page refresh,
   scoped to this browser/device only (not synced to server).
══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "taskflow_quick_todos";

/** Load todos from localStorage, return empty array on parse error */
const loadTodos = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

/* ── Single to-do item row ──────────────────────────────────── */
const TodoItem = ({ item, onToggle, onDelete }) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.18 }}
    className="
      flex items-center gap-3 py-2.5 group
      border-b border-slate-100 dark:border-slate-700/40 last:border-0
    "
  >
    {/* Checkbox button */}
    <motion.button
      whileTap={{ scale: 0.82 }}
      onClick={() => onToggle(item.id)}
      className="shrink-0 transition-transform duration-150 hover:scale-110"
      aria-label={item.done ? "Mark incomplete" : "Mark complete"}
    >
      {item.done
        ? <CheckCircle2 size={20} className="text-teal-500" />
        : <Circle       size={20} className="text-slate-300 dark:text-slate-600 hover:text-brand-400 transition-colors" />
      }
    </motion.button>

    {/* Item text — line-through when done */}
    <span className={`
      flex-1 text-sm leading-snug transition-all duration-250
      ${item.done
        ? "line-through text-slate-400 dark:text-slate-500"
        : "text-slate-700 dark:text-slate-200"
      }
    `}>
      {item.text}
    </span>

    {/* Delete button — visible on hover */}
    <button
      onClick={() => onDelete(item.id)}
      className="
        shrink-0 opacity-0 group-hover:opacity-100
        p-1 rounded-lg
        text-slate-300 dark:text-slate-600
        hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
        transition-all duration-150
      "
      aria-label="Delete item"
    >
      <Trash2 size={13} />
    </button>
  </motion.li>
);

/* ── Main quick-todo container ──────────────────────────────── */
const QuickTodoSection = () => {
  const [items,    setItems]    = useState(loadTodos);
  const [input,    setInput]    = useState("");
  const [listName, setListName] = useState("Quick To-Do");
  const inputRef               = useRef(null);

  /** Save to state + localStorage atomically */
  const persist = (next) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  /** Add new item (prepend so newest appears first) */
  const addItem = () => {
    const text = input.trim();
    if (!text) return;
    persist([{ id: Date.now(), text, done: false }, ...items]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleItem = (id) =>
    persist(items.map(i => i.id === id ? { ...i, done: !i.done } : i));

  const deleteItem = (id) =>
    persist(items.filter(i => i.id !== id));

  /** Share list via Web Share API or clipboard fallback */
  const shareList = async () => {
    const text =
      `📋 ${listName}\n\n` +
      items.map(i => `${i.done ? "✅" : "⬜"} ${i.text}`).join("\n");
    try {
      if (navigator.share) await navigator.share({ title: listName, text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("List copied to clipboard!");
      }
    } catch { toast.error("Could not share list"); }
  };

  const done  = items.filter(i => i.done).length;
  const total = items.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  /* Split items into pending-first, completed-at-bottom */
  const pendingItems   = items.filter(i => !i.done);
  const completedItems = items.filter(i =>  i.done);

  return (
    <div className="section-card">
      {/* ── Header ── */}
      <div className="
        px-4 sm:px-5 py-4
        border-b border-slate-100 dark:border-slate-700/50
        flex items-center justify-between gap-3
      ">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="
            w-8 h-8 rounded-xl shrink-0
            bg-brand-500/10 dark:bg-brand-500/20
            flex items-center justify-center
          ">
            <ClipboardList size={15} className="text-brand-500" />
          </div>
          {/* Editable list name */}
          <input
            value={listName}
            onChange={e => setListName(e.target.value)}
            className="
              font-display font-bold text-[15px]
              text-slate-800 dark:text-white
              bg-transparent border-none outline-none
              min-w-0 truncate
            "
            aria-label="List name"
          />
        </div>

        {total > 0 && (
          <button
            onClick={shareList}
            className="
              flex items-center gap-1.5 shrink-0
              text-xs font-semibold text-brand-500 hover:text-brand-600
              px-2.5 py-1.5 rounded-lg
              hover:bg-brand-50 dark:hover:bg-brand-500/10
              transition-all
            "
          >
            <Share2 size={12} />
            Share
          </button>
        )}
      </div>

      {/* ── Progress bar ── */}
      {total > 0 && (
        <div className="px-4 sm:px-5 pt-3.5 pb-1">
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5">
            <span>{done}/{total} completed</span>
            <span className="font-medium text-brand-500">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full"
            />
          </div>
        </div>
      )}

      {/* ── Items list ── */}
      <div className="px-4 sm:px-5 py-2">
        {total === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-5">
            Nothing here yet — add your first item below
          </p>
        )}
        <AnimatePresence mode="popLayout">
          {/* Pending items */}
          <ul>
            {pendingItems.map(item => (
              <TodoItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}
          </ul>
          {/* Completed items section */}
          {completedItems.length > 0 && (
            <motion.div key="completed-section" layout className="mt-2">
              <p className="
                text-[11px] font-semibold uppercase tracking-wide
                text-slate-400 dark:text-slate-500
                px-0.5 mb-1
              ">
                Completed ({completedItems.length})
              </p>
              <ul>
                {completedItems.map(item => (
                  <TodoItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Add item input row ── */}
      <div className="px-4 sm:px-5 pb-4 pt-1">
        <div className="
          flex items-center gap-2
          bg-slate-50 dark:bg-slate-900/50
          border border-slate-200 dark:border-slate-700
          rounded-xl px-3 py-2
          focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20
          transition-all
        ">
          <Plus size={15} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addItem()}
            placeholder="Add item… press Enter"
            className="
              flex-1 text-sm bg-transparent border-none outline-none
              text-slate-700 dark:text-slate-200
              placeholder-slate-400 dark:placeholder-slate-500
            "
          />
          {input.trim() && (
            <button
              onClick={addItem}
              className="
                text-xs font-semibold shrink-0
                text-brand-500 hover:text-brand-600
                px-2 py-0.5 rounded-lg
                hover:bg-brand-50 dark:hover:bg-brand-500/10
                transition-all
              "
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   TASK ROW — backend task displayed as a list item
   Left border accent color = status indicator:
     pending     → slate  (neutral)
     in-progress → blue   (active)
     completed   → teal   (done)
══════════════════════════════════════════════════════════════ */

/** Border-left color classes per task status */
const STATUS_BORDER = {
  "pending":     "border-l-slate-400",
  "in-progress": "border-l-blue-500",
  "completed":   "border-l-teal-500",
};

/** Priority pill color classes */
const PRIORITY_PILL = {
  high:   "bg-red-100     text-red-600   dark:bg-red-900/30    dark:text-red-400",
  medium: "bg-amber-100   text-amber-600 dark:bg-amber-900/30  dark:text-amber-400",
  low:    "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};

/**
 * Calculate time-remaining info for a task.
 * Returns null if no due date or task is completed.
 */
const getTimeInfo = (due_date, status) => {
  if (!due_date || status === "completed") return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(due_date); due.setHours(0, 0, 0, 0);
  const d   = Math.round((due - now) / 86400000);
  if (d < 0)   return { label: `${Math.abs(d)}d overdue`, cls: "text-red-500    dark:text-red-400"    };
  if (d === 0) return { label: "Due today",                cls: "text-orange-500 dark:text-orange-400" };
  if (d === 1) return { label: "Due tomorrow",             cls: "text-amber-500  dark:text-amber-400"  };
  if (d <= 7)  return { label: `${d} days left`,           cls: "text-blue-500   dark:text-blue-400"   };
  return         { label: `${d} days left`,                cls: "text-slate-400  dark:text-slate-500"  };
};

const TaskRow = ({ task, onToggle, onDelete }) => {
  const navigate = useNavigate();
  const isDone   = task.status === "completed";
  const time     = getTimeInfo(task.due_date, task.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-start gap-3
        px-3 sm:px-4 py-3
        bg-white dark:bg-slate-800/60
        border border-slate-200 dark:border-slate-700/60
        border-l-4 ${STATUS_BORDER[task.status] || STATUS_BORDER.pending}
        rounded-r-xl rounded-l-none   /* left rounded off so accent border shows cleanly */
        group
        hover:shadow-sm dark:hover:shadow-slate-900/40
        transition-all duration-150
      `}
    >
      {/* ── Checkbox toggle ── */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onToggle(task)}
        className="mt-0.5 shrink-0 transition-transform duration-150 hover:scale-110"
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      >
        {isDone
          ? <CheckCircle2 size={19} className="text-teal-500" />
          : <Circle       size={19} className="text-slate-300 dark:text-slate-600 hover:text-brand-400 transition-colors" />
        }
      </motion.button>

      {/* ── Task content ── */}
      <div className="flex-1 min-w-0">
        {/* Title — line-through when completed */}
        <p className={`
          text-sm font-medium leading-snug
          ${isDone
            ? "line-through text-slate-400 dark:text-slate-500"
            : "text-slate-800 dark:text-slate-100"
          }
        `}>
          {task.title}
        </p>

        {/* Description — single line, truncated */}
        {task.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/*
          Meta row: priority pill + time remaining + due date
          flex-wrap prevents overflow on narrow screens
        */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority pill */}
          <span className={`
            text-[11px] font-semibold capitalize
            px-2 py-0.5 rounded-full leading-tight
            ${PRIORITY_PILL[task.priority] || PRIORITY_PILL.medium}
          `}>
            {task.priority}
          </span>

          {/* Time remaining */}
          {time && (
            <span className={`text-[11px] font-medium flex items-center gap-1 ${time.cls}`}>
              <Clock size={10} className="shrink-0" />
              {time.label}
            </span>
          )}

          {/* Due date display */}
          {task.due_date && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {new Date(task.due_date).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* ── Action buttons (visible on hover) ── */}
      <div className="
        flex items-center gap-0.5
        opacity-0 group-hover:opacity-100
        transition-opacity duration-150
        shrink-0 mt-0.5
      ">
        <button
          onClick={() => navigate(`/edit-task/${task.id}`)}
          className="
            p-1.5 rounded-lg
            text-slate-400 hover:text-brand-500
            hover:bg-brand-50 dark:hover:bg-brand-500/10
            transition-all
          "
          aria-label="Edit task"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="
            p-1.5 rounded-lg
            text-slate-400 hover:text-red-500
            hover:bg-red-50 dark:hover:bg-red-500/10
            transition-all
          "
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MY TASKS PAGE
══════════════════════════════════════════════════════════════ */

/** Filter tab definitions */
const FILTERS = [
  { key: "all",       label: "All"       },
  { key: "today",     label: "Today"     },
  { key: "pending",   label: "Pending"   },
  { key: "completed", label: "Completed" },
];

const MyTasks = () => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  /* Reusable today date object for comparisons */
  const today = new Date(); today.setHours(0, 0, 0, 0);

  /* ── Fetch tasks from backend ── */
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

  /* ── Toggle task status (pending ↔ completed) ── */
  const toggleTask = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    /* Optimistic update */
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
    try {
      await axiosInstance.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      if (newStatus === "completed") toast.success("Task completed! ✅");
    } catch {
      toast.error("Failed to update task");
      fetchTasks(); /* Rollback */
    }
  };

  /* ── Delete task ── */
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
      fetchTasks(); /* Rollback */
    }
  };

  /** Get count for each filter tab badge */
  const getCount = (key) => {
    if (key === "all")       return tasks.length;
    if (key === "pending")   return tasks.filter(t => t.status !== "completed").length;
    if (key === "completed") return tasks.filter(t => t.status === "completed").length;
    if (key === "today")     return tasks.filter(t => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).length;
    return 0;
  };

  /** Apply active filter to task list */
  const filteredTasks = tasks.filter(t => {
    if (filter === "today") {
      if (!t.due_date) return false;
      const d = new Date(t.due_date); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }
    if (filter === "pending")   return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount   = tasks.filter(t => t.status !== "completed").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="page-wrapper">
      <div className="page-inner space-y-5 sm:space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="
              font-display text-xl sm:text-2xl font-bold
              text-slate-800 dark:text-white
              flex items-center gap-2.5
            ">
              <CheckSquare size={22} className="text-brand-500 shrink-0" />
              My Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              {pendingCount} remaining · {completedCount} done
            </p>
          </div>

          <Link to="/add-task" className="btn-primary shrink-0">
            <Plus size={15} />
            <span className="hidden sm:inline">New Task</span>
          </Link>
        </div>

        {/* ── Quick To-Do section ── */}
        <QuickTodoSection />

        {/* ── Task list section header + filter tabs ── */}
        <div>
          <h2 className="
            text-xs font-semibold uppercase tracking-wide
            text-slate-400 dark:text-slate-500 mb-3
          ">
            Task List
          </h2>

          {/* Filter tabs — flex-wrap so they don't overflow on small screens */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => {
              const count = getCount(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`
                    flex items-center gap-1.5
                    px-3 sm:px-3.5 py-2 rounded-xl text-sm font-semibold
                    transition-all duration-150
                    ${filter === f.key
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }
                  `}
                >
                  {f.label}
                  {/* Count badge */}
                  <span className={`
                    text-[11px] px-1.5 py-0.5 rounded-full font-bold
                    ${filter === f.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }
                  `}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Task list (or loading/empty states) ── */}
        {loading ? (
          /* Skeleton rows while loading */
          <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[70px] skeleton rounded-xl" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <CheckCircle2 size={38} className="text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </p>
            {filter === "all" && (
              <Link to="/add-task" className="btn-primary mt-5">
                <Plus size={15} /> Create first task
              </Link>
            )}
          </div>
        ) : (
          /* Animated task list */
          <motion.div layout className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyTasks;