import { Pencil, Trash2, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PriorityBadge from "./PriorityBadge";

const STATUS_STYLES = {
  "pending":     "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  "in-progress": "bg-blue-100  text-blue-700  dark:bg-blue-900/40 dark:text-blue-300",
  "completed":   "bg-teal-100  text-teal-700  dark:bg-teal-900/40 dark:text-teal-300",
};

// ── Time remaining logic ────────────────────────────────────────
const getTimeRemaining = (due_date, status) => {
  if (!due_date || status === "completed") return null;

  const now     = new Date();
  const due     = new Date(due_date);
  // Compare at day granularity
  const nowDay  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay  = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffMs  = dueDay - nowDay;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return {
      label: abs === 1 ? "1 day overdue" : `${abs} days overdue`,
      type: "overdue",
    };
  }
  if (diffDays === 0) return { label: "Due today",      type: "today"   };
  if (diffDays === 1) return { label: "Due tomorrow",   type: "soon"    };
  if (diffDays <= 3)  return { label: `${diffDays} days left`, type: "soon" };
  if (diffDays <= 7)  return { label: `${diffDays} days left`, type: "week" };
  return { label: `${diffDays} days left`, type: "safe" };
};

const TIME_STYLES = {
  overdue: "text-red-500    dark:text-red-400    bg-red-50    dark:bg-red-900/20",
  today:   "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
  soon:    "text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-900/20",
  week:    "text-blue-500   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/20",
  safe:    "text-slate-500  dark:text-slate-400  bg-slate-100 dark:bg-slate-700/50",
};

// ── Component ───────────────────────────────────────────────────
const TaskCard = ({ task, onDelete }) => {
  const navigate  = useNavigate();
  const timeInfo  = getTimeRemaining(task.due_date, task.status);
  const isOverdue = timeInfo?.type === "overdue";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white dark:bg-slate-800/70 rounded-2xl shadow-sm
        border transition-all duration-200 flex flex-col group
        hover:shadow-md dark:hover:shadow-slate-900/50
        ${isOverdue
          ? "border-red-300 dark:border-red-500/40"
          : "border-slate-200 dark:border-slate-700"
        }`}
    >
      {/* Overdue ribbon */}
      {isOverdue && (
        <div className="absolute top-0 right-0 flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl">
          <AlertTriangle size={11} />
          Overdue
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: title + priority */}
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 flex-1 pr-1">
            {task.title}
          </h3>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* ── Time remaining pill ── */}
        {timeInfo && (
          <div className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${TIME_STYLES[timeInfo.type]}`}>
            <Clock size={11} />
            {timeInfo.label}
          </div>
        )}

        {/* ── Completed badge ── */}
        {task.status === "completed" && task.due_date && (
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold mb-3 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20">
            ✓ Completed
          </div>
        )}

        {/* Meta: status */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[task.status] || STATUS_STYLES.pending}`}>
            {task.status}
          </span>

          {/* Due date text */}
          {task.due_date && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {new Date(task.due_date).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — reveal on hover */}
      <div className="flex items-center justify-end gap-1 px-5 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => navigate(`/edit-task/${task.id}`)}
          className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all"
          aria-label="Edit task"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          aria-label="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;