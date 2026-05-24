import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const Illustration = () => (
  <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-xs mx-auto" aria-hidden="true">
    <circle cx="200" cy="140" r="110" className="fill-brand-500/8 dark:fill-brand-500/5" />
    <rect x="130" y="60" width="140" height="165" rx="14"
      className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700" strokeWidth="2" />
    <rect x="168" y="50" width="64" height="24" rx="12"
      className="fill-slate-200 dark:fill-slate-700" />
    <rect x="180" y="56" width="40" height="12" rx="6"
      className="fill-white dark:fill-slate-600" />
    <rect x="152" y="100" width="96" height="8" rx="4" className="fill-slate-200 dark:fill-slate-600" />
    <rect x="152" y="116" width="72" height="8" rx="4" className="fill-slate-200 dark:fill-slate-700" />
    <rect x="152" y="132" width="84" height="8" rx="4" className="fill-slate-200 dark:fill-slate-600" />
    <circle cx="200" cy="195" r="28"
      className="fill-brand-500/10 stroke-brand-500" strokeWidth="2" strokeDasharray="5 4" />
    <line x1="200" y1="185" x2="200" y2="205" className="stroke-brand-500" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="190" y1="195" x2="210" y2="195" className="stroke-brand-500" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="88"  cy="95"  r="5" className="fill-brand-400/30" />
    <circle cx="312" cy="180" r="7" className="fill-brand-400/20" />
    <circle cx="318" cy="82"  r="4" className="fill-slate-300 dark:fill-slate-600" />
    <circle cx="78"  cy="210" r="4" className="fill-slate-300 dark:fill-slate-600" />
  </svg>
);

const EmptyState = ({ filtered = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      className="mb-6"
    >
      <Illustration />
    </motion.div>
    <h2 className="font-display text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
      {filtered ? "No matching tasks" : "Your slate is clean"}
    </h2>
    <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mb-8">
      {filtered
        ? "Try adjusting your filters or search term."
        : "No tasks yet. Create your first one and get moving."}
    </p>
    {!filtered && (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
        <Link to="/add-task" className="btn-primary">
          <Plus size={16} />
          Create your first task
        </Link>
      </motion.div>
    )}
  </motion.div>
);

export default EmptyState;