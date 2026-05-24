const STYLES = {
  low:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  medium: "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-400",
  high:   "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-400",
};

const DOTS = {
  low:    "bg-emerald-500",
  medium: "bg-amber-500",
  high:   "bg-red-500",
};

const PriorityBadge = ({ priority }) => {
  const style = STYLES[priority] || STYLES.medium;
  const dot   = DOTS[priority]   || DOTS.medium;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {priority}
    </span>
  );
};

export default PriorityBadge;