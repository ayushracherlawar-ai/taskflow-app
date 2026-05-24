import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, ClipboardList,
  AlertTriangle, Minus, TrendingUp,
  Clock, CheckCircle2, Circle, PlayCircle,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import Footer from "../components/Footer";
import toast from "react-hot-toast";

// Priority selector
const PRIORITIES = [
  { value: "low",    label: "Low",    icon: Minus,        bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400",   active: "!bg-emerald-500 !border-emerald-500 !text-white" },
  { value: "medium", label: "Medium", icon: TrendingUp,   bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400",              active: "!bg-amber-500 !border-amber-500 !text-white"   },
  { value: "high",   label: "High",   icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400",                        active: "!bg-red-500 !border-red-500 !text-white"       },
];

const STATUSES = [
  { value: "pending",     label: "Pending",     icon: Circle       },
  { value: "in-progress", label: "In Progress", icon: PlayCircle   },
  { value: "completed",   label: "Completed",   icon: CheckCircle2 },
];

const AddTask = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors,   setErrors]   = useState({});

  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", status: "pending", due_date: "",
  });

  useEffect(() => { if (isEdit) fetchTask(); }, []);

  const fetchTask = async () => {
    try {
      const res  = await axiosInstance.get("/tasks");
      const task = res.data.find(t => t.id === Number(id));
      if (task) setForm({
        title:       task.title       || "",
        description: task.description || "",
        priority:    task.priority    || "medium",
        status:      task.status      || "pending",
        due_date:    task.due_date    || "",
      });
    } catch { toast.error("Failed to load task"); }
    finally { setFetching(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (form.title.trim().length > 200) e.title = "Title is too long";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/tasks/${id}`, form);
        toast.success("Task updated ✨");
      } else {
        await axiosInstance.post("/tasks", form);
        toast.success("Task created! 🎉");
      }
      navigate("/dashboard");
    } catch { toast.error("Failed to save task"); }
    finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-wrapper flex flex-col">
      <div className="page-inner flex-1">
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="section-card p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <ClipboardList size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">
                  {isEdit ? "Edit Task" : "New Task"}
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {isEdit ? "Update the details below" : "Fill in the details to create a task"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="label">Title *</label>
                <input type="text" value={form.title}
                  onChange={e => { setForm(p => ({...p, title: e.target.value})); setErrors(p => ({...p, title: ""})); }}
                  placeholder="What needs to be done?"
                  className={`input-field ${errors.title ? "border-red-400 focus:border-red-500 focus:ring-red-500/30" : ""}`}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={11} />{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="label">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  placeholder="Add more context or details (optional)…"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Priority selector */}
              <div>
                <label className="label">Priority</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRIORITIES.map(({ value, label, icon: Icon, bg, active }) => (
                    <button key={value} type="button"
                      onClick={() => setForm(p => ({...p, priority: value}))}
                      className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${bg} ${form.priority === value ? active : ""}`}
                    >
                      <Icon size={15} className="shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status selector */}
              <div>
                <label className="label">Status</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {STATUSES.map(({ value, label, icon: Icon }) => (
                    <button key={value} type="button"
                      onClick={() => setForm(p => ({...p, status: value}))}
                      className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150
                        ${form.status === value
                          ? value === "pending"     ? "bg-slate-500 border-slate-500 text-white"
                          : value === "in-progress" ? "bg-blue-500 border-blue-500 text-white"
                          :                           "bg-teal-500 border-teal-500 text-white"
                          : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="hidden xs:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="label flex items-center gap-1.5"><Clock size={12} /> Due Date</label>
                <input type="date" value={form.due_date || ""}
                  onChange={e => setForm(p => ({...p, due_date: e.target.value}))}
                  className="input-field" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save size={15} />}
                  {loading ? "Saving…" : isEdit ? "Update Task" : "Create Task"}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="btn-ghost border border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddTask;