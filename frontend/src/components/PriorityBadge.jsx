const STYLES = {
  low:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  medium: "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400",
  high:   "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-400",
};
const DOTS = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-red-500" };

const PriorityBadge = ({ priority }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${STYLES[priority] || STYLES.medium}`}>
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOTS[priority] || DOTS.medium}`} />
    {priority}
  </span>
);

export default PriorityBadge;