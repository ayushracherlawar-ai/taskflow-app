import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

// Inline SVG illustration — no external dependency needed
const IllustrationNoTasks = () => (
  <svg
    viewBox="0 0 400 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-xs mx-auto"
    aria-hidden="true"
  >
    {/* Background circle */}
    <circle cx="200" cy="150" r="120" className="fill-brand-500/10 dark:fill-brand-500/5" />

    {/* Clipboard body */}
    <rect x="130" y="70" width="140" height="170" rx="12"
      className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
      strokeWidth="2" />

    {/* Clipboard clip */}
    <rect x="170" y="60" width="60" height="22" rx="11"
      className="fill-slate-200 dark:fill-slate-700" />
    <rect x="182" y="65" width="36" height="12" rx="6"
      className="fill-white dark:fill-slate-600" />

    {/* Lines — "tasks" */}
    <rect x="152" y="112" width="96" height="8" rx="4" className="fill-slate-200 dark:fill-slate-600" />
    <rect x="152" y="128" width="72" height="8" rx="4" className="fill-slate-200 dark:fill-slate-700" />
    <rect x="152" y="144" width="84" height="8" rx="4" className="fill-slate-200 dark:fill-slate-600" />
    <rect x="152" y="160" width="56" height="8" rx="4" className="fill-slate-200 dark:fill-slate-700" />

    {/* Checkmark circle (empty — not done yet) */}
    <circle cx="200" cy="210" r="30"
      className="fill-brand-500/10 stroke-brand-500"
      strokeWidth="2.5" strokeDasharray="6 4" />

    {/* Plus inside the dashed circle */}
    <line x1="200" y1="198" x2="200" y2="222" className="stroke-brand-500" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="188" y1="210" x2="212" y2="210" className="stroke-brand-500" strokeWidth="2.5" strokeLinecap="round" />

    {/* Floating dots for visual interest */}
    <circle cx="90"  cy="100" r="6"  className="fill-brand-400/30" />
    <circle cx="310" cy="190" r="8"  className="fill-brand-400/20" />
    <circle cx="320" cy="90"  r="4"  className="fill-slate-300 dark:fill-slate-600" />
    <circle cx="80"  cy="220" r="5"  className="fill-slate-300 dark:fill-slate-600" />
  </svg>
);

const EmptyState = ({ filtered = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <IllustrationNoTasks />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-display text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2"
      >
        {filtered ? "No matching tasks" : "Your slate is clean"}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mb-8"
      >
        {filtered
          ? "Try adjusting your search or filters to find what you're looking for."
          : "You have no tasks yet. Create your first one and get things moving."}
      </motion.p>

      {!filtered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
        >
          <Link
            to="/add-task"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
              text-white px-6 py-3 rounded-xl font-medium text-sm
              shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50
              transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Create your first task
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;