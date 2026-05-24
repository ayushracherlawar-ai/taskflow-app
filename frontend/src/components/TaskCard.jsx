import { Pencil, Trash2, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PriorityBadge from "./PriorityBadge";

const STATUS_STYLES = {
  "pending":     "bg-slate-100 text-slate-600 dark:bg-slate-700/70 dark:text-slate-300",
  "in-progress": "bg-blue-100  text-blue-700  dark:bg-blue-900/40  dark:text-blue-300",
  "completed":   "bg-teal-100  text-teal-700  dark:bg-teal-900/40  dark:text-teal-300",
};

const getTimeRemaining = (due_date, status) => {
  if (!due_date || status === "completed") return null;
  const nowDay = new Date(); nowDay.setHours(0,0,0,0);
  const dueDay = new Date(due_date); dueDay.setHours(0,0,0,0);
  const diff   = Math.round((dueDay - nowDay) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`,  type: "overdue" };
  if (diff === 0) return { label: "Due today",                   type: "today"   };
  if (diff === 1) return { label: "Due tomorrow",                type: "soon"    };
  if (diff <= 3)  return { label: `${diff} days left`,           type: "soon"    };
  if (diff <= 7)  return { label: `${diff} days left`,           type: "week"    };
  return            { label: `${diff} days left`,                type: "safe"    };
};

const TIME_CLS = {
  overdue: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  today:   "text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
  soon:    "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
  week:    "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  safe:    "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50",
};

const TaskCard = ({ task, onDelete }) => {
  const navigate  = useNavigate();
  const timeInfo  = getTimeRemaining(task.due_date, task.status);
  const isOverdue = timeInfo?.type === "overdue";
  const isDone    = task.status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(99,102,241,0.13)" }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white dark:bg-slate-800/70
        backdrop-blur-sm rounded-2xl border flex flex-col group
        transition-all duration-200
        ${isOverdue
          ? "border-red-200 dark:border-red-500/30 shadow-sm shadow-red-100 dark:shadow-none"
          : isDone
          ? "border-teal-200 dark:border-teal-700/40"
          : "border-slate-200 dark:border-slate-700/60 shadow-card"
        }`}
    >
      {/* Top accent line */}
      <div className={`h-0.5 rounded-t-2xl w-full ${
        isOverdue ? "bg-gradient-to-r from-red-400 to-rose-500" :
        isDone    ? "bg-gradient-to-r from-teal-400 to-emerald-500" :
        task.priority === "high"   ? "bg-gradient-to-r from-red-400 to-orange-400" :
        task.priority === "medium" ? "bg-gradient-to-r from-amber-400 to-yellow-400" :
                                     "bg-gradient-to-r from-emerald-400 to-teal-400"
      }`} />

      {/* Overdue banner */}
      {isOverdue && (
        <div className="absolute top-0.5 right-0 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl">
          <AlertTriangle size={10} />
          Overdue
        </div>
      )}

      {/* Completed watermark */}
      {isDone && (
        <div className="absolute top-2 right-2 opacity-15">
          <CheckCircle2 size={40} className="text-teal-500" />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Title + priority */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className={`text-sm font-semibold leading-snug flex-1 line-clamp-2 pr-1
            ${isDone ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-800 dark:text-slate-100"}`}>
            {task.title}
          </h3>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Time remaining */}
        {timeInfo && (
          <div className={`inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full text-xs font-semibold mb-3 ${TIME_CLS[timeInfo.type]}`}>
            <Clock size={10} />
            {timeInfo.label}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[task.status] || STATUS_STYLES.pending}`}>
            {task.status}
          </span>
          {task.due_date && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-all duration-150 -mt-1">
        <button onClick={() => navigate(`/edit-task/${task.id}`)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all">
          <Pencil size={14} />
        </button>
        <button onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;