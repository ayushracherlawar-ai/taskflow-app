import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Share2, CheckCircle2, Circle, Trash2, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

// Individual todo item
const TodoItem = ({ item, onToggle, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10, height: 0 }}
    className="flex items-center gap-3 py-2.5 px-1 group border-b border-slate-100 dark:border-slate-700/50 last:border-0"
  >
    <button
      onClick={() => onToggle(item.id)}
      className="shrink-0 transition-all duration-200 hover:scale-110"
    >
      <motion.div whileTap={{ scale: 0.85 }}>
        {item.done
          ? <CheckCircle2 size={22} className="text-teal-500" />
          : <Circle       size={22} className="text-slate-300 dark:text-slate-600 hover:text-brand-400 transition-colors" />
        }
      </motion.div>
    </button>

    <span className={`flex-1 text-sm transition-all duration-300 ${
      item.done
        ? "line-through text-slate-400 dark:text-slate-500"
        : "text-slate-700 dark:text-slate-200"
    }`}>
      {item.text}
    </span>

    <button
      onClick={() => onDelete(item.id)}
      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
    >
      <Trash2 size={14} />
    </button>
  </motion.div>
);

const QuickTodo = () => {
  const [items,    setItems]    = useState([]);
  const [input,    setInput]    = useState("");
  const [listName, setListName] = useState("Quick Todos");
  const inputRef               = useRef(null);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setItems(p => [...p, { id: Date.now(), text, done: false }]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggle = (id) =>
    setItems(p => p.map(i => i.id === id ? { ...i, done: !i.done } : i));

  const remove = (id) =>
    setItems(p => p.filter(i => i.id !== id));

  const share = async () => {
    const text = `📋 ${listName}\n\n` +
      items.map(i => `${i.done ? "✅" : "⬜"} ${i.text}`).join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: listName, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("List copied to clipboard!");
      }
    } catch { toast.error("Could not share"); }
  };

  const done  = items.filter(i => i.done).length;
  const total = items.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="section-card">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
            <ClipboardList size={16} className="text-brand-500" />
          </div>
          <input
            value={listName}
            onChange={e => setListName(e.target.value)}
            className="font-display font-bold text-base text-slate-800 dark:text-white bg-transparent border-none outline-none min-w-0 truncate"
          />
        </div>
        {items.length > 0 && (
          <button onClick={share}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10">
            <Share2 size={13} />
            Share
          </button>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-5 pt-3">
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5">
            <span>{done}/{total} done</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="px-5 py-2 min-h-[60px]">
        <AnimatePresence mode="popLayout">
          {items.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-slate-400 dark:text-slate-500 text-center py-4"
            >
              Add items below to get started
            </motion.p>
          )}
          {/* Pending first */}
          {items.filter(i => !i.done).map(item => (
            <TodoItem key={item.id} item={item} onToggle={toggle} onDelete={remove} />
          ))}
          {/* Completed section */}
          {items.some(i => i.done) && (
            <div className="mt-2">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1 px-1">Completed</p>
              {items.filter(i => i.done).map(item => (
                <TodoItem key={item.id} item={item} onToggle={toggle} onDelete={remove} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-5 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          <Plus size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Add an item… (press Enter)"
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />
          {input && (
            <button onClick={add}
              className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickTodo;